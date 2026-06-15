<script setup lang="ts">
interface Props {
	title: string;
	value?: string | number;
}

const props = defineProps<Props>();
</script>
<template>
	<div
		align="center"
		justify="center"
		class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5"
	>
		<div class="text-slate-500 text-xs font-bold uppercase tracking-wider">
			{{ props.title }}
		</div>
		<div class="text-white text-xl md:text-2xl font-extrabold mt-1">
			{{ props.value }}
		</div>
	</div>
</template>
