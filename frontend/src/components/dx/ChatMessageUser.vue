<script setup lang="ts">
import { type ChatMsg } from "@/stores/room";
import { computed } from 'vue';
import FlexCol from "./FlexCol.vue";
import FlexRow from "./FlexRow.vue";

const props = defineProps<{
	message: ChatMsg;
}>();

const createdAt = computed(() => {
	const date = new Date(props.message.createdAt);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
	});
});

const createdAtTitle = computed(() => {
	return new Date(props.message.createdAt).toLocaleString();
});
</script>
<template>
	<FlexRow align="start">
		<div
			class="w-7 h-7 rounded-lg bg-muted/70 border flex items-center justify-center text-sm shrink-0"
		>
			{{ message.emoji }}
		</div>

		<FlexCol gap="1">
			<FlexRow>
				<span class="font-semibold text-foreground">
					{{ message.nickname }}
				</span>
				<span
					class="text-xs text-muted-foreground/60"
					:title="createdAtTitle"
				>
					{{ createdAt }}
				</span>
			</FlexRow>
			<p
				class="text-muted-foreground break-words leading-relaxed max-w-[280px]"
			>
				{{ message.content }}
			</p>
		</FlexCol>
	</FlexRow>
</template>