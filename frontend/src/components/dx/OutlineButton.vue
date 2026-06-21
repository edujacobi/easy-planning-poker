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
		class="hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-all duration-150 active:scale-[0.98]"
	>
		<slot />
	</Button>
</template>
