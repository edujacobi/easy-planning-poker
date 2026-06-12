<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div data-slot="card-description" :class="cn(
    'text-muted-foreground text-sm',
    'text-slate-400',
    props.class
  )">
    <slot />
  </div>
</template>
