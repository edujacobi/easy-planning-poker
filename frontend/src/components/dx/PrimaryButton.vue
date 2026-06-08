<script setup lang="ts">
import { Button } from '../ui/button';
import { type ButtonVariants } from '../ui/button';

interface Props {
  disabled?: boolean;
  size?: ButtonVariants['size'];
  type?: 'button' | 'submit' | 'reset';
}

defineProps<Props>();
</script>

<template>
  <Button :type="type || 'button'" :disabled="disabled" :size="size"
    class="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white border-0 transition-all duration-200 shadow-md shadow-violet-500/10 active:scale-[0.98]">
    <slot />
  </Button>
</template>
