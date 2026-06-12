<script setup lang="ts">
import { ArrowRight, Play, Plus, Trash2 } from "lucide-vue-next";
import { ref } from "vue";
import Alert from "./dx/Alert.vue";
import Divider from "./dx/Divider.vue";
import FlexCol from "./dx/FlexCol.vue";
import FlexRow from "./dx/FlexRow.vue";
import FormGroup from "./dx/FormGroup.vue";
import GlassCard from "./dx/GlassCard.vue";
import OutlineButton from "./dx/OutlineButton.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

const emit = defineEmits<{
	(e: "join-room", roomId: string): void;
	(
		e: "create-room",
		payload: {
			title: string;
			voteType: "linear" | "fibonacci";
			stories: Array<{ title: string; tasks: string[] }>;
		},
	): void;
}>();

// Tabs state
const activeTab = ref<"join" | "create">("join");

// Join Room State
const roomIdToJoin = ref("");

// Create Room State
const roomTitle = ref("");
const voteType = ref<"linear" | "fibonacci">("fibonacci");
const stories = ref<Array<{ title: string; tasks: string[] }>>([
	{
		title: "Sprint Backlog Item 1",
		tasks: ["Task 1: Design", "Task 2: Implementation"],
	},
]);

// Custom Alert State
const alertMessage = ref("");

function showAlert(msg: string) {
	alertMessage.value = msg;

	setTimeout(() => {
		if (alertMessage.value === msg) alertMessage.value = "";
	}, 15_000);
}

function joinRoom() {
	const id = roomIdToJoin.value.trim();
	if (!id) {
		return showAlert("Please enter a Room ID.");
	}

	emit("join-room", id);
}

function addStory() {
	stories.value.push({
		title: `New Story ${stories.value.length + 1}`,
		tasks: ["Task 1"],
	});
}

function removeStory(index: number) {
	stories.value.splice(index, 1);
}

function addTask(storyIndex: number) {
	stories.value[storyIndex].tasks.push(
		`Task ${stories.value[storyIndex].tasks.length + 1}`,
	);
}

function removeTask(storyIndex: number, taskIndex: number) {
	stories.value[storyIndex].tasks.splice(taskIndex, 1);
}

function createRoom() {
	if (!roomTitle.value.trim()) {
		return showAlert("Please enter a Room Title.");
	}

	if (
		stories.value.length === 0 ||
		stories.value.some((s) => s.tasks.length === 0)
	) {
		return showAlert(
			"Please ensure you have at least one story and every story has at least one task.",
		);
	}

	emit("create-room", {
		title: roomTitle.value.trim(),
		voteType: voteType.value,
		stories: stories.value,
	});
}
</script>

