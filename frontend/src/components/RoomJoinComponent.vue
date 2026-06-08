<script setup lang="ts">
import { ref } from 'vue';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Play, Plus, Trash2, ArrowRight, AlertTriangle } from 'lucide-vue-next';
import { Alert, AlertTitle, AlertDescription } from './ui/alert';

// DX Components
import PrimaryButton from './dx/PrimaryButton.vue';
import OutlineButton from './dx/OutlineButton.vue';
import FlexRow from './dx/FlexRow.vue';
import FlexCol from './dx/FlexCol.vue';

const emit = defineEmits<{
  (e: 'join-room', roomId: string): void;
  (e: 'create-room', payload: { title: string; voteType: 'linear' | 'fibonacci'; stories: Array<{ title: string; tasks: string[] }> }): void;
}>();

// Tabs state
const activeTab = ref<'join' | 'create'>('join');

// Join Room State
const roomIdToJoin = ref('');

// Create Room State
const roomTitle = ref('');
const voteType = ref<'linear' | 'fibonacci'>('fibonacci');
const stories = ref<Array<{ title: string; tasks: string[] }>>([
  { title: 'Sprint Backlog Item 1', tasks: ['Task 1: Design', 'Task 2: Implementation'] }
]);

// Custom Alert State
const alertMessage = ref('');

function showAlert(msg: string) {
  alertMessage.value = msg;

  setTimeout(() => {
    if (alertMessage.value === msg) alertMessage.value = '';
  }, 4000);
}

function joinRoom() {
  const id = roomIdToJoin.value.trim();
  if (!id) {
    return showAlert('Please enter a Room ID.');
  }

  emit('join-room', id);
}

function addStory() {
  stories.value.push({ title: `New Story ${stories.value.length + 1}`, tasks: ['Task 1'] });
}

function removeStory(index: number) {
  stories.value.splice(index, 1);
}

function addTask(storyIndex: number) {
  stories.value[storyIndex].tasks.push(`Task ${stories.value[storyIndex].tasks.length + 1}`);
}

function removeTask(storyIndex: number, taskIndex: number) {
  stories.value[storyIndex].tasks.splice(taskIndex, 1);
}

function createRoom() {
  if (!roomTitle.value.trim()) {
    return showAlert('Please enter a Room Title.');
  }

  if (stories.value.length === 0 || stories.value.some(s => s.tasks.length === 0)) {
    return showAlert('Please ensure you have at least one story and every story has at least one task.');
  }

  emit('create-room', {
    title: roomTitle.value.trim(),
    voteType: voteType.value,
    stories: stories.value
  });
}
</script>

