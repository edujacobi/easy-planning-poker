<script setup lang="ts">
import { Check, CheckCircle2, Eye, LayoutList } from "lucide-vue-next";
import { computed, ref, watch } from "vue";
import { useRoomStore, type StoryItem } from "../stores/room";
import Divider from "./dx/Divider.vue";
import FlexCol from "./dx/FlexCol.vue";
import FlexRow from "./dx/FlexRow.vue";
import GlassCard from "./dx/GlassCard.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import ScrollArea from "./ui/scroll-area/ScrollArea.vue";

const roomStore = useRoomStore();

const activeTaskId = computed(() => roomStore.activeTaskId);
const activeTask = computed(() => roomStore.activeTask);
const votingRevealed = computed(() => roomStore.votingRevealed);
const isAdmin = computed(() => roomStore.isAdmin);

// State for point confirmation
const confirmedPointsInput = ref<string>("");

// Calculate total points for each story
function getStoryTotalPoints(storyId: string) {
	const story = roomStore.room?.stories.find((s) => s.id === storyId);
	if (!story) return 0;
	return story.tasks.reduce((sum, t) => sum + (t.points || 0), 0);
}

// Reset confirmed points input when active task changes or revealed changes
watch([activeTaskId, votingRevealed], () => {
	if (activeTask.value && votingRevealed.value) {
		const votes = Object.values(
			roomStore.players.map((p) => p.voteValue).filter(Boolean),
		) as string[];

		if (votes.length > 0) {
			confirmedPointsInput.value = votes[0]; // default suggestion
		} else {
			confirmedPointsInput.value = "";
		}
	} else {
		confirmedPointsInput.value = "";
	}
});

function selectTask(taskId: string) {
	if (!isAdmin.value) return;

	roomStore.selectTask(taskId);
}

function revealVotes() {
	if (!isAdmin.value) return;

	roomStore.revealVotes();
}

function confirmPoints() {
	if (!isAdmin.value) return;

	const pts =
		confirmedPointsInput.value === "" ||
		isNaN(Number(confirmedPointsInput.value))
			? null
			: Number(confirmedPointsInput.value);

	roomStore.confirmPoints(pts);
}

const checkAllTasksVoted = computed(() => {
	if (!roomStore.room) return false;

	return roomStore.room.stories.every((story) =>
		story.tasks.every((task) => task.points !== null),
	);
});

function checkAllTasksVotedFromStory(story: StoryItem) {
	return story.tasks.every((task) => task.points !== null);
}

// Trigger Finish Session flow
function triggerFinishSession() {
	if (!isAdmin.value) return;

	roomStore.isFinishModalDismissed = false;
}

// Task display helper functions
function getTaskClass(task: any) {
	const isActive = activeTaskId.value === task.id;

	return [
		isActive
			? "bg-indigo-600/15 border border-indigo-500/30 text-indigo-300 ps-3 transition-all duration-150"
			: "bg-background/30 hover:bg-background/60 text-muted-foreground border border-transparent transition-all duration-150",
		isAdmin.value ? "cursor-pointer" : "cursor-default",
	];
}

function getTaskStatusLabel(task: any) {
	if (activeTaskId.value === task.id) return "Voting now...";

	return task.points !== null ? "Completed" : "Pending";
}

function getTaskPointsDisplay(task: any) {
	return task.points !== null ? `${task.points} pts` : "-";
}
</script>

<template>
	<GlassCard
		class="w-full min-w-0 grid grid-rows-[max-content,1fr,auto] h-full p-4 gap-1 max-h-[70dvh]"
	>
		<!-- Header -->
		<FlexCol>
			<FlexRow justify="between">
				<FlexRow>
					<LayoutList
						class="text-indigo-400"
						:size="16"
					/>
					<h3 class="text-sm font-bold text-white">
						Issues & Stories
					</h3>
				</FlexRow>
				<FlexRow
					v-if="checkAllTasksVoted"
					align="center"
					class="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-bold border border-emerald-500/20"
				>
					<CheckCircle2 class="w-3 h-3" />
					All voted
				</FlexRow>
			</FlexRow>
			<Divider/>
		</FlexCol>


		<!-- Stories list accordion -->
		<ScrollArea class="w-full min-w-0 min-h-[400px]">
			<Accordion
				type="multiple"
				class="w-full min-w-0 space-y-2"
			>
				<AccordionItem
					v-for="story in roomStore.room?.stories"
					:key="story.id"
					:value="story.id"
					class="border rounded-xl bg-background/20 overflow-hidden"
				>
					<AccordionTrigger
						class="w-full min-w-0 px-3 py-2.5 hover:no-underline hover:bg-background/40 text-foreground"
					>
						<FlexRow
							justify="between"
							class="w-full min-w-0 pr-2 text-sm font-semibold"
						>
							<span
								class="flex-1 min-w-0 truncate text-left"
								:title="story.title"
							>
								{{ story.title }}
							</span>
							<FlexRow
								class="text-xs px-2 py-0.5 rounded-full font-mono shrink-0"
								:class="checkAllTasksVotedFromStory(story) ? 
									'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
									'bg-muted text-muted-foreground'
								"
							>
								<CheckCircle2
									v-if="checkAllTasksVotedFromStory(story)"
									class="w-3 h-3"
								/>
								{{ getStoryTotalPoints(story.id) }} pts
							</FlexRow>
						</FlexRow>
					</AccordionTrigger>
					<AccordionContent
						class="px-3 pt-1 pb-3 space-y-1.5 border-t"
					>
						<!-- Nested Tasks -->
						<FlexRow
							v-for="task in story.tasks"
							:key="task.id"
							justify="between"
							class="w-full min-w-0 p-2 rounded-lg text-xs transition duration-200 select-none"
							:class="getTaskClass(task)"
							@click="selectTask(task.id)"
						>
							<FlexCol
								gap="1"
								class="flex-1 min-w-0"
							>
								<span
									class="truncate text-slate-200"
									:title="task.title"
								>
									{{ task.title }}
								</span>
								<span class="text-xs text-muted-foreground font-mono">
									{{ getTaskStatusLabel(task) }}
								</span>
							</FlexCol>

							<div class="text-xs font-mono text-muted-foreground shrink-0">
								{{ getTaskPointsDisplay(task) }}
							</div>
						</FlexRow>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</ScrollArea>

		<!-- Admin Panel Controls -->
		
		<FlexCol
			v-if="isAdmin"
			class="space-y-3"
		>
			<Divider/>
			<p class="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
				Admin controls
			</p>

			<!-- Task voting state decisions -->
			<FlexCol
				v-if="activeTask"
				gap="3"
			>
				<!-- 1. Reveal Votes -->
				<PrimaryButton
					v-if="!votingRevealed"
					class="w-full font-medium"
					@click="revealVotes"
				>
					<Eye />
					Reveal votes
				</PrimaryButton>

				<!-- 2. Point confirmation (displayed only after votes are revealed) -->
				<FlexCol v-else>
					<Label>
						Confirm Story points for Task:
					</Label>
					<FlexRow>
						<Input
							v-model="confirmedPointsInput"
							placeholder="e.g. 3, 5, or empty for skipped"
							class="text-xs h-9"
						/>
						<Button
							size="icon-sm"
							class="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0"
							@click="confirmPoints"
						>
							<Check />
						</Button>
					</FlexRow>
				</FlexCol>
			</FlexCol>

			<!-- Finish session if all tasks voted -->
			<Button
				v-if="checkAllTasksVoted"
				class="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
				@click="triggerFinishSession"
			>
				Finish active session
			</Button>
		</FlexCol>
	</GlassCard>
</template>
