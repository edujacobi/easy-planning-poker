import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { RoomsService } from './rooms.service';

@Controller('api/rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  async createRoom(
    @Body()
    body: {
      title: string;
      voteType: 'linear' | 'fibonacci';
      creatorUserId: string;
      creatorNickname: string;
      creatorEmoji: string;
      stories: Array<{ title: string; tasks: string[] }>;
    },
  ) {
    return this.roomsService.createRoom(body);
  }

  @Get(':roomId')
  async getRoom(@Param('roomId') roomId: string) {
    return this.roomsService.getRoomDetails(roomId);
  }

  @Get(':roomId/chat')
  async getChatHistory(@Param('roomId') roomId: string) {
    return this.roomsService.getChatHistory(roomId);
  }

  @Get(':roomId/results')
  async getResults(@Param('roomId') roomId: string) {
    return this.roomsService.generateRoomResults(roomId);
  }
}
