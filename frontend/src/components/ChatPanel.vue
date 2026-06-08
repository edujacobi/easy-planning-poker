<script setup lang="ts">
import { ref, computed, nextTick, onMounted, watch } from 'vue';
import { useRoomStore } from '../stores/room';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';
import { Send, Bot, Users } from 'lucide-vue-next';

// DX Components
import GlassCard from './dx/GlassCard.vue';
import FlexRow from './dx/FlexRow.vue';
import FlexCol from './dx/FlexCol.vue';

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
  <GlassCard class="w-full flex flex-col h-full p-4">
    <!-- Title header -->
    <FlexRow gap="2" class="border-b border-slate-800 pb-3 mb-3">
      <Users class="w-4 h-4 text-violet-400" />
      <h3 class="text-sm font-bold text-white">Room Chat & Logs</h3>
    </FlexRow>

    <!-- Message View Box -->
    <ScrollArea class="flex-1 min-h-[220px] pr-2">
      <div class="space-y-2.5">
        <FlexRow v-for="msg in chatMessages" :key="msg.id" align="start" gap="3" class="text-xs animate-slide-up">
          <!-- System Messages -->
          <div v-if="msg.isSystem"
            class="w-full p-2.5 rounded-xl border border-violet-500/10 bg-violet-950/10 text-slate-300 flex items-start gap-2">
            <Bot class="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <div class="leading-relaxed">
              <span class="font-bold text-violet-300">{{ msg.emoji }} {{ msg.nickname }}:</span>
              <p class="mt-0.5 text-slate-300 whitespace-pre-line">{{ msg.content }}</p>
            </div>
          </div>

          <!-- User Messages -->
          <FlexRow v-slot:default v-else align="start" gap="2">
            <!-- Emoji Avatar badge -->
            <div
              class="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm shrink-0">
              {{ msg.emoji }}
            </div>

            <FlexCol gap="1">
              <FlexRow gap="2">
                <span class="font-semibold text-slate-200">{{ msg.nickname }}</span>
                <span class="text-[10px] text-slate-600">
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
    <FlexRow gap="2" class="mt-3 pt-3 border-t border-slate-800">
      <Input v-model="typedMessage" placeholder="Type a message or vote discussion..."
        class="bg-slate-950 border-slate-800 text-xs h-9 focus:border-violet-500" @keyup.enter="sendMessage" />
      <Button @click="sendMessage" size="sm"
        class="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shrink-0">
        <Send class="w-3.5 h-3.5" />
      </Button>
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
