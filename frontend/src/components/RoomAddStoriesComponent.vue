<script setup lang="ts">
import { ref } from "vue";
import Alert from "../components/dx/Alert.vue";
import StoryTaskAdder from "./StoryTaskAdder.vue";
import Divider from "./dx/Divider.vue";
import FlexRow from "./dx/FlexRow.vue";
import GlassCard from "./dx/GlassCard.vue";
import OutlineButton from "./dx/OutlineButton.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Spinner from "./dx/Spinner.vue";

const props = defineProps<{
	isAdmin: boolean;
	endMessage: string;
}>();

const emit = defineEmits<{
	(e: "submit", stories: Array<{ title: string; tasks: string[] }>): void;
	(e: "cancel"): void;
}>();

const newStories = ref<Array<{ title: string; tasks: string[] }>>([
	{ title: "New Backlog Item", tasks: ["Task 1"] },
]);

const alertMessage = ref("");

function showAlert(msg: string) {
	alertMessage.value = msg;
	setTimeout(() => {
		if (alertMessage.value === msg) alertMessage.value = "";
	}, 10_000);
}

function handleSubmit() {
	const canSubmit = newStories.value.length > 0 &&
		newStories.value.some((s) => s.tasks.length > 0);
	
	if (!canSubmit) {
		showAlert("Please enter at least one story and verify all stories contain tasks.");
		return;
	}

	emit("submit", newStories.value);
	// Reset local state
	newStories.value = [{ title: "New Backlog Item", tasks: ["Task 1"] }];
}
</script>

<template>
	<div
		class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4"
	>
		<Alert
			:alertMessage="alertMessage"
			variant="destructive"
			@close="alertMessage = ''"
		/>
		
		<GlassCard
			class="w-full max-w-xl max-h-[85vh] overflow-y-auto flex flex-col"
		>
			<CardHeader>
				<CardTitle>
					Add more Stories and Tasks
				</CardTitle>
				<CardDescription>
					{{ props.endMessage }}
				</CardDescription>
			</CardHeader>

			<Divider/>

			<CardContent class="flex-1 px-6">
				<!-- Non-Admin waiting screen -->
				<section
					v-if="!props.isAdmin"
					class="text-center py-6 space-y-3"
				>
					<Spinner borderColor="amber" />
					<p class="text-sm text-slate-400">
						Admin is currently adding more Stories to estimation
						backlog...
					</p>
				</section>

				<!-- Admin Add stories form list -->
				<StoryTaskAdder
					v-else
					label="New Stories"
					:stories="newStories"
					class="py-2"
				/>
			</CardContent>
			
			<Divider/>

			<FlexRow
				v-if="props.isAdmin"
				class="px-3 gap-3"
			>
				<PrimaryButton
					class="flex-1"
					@click="handleSubmit"
				>
					Append backlog Stories
				</PrimaryButton>
				<OutlineButton @click="emit('cancel')">
					Cancel
				</OutlineButton>
			</FlexRow>
		</GlassCard>
	</div>
</template>
