<script setup lang="ts">
import { FileText, Plus } from 'lucide-vue-next';
import { computed } from 'vue';
import { useRoomStore } from '../stores/room';
import OutlineButton from './dx/OutlineButton.vue';
import PrimaryButton from './dx/PrimaryButton.vue';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';

const roomStore = useRoomStore();

const isOpen = computed(function () {
	// Only show to Admin when not dismissed, all tasks are voted, session is not finished, and we are not in add_stories mode
	if (roomStore.isFinishModalDismissed) {
		return false;
	}

	if (!roomStore.isAdmin || roomStore.sessionMode === 'add_stories' || roomStore.isSessionFinished) {
		return false;
	}

	if (!roomStore.room) return false;

	return roomStore.room.stories.every(function (story) {
		return story.tasks.every(function (task) {
			return task.points !== null;
		});
	});
});

function selectAddStories() {
	roomStore.finishSession('add_stories');
}

function selectFinish() {
	roomStore.finishSession('finish');
}

function dismissModal() {
	roomStore.isFinishModalDismissed = true;
}
</script>

<template>
	<Dialog :open="isOpen">
		<DialogContent>
			<DialogHeader>
				<DialogTitle>
					Finish session?
				</DialogTitle>
				<DialogDescription>
					All stories and tasks in this room have been estimated. What would you like to do next?
				</DialogDescription>
			</DialogHeader>

			<DialogFooter>
				<OutlineButton @click="selectAddStories">
					<Plus />
					Add more Stories
				</OutlineButton>
				<PrimaryButton @click="selectFinish">
					<FileText />
					Finish and compile results
				</PrimaryButton>
			</DialogFooter>
		</DialogContent>
	</Dialog>
</template>
