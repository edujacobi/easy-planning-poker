import { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import request from "supertest";
import { App } from "supertest/types";
import { RoomsController } from "../rooms.controller";
import { RoomsService } from "../rooms.service";
import { RoomCreationRateLimiterGuard } from "./rate-limiter.guard";

describe("room creation rate limit", () => {
	let app: INestApplication<App>;
	const createRoom = jest.fn().mockResolvedValue({ id: "room" });
	const getRoomDetails = jest.fn().mockResolvedValue({
		id: "room",
		title: "Room",
		voteType: "linear",
		stories: [],
	});

	beforeEach(async () => {
		const module = await Test.createTestingModule({
			controllers: [RoomsController],
			providers: [
				RoomCreationRateLimiterGuard,
				{
					provide: RoomsService,
					useValue: { createRoom, getRoomDetails },
				},
			],
		}).compile();
		app = module.createNestApplication();
		await app.init();
		createRoom.mockClear();
	});

	afterEach(async () => {
		jest.restoreAllMocks();
		await app.close();
	});

	it("limits concurrent creation by IP, ignores spoofed headers, and resets after an hour", async () => {
		const now = jest.spyOn(Date, "now").mockReturnValue(1_000_000);
		const responses = await Promise.all(
			Array.from({ length: 13 }, (_, i) =>
				request(app.getHttpServer<App>())
					.post("/api/rooms")
					.set("X-Forwarded-For", `192.0.2.${i}`)
					.send({}),
			),
		);
		expect(responses.filter((res) => res.status === 201)).toHaveLength(10);
		const limited = responses.filter((res) => res.status === 429);
		expect(limited).toHaveLength(3);
		expect(limited[0].headers["retry-after"]).toBe("3600");
		expect(createRoom).toHaveBeenCalledTimes(10);

		await request(app.getHttpServer<App>())
			.get("/api/rooms/room")
			.expect(200);
		now.mockReturnValue(1_000_000 + 60 * 60 * 1000);
		await request(app.getHttpServer<App>())
			.post("/api/rooms")
			.send({})
			.expect(201);
		expect(createRoom).toHaveBeenCalledTimes(11);
	});
});
