<script setup lang="ts">
import { ref } from "vue";
import type { StoryInput } from "../stores/room";
import Alert from "../components/dx/Alert.vue";
import StoryTaskAdder from "./StoryTaskAdder.vue";
import Divider from "./dx/Divider.vue";
import FlexRow from "./dx/FlexRow.vue";
import OutlineButton from "./dx/OutlineButton.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import { CardContent, CardHeader } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";
import Spinner from "./dx/Spinner.vue";

const props = defineProps<{
	isAdmin: boolean;
	endMessage: string;
}>();

const emit = defineEmits<{
	(e: "submit", stories: StoryInput[]): void;
	(e: "cancel"): void;
}>();

const newStories = ref<StoryInput[]>([
	{ title: "New Backlog Item", tasks: [{ title: "Task 1", description: "" }] },
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
		newStories.value.every((s) => s.tasks.length > 0);

	if (!canSubmit) {
		showAlert("Please enter at least one story and verify all stories contain tasks.");
		return;
	}

	emit("submit", newStories.value);
	// Reset local state
	newStories.value = [{ title: "New Backlog Item", tasks: [{ title: "Task 1", description: "" }] }];
}
</script>

<template>
	<output
		v-if="!props.isAdmin"
		class="fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border bg-background p-4 text-foreground shadow-lg"
	>
		<Spinner borderColor="amber" />
		<span>Admin is currently adding more stories and tasks.</span>
	</output>
	<Dialog
		v-else
		:open="true"
		@update:open="(open) => { if (!open) emit('cancel'); }"
	>
		<DialogContent
			:show-close-button="false"
			class="sm:max-w-xl max-h-[85vh] overflow-y-auto flex flex-col"
			@pointer-down-outside.prevent
		>
			<Alert
				:alertMessage="alertMessage"
				variant="destructive"
				@close="alertMessage = ''"
			/>

			<CardHeader>
				<DialogTitle>
					Add more Stories and Tasks
				</DialogTitle>
				<DialogDescription>
					{{ props.endMessage }}
				</DialogDescription>
			</CardHeader>

			<Divider/>

			<CardContent class="flex-1 px-6">
				<StoryTaskAdder
					label="New Stories"
					:stories="newStories"
					class="py-2"
				/>
			</CardContent>

			<Divider/>

			<FlexRow
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
		</DialogContent>
	</Dialog>
</template>
