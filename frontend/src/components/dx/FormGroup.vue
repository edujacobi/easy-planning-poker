<script setup lang="ts">
import { Label } from '../ui/label';

interface Props {
  label: string;
  id: string;
}

defineProps<Props>();
</script>

<template>
  <div class="space-y-2 w-full flex flex-col items-start">
    <Label :for="id" class="text-slate-300 text-xs font-semibold">{{ label }}</Label>
    <slot />
  </div>
</template>
