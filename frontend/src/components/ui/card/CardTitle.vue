<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = defineProps<{
	class?: HTMLAttributes["class"];
	size?: "big" | "normal" | "small";
}>();

const sizeClasses = {
	big: "text-2xl font-bold",
	normal: "text-xl",
	small: "text-lg",
};

const sizeClass = sizeClasses[props.size ?? "normal"];
</script>

<template>
	<div
		data-slot="card-title"
		:class="
			cn(
				'text-base leading-snug font-medium group-data-[size=sm]/card:text-sm cn-font-heading',
				'text-white',
				sizeClass,
				props.class,
			)
		"
	>
		<slot />
	</div>
</template>
