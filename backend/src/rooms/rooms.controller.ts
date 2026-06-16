import { Controller, Post, Get, Body, Param, Query } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { CreateRoomDto } from "./dto/create-room.dto";

@Controller("api/rooms")
export class RoomsController {
	constructor(private readonly roomsService: RoomsService) {}

	@Post()
	async createRoom(@Body() body: CreateRoomDto) {
		const room = await this.roomsService.createRoom(body);
		return { id: room.id };
	}

	@Get(":roomId")
	async getRoom(
		@Param("roomId") roomId: string,
		@Query("userId") userId?: string,
	) {
		const room = await this.roomsService.getRoomDetails(roomId);
		return {
			id: room.id,
			title: room.title,
			voteType: room.voteType,
			stories: room.stories,
			amIAdmin: room.adminUserId === userId,
		};
	}

	@Get(":roomId/chat")
	async getChatHistory(@Param("roomId") roomId: string) {
		const history = await this.roomsService.getChatHistory(roomId);
		return history.map((msg) => ({
			id: msg.id,
			roomId: msg.roomId,
			userId: this.roomsService.hashUserId(msg.userId),
			nickname: msg.nickname,
			emoji: msg.emoji,
			content: msg.content,
			isSystem: msg.isSystem,
			createdAt: msg.createdAt,
		}));
	}

	@Get(":roomId/results")
	async getResults(@Param("roomId") roomId: string) {
		return this.roomsService.generateRoomResults(roomId);
	}
}
