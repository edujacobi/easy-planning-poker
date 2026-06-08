<script setup lang="ts">
import { Card } from '../ui/card';
</script>

<template>
  <Card class="border-slate-800/80 bg-slate-900/60 backdrop-blur-xl shadow-2xl transition duration-300">
    <slot />
  </Card>
</template>
