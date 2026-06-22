<script setup lang="ts">

	defineProps<{
	active: boolean;
}>();
</script>

<template>
	<button
		class="py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-150"
		:class="
			active
				? 'bg-indigo-600 text-white shadow-md'
				: 'text-muted-foreground hover:text-foreground'
		"
	>
		<slot></slot>
	</button>
</template>