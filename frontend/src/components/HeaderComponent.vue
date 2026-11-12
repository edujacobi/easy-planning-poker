<script setup lang="ts">
</script>

<template>
	<header class="text-center mb-4 animate-fade-in">
		<h1
			class="text-4xl md:text-6xl font-extrabold tracking-tight text-indigo-700 dark:text-indigo-200"
		>
			Easy Planning Poker
		</h1>
		<p class="text-muted-foreground mt-8 text-sm md:text-base max-w-md mx-auto">
			Fast, collaborative, and seamless agile estimation. Create a room
			and invite your team.
		</p>
	</header>
</template>

<style scoped>
@media (prefers-reduced-motion: no-preference) {
	.animate-fade-in {
		animation: fadeIn 0.8s ease-out forwards;
	}
}

@keyframes fadeIn {
	from {
		opacity: 0;
		transform: translateY(-10px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
