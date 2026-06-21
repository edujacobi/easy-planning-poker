<script setup lang="ts">
const props = defineProps<{
	markdownContent?: string;
}>();
</script>
<template>
	<div
		class="bg-background rounded-xl border p-4 h-[35dvh] overflow-y-auto text-left w-full"
	>
		<pre
			class="text-xs font-mono text-muted-foreground whitespace-pre-wrap leading-relaxed"
		>{{ props.markdownContent }}</pre>
	</div>
</template>
