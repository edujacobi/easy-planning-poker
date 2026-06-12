<script setup lang="ts">
import { Button } from "../ui/button";
import { type ButtonVariants } from "../ui/button";

interface Props {
	disabled?: boolean;
	size?: ButtonVariants["size"];
	type?: "button" | "submit" | "reset";
}

defineProps<Props>();
</script>

<template>
	<Button
		:type="type || 'button'"
		:disabled="disabled"
		:size="size"
		class="bg-indigo-600 hover:bg-indigo-500 text-white border-0 transition-all duration-150 active:scale-[0.98]"
	>
		<slot />
	</Button>
</template>
