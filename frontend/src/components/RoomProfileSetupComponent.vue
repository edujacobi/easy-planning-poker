<script setup lang="ts">
import { CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Input } from './ui/input';
import GlassCard from './dx/GlassCard.vue';
import FormGroup from './dx/FormGroup.vue';
import FlexCol from './dx/FlexCol.vue';
import PrimaryButton from './dx/PrimaryButton.vue';

const localNickname = defineModel<string>('nickname', { required: true });
const localEmoji = defineModel<string>('emoji', { required: true });

const emojis = ['😎', '😊', '🦊', '🚀', '💻', '🍕', '🎮', '🐱', '🦁', '🦉', '🎩', '🦄', '🔥', '🌈', '🥑', '👾'];

const emit = defineEmits<{
  (e: 'submit'): void;
}>();
</script>

<template>
  <div class="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
    <GlassCard class="w-full max-w-md shadow-2xl">
      <CardHeader class="text-center">
        <CardTitle class="text-white text-2xl">Configure Your Profile</CardTitle>
        <CardDescription class="text-slate-400">Join room estimation session by setting your nickname.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-5">
        <FlexCol align="center" gap="4">
          <!-- Selected avatar display -->
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-3.5xl shadow-lg border border-violet-400/20">
            {{ localEmoji }}
          </div>

          <FormGroup label="Nickname" id="localNickname">
            <Input 
              id="localNickname" 
              v-model="localNickname" 
              placeholder="Type your name..."
              class="bg-slate-950 border-slate-800 text-slate-200 placeholder:text-slate-700 focus:border-violet-500"
              maxlength="20" 
              @keyup.enter="emit('submit')" 
            />
          </FormGroup>
        </FlexCol>

        <FlexCol gap="2">
          <label class="text-xs text-slate-400">Choose Avatar:</label>
          <div class="flex flex-wrap gap-2 justify-center">
            <button 
              v-for="emoji in emojis" 
              :key="emoji" 
              type="button" 
              @click="localEmoji = emoji"
              class="w-9 h-9 rounded-xl bg-slate-950 hover:bg-slate-800 border flex items-center justify-center text-lg transition duration-200"
              :class="localEmoji === emoji ? 'border-violet-500 scale-105 shadow-md shadow-violet-500/20' : 'border-slate-800 hover:border-slate-700'"
            >
              {{ emoji }}
            </button>
          </div>
        </FlexCol>

        <PrimaryButton 
          @click="emit('submit')" 
          :disabled="!localNickname.trim()" 
          class="w-full py-5 mt-2"
        >
          Enter Estimation Room
        </PrimaryButton>
      </CardContent>
    </GlassCard>
  </div>
</template>
