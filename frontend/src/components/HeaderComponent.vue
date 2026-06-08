<script setup lang="ts">
import { Sparkles } from 'lucide-vue-next';
</script>

<template>
  <header class="text-center mb-8 animate-fade-in">
    <div
      class="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/5 text-violet-400 text-xs font-semibold mb-3 tracking-wider uppercase">
      <Sparkles class="w-3.5 h-3.5" />
      Real-Time Estimation Platform
    </div>
    <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight text-violet-200">
      Easy Planning Poker
    </h1>
    <p class="text-slate-400 mt-2 text-sm md:text-base max-w-md mx-auto">
      Fast, collaborative, and seamless agile estimation. Create a room and invite your team.
    </p>
  </header>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
