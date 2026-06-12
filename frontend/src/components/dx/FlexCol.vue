<script setup lang="ts">
import { computed } from "vue";

interface Props {
	align?: "start" | "center" | "end" | "stretch";
	justify?: "start" | "center" | "end" | "between" | "around";
	gap?: "1" | "2" | "3" | "4" | "6" | "8";
}

const props = withDefaults(defineProps<Props>(), {
	align: "stretch",
	justify: "start",
	gap: "2",
});

const alignClass = computed(() => {
	const map = {
		start: "items-start",
		center: "items-center",
		end: "items-end",
		stretch: "items-stretch",
	};
	return map[props.align] || "items-stretch";
});

const justifyClass = computed(() => {
	const map = {
		start: "justify-start",
		center: "justify-center",
		end: "justify-end",
		between: "justify-between",
		around: "justify-around",
	};
	return map[props.justify] || "justify-start";
});

const gapClass = computed(() => {
	const map = {
		"1": "gap-1",
		"2": "gap-2",
		"3": "gap-3",
		"4": "gap-4",
		"6": "gap-6",
		"8": "gap-8",
	};
	return map[props.gap] || "gap-2";
});
</script>

<template>
	<div
		class="flex flex-col"
		:class="[alignClass, justifyClass, gapClass]"
	>
		<slot />
	</div>
</template>
