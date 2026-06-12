<script setup lang="ts">
import { computed } from 'vue';
import { useRoomStore } from '../stores/room';

const roomStore = useRoomStore();

const players = computed(() => roomStore.players);
const votingRevealed = computed(() => roomStore.votingRevealed);
const activeTask = computed(() => roomStore.activeTask);

// Determine table status message
const tableStatusText = computed(() => {
  if (!activeTask.value) {
    return 'No task selected for voting';
  }

  const votedCount = players.value.filter(p => p.hasVoted && p.isOnline).length;
  const onlineCount = players.value.filter(p => p.isOnline).length;

  if (votingRevealed.value) {
    return 'Votes Revealed!';
  }

  if (votedCount === 0) {
    return 'Waiting for player\'s votes...';
  }

  if (votedCount === onlineCount) {
    return 'All players have voted! Reveal ready.';
  }

  return `Voted: ${votedCount} / ${onlineCount}`;
});

// Computed headers
const sessionSubtitle = computed(() => activeTask.value ? 'Active Vote Session' : 'Standby');
const sessionTitle = computed(() => activeTask.value ? activeTask.value.title : 'Select a task from sidebar');

// Player style and text helper functions
function getPlayerVoteDisplay(player: any) {
  return votingRevealed.value ? player.voteValue || '?' : '✓';
}

function getPlayerVotedCardClass() {
  return votingRevealed.value
    ? 'bg-slate-950 border-indigo-500 text-indigo-400 shadow-indigo-500/10'
    : 'bg-indigo-700 border-indigo-500 text-white';
}

function getPlayerBadgeClass(player: any) {
  return player.isOnline ? (player.isAdmin ? 'border-amber-500' : 'border-emerald-500') : 'border-slate-800 opacity-40';
}

function getPlayerNameClass(player: any) {
  return player.isOnline ? 'text-slate-200' : 'text-slate-700';
}

function getPlayerRoleText(player: any) {
  return player.isOnline ? (player.isAdmin ? 'Admin' : 'Player') : 'Offline';
}

// Dynamic layout distribution coordinate calculations
function getPositionStyles(index: number, total: number) {
  if (total === 0) return {};

  // Distribute points evenly along a circle mapping
  const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // start from top
  const rx = 40; // horizontal radius in percent
  const ry = 35; // vertical radius in percent

  const x = 50 + rx * Math.cos(angle);
  const y = 50 + ry * Math.sin(angle);

  return {
    left: `${x}%`,
    top: `${y}%`,
    transform: 'translate(-50%, -50%)',
  };
}
</script>

<template>
  <div class="relative w-full h-[400px] md:h-[500px] overflow-hidden">

    <!-- Table Ring Center -->
    <div
      class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[40%] bg-gradient-to-br from-indigo-900/40 to-slate-900/60 border border-indigo-500/20 rounded-[4rem] flex flex-col items-center justify-center text-center px-4 shadow-2xl shadow-indigo-500/5 backdrop-blur-md">
      <div class="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-1">
        {{ sessionSubtitle }}
      </div>
      <div class="text-white text-sm md:text-base font-medium max-w-[85%] truncate mb-1">
        {{ sessionTitle }}
      </div>
      <div class="text-slate-400 text-xs animate-pulse">
        {{ tableStatusText }}
      </div>
    </div>

    <!-- Players distributed circularly around the table -->
    <div v-for="(player, idx) in players" :key="player.userId"
      class="absolute transition-all duration-500 flex flex-col items-center gap-1.5"
      :style="getPositionStyles(idx, players.length)">

      <!-- Voted Card Space slot -->
      <div class="h-14 w-10 flex items-center justify-center relative">
        <div v-if="player.hasVoted && player.isOnline"
          class="h-12 w-9 min-w-9 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-300"
          :class="getPlayerVotedCardClass()">
          {{ getPlayerVoteDisplay(player) }}
        </div>

        <!-- Empty spacer when has not voted -->
        <div v-else-if="player.isOnline"
          class="h-12 w-9 min-w-9 rounded-lg border border-dashed border-slate-700 bg-slate-900/20 flex items-center justify-center text-slate-600 text-xs font-semibold">
        </div>
      </div>

      <!-- Avatar & Name details -->
      <div class="relative flex flex-col items-center">

        <!-- Emoji Badge with online state border -->
        <div class="w-11 h-11 rounded-full flex items-center justify-center text-2xl border-2 relative"
          :class="getPlayerBadgeClass(player)">
          {{ player.emoji }}
        </div>

        <!-- Name Label -->
        <div class="mt-1 text-center max-w-[80px]">
          <div class="text-xs font-semibold truncate" :class="getPlayerNameClass(player)">
            {{ player.nickname }}
          </div>
          <div class="text-xs text-slate-500" :class="player.isAdmin ? 'text-amber-500' : ''">
            {{ getPlayerRoleText(player) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
