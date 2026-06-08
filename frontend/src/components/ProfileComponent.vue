<script setup lang="ts">
import { CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import GlassCard from './dx/GlassCard.vue';
import FormGroup from './dx/FormGroup.vue';
import FlexCol from './dx/FlexCol.vue';

const nickname = defineModel<string>('nickname', { required: true });
const selectedEmoji = defineModel<string>('selectedEmoji', { required: true });

const emojis = ['😎', '😊', '🦊', '🚀', '💻', '🍕', '🎮', '🐱', '🦁', '🦉', '🎩', '🦄', '🔥', '🌈', '🥑', '👾', '🍊', '🍓', '🍒', '🍋', '🍌', '🍍', '🍉', '🍇', '🍈', '🐔'];
</script>

<template>
  <GlassCard>
    <CardHeader class="pb-4">
      <CardTitle class="text-xl text-white">Your Profile</CardTitle>
      <CardDescription class="text-slate-400">Choose a nickname and avatar that others will see.</CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">

        <!-- Emoji avatar selector -->
        <FlexCol align="center" gap="2">
          <div
            class="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/10 border border-violet-400/20 animate-pulse-slow">
            {{ selectedEmoji }}
          </div>
          <span class="text-xs font-medium text-slate-400">Avatar</span>
        </FlexCol>

        <!-- Nickname input -->
        <FormGroup label="Nickname" id="nickname" class="md:col-span-3">
          <Input id="nickname" v-model="nickname" placeholder="e.g. Luke Skywalker"
            class="bg-slate-950 border-slate-800 text-slate-100 placeholder:text-slate-600 focus:border-violet-500 focus:ring-violet-500/20"
            maxlength="20" />
        </FormGroup>
      </div>

      <!-- Quick avatar options -->
      <FlexCol gap="2" class="pt-2">
        <Label class="text-xs text-slate-400">Quick select avatar:</Label>
        <div class="flex flex-wrap gap-2 justify-center md:justify-start">
          <button v-for="emoji in emojis" :key="emoji" type="button" @click="selectedEmoji = emoji"
            class="w-10 h-10 rounded-xl bg-slate-950 hover:bg-slate-800 border flex items-center justify-center text-xl transition-all duration-200"
            :class="selectedEmoji === emoji ? 'border-violet-500 scale-110 shadow-md shadow-violet-500/20' : 'border-slate-800 hover:border-slate-700'">
            {{ emoji }}
          </button>
        </div>
      </FlexCol>
    </CardContent>
  </GlassCard>
</template>

<style scoped>
.animate-pulse-slow {
  animation: pulseSlow 3s infinite ease-in-out;
}

@keyframes pulseSlow {

  0%,
  100% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.03);
  }
}
</style>
