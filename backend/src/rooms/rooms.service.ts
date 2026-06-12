import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Room } from "./models/room.model";
import { Story } from "./models/story.model";
import { Task } from "./models/task.model";
import { Participant } from "./models/participant.model";
import { ChatMessage } from "./models/chat-message.model";

export interface ActiveRoomState {
	activeTaskId: string | null;
	votingRevealed: boolean;
	votes: Record<string, string>; // userId -> voteValue
	connectedUsers: Set<string>; // Set of active userIds in room
}

@Injectable()
export class RoomsService {
	// In-memory active voting state for rooms
	private activeRoomStates = new Map<string, ActiveRoomState>();

	constructor(
		@InjectModel(Room) private roomModel: typeof Room,
		@InjectModel(Story) private storyModel: typeof Story,
		@InjectModel(Task) private taskModel: typeof Task,
		@InjectModel(Participant) private participantModel: typeof Participant,
		@InjectModel(ChatMessage) private chatMessageModel: typeof ChatMessage,
	) {}

	// Get or initialize active in-memory state for a room
	getOrCreateActiveState(
		roomId: string,
		defaultTaskId: string | null = null,
	): ActiveRoomState {
		let state = this.activeRoomStates.get(roomId);
		if (!state) {
			state = {
				activeTaskId: defaultTaskId,
				votingRevealed: false,
				votes: {},
				connectedUsers: new Set<string>(),
			};
			this.activeRoomStates.set(roomId, state);
		}
		return state;
	}

	// Create a new room with stories and tasks
	async createRoom(data: {
		title: string;
		voteType: "linear" | "fibonacci";
		creatorUserId: string;
		creatorNickname: string;
		creatorEmoji: string;
		stories: Array<{ title: string; tasks: string[] }>;
	}): Promise<Room> {
		const room = await this.roomModel.create({
			title: data.title,
			voteType: data.voteType,
			adminUserId: data.creatorUserId,
		} as any);

		// Create participant record for the admin
		await this.participantModel.create({
			roomId: room.id,
			userId: data.creatorUserId,
			nickname: data.creatorNickname,
			emoji: data.creatorEmoji,
		} as any);

		// Bulk create stories and tasks
		let storyOrder = 0;
		for (const s of data.stories) {
			const story = await this.storyModel.create({
				roomId: room.id,
				title: s.title,
				order: storyOrder++,
			} as any);

			let taskOrder = 0;
			for (const tTitle of s.tasks) {
				await this.taskModel.create({
					storyId: story.id,
					title: tTitle,
					order: taskOrder++,
					points: null,
				} as any);
			}
		}

		// Set first task as active in-memory state
		const firstStory = await this.storyModel.findOne({
			where: { roomId: room.id },
			order: [["order", "ASC"]],
			include: [{ model: Task, order: [["order", "ASC"]] }],
		});
		const firstTaskId = firstStory?.tasks?.[0]?.id || null;
		this.getOrCreateActiveState(room.id, firstTaskId);

		return room;
	}

	// Retrieve a room details with full hierarchy
	async getRoomDetails(roomId: string): Promise<Room> {
		const room = await this.roomModel.findByPk(roomId, {
			include: [
				{
					model: Story,
					include: [{ model: Task }],
				},
				{
					model: Participant,
				},
			],
		});

		if (!room) {
			throw new NotFoundException("Room not found");
		}

		// Sort stories and tasks by order key locally to keep correct list sequencing
		room.stories = room.stories.sort((a, b) => a.order - b.order);
		for (const story of room.stories) {
			story.tasks = story.tasks.sort((a, b) => a.order - b.order);
		}

		return room;
	}

	// Add more stories to an existing room
	async addStories(
		roomId: string,
		stories: Array<{ title: string; tasks: string[] }>,
	) {
		const existingStories = await this.storyModel.findAll({
			where: { roomId },
		});
		let storyOrder = existingStories.length;

		const addedStories: Story[] = [];
		for (const s of stories) {
			const story = await this.storyModel.create({
				roomId,
				title: s.title,
				order: storyOrder++,
			} as any);

			let taskOrder = 0;
			const addedTasks: Task[] = [];
			for (const tTitle of s.tasks) {
				const task = await this.taskModel.create({
					storyId: story.id,
					title: tTitle,
					order: taskOrder++,
					points: null,
				} as any);
				addedTasks.push(task);
			}
			story.setDataValue("tasks", addedTasks);
			story.tasks = addedTasks;
			addedStories.push(story);
		}

		// If there is currently no active task, set the first newly added task as active
		const state = this.getOrCreateActiveState(roomId);
		if (
			!state.activeTaskId &&
			addedStories.length > 0 &&
			addedStories[0].tasks &&
			addedStories[0].tasks.length > 0
		) {
			state.activeTaskId = addedStories[0].tasks[0].id;
		}

		return addedStories;
	}

