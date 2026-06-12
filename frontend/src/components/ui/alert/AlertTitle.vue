<script setup lang="ts">
import { type HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
}>();
</script>

<template>
	<h5
		:class="
			cn(
				'mb-1 font-medium leading-none tracking-tight',
				'flex items-center justify-between text-sm font-semibold',
				props.class,
			)
		"
	>
		<slot />
	</h5>
</template>