<template>
	<div class="relative w-full">
		<Alert
			:alertMessage="alertMessage"
			variant="destructive"
			@close="alertMessage = ''"
		/>

		<GlassCard>
			<div class="grid grid-cols-2 gap-1 px-3">
				<button
					class="py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-150"
					:class="
						activeTab === 'join'
							? 'bg-indigo-600 text-white shadow-md'
							: 'text-slate-400 hover:text-slate-200'
					"
					@click="activeTab = 'join'"
				>
					Join room
				</button>
				<button
					class="py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-150"
					:class="
						activeTab === 'create'
							? 'bg-indigo-600 text-white shadow-md'
							: 'text-slate-400 hover:text-slate-200'
					"
					@click="activeTab = 'create'"
				>
					Create room
				</button>
			</div>

			<!-- Join Room Pane -->
			<div
				v-if="activeTab === 'join'"
				class="p-4 space-y-4"
			>
				<FormGroup
					id="roomId"
					label="Room code or ID"
				>
					<FlexRow class="w-full">
						<Input
							id="roomId"
							v-model="roomIdToJoin"
							placeholder="Paste the unique room ID here..."
							@keyup.enter="joinRoom"
						/>
						<PrimaryButton
							size="sm"
							@click="joinRoom"
						>
							Join
							<Play />
						</PrimaryButton>
					</FlexRow>
				</FormGroup>
			</div>

			<!-- Create Room Pane -->
			<div
				v-if="activeTab === 'create'"
				class="px-4 py-2 space-y-4"
			>
				<!-- Room Title -->
				<FormGroup
					id="roomTitle"
					label="Room title"
				>
					<Input
						id="roomTitle"
						v-model="roomTitle"
						placeholder="Death Star team estimation"
					/>
				</FormGroup>

				<!-- Deck selection -->
				<FlexCol gap="2">
					<Label>
						Choose vote style
					</Label>
					<div class="grid grid-cols-2 gap-3">
						<button
							type="button"
							class="p-4 rounded-xl border bg-slate-950/60 hover:bg-slate-950 text-left transition-all duration-150"
							:class="
								voteType === 'fibonacci'
									? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-700/10 hover:bg-indigo-700/15'
									: 'border-slate-800 hover:border-slate-700'
							"
							@click="voteType = 'fibonacci'"
						>
							<div class="font-bold text-white">
								Fibonacci
							</div>
							<div class="text-xs text-slate-400 mt-1">
								0, 1, 2, 3, 5, 8, 13
							</div>
						</button>
						<button
							type="button"
							class="p-4 rounded-xl border bg-slate-950/60 hover:bg-slate-950 text-left transition-all duration-150"
							:class="
								voteType === 'linear'
									? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-700/10 hover:bg-indigo-700/15'
									: 'border-slate-800 hover:border-slate-700'
							"
							@click="voteType = 'linear'"
						>
							<div class="font-bold text-white">
								Linear
							</div>
							<div class="text-xs text-slate-400 mt-1">
								0, 1, 2, 3, 4, 5, 6, 7, 8
							</div>
						</button>
					</div>
				</FlexCol>

				<!-- Story and Task manager -->
				<FlexCol
					gap="3"
					class="py-2"
				>
					<Label>
						Stories and Tasks
					</Label>

					<!-- List of input stories -->
					<div class="space-y-4 pr-1">
						<div
							v-for="(story, sIdx) in stories"
							:key="sIdx"
							class="space-y-3 relative group"
						>
							<!-- Story Header -->
							<FlexRow>
								<div
									class="text-sm bg-slate-800 text-slate-300 px-3 py-0.5 rounded font-mono shrink-0"
								>
									Story {{ sIdx + 1 }}
								</div>
								<Input
									v-model="story.title"
									placeholder="Story title..."
									class="text-sm h-8"
								/>
								<button
									type="button"
									class="text-slate-600 hover:text-red-400 transition shrink-0"
									title="Remove Story"
									@click="removeStory(sIdx)"
								>
									<Trash2 />
								</button>
							</FlexRow>

							<!-- Nested Tasks -->
							<div
								class="pl-6 space-y-2 border-l border-slate-800 pb-3"
							>
								<FlexRow
									v-for="(_, tIdx) in story.tasks"
									:key="tIdx"
								>
									<span
										class="text-sm text-slate-500 font-mono shrink-0"
									>
										Task {{ tIdx + 1 }}
									</span>
									<Input
										v-model="story.tasks[tIdx]"
										placeholder="Task Title..."
										class="text-xs h-7"
									/>
									<button
										type="button"
										class="text-slate-600 hover:text-red-400 transition shrink-0"
										title="Remove Task"
										@click="removeTask(sIdx, tIdx)"
									>
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</FlexRow>

								<OutlineButton
									size="sm"
									@click="addTask(sIdx)"
								>
									<Plus class="w-3.5 h-3.5" />
									Add Task
								</OutlineButton>
							</div>
						</div>
					</div>
					<OutlineButton
						size="sm"
						@click="addStory"
					>
						<Plus class="w-3.5 h-3.5" />
						Add Story
					</OutlineButton>
				</FlexCol>

				<Divider />

				<!-- Create Button -->
				<PrimaryButton
					class="w-full py-6 text-base"
					@click="createRoom"
				>
					Create and open room
					<ArrowRight />
				</PrimaryButton>
			</div>
		</GlassCard>
	</div>
</template>
