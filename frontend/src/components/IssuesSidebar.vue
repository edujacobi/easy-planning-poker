<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoomStore } from '../stores/room';
import { Button } from './ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from './ui/accordion';
import { Input } from './ui/input';
import { Eye, Check, CheckCircle2 } from 'lucide-vue-next';

// DX Components
import GlassCard from './dx/GlassCard.vue';
import FlexRow from './dx/FlexRow.vue';
import FlexCol from './dx/FlexCol.vue';
import PrimaryButton from './dx/PrimaryButton.vue';

const roomStore = useRoomStore();

const activeTaskId = computed(() => roomStore.activeTaskId);
const activeTask = computed(() => roomStore.activeTask);
const votingRevealed = computed(() => roomStore.votingRevealed);
const isAdmin = computed(() => roomStore.isAdmin);

// State for point confirmation
const confirmedPointsInput = ref<string>('');

// Calculate total points for each story
function getStoryTotalPoints(storyId: string) {
  const story = roomStore.room?.stories.find(s => s.id === storyId);
  if (!story) return 0;
  return story.tasks.reduce((sum, t) => sum + (t.points || 0), 0);
}

// Reset confirmed points input when active task changes or revealed changes
watch([activeTaskId, votingRevealed], () => {
  if (activeTask.value && votingRevealed.value) {
    const votes = Object.values(roomStore.players.map(p => p.voteValue).filter(Boolean)) as string[];

    if (votes.length > 0) {
      confirmedPointsInput.value = votes[0]; // default suggestion

    } else {
      confirmedPointsInput.value = '';
    }

  } else {
    confirmedPointsInput.value = '';
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

  const pts = confirmedPointsInput.value === '' || isNaN(Number(confirmedPointsInput.value))
    ? null
    : Number(confirmedPointsInput.value);

  roomStore.confirmPoints(pts);
}

const checkAllTasksVoted = computed(() => {
  if (!roomStore.room) return false;

  return roomStore.room.stories.every(story =>
    story.tasks.every(task => task.points !== null)
  );
});

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
      ? 'bg-violet-600/15 border border-violet-500/30 text-violet-300 font-bold'
      : 'bg-slate-950/30 hover:bg-slate-950/60 text-slate-400 border border-transparent',
    isAdmin.value ? 'cursor-pointer' : 'cursor-default'
  ];
}

function getTaskStatusLabel(task: any) {
  if (activeTaskId.value === task.id) return 'Voting now...';

  return task.points !== null ? 'Completed' : 'Pending';
}

function getTaskPointsDisplay(task: any) {
  return task.points !== null ? `${task.points} pts` : '-';
}
</script>

<template>
  <GlassCard class="w-full flex flex-col h-full p-4 md:p-6">

    <!-- Header -->
    <FlexRow justify="between" class="border-b border-slate-800 pb-3 mb-4">
      <h3 class="text-lg font-bold text-white">Issues & Stories</h3>
      <div v-if="checkAllTasksVoted"
        class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
        <CheckCircle2 class="w-3 h-3" />
        All Voted
      </div>
    </FlexRow>

    <!-- Stories list accordion -->
    <div class="flex-1 overflow-y-auto pr-1 space-y-3 max-h-[350px] md:max-h-[450px]">
      <Accordion type="multiple" class="w-full space-y-2">
        <AccordionItem v-for="story in roomStore.room?.stories" :key="story.id" :value="story.id"
          class="border border-slate-800/60 rounded-xl bg-slate-950/20 overflow-hidden">
          <AccordionTrigger class="px-3 py-2.5 hover:no-underline hover:bg-slate-950/40 text-slate-200">
            <div class="flex justify-between w-full pr-4 text-sm font-semibold">
              <span class="truncate max-w-[150px]">{{ story.title }}</span>
              <span class="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                {{ getStoryTotalPoints(story.id) }} pts
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent class="px-3 pt-1 pb-3 space-y-1.5 border-t border-slate-950">
            <!-- Nested Tasks -->
            <FlexRow v-for="task in story.tasks" :key="task.id" @click="selectTask(task.id)" justify="between"
              class="p-2 rounded-lg text-xs transition duration-200 select-none" :class="getTaskClass(task)">
              <FlexCol gap="1" class="max-w-[70%]">
                <span class="truncate text-slate-200">{{ task.title }}</span>
                <span class="text-[11px] text-slate-500 font-mono">
                  {{ getTaskStatusLabel(task) }}
                </span>
              </FlexCol>

              <div class="text-xs font-mono text-slate-300">
                {{ getTaskPointsDisplay(task) }}
              </div>
            </FlexRow>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>

    <!-- Admin Panel Controls -->
    <div v-if="isAdmin" class="mt-6 border-t border-slate-800 pt-4 space-y-4">
      <div class="text-xs uppercase tracking-wider text-slate-500 font-semibold">
        Admin Controls
      </div>

      <!-- Task voting state decisions -->
      <div v-if="activeTask" class="space-y-3">
        <!-- 1. Reveal Votes -->
        <PrimaryButton v-if="!votingRevealed" @click="revealVotes" class="w-full font-medium">
          <Eye class="w-4 h-4 mr-2" />
          Reveal Player Votes
        </PrimaryButton>

        <!-- 2. Point confirmation (displayed only after votes are revealed) -->
        <div v-else class="space-y-2 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
          <label class="text-[11px] font-semibold text-slate-400">Confirm Story Points for Task:</label>
          <FlexRow gap="2">
            <Input v-model="confirmedPointsInput" placeholder="e.g. 3, 5, or empty for skipped"
              class="bg-slate-950 border-slate-800 text-slate-100 text-xs h-9 focus:border-violet-500" />
            <Button @click="confirmPoints" size="sm" class="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0">
              <Check class="w-4 h-4" />
            </Button>
          </FlexRow>
        </div>
      </div>

      <!-- Finish session if all tasks voted -->
      <Button v-if="checkAllTasksVoted" @click="triggerFinishSession"
        class="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
        Finish Active Session
      </Button>
    </div>
  </GlassCard>
</template>
