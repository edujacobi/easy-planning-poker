<script setup lang="ts">
import { useTheme } from "./lib/theme";

const { initTheme } = useTheme();

// Initialize the theme synchronously on startup
initTheme();
</script>

<template>
	<main
		class="min-h-screen bg-background text-foreground font-sans antialiased"
	>
		<router-view />
	</main>
</template>