<template>
  <div class="relative w-full">
    <!-- Floating Alert -->
    <div v-if="alertMessage" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 animate-fade-in">
      <Alert variant="destructive"
        class="bg-slate-950/95 border-red-500/50 text-red-200 backdrop-blur-md shadow-2xl flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div class="flex-1">
          <AlertTitle class="flex items-center justify-between text-sm font-semibold">
            <span>Warning</span>
            <button @click="alertMessage = ''"
              class="text-xs hover:text-white underline opacity-70 hover:opacity-100">Dismiss</button>
          </AlertTitle>
          <AlertDescription class="text-xs text-red-300 mt-1">
            {{ alertMessage }}
          </AlertDescription>
        </div>
      </Alert>
    </div>

    <FlexCol class="border border-slate-800 bg-slate-900/40 rounded-2xl p-1.5 backdrop-blur-xl">
      <div class="grid grid-cols-2 gap-1">
        <button @click="activeTab = 'join'"
          class="py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200"
          :class="activeTab === 'join' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'">
          Join Room
        </button>
        <button @click="activeTab = 'create'"
          class="py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200"
          :class="activeTab === 'create' ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'">
          Create Room
        </button>
      </div>

      <!-- Join Room Pane -->
      <div v-if="activeTab === 'join'" class="p-4 space-y-4 animate-slide-up">
        <FormGroup label="Room Code or ID" id="roomId">
          <FlexRow class="w-full">
            <Input id="roomId" v-model="roomIdToJoin" placeholder="Paste the unique room ID here..."
              class="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:ring-violet-500/20"
              @keyup.enter="joinRoom" />
            <PrimaryButton @click="joinRoom">
              Join
              <Play class="w-4 h-4 ml-2" />
            </PrimaryButton>
          </FlexRow>
        </FormGroup>
      </div>

      <!-- Create Room Pane -->
      <div v-if="activeTab === 'create'" class="p-4 space-y-5 animate-slide-up">

        <!-- Room Title -->
        <FormGroup label="Room Title" id="roomTitle">
          <Input id="roomTitle" v-model="roomTitle" placeholder="e.g. Death Star Team Estimation"
            class="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:ring-violet-500/20" />
        </FormGroup>

        <!-- Deck selection -->
        <FlexCol gap="2">
          <Label class="text-slate-300">Choose Vote Deck</Label>
          <div class="grid grid-cols-2 gap-3">
            <button type="button" @click="voteType = 'fibonacci'"
              class="p-4 rounded-xl border bg-slate-950/60 hover:bg-slate-950 text-left transition-all duration-200"
              :class="voteType === 'fibonacci' ? 'border-violet-500 ring-2 ring-violet-500/10' : 'border-slate-800 hover:border-slate-700'">
              <div class="font-bold text-white">Fibonacci</div>
              <div class="text-xs text-slate-400 mt-1">0, 1, 2, 3, 5, 8, 13</div>
            </button>
            <button type="button" @click="voteType = 'linear'"
              class="p-4 rounded-xl border bg-slate-950/60 hover:bg-slate-950 text-left transition-all duration-200"
              :class="voteType === 'linear' ? 'border-violet-500 ring-2 ring-violet-500/10' : 'border-slate-800 hover:border-slate-700'">
              <div class="font-bold text-white">Linear</div>
              <div class="text-xs text-slate-400 mt-1">0, 1, 2, 3, 4, 5, 6, 7, 8</div>
            </button>
          </div>
        </FlexCol>

        <!-- Story and Task manager -->
        <FlexCol gap="3" class="pt-2">
          <FlexRow justify="between" class="border-b border-slate-800 pb-2">
            <Label class="text-slate-300 font-semibold">Stories & Tasks List</Label>
            <OutlineButton size="sm" @click="addStory">
              <Plus class="w-3.5 h-3.5 mr-1" />
              Add Story
            </OutlineButton>
          </FlexRow>

          <!-- List of input stories -->
          <div class="space-y-4 max-h-64 overflow-y-auto pr-1">
            <div v-for="(story, sIdx) in stories" :key="sIdx"
              class="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 relative group">
              <!-- Story Header -->
              <FlexRow>
                <div class="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono shrink-0">Story {{ sIdx +
                  1 }}</div>
                <Input v-model="story.title" placeholder="Story Title..."
                  class="bg-slate-950 border-slate-800 text-slate-100 focus:border-violet-500 text-sm h-8" />
                <button type="button" @click="removeStory(sIdx)"
                  class="text-slate-600 hover:text-red-400 transition shrink-0" title="Remove Story">
                  <Trash2 class="w-4 h-4" />
                </button>
              </FlexRow>

              <!-- Nested Tasks -->
              <div class="pl-4 space-y-2 border-l border-slate-800">
                <FlexRow v-for="(_, tIdx) in story.tasks" :key="tIdx">
                  <span class="text-xs text-slate-500 font-mono shrink-0">Task {{ tIdx + 1 }}</span>
                  <Input v-model="story.tasks[tIdx]" placeholder="Task Title..."
                    class="bg-slate-950 border-slate-800 text-slate-300 focus:border-violet-500 text-xs h-7" />
                  <button type="button" @click="removeTask(sIdx, tIdx)"
                    class="text-slate-600 hover:text-red-400 transition shrink-0" title="Remove Task">
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </FlexRow>

                <button type="button" @click="addTask(sIdx)"
                  class="text-xs text-violet-400 hover:text-violet-300 flex items-center mt-1">
                  <Plus class="w-3.5 h-3.5 mr-1" />
                  Add Task
                </button>
              </div>
            </div>
          </div>
        </FlexCol>

        <!-- Create Button -->
        <PrimaryButton @click="createRoom" class="w-full py-6 text-base">
          Create and Open Room
          <ArrowRight class="w-5 h-5 ml-2" />
        </PrimaryButton>
      </div>
    </FlexCol>
  </div>
</template>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.4s ease-out forwards;
}

.animate-fade-in {
  animation: fadeIn 0.3s ease-out forwards;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
