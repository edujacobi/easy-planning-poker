<script setup lang="ts">
import type { ChatMsg } from "@/stores/room";
import { computed } from "vue";
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
	<div
		class="w-full p-2.5 rounded-xl border border-indigo-500/20 bg-indigo-50/50 text-indigo-900 dark:border-indigo-500/30 dark:bg-indigo-950/30 dark:text-indigo-200 flex items-start gap-2"
	>
		<div class="leading-relaxed">
			<FlexRow>
				<span class="font-bold text-indigo-600 dark:text-indigo-300">
					{{ message.nickname }}
				</span>
				<span
					class="text-xs text-slate-400 dark:text-slate-600"
					:title="createdAtTitle"
				>
					{{ createdAt }}
				</span>
			</FlexRow>
			<p
				class="mt-0.5 text-slate-700 dark:text-indigo-200/90 whitespace-pre-line"
			>
				{{ message.content }}
			</p>
		</div>
	</div>
</template>