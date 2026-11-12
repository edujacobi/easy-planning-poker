import { BadRequestException, ValidationPipe } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";
import type { Server, Socket } from "socket.io";
import { CreateRoomDto } from "./dto/create-room.dto";
import { ChatMessage } from "./models/chat-message.model";
import { Participant } from "./models/participant.model";
import { Room } from "./models/room.model";
import { Story } from "./models/story.model";
import { Task } from "./models/task.model";
import { RoomsService } from "./rooms.service";
import { RoomsGateway } from "./rooms.gateway";

describe("task descriptions and results", () => {
	let sequelize: Sequelize;
	let service: RoomsService;

	beforeAll(async () => {
		sequelize = new Sequelize({
			dialect: "sqlite",
			storage: ":memory:",
			logging: false,
			models: [Room, Story, Task, Participant, ChatMessage],
		});
		await sequelize.sync();
		service = new RoomsService(Room, Story, Task, Participant, ChatMessage);
	});

	afterAll(async () => {
		await sequelize.close();
	});

	it("preserves descriptions through creation, editing and results", async () => {
		const room = await service.createRoom({
			title: "Session",
			voteType: "linear",
			creatorUserId: "user",
			creatorNickname: "Admin",
			creatorEmoji: "A",
			stories: [{ title: "Story", tasks: ["Old task"] }],
		});
		const newRoom = await service.createRoom({
			title: "New session",
			voteType: "linear",
			creatorUserId: "user",
			creatorNickname: "Admin",
			creatorEmoji: "A",
			stories: [
				{
					title: "Story",
					tasks: [{ title: "Task", description: "Created" }],
				},
			],
		});
		expect(
			(await service.getRoomDetails(newRoom.id)).stories[0].tasks[0]
				.description,
		).toBe("Created");

		const initial = await service.getRoomDetails(room.id);
		expect(initial.stories[0].tasks[0].description).toBe("");
		await service.editStories(room.id, [
			{
				id: initial.stories[0].id,
				title: "Story",
				tasks: [
					{
						id: initial.stories[0].tasks[0].id,
						title: "Old task",
						description: "Edited description",
					},
				],
			},
		]);
		await service.addStories(room.id, [
			{
				title: "Another story",
				tasks: [
					{ title: "New task", description: "New description" },
					"Legacy",
				],
			},
		]);
		const updated = await service.getRoomDetails(room.id);
		await service.editStories(
			room.id,
			updated.stories.map((story) => ({
				id: story.id,
				title: story.title,
				tasks: story.tasks.map((task) => ({
					id: task.id,
					title: task.title,
				})),
			})),
		);
		await service.confirmPoints(room.id, 0);
		const results = await service.generateRoomResults(room.id);
		expect(results.tasks).toEqual([
			{
				id: updated.stories[0].tasks[0].id,
				title: "Old task",
				description: "Edited description",
				points: 0,
				priority: "Medium",
			},
			{
				id: updated.stories[1].tasks[0].id,
				title: "New task",
				description: "New description",
				points: null,
				priority: "Medium",
			},
			{
				id: updated.stories[1].tasks[1].id,
				title: "Legacy",
				description: "",
				points: null,
				priority: "Medium",
			},
		]);
		expect(results.markdown).toContain("| Old task | 0 |");
	});

	it("validates both legacy task strings and task descriptions on room creation", async () => {
		const pipe = new ValidationPipe({ whitelist: true, transform: true });
		const metadata = { type: "body" as const, metatype: CreateRoomDto };
		const body = {
			title: "Session",
			voteType: "linear",
			creatorUserId: "a2857cb0-7316-4dca-9c2a-a7605a7f874c",
			creatorNickname: "Admin",
			creatorEmoji: "A",
			stories: [
				{
					title: "Story",
					tasks: [
						"Old task",
						{ title: "New task", description: "Details" },
					],
				},
			],
		};
		const result = (await pipe.transform(body, metadata)) as CreateRoomDto;
		expect(result.stories[0].tasks[0].title).toBe("Old task");
		expect(result.stories[0].tasks[1].description).toBe("Details");
		await expect(
			pipe.transform(
				{
					...body,
					stories: [
						{
							title: "Story",
							tasks: [{ title: "Task", description: 5 }],
						},
					],
				},
				metadata,
			),
		).rejects.toBeInstanceOf(BadRequestException);
	});

	it("allows only the creator to update finished task priorities and restores them on reconnect", async () => {
		const room = await service.createRoom({
			title: "Priority session",
			voteType: "linear",
			creatorUserId: "creator",
			creatorNickname: "Creator",
			creatorEmoji: "A",
			stories: [{ title: "Story", tasks: ["Same title", "Same title"] }],
		});
		const otherRoom = await service.createRoom({
			title: "Other session",
			voteType: "linear",
			creatorUserId: "creator",
			creatorNickname: "Creator",
			creatorEmoji: "A",
			stories: [{ title: "Story", tasks: ["Other task"] }],
		});
		const tasks = (await service.getRoomDetails(room.id)).stories[0].tasks;
		const otherTask = (await service.getRoomDetails(otherRoom.id))
			.stories[0].tasks[0];
		const broadcast = jest.fn();
		const gateway = new RoomsGateway(service);
		gateway.server = {
			to: jest.fn().mockReturnValue({ emit: broadcast }),
		} as unknown as Server;
		const client = (userId: string) =>
			({
				handshake: {
					query: {
						roomId: room.id,
						userId,
						nickname: userId,
						emoji: "A",
					},
				},
				join: jest.fn().mockResolvedValue(undefined),
				emit: jest.fn(),
			}) as unknown as Socket;
		const creator = client("creator");
		const viewer = client("viewer");
		const viewerEmit = jest.spyOn(viewer, "emit");

		expect(
			await gateway.handleSetTaskPriority(creator, {
				taskId: tasks[0].id,
				priority: "High",
			}),
		).toEqual({ error: "Task not found in the finished session." });
		await gateway.handleFinishSession(creator, { decision: "finish" });
		const results = service.getOrCreateActiveState(room.id).sessionResults!;
		expect(results.tasks.map((task) => task.priority)).toEqual([
			"Medium",
			"Medium",
		]);

		expect(
			await gateway.handleSetTaskPriority(viewer, {
				taskId: tasks[0].id,
				priority: "High",
			}),
		).toHaveProperty("error");
		expect(
			await gateway.handleSetTaskPriority(creator, {
				taskId: tasks[0].id,
				priority: "Urgent",
			}),
		).toHaveProperty("error");
		expect(
			await gateway.handleSetTaskPriority(creator, {
				taskId: otherTask.id,
				priority: "High",
			}),
		).toHaveProperty("error");
		expect(results.tasks.map((task) => task.priority)).toEqual([
			"Medium",
			"Medium",
		]);

		expect(
			await gateway.handleSetTaskPriority(creator, {
				taskId: tasks[1].id,
				priority: "High",
			}),
		).toEqual({});
		expect(results.tasks.map((task) => task.priority)).toEqual([
			"Medium",
			"High",
		]);
		expect(broadcast).toHaveBeenCalledWith("taskPriorityChanged", {
			taskId: tasks[1].id,
			priority: "High",
		});
		await gateway.handleConnection(viewer);
		expect(viewerEmit).toHaveBeenCalledWith("sessionFinished", results);
	});
});
