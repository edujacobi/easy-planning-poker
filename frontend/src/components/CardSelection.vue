<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoomStore } from '../stores/room';

const roomStore = useRoomStore();

const activeVote = ref<string | null>(null);

// Get the correct card set based on Room Config
const cardOptions = computed(() => {
  if (roomStore.room?.voteType === 'linear') {
    return ['0', '1', '2', '3', '4', '5', '6', '7', '8', '?'];

  }
  return ['0', '1', '2', '3', '5', '8', '13', '?'];
});

// Watch activeTaskId: reset vote card highlights if the task changes
watch(() => roomStore.activeTaskId, () => {
  activeVote.value = null;
});

// Watch roomState votingRevealed: reset local card state when task gets confirmed
watch(() => roomStore.votingRevealed, (newVal) => {
  if (!newVal && Object.keys(roomStore.players).length > 0) {
    const myPlayerState = roomStore.players.find(p => p.userId === roomStore.user?.userId);

    if (myPlayerState && !myPlayerState.hasVoted) {
      activeVote.value = null;
    }
  }
});

function selectCard(card: string) {
  if (roomStore.votingRevealed || !roomStore.activeTaskId) return;

  if (activeVote.value === card) {
    activeVote.value = null;
    roomStore.castVote('');

  } else {
    activeVote.value = card;
    roomStore.castVote(card);
  }
}

// Computed labels and styles helper
const chooseCardLabel = computed(() => roomStore.activeTaskId ? 'Choose your card 👇' : 'Select a task to start voting');

function getCardClass(card: string) {
  const isVoteActive = activeVote.value === card;
  const isInteractionDisabled = roomStore.votingRevealed || !roomStore.activeTaskId;

  return [
    isVoteActive
      ? 'bg-gradient-to-b from-violet-600 to-indigo-600 border-violet-400 text-white -translate-y-2 shadow-lg shadow-violet-500/20 scale-105'
      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:text-slate-100 hover:-translate-y-1',

    isInteractionDisabled ? 'opacity-40 cursor-not-allowed hover:translate-y-0' : 'cursor-pointer'
  ];
}
</script>

<template>
  <div class="w-full flex flex-col items-center gap-3 py-4 mt-2">
    <div class="text-slate-400 text-xs font-semibold uppercase tracking-wider">
      {{ chooseCardLabel }}
    </div>

    <!-- Cards container -->
    <div class="flex flex-wrap gap-2 md:gap-3 justify-center items-center px-4 max-w-3xl">
      <button v-for="card in cardOptions" :key="card" type="button" @click="selectCard(card)"
        :disabled="roomStore.votingRevealed || !roomStore.activeTaskId"
        class="h-16 w-11 md:h-20 md:w-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg md:text-xl transition-all duration-200 select-none shadow-md"
        :class="getCardClass(card)">
        {{ card }}
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Hover animation override */
button:disabled {
  transform: none !important;
}
</style>
