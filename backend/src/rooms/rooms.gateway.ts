import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomsService: RoomsService) { }

  // Handle user connection and room registration
  async handleConnection(client: Socket) {
    const { userId, nickname, emoji, roomId } = client.handshake.query as {
      userId?: string;
      nickname?: string;
      emoji?: string;
      roomId?: string;
    };

    if (!userId || !roomId || !nickname || !emoji) {
      client.disconnect();
      return;
    }

    // Join Socket.io room
    await client.join(roomId);

    // Save in participant list
    await this.roomsService.joinParticipant(roomId, { userId, nickname, emoji });

    // Send system alert to chat
    const systemMsg = await this.roomsService.createChatMessage(
      roomId,
      'system',
      'System',
      '🤖',
      `${nickname} joined the room!`,
      true,
    );
    this.server.to(roomId).emit('chatMessage', systemMsg);

    // Broadcast updated state
    await this.broadcastRoomState(roomId);
  }

  // Handle user disconnection
  async handleDisconnect(client: Socket) {
    const { userId, roomId } = client.handshake.query as {
      userId?: string;
      roomId?: string;
    };

    if (userId && roomId) {
      this.roomsService.leaveParticipant(roomId, userId);

      // Broadcast updated state
      await this.broadcastRoomState(roomId);
    }
  }

  // Cast vote event
  @SubscribeMessage('castVote')
  handleCastVote(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { vote: string },
  ) {
    const { userId, roomId } = client.handshake.query as { userId: string; roomId: string };
    if (!userId || !roomId) return;

    this.roomsService.castVote(roomId, userId, data.vote);
    this.broadcastRoomState(roomId);
  }

  // Reveal votes event (Admin Only)
  @SubscribeMessage('revealVotes')
  async handleRevealVotes(@ConnectedSocket() client: Socket) {
    const { roomId } = client.handshake.query as { roomId: string };
    if (!roomId) return;

    // Get room admin configuration to verify
    const room = await this.roomsService.getRoomDetails(roomId);
    const { userId } = client.handshake.query as { userId: string };
    if (room.adminUserId !== userId) return; // Only admin can reveal

    const state = this.roomsService.revealVotes(roomId);

    // Format vote results for the chat
    if (state.activeTaskId) {
      const task = await this.roomsService.getRoomDetails(roomId)
        .then((r) => {
          for (const s of r.stories) {
            const t = s.tasks.find((tk) => tk.id === state.activeTaskId);
            if (t) return t;
          }
          return null;
        });

      if (task) {
        const stats = this.calculateStats(state.votes);
        let countsStr = Object.entries(stats.counts)
          .map(([val, qty]) => `'${val}': ${qty} vote${qty > 1 ? 's' : ''}`)
          .join(', ');

        if (!countsStr) countsStr = 'No votes cast';

        const statsMsg = `VOTE RESULTS for "${task.title}" -> Mean: ${stats.mean.toFixed(2)}, Median: ${stats.median}, Votes Breakdown: [ ${countsStr} ]`;

        // Send statistics message to chat
        const chatMsg = await this.roomsService.createChatMessage(
          roomId,
          'system',
          'System',
          '📊',
          statsMsg,
          true,
        );
        this.server.to(roomId).emit('chatMessage', chatMsg);
      }
    }

    this.broadcastRoomState(roomId);
  }

  // Confirm points for active task (Admin Only)
  @SubscribeMessage('confirmPoints')
  async handleConfirmPoints(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { points: number | null },
  ) {
    const { roomId, userId } = client.handshake.query as { roomId: string; userId: string };
    if (!roomId) return;

    const room = await this.roomsService.getRoomDetails(roomId);
    if (room.adminUserId !== userId) return;

    // Confirm points updates database and advances task
    await this.roomsService.confirmPoints(roomId, data.points);

    // Broadcast state and details reload
    await this.broadcastRoomState(roomId);
    this.server.to(roomId).emit('reloadRoomDetails');
  }

  // Select active task manually (Admin Only)
  @SubscribeMessage('selectTask')
  async handleSelectTask(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { taskId: string },
  ) {
    const { roomId, userId } = client.handshake.query as { roomId: string; userId: string };
    if (!roomId) return;

    const room = await this.roomsService.getRoomDetails(roomId);
    if (room.adminUserId !== userId) return;

    this.roomsService.selectTask(roomId, data.taskId);
    await this.broadcastRoomState(roomId);
  }

  // Handle chat messages
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { content: string },
  ) {
    const { roomId, userId, nickname, emoji } = client.handshake.query as {
      roomId: string;
      userId: string;
      nickname: string;
      emoji: string;
    };

    if (!roomId || !contentValid(data.content)) return;

    const message = await this.roomsService.createChatMessage(
      roomId,
      userId,
      nickname,
      emoji,
      data.content,
      false,
    );

    this.server.to(roomId).emit('chatMessage', message);
  }

  // End / Finish Session trigger (Admin Only)
  @SubscribeMessage('finishSession')
  async handleFinishSession(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { decision: 'add_stories' | 'finish' | 'cancel' },
  ) {
    const { roomId, userId } = client.handshake.query as { roomId: string; userId: string };
    if (!roomId) return;

    const room = await this.roomsService.getRoomDetails(roomId);
    if (room.adminUserId !== userId) return;

    if (data.decision === 'add_stories') {
      this.server.to(roomId).emit('sessionStateChange', { mode: 'add_stories' });
    } else if (data.decision === 'cancel') {
      this.server.to(roomId).emit('sessionStateChange', { mode: 'voting' });
    } else if (data.decision === 'finish') {
      const results = await this.roomsService.generateRoomResults(roomId);

      // Write stats to chat
      const statsMsg = `SESSION COMPLETED! Total Stories: ${results.totalStories}, Total Points Voted: ${results.totalPoints}. Participants: ${results.participantsCount}`;
      const chatMsg = await this.roomsService.createChatMessage(
        roomId,
        'system',
        'System',
        '🏆',
        statsMsg,
        true,
      );
      this.server.to(roomId).emit('chatMessage', chatMsg);

      // Emit session completion details to all clients
      this.server.to(roomId).emit('sessionFinished', results);
    }
  }

  // Add more stories event (Admin Only)
  @SubscribeMessage('addStories')
  async handleAddStories(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { stories: Array<{ title: string; tasks: string[] }> },
  ) {
    const { roomId, userId } = client.handshake.query as { roomId: string; userId: string };
    if (!roomId) return;

    const room = await this.roomsService.getRoomDetails(roomId);
    if (room.adminUserId !== userId) return;

    await this.roomsService.addStories(roomId, data.stories);

    // Force client details reload and state sync
    this.server.to(roomId).emit('reloadRoomDetails');
    await this.broadcastRoomState(roomId);

    // Return all players to voting mode
    this.server.to(roomId).emit('sessionStateChange', { mode: 'voting' });
  }

  // Broadcasts standard room state in-memory structure
  private async broadcastRoomState(roomId: string) {
    const state = this.roomsService.getOrCreateActiveState(roomId);
    const room = await this.roomsService.getRoomDetails(roomId);

    // Compile active client list with active/reveal mapping
    const players = room.participants.map((p) => {
      const hasVoted = !!state.votes[p.userId];
      const voteValue = state.votingRevealed ? state.votes[p.userId] || null : null;
      const isOnline = state.connectedUsers.has(p.userId);

      return {
        userId: p.userId,
        nickname: p.nickname,
        emoji: p.emoji,
        hasVoted,
        voteValue,
        isOnline,
        isAdmin: room.adminUserId === p.userId,
      };
    });

    this.server.to(roomId).emit('roomState', {
      activeTaskId: state.activeTaskId,
      votingRevealed: state.votingRevealed,
      votesCount: Object.keys(state.votes).length,
      players,
    });
  }

  // Internal statistical helper
  private calculateStats(votes: Record<string, string>) {
    const numericVotes: number[] = [];
    const counts: Record<string, number> = {};

    for (const val of Object.values(votes)) {
      counts[val] = (counts[val] || 0) + 1;
      const num = Number(val);
      if (!isNaN(num) && val !== '?') {
        numericVotes.push(num);
      }
    }

    let mean = 0;
    let median = 0;

    if (numericVotes.length > 0) {
      mean = numericVotes.reduce((sum, v) => sum + v, 0) / numericVotes.length;

      numericVotes.sort((a, b) => a - b);
      const mid = Math.floor(numericVotes.length / 2);
      if (numericVotes.length % 2 === 0) {
        median = (numericVotes[mid - 1] + numericVotes[mid]) / 2;
      } else {
        median = numericVotes[mid];
      }
    }

    return { counts, mean, median };
  }
}

// Basic input verification helper
function contentValid(c: any): boolean {
  return typeof c === 'string' && c.trim().length > 0;
}
