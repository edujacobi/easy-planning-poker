<script setup lang="ts">
import { computed } from "vue";

interface Props {
    columns?: number | string;
    rows?: number | string;
    gap?: '1' | '2' | '3' | '4' | '6' | '8';
}

const props = withDefaults(defineProps<Props>(), {
    columns: 1,
    rows: 1,
    gap: '2',
});

const colClass = computed(() => `grid-cols-${props.columns}`);
const rowClass = computed(() => `grid-rows-${props.rows}`);

const gapClass = computed(() => {
    const map = {
        '1': 'gap-1',
        '2': 'gap-2',
        '3': 'gap-3',
        '4': 'gap-4',
        '6': 'gap-6',
        '8': 'gap-8',
    };
    return map[props.gap] || 'gap-2';
});
</script>

<template>
    <div :class="[colClass, rowClass, gapClass]" class="grid">
        <slot></slot>
    </div>
</template>