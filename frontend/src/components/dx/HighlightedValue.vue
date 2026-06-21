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
		class="bg-background/60 border rounded-xl p-3.5"
	>
		<div class="text-muted-foreground text-xs font-bold uppercase tracking-wider">
			{{ props.title }}
		</div>
		<div class="text-foreground text-xl md:text-2xl font-extrabold mt-1">
			{{ props.value }}
		</div>
	</div>
</template>
