<script setup lang="ts">
import { ArrowLeft, Check, Share2 } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import FlexRow from './dx/FlexRow.vue';
import OutlineButton from './dx/OutlineButton.vue';

defineProps<{
  roomTitle: string | undefined;
  roomId: string | undefined;
}>();

const router = useRouter();
const isCopiedLink = ref(false);

function copyInviteLink() {
  navigator.clipboard.writeText(window.location.href);
  isCopiedLink.value = true;

  setTimeout(() => isCopiedLink.value = false, 2000);
}

const inviteButtonText = computed(() => isCopiedLink.value ? 'Link copied!' : 'Copy invite link');
</script>

<template>
  <FlexRow justify="between" wrap class="border border-slate-800/40 bg-slate-900/60 rounded-2xl p-4 backdrop-blur-xl">
    <FlexRow class="gap-3">
      <OutlineButton @click="router.push('/')" size="sm">
        <ArrowLeft />
        Return
      </OutlineButton>

      <div class="border-l border-slate-800 h-6"></div>

      <div>
        <h2 class="text-lg font-bold text-white leading-none">
          {{ roomTitle }}
        </h2>
        <p class="text-xs text-slate-500 font-mono mt-1">Room ID: {{ roomId }}</p>
      </div>
    </FlexRow>

    <FlexRow class="gap-2">
      <OutlineButton @click="copyInviteLink" size="sm">
        <Check v-if="isCopiedLink" class="text-emerald-400" />
        <Share2 v-else />
        {{ inviteButtonText }}
      </OutlineButton>
    </FlexRow>
  </FlexRow>
</template>
