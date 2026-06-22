<script setup lang="ts">

defineProps<{
	active: boolean;
}>();
</script>

<template>
	<button
		class="p-4 rounded-xl border bg-background text-left transition-all duration-150"
		:class="
			active
				? 'border-indigo-500 ring-2 ring-indigo-500/10 bg-indigo-700/10 hover:bg-indigo-700/15'
				: 'hover:dark:border-slate-700 hover:border-slate-300'
		"
	>
		<slot></slot>
	</button>
</template>