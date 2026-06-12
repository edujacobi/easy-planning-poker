<script setup lang="ts">
import { type HTMLAttributes } from "vue";
import { type AlertVariants, alertVariants } from ".";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
	variant?: AlertVariants["variant"];
}>();
</script>

<template>
	<div
		:class="
			cn(
				alertVariants({ variant }),
				'bg-red-950/25 border-red-500/50 text-red-200 backdrop-blur-md shadow-2xl flex items-start gap-3',
				props.class,
			)
		"
		role="alert"
	>
		<slot />
	</div>
</template>
