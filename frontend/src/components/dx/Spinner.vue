<script lang="ts" setup>

const props = withDefaults(
	defineProps<{
		size?: number | string;
		borderColor?: string;
		borderWidth?: number;
	}>(),
	{
		size: 10,
		borderColor: "slate",
		borderWidth: 2,
	},
);

</script>
<template>
	<div
		:class="`w-${props.size} h-${props.size} rounded-full border-${props.borderWidth} border-${props.borderColor}-500 border-t-transparent animate-spin mx-auto`"
	>
	</div>
</template>
