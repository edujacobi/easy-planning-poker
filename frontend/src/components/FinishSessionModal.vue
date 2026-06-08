<script setup lang="ts">
import { computed } from 'vue';
import { useRoomStore } from '../stores/room';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { FileText, Plus, X } from 'lucide-vue-next';
import OutlineButton from './dx/OutlineButton.vue';
import PrimaryButton from './dx/PrimaryButton.vue';

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
    <DialogContent class="border-slate-800 bg-slate-900 text-slate-100 max-w-sm dark">
      <DialogHeader>
        <DialogTitle class="text-white text-lg">
          Finish Session?
        </DialogTitle>
        <DialogDescription class="text-slate-400 text-xs mt-1">
          All stories and tasks in this room have been estimated. What would you like to do next?
        </DialogDescription>
      </DialogHeader>

      <DialogFooter class="flex flex-col gap-2 mt-4 sm:flex-col sm:gap-2">
        <OutlineButton type="button" @click="selectAddStories">
          <Plus class="w-4 h-4 mr-2" />
          Add More Stories
        </OutlineButton>
        <PrimaryButton type="button" @click="selectFinish">
          <FileText class="w-4 h-4 mr-2" />
          Finish & Compile Results
        </PrimaryButton>
        <OutlineButton type="button" @click="dismissModal" class="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
          <X class="w-4 h-4 mr-2" />
          Cancel
        </OutlineButton>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
