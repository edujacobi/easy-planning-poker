<script setup lang="ts">
import { Send, Users } from 'lucide-vue-next';
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRoomStore } from '../stores/room.ts';
import FlexCol from './dx/FlexCol.vue';
import FlexRow from './dx/FlexRow.vue';
import GlassCard from './dx/GlassCard.vue';
import PrimaryButton from './dx/PrimaryButton.vue';
import { Input } from './ui/input/index.ts';
import { ScrollArea } from './ui/scroll-area/index.ts';

const roomStore = useRoomStore();
const typedMessage = ref('');
const chatMessages = computed(() => roomStore.chatMessages);

function sendMessage() {
  const msg = typedMessage.value.trim();
  if (!msg) return;

  roomStore.sendMessage(msg);
  typedMessage.value = '';
}

// Auto scroll to bottom on new messages
function scrollToBottom() {
  nextTick(() => {
    const scrollContainer = document.querySelector('[data-radix-scroll-area-viewport]');

    if (scrollContainer) {
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  });
}

watch(chatMessages, () => {
  scrollToBottom();
}, { deep: true });

onMounted(() => {
  scrollToBottom();
});
</script>

<template>
  <GlassCard class="w-full flex flex-col h-full p-4 gap-1 max-h-[70dvh]">
    <!-- Title header -->
    <FlexRow gap="2" class="border-b border-slate-800 pb-3 mb-1">
      <Users class="text-indigo-400" :size="16" />
      <h3 class="text-sm font-bold text-white">
        Chat and logs
      </h3>
    </FlexRow>

    <!-- Message View Box -->
    <ScrollArea class="flex-1 min-h-[220px]">
      <div class="space-y-2.5">
        <FlexRow v-for="msg in chatMessages" :key="msg.id" align="start" gap="3" class="text-xs animate-slide-up">
          <!-- System Messages -->
          <div v-if="msg.isSystem"
            class="w-full p-2.5 rounded-xl border border-indigo-500/30 bg-indigo-950/30 text-slate-300 flex items-start gap-2">
            <div class="leading-relaxed">
              <FlexRow gap="2">
                <span class="font-bold text-indigo-300">{{ msg.nickname }}</span>
                <span class="text-xs text-slate-600" :title="new Date(msg.createdAt).toLocaleString()">
                  {{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </FlexRow>
              <p class="mt-0.5 text-slate-300 whitespace-pre-line">{{ msg.content }}</p>
            </div>
          </div>

          <!-- User Messages -->
          <FlexRow v-slot:default v-else align="start" gap="2">
            <!-- Emoji Avatar badge -->
            <div
              class="w-7 h-7 rounded-lg bg-slate-800/70 border border-slate-700 flex items-center justify-center text-sm shrink-0">
              {{ msg.emoji }}
            </div>

            <FlexCol gap="1">
              <FlexRow gap="2">
                <span class="font-semibold text-slate-200">{{ msg.nickname }}</span>
                <span class="text-xs text-slate-600" :title="new Date(msg.createdAt).toLocaleString()">
                  {{ new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}
                </span>
              </FlexRow>
              <p class="text-slate-400 break-words leading-relaxed max-w-[280px]">
                {{ msg.content }}
              </p>
            </FlexCol>
          </FlexRow>
        </FlexRow>
      </div>
    </ScrollArea>

    <!-- Message Input Bar -->
    <FlexRow gap="2" class="mt-1 pt-3 border-t border-slate-800">
      <Input v-model="typedMessage" placeholder="Type a message or vote discussion..." class="text-xs h-9"
        @keyup.enter="sendMessage" />
      <PrimaryButton @click="sendMessage" size="icon-sm">
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
