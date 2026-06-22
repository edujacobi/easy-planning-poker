<script setup lang="ts">
import { Send, Users } from "lucide-vue-next";
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { useRoomStore } from "../stores/room.ts";
import ChatMessageSystem from "./dx/ChatMessageSystem.vue";
import ChatMessageUser from "./dx/ChatMessageUser.vue";
import FlexRow from "./dx/FlexRow.vue";
import FlexCol from "./dx/FlexCol.vue";
import GlassCard from "./dx/GlassCard.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import { Input } from "./ui/input/index.ts";
import { ScrollArea } from "./ui/scroll-area/index.ts";
import Divider from "./dx/Divider.vue";

const roomStore = useRoomStore();
const typedMessage = ref("");
const chatMessages = computed(() => roomStore.chatMessages);
const scrollAreaRef = ref<any>(null);

function sendMessage() {
	const msg = typedMessage.value.trim();
	if (!msg) return;

	roomStore.sendMessage(msg);
	typedMessage.value = "";
}

// Auto scroll to bottom on new messages
function scrollToBottom() {
	nextTick(() => {
		if (scrollAreaRef.value?.$el) {
			const scrollContainer = scrollAreaRef.value.$el.querySelector(
				'[data-slot="scroll-area-viewport"], [data-reka-scroll-area-viewport], [data-radix-scroll-area-viewport]',
			);

			if (scrollContainer) {
				scrollContainer.scrollTop = scrollContainer.scrollHeight;
			}
		}
	});
}

watch(
	chatMessages,
	() => {
		scrollToBottom();
	},
	{ deep: true },
);

onMounted(() => {
	scrollToBottom();
});
</script>

<template>
	<GlassCard class="w-full flex flex-col h-full p-4 gap-1 max-h-[70dvh]">
		<!-- Title header -->
		<FlexRow>
			<Users
				class="text-indigo-400"
				:size="16"
			/>
			<h3 class="text-sm font-bold text-foreground">
				Chat and logs
			</h3>
		</FlexRow>

		<Divider/>

		<!-- Message View Box -->
		<ScrollArea
			ref="scrollAreaRef"
			class="flex-1 min-h-[220px]"
		>
			<FlexCol>
				<FlexRow
					v-for="msg in chatMessages"
					:key="msg.id"
					align="start"
					gap="3"
					class="text-xs animate-appear"
				>
					<ChatMessageSystem
						v-if="msg.isSystem"
						:message="msg"
					/>

					<ChatMessageUser
						v-else
						:message="msg"
					/>
				</FlexRow>
			</FlexCol>
		</ScrollArea>

		<Divider/>

		<!-- Message Input Bar -->
		<FlexRow>
			<Input
				v-model="typedMessage"
				placeholder="Type a message or vote discussion..."
				class="text-xs h-9"
				@keyup.enter="sendMessage"
			/>
			<PrimaryButton
				size="icon-sm"
				@click="sendMessage"
			>
				<Send />
			</PrimaryButton>
		</FlexRow>
	</GlassCard>
</template>

<style scoped>
.animate-appear {
	animation: appear 0.5s ease-out forwards;
}

@keyframes appear {
	from {
		opacity: 0;
	}

	to {
		opacity: 1;
	}
}
</style>
