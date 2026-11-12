<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn } from "@/lib/utils";

const props = withDefaults(
	defineProps<{
		class?: HTMLAttributes["class"];
	}>(),
	{
		class: "",
	},
);
</script>

<template>
	<div
		data-slot="dialog-footer"
		:class="
			cn(
				'bg-muted/50 -mx-4 -mb-4 rounded-b-xl border-t p-4 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
				'flex flex-col gap-2 mt-4 sm:flex-col sm:gap-2',
				props.class,
			)
		"
	>
		<slot />
	</div>
</template>
