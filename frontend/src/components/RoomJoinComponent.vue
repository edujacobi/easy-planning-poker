<script setup lang="ts">
import { ArrowRight, Play } from "lucide-vue-next";
import { ref } from "vue";
import Alert from "./dx/Alert.vue";
import Divider from "./dx/Divider.vue";
import FlexCol from "./dx/FlexCol.vue";
import FlexRow from "./dx/FlexRow.vue";
import FormGroup from "./dx/FormGroup.vue";
import GlassCard from "./dx/GlassCard.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import StoryTaskAdder from "./StoryTaskAdder.vue";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import Grid from "./dx/Grid.vue";
import SelectableItem from "./dx/SelectableItem.vue";
import SwitchButton from "./dx/SwitchButton.vue";

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

type VoteType = "linear" | "fibonacci";

const voteType = ref<VoteType>("fibonacci");
const voteTypeData = ref<Array<{
	label: string;
	value: VoteType;
	cards: number[]
}>>([
	{
		label: "Fibonacci",
		value: "fibonacci",
		cards: [0, 1, 2, 3, 5, 8, 13, 21]
	},
	{
		label: "Linear",
		value: "linear",
		cards: [0, 1, 2, 3, 4, 5, 6, 7, 8]
	},
]);


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
	}, 10_000);
}

function joinRoom() {
	const id = roomIdToJoin.value.trim();
	if (!id) {
		return showAlert("Please enter a Room ID.");
	}

	emit("join-room", id);
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
			<Grid
				columns="2"
				class="px-3"
			> 
				<SwitchButton 
					:active="activeTab === 'join'"
					@click="activeTab = 'join'"
				>
					Join room
				</SwitchButton>
				<SwitchButton 
					:active="activeTab === 'create'"
					@click="activeTab = 'create'"
				>
					Create room
				</SwitchButton>
			</Grid>

			<!-- Join Room Pane -->
			<FlexCol
				gap="3"
				class="px-4 py-2"
			>
				<template v-if="activeTab === 'join'">
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
				</template>

				<!-- Create Room Pane -->
				<template v-if="activeTab === 'create'">
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
					<FlexCol>
						<Label>
							Choose vote style
						</Label>
						<Grid columns="2">
							<SelectableItem
								v-for="(type, idx) in voteTypeData"
								:key="idx"
								:active="voteType === type.value"
								@click="voteType = type.value"
							>
								<p class="font-bold text-white">
									{{ type.label }}
								</p>
								<p class="text-sm text-slate-400">
									{{ type.cards.join(", ") }}
								</p>
							</SelectableItem>
						</Grid>
					</FlexCol>

					<!-- Story and Task manager -->
					<StoryTaskAdder
						label="Stories and Tasks"
						:stories="stories"
					/>

					<Divider />

					<!-- Create Button -->
					<PrimaryButton
						class="w-full py-6 text-base"
						@click="createRoom"
					>
						Create and open room
						<ArrowRight />
					</PrimaryButton>
				</template>
			</FlexCol>
		</GlassCard>
	</div>
</template>
