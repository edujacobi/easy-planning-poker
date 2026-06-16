import { defineStore } from "pinia";
import io, { type Socket } from "socket.io-client";

const BACKEND_URL = import.meta.env.DEV
	? "http://localhost:3000"
	: window.location.origin;

export interface UserProfile {
	userId: string;
	nickname: string;
	emoji: string;
}

export interface Player {
	userId: string;
	nickname: string;
	emoji: string;
	hasVoted: boolean;
	voteValue: string | null;
	isOnline: boolean;
	isAdmin: boolean;
}

export interface TaskItem {
	id: string;
	storyId: string;
	title: string;
	order: number;
	points: number | null;
}

export interface StoryItem {
	id: string;
	roomId: string;
	title: string;
	order: number;
	tasks: TaskItem[];
}

export interface RoomDetails {
	id: string;
	title: string;
	voteType: "linear" | "fibonacci";
	amIAdmin: boolean;
	stories: StoryItem[];
}

export interface ChatMsg {
	id: string;
	roomId: string;
	userId: string;
	nickname: string;
	emoji: string;
	content: string;
	isSystem: boolean;
	createdAt: string;
}

export interface SessionResults {
	markdown: string;
	participantsCount: number;
	totalStories: number;
	totalPoints: number;
}

export const useRoomStore = defineStore("room", {
	state: () => ({
		user: null as UserProfile | null,
		room: null as RoomDetails | null,
		players: [] as Player[],
		activeTaskId: null as string | null,
		votingRevealed: false,
		votesCount: 0,
		chatMessages: [] as ChatMsg[],
		socket: null as Socket | null,
		sessionMode: "voting" as "voting" | "add_stories",
		sessionFinishedData: null as SessionResults | null,
		isFinishModalDismissed: false,
		isLoading: false,
		error: null as string | null,
		myHashedUserId: null as string | null,
	}),

	getters: {
		isAdmin(state): boolean {
			return state.room?.amIAdmin || false;
		},
		activeTask(state): TaskItem | null {
			if (!state.room || !state.activeTaskId) return null;

			for (const story of state.room.stories) {
				const task = story.tasks.find(
					(t) => t.id === state.activeTaskId,
				);

				if (task) return task;
			}
			return null;
		},
		isSessionFinished(state): boolean {
			return !!state.sessionFinishedData;
		},
	},

	actions: {
		// Load or generate user session from LocalStorage
		loadUser() {
			const stored = localStorage.getItem("planning_poker_user");
			if (stored) {
				try {
					this.user = JSON.parse(stored);
					return;
				} catch (e) {
					// ignore parsing errors
				}
			}
			// Generate new user details
			const userId = crypto.randomUUID();
			this.user = { userId, nickname: "", emoji: "" };
			this.saveUser();
		},

		saveUser(nickname?: string, emoji?: string) {
			if (!this.user) return;
			if (nickname !== undefined) this.user.nickname = nickname;
			if (emoji !== undefined) this.user.emoji = emoji;

			localStorage.setItem(
				"planning_poker_user",
				JSON.stringify(this.user),
			);
		},

		// HTTP: Create room
		async createRoom(
			title: string,
			voteType: "linear" | "fibonacci",
			stories: Array<{ title: string; tasks: string[] }>,
		): Promise<string> {
			this.isLoading = true;
			this.error = null;

			try {
				if (!this.user) this.loadUser();
				const res = await fetch(`${BACKEND_URL}/api/rooms`, {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						title,
						voteType,
						creatorUserId: this.user?.userId,
						creatorNickname: this.user?.nickname,
						creatorEmoji: this.user?.emoji,
						stories,
					}),
				});

				if (!res.ok) throw new Error("Failed to create room");
				const data = await res.json();

				return data.id;
			} catch (err: unknown) {
				this.error = (err as Error).message;
				throw err;
			} finally {
				this.isLoading = false;
			}
		},

		// HTTP: Fetch Room Details
		async fetchRoomDetails(roomId: string) {
			try {
				if (!this.user) this.loadUser();
				const userId = this.user?.userId || "";
				const res = await fetch(
					`${BACKEND_URL}/api/rooms/${roomId}?userId=${userId}`,
				);

				if (!res.ok) throw new Error("Failed to load room details");
				const data = await res.json();
				this.room = data;

				if (this.room) {
					const allVoted = this.room.stories.every((story) =>
						story.tasks.every((task) => task.points !== null),
					);

					if (!allVoted) {
						this.isFinishModalDismissed = false;
					}
				}
			} catch (err: unknown) {
				this.error = (err as Error).message;
				throw err;
			}
		},

		// HTTP: Fetch Chat History
		async fetchChatHistory(roomId: string) {
			try {
				const res = await fetch(
					`${BACKEND_URL}/api/rooms/${roomId}/chat`,
				);

				if (!res.ok) throw new Error("Failed to load chat history");
				this.chatMessages = await res.json();
			} catch (err: unknown) {
				console.error(err as Error);
			}
		},

		// WebSockets: Initialize socket connection
		async connectSocket(roomId: string) {
			if (this.socket) {
				this.socket.disconnect();
			}

			if (!this.user) this.loadUser();

			// Load database details first
			await this.fetchRoomDetails(roomId);
			await this.fetchChatHistory(roomId);

			// Connect to root socket namespace
			this.socket = io(BACKEND_URL, {
				query: {
					userId: this.user?.userId || "",
					nickname: this.user?.nickname || "",
					emoji: this.user?.emoji || "",
					roomId,
				},
			});

			// Socket Event bindings
			this.socket.on("initUser", (data: { hashedUserId: string }) => {
				this.myHashedUserId = data.hashedUserId;
			});

			this.socket.on(
				"roomState",
				(state: {
					activeTaskId: string | null;
					votingRevealed: boolean;
					votesCount: number;
					players: Player[];
				}) => {
					this.activeTaskId = state.activeTaskId;
					this.votingRevealed = state.votingRevealed;
					this.votesCount = state.votesCount;
					this.players = state.players;
				},
			);

			this.socket.on("chatMessage", (msg: ChatMsg) => {
				this.chatMessages.push(msg);
			});

			this.socket.on("reloadRoomDetails", async () => {
				await this.fetchRoomDetails(roomId);
			});

			this.socket.on(
				"sessionStateChange",
				(data: { mode: "voting" | "add_stories" }) => {
					this.sessionMode = data.mode;
				},
			);

			this.socket.on("sessionFinished", (results: SessionResults) => {
				this.sessionFinishedData = results;
			});
		},

		disconnectSocket() {
			if (this.socket) {
				this.socket.disconnect();
				this.socket = null;
			}

			this.room = null;
			this.players = [];
			this.activeTaskId = null;
			this.chatMessages = [];
			this.sessionFinishedData = null;
			this.sessionMode = "voting";
			this.isFinishModalDismissed = false;
			this.myHashedUserId = null;
		},

		// WS Emit Actions
		castVote(vote: string) {
			this.socket?.emit("castVote", { vote });
		},

		revealVotes() {
			this.socket?.emit("revealVotes");
		},

		confirmPoints(points: number | null) {
			this.socket?.emit("confirmPoints", { points });
		},

		selectTask(taskId: string) {
			this.socket?.emit("selectTask", { taskId });
		},

		sendMessage(content: string) {
			this.socket?.emit("sendMessage", { content });
		},

		finishSession(decision: "add_stories" | "finish" | "cancel") {
			if (decision === "add_stories") {
				this.sessionMode = "add_stories";
				this.isFinishModalDismissed = false;
			} else if (decision === "cancel") {
				this.sessionMode = "voting";
				this.isFinishModalDismissed = true;
			}
			this.socket?.emit("finishSession", { decision });
		},

		addStories(stories: Array<{ title: string; tasks: string[] }>) {
			this.socket?.emit("addStories", { stories });
			this.sessionMode = "voting"; // reset to voting screen
			this.isFinishModalDismissed = false;
		},
	},
});
