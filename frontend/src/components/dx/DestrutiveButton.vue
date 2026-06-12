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
		class="bg-transparent hover:bg-red-600/10 text-red-400 hover:text-red-300 transition-all duration-150 active:scale-[0.98]"
	>
		<slot />
	</Button>
</template>
