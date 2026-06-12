<script setup lang="ts">
import { computed } from "vue";

interface Props {
	align?: "start" | "center" | "end" | "stretch" | "baseline";
	justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
	gap?: "1" | "2" | "3" | "4" | "6" | "8";
	wrap?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
	align: "center",
	justify: "start",
	gap: "2",
	wrap: false,
});

const alignClass = computed(() => {
	const map = {
		start: "items-start",
		center: "items-center",
		end: "items-end",
		stretch: "items-stretch",
		baseline: "items-baseline",
	};
	return map[props.align] || "items-center";
});

const justifyClass = computed(() => {
	const map = {
		start: "justify-start",
		center: "justify-center",
		end: "justify-end",
		between: "justify-between",
		around: "justify-around",
		evenly: "justify-evenly",
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
		class="flex"
		:class="[alignClass, justifyClass, gapClass, wrap ? 'flex-wrap' : '']"
	>
		<slot />
	</div>
</template>