	// Join a room (update database participant and memory connections)
	async joinParticipant(
		roomId: string,
		user: { userId: string; nickname: string; emoji: string },
	) {
		// Check if participant already exists in database
		let participant = await this.participantModel.findOne({
			where: { roomId, userId: user.userId },
		});

		if (!participant) {
			participant = await this.participantModel.create({
				roomId,
				userId: user.userId,
				nickname: user.nickname,
				emoji: user.emoji,
			} as any);
		} else {
			// If user came back with different nickname/emoji, update it
			participant.nickname = user.nickname;
			participant.emoji = user.emoji;
			await participant.save();
		}

		const state = this.getOrCreateActiveState(roomId);
		state.connectedUsers.add(user.userId);

		return participant;
	}

	// Leave active users list
	leaveParticipant(roomId: string, userId: string) {
		const state = this.activeRoomStates.get(roomId);
		if (state) {
			state.connectedUsers.delete(userId);
		}
	}

	// Cast a vote for the active task
	castVote(
		roomId: string,
		userId: string,
		voteValue: string,
	): ActiveRoomState {
		const state = this.getOrCreateActiveState(roomId);
		if (!state.votingRevealed && state.activeTaskId) {
			state.votes[userId] = voteValue;
		}
		return state;
	}

	// Reveal votes
	revealVotes(roomId: string): ActiveRoomState {
		const state = this.getOrCreateActiveState(roomId);
		state.votingRevealed = true;
		return state;
	}

	// Confirm final point value for active task and save to DB
	async confirmPoints(
		roomId: string,
		points: number | null,
	): Promise<ActiveRoomState> {
		const state = this.getOrCreateActiveState(roomId);
		if (!state.activeTaskId) return state;

		// Save points to database
		const task = await this.taskModel.findByPk(state.activeTaskId);
		if (task) {
			task.points = points;
			await task.save();
		}

		// Reset votes state for active task
		state.votes = {};
		state.votingRevealed = false;

		// Pro-actively find and set the next unvoted task as active
		const nextTaskId = await this.findNextUnvotedTaskId(roomId);
		state.activeTaskId = nextTaskId;

		return state;
	}

	// Set the active task being voted
	selectTask(roomId: string, taskId: string): ActiveRoomState {
		const state = this.getOrCreateActiveState(roomId);
		state.activeTaskId = taskId;
		state.votes = {};
		state.votingRevealed = false;
		return state;
	}

	// Helper to find the next task in chronological order that does not have points
	private async findNextUnvotedTaskId(
		roomId: string,
	): Promise<string | null> {
		const stories = await this.storyModel.findAll({
			where: { roomId },
			order: [["order", "ASC"]],
			include: [{ model: Task, order: [["order", "ASC"]] }],
		});

		for (const story of stories) {
			for (const task of story.tasks) {
				if (task.points === null) {
					return task.id;
				}
			}
		}
		return null;
	}

	// Persistence of chat message
	async createChatMessage(
		roomId: string,
		userId: string,
		nickname: string,
		emoji: string,
		content: string,
		isSystem = false,
	): Promise<ChatMessage> {
		return this.chatMessageModel.create({
			roomId,
			userId,
			nickname,
			emoji,
			content,
			isSystem,
		} as any);
	}

	// Get chat history
	async getChatHistory(roomId: string): Promise<ChatMessage[]> {
		return this.chatMessageModel.findAll({
			where: { roomId },
			order: [["createdAt", "ASC"]],
		});
	}

	// Generate statistics for all tasks and stories in a room
	async generateRoomResults(roomId: string) {
		const room = await this.getRoomDetails(roomId);
		const participants = await this.participantModel.findAll({
			where: { roomId },
		});

		// Aggregate statistics
		let md = `# Planning Poker Session Results: ${room.title}\n\n`;
		md += `**Date:** ${new Date().toLocaleString()}\n`;
		md += `**Room Code/ID:** ${room.id}\n\n`;

		md += `## Stories & Tasks Details\n\n`;

		let totalSessionPoints = 0;

		for (const story of room.stories) {
			let storyPoints = 0;
			md += `### Story: ${story.title}\n`;
			md += `| Task Title | Story Point | \n`;
			md += `| :--- | :---: |\n`;

			for (const task of story.tasks) {
				const pointsLabel =
					task.points !== null
						? task.points.toString()
						: "Not Voted / Skipped";
				md += `| ${task.title} | ${pointsLabel} |\n`;
				if (task.points !== null) {
					storyPoints += task.points;
				}
			}

			md += `| **Total Story Points** | **${storyPoints}** |\n\n`;
			totalSessionPoints += storyPoints;
		}

		md += `---\n\n`;
		md += `### Summary Statistics\n`;
		md += `- **Total Stories:** ${room.stories.length}\n`;
		md += `- **Grand Total Points:** ${totalSessionPoints}\n\n`;

		md += `### Participants\n`;
		md += `| Nickname | Emoji | Joined At |\n`;
		md += `| :--- | :---: | :--- |\n`;

		for (const p of participants) {
			md += `| ${p.nickname} | ${p.emoji} | ${new Date(p.createdAt).toLocaleString()} |\n`;
		}

		return {
			markdown: md,
			participantsCount: participants.length,
			totalStories: room.stories.length,
			totalPoints: totalSessionPoints,
		};
	}
}
