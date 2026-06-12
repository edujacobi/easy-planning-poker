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
		variant="outline"
		class="border-slate-800 bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-white transition-all duration-150 active:scale-[0.98]"
	>
		<slot />
	</Button>
</template>
