<script setup lang="ts">
import { ref } from "vue";
import { useRoomStore } from "../stores/room";
import type { StoryInput } from "../stores/room";
import Alert from "./dx/Alert.vue";
import Divider from "./dx/Divider.vue";
import FlexCol from "./dx/FlexCol.vue";
import FlexRow from "./dx/FlexRow.vue";
import OutlineButton from "./dx/OutlineButton.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import StoryTaskAdder from "./StoryTaskAdder.vue";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

const emit = defineEmits<{
	(e: "close"): void;
}>();

const roomStore = useRoomStore();

const localStories = ref<StoryInput[]>(
	roomStore.room?.stories
		? JSON.parse(JSON.stringify(roomStore.room.stories))
		: []
);

const alertMessage = ref("");

function showAlert(msg: string) {
	alertMessage.value = msg;
	setTimeout(() => {
		if (alertMessage.value === msg) alertMessage.value = "";
	}, 5000);
}

function handleSave() {
	const canSave = localStories.value.length > 0 &&
		localStories.value.every((s) => s.title.trim() && s.tasks.length > 0 && s.tasks.every(t => t.title.trim()));

	if (!canSave) {
		showAlert("Please verify all stories and tasks have titles, and each story has at least one task.");
		return;
	}

	roomStore.editStories(localStories.value);
	emit("close");
}
</script>

<template>
	<Dialog
		:open="true"
		@update:open="(open) => { if (!open) emit('close'); }"
	>
		<DialogContent
			:show-close-button="false"
			class="sm:max-w-xl max-h-[85vh] flex flex-col p-6 gap-4"
			@pointer-down-outside.prevent
		>
			<Alert
				:alertMessage="alertMessage"
				variant="destructive"
				@close="alertMessage = ''"
			/>

			<FlexCol gap="1">
				<DialogTitle class="text-lg font-bold">
					Edit Stories and Tasks
				</DialogTitle>
				<DialogDescription>
					Modify details, remove, or append new stories and tasks. Saving updates database real-time.
				</DialogDescription>
			</FlexCol>

			<Divider />

			<!-- Stories list with scroll -->
			<div class="flex-1 overflow-y-auto pr-2 min-h-[300px]">
				<StoryTaskAdder
					label="Stories and Tasks"
					:stories="localStories"
				/>
			</div>

			<Divider />

			<FlexRow
				justify="end"
				gap="3"
			>
				<OutlineButton @click="emit('close')">
					Cancel
				</OutlineButton>
				<PrimaryButton @click="handleSave">
					Save
				</PrimaryButton>
			</FlexRow>
		</DialogContent>
	</Dialog>
</template>
