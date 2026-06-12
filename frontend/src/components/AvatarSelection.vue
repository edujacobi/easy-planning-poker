<script setup lang="ts">
import Label from './ui/label/Label.vue';
import FlexCol from './dx/FlexCol.vue';
import FlexRow from './dx/FlexRow.vue';
import FormGroup from './dx/FormGroup.vue';
import { Input } from './ui/input';

const selectedNickname = defineModel<string>('nickname', { required: true });
const selectedEmoji = defineModel<string>('emoji', { required: true });

const emojis = [
    '😎', '😊', '🦊', '🚀', '💻', '🍕',
    '🎮', '🐱', '🦁', '🦉', '🎩', '🦄',
    '🔥', '🌈', '🥑', '👾', '🍊', '🍓',
    '🍒', '🍋', '🍍', '🍉', '🍇', '🐔'
];

const emit = defineEmits<{
    (e: 'submit'): void;
}>();
</script>

<template>
    <!-- Nickname input -->
    <FormGroup label="Nickname" id="localNickname">
        <Input id="localNickname" v-model="selectedNickname" placeholder="Type your name..." maxlength="20"
            @submit="emit('submit')" />
    </FormGroup>

    <!-- Quick avatar options -->
    <FlexRow gap="8" align="end">
        <FlexCol gap="2">
            <Label>
                Avatar
            </Label>
            <div class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border border-slate-400/20">
                {{ selectedEmoji }}
            </div>
        </FlexCol>

        <FlexCol gap="2">
            <div class="flex flex-wrap gap-1 justify-center md:justify-start">
                <button v-for="emoji in emojis" :key="emoji" type="button" @click="selectedEmoji = emoji"
                    class="w-10 h-10 rounded-xl bg-slate-950/60 hover:bg-slate-950 border flex items-center justify-center text-xl transition-all duration-150"
                    :class="selectedEmoji === emoji ? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-700/10 hover:bg-indigo-700/15 scale-110' : 'border-slate-800 hover:border-slate-700'">
                    {{ emoji }}
                </button>
            </div>
        </FlexCol>

    </FlexRow>
</template>
