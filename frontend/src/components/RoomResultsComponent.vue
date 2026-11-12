<script setup lang="ts">
import { Check, Copy, FileCheck, Home } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useRoomStore, type SessionResults } from "../stores/room";
import Divider from "./dx/Divider.vue";
import FlexRow from "./dx/FlexRow.vue";
import FormGroup from "./dx/FormGroup.vue";
import GlassCard from "./dx/GlassCard.vue";
import Grid from "./dx/Grid.vue";
import HighlightedIcon from "./dx/HighlightedIcon.vue";
import HighlightedValue from "./dx/HighlightedValue.vue";
import OutlineButton from "./dx/OutlineButton.vue";
import PreFormattedText from "./dx/PreFormattedText.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const props = defineProps<{
	sessionFinishedData: SessionResults | null;
}>();

const router = useRouter();
const roomStore = useRoomStore();
const isCopiedMd = ref(false);
const copyError = ref("");
const priorityError = ref("");
const priorityPending = ref(false);

async function updatePriority(event: Event, task: SessionResults["tasks"][number]) {
	const select = event.target;
	if (!(select instanceof HTMLSelectElement)) return;
	const priority = select.value;
	if (priority !== "Low" && priority !== "Medium" && priority !== "High") return;
	priorityPending.value = true;
	priorityError.value = "";
	try {
		await roomStore.setTaskPriority(task.id, priority);
	} catch (error: unknown) {
		select.value = task.priority;
		priorityError.value =
			error instanceof Error ? error.message : "Could not update priority.";
	} finally {
		priorityPending.value = false;
	}
}

async function copyResultsMarkdown() {
	if (!props.sessionFinishedData?.markdown) return;

	try {
		await navigator.clipboard.writeText(props.sessionFinishedData.markdown);
		copyError.value = "";
		isCopiedMd.value = true;
		setTimeout(() => (isCopiedMd.value = false), 2_000);
	} catch {
		copyError.value = "Could not copy to the clipboard. Please copy the preview manually.";
	}
}

const copyButtonText = computed(() =>
	isCopiedMd.value ? "RESULTS.md Copied!" : "Copy RESULTS.md File Content",
);
</script>

<template>
	<div
		class="fixed inset-0 backdrop-blur-md bg-background/80 flex items-center justify-center z-50 p-4 md:p-8"
	>
		<GlassCard class="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
			<CardHeader class="text-center">
				<HighlightedIcon>
					<FileCheck class="w-6 h-6" />
				</HighlightedIcon>
				<CardTitle size="big">
					Session concluded!
				</CardTitle>
				<CardDescription>
					Here are the compiled statistics and results of the Planning
					Poker session.
				</CardDescription>
			</CardHeader>

			<Divider />

			<CardContent>
				<!-- Quick Stats Panel Grid -->
				<Grid
					columns="3"
					gap="4"
				>
					<HighlightedValue
						title="Stories voted"
						:value="sessionFinishedData?.totalStories"
					/>
					<HighlightedValue
						title="Total points"
						:value="sessionFinishedData?.totalPoints"
					/>
					<HighlightedValue
						title="Participants"
						:value="sessionFinishedData?.participantsCount"
					/>
				</Grid>

				<!-- RESULTS.md Preview block -->
				<FormGroup
					id="markdownPreview"
					label="RESULTS.md Preview:"
				>
					<PreFormattedText
						:markdownContent="sessionFinishedData?.markdown"
					/>
				</FormGroup>

				<div class="space-y-2">
					<h3 class="text-sm font-medium">
						Task priorities
					</h3>
					<div
						v-for="task in sessionFinishedData?.tasks"
						:key="task.id"
						class="flex items-center justify-between gap-3"
					>
						<span class="text-sm break-words">{{ task.title }}</span>
						<select
							v-if="roomStore.isAdmin"
							:value="task.priority"
							:aria-label="`Priority for ${task.title}`"
							:disabled="priorityPending"
							class="rounded-md border bg-background px-2 py-1 text-sm"
							@change="updatePriority($event, task)"
						>
							<option value="Low">
								Low
							</option>
							<option value="Medium">
								Medium
							</option>
							<option value="High">
								High
							</option>
						</select>
						<span
							v-else
							class="text-sm"
						>{{ task.priority }}</span>
					</div>
					<p
						v-if="priorityError"
						role="alert"
						class="text-sm text-destructive"
					>
						{{ priorityError }}
					</p>
				</div>

				<p
					v-if="copyError"
					role="alert"
					class="text-sm text-destructive"
				>
					{{ copyError }}
				</p>
			</CardContent>

			<Divider />

			<FlexRow
				class="p-4 py-0 gap-3"
				justify="between"
			>
				<PrimaryButton
					class="flex-1 py-6 text-sm"
					@click="copyResultsMarkdown"
				>
					<Check v-if="isCopiedMd" />
					<Copy v-else />
					{{ copyButtonText }}
				</PrimaryButton>

				<OutlineButton
					class="py-6"
					@click="router.push('/')"
				>
					<Home />
					Return
				</OutlineButton>
			</FlexRow>
		</GlassCard>
	</div>
</template>
