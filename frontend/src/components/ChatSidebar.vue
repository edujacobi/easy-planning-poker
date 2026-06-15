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

function sendMessage() {
	const msg = typedMessage.value.trim();
	if (!msg) return;

	roomStore.sendMessage(msg);
	typedMessage.value = "";
}

// Auto scroll to bottom on new messages
function scrollToBottom() {
	nextTick(() => {
		const scrollContainer = document.querySelector(
			"[data-radix-scroll-area-viewport]",
		);

		if (scrollContainer) {
			scrollContainer.scrollTop = scrollContainer.scrollHeight;
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
			<h3 class="text-sm font-bold text-white">
				Chat and logs
			</h3>
		</FlexRow>

		<Divider/>

		<!-- Message View Box -->
		<ScrollArea class="flex-1 min-h-[220px]">
			<FlexCol>
				<FlexRow
					v-for="msg in chatMessages"
					:key="msg.id"
					align="start"
					gap="3"
					class="text-xs animate-slide-up"
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
.animate-slide-up {
	animation: slideUp 0.3s ease-out forwards;
}

@keyframes slideUp {
	from {
		opacity: 0;
		transform: translateY(8px);
	}

	to {
		opacity: 1;
		transform: translateY(0);
	}
}
</style>
