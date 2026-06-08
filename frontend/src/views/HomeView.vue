<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRoomStore } from '../stores/room';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/alert';
import { AlertTriangle } from 'lucide-vue-next';

// DX Components
import PageWrapper from '../components/dx/PageWrapper.vue';
import FlexCol from '../components/dx/FlexCol.vue';

// Subcomponents
import HeaderComponent from '../components/HeaderComponent.vue';
import ProfileComponent from '../components/ProfileComponent.vue';
import RoomJoinComponent from '../components/RoomJoinComponent.vue';

const router = useRouter();
const roomStore = useRoomStore();

// Profile states
const nickname = ref('');
const selectedEmoji = ref('😎');

// Alert state
const alertMessage = ref('');

function showAlert(msg: string) {
  alertMessage.value = msg;

  setTimeout(() => {
    if (alertMessage.value === msg) alertMessage.value = '';
  }, 4000);
}

onMounted(() => {
  roomStore.loadUser();

  if (roomStore.user) {
    nickname.value = roomStore.user.nickname;
    selectedEmoji.value = roomStore.user.emoji;
  }
});

function saveProfile() {
  if (!nickname.value.trim()) return false;

  roomStore.saveUser(nickname.value.trim(), selectedEmoji.value);

  return true;
}

function handleJoinRoom(roomId: string) {
  if (!saveProfile()) {
    return showAlert('Please enter a nickname first.');
  }

  router.push(`/room/${roomId}`);
}

async function handleCreateRoom(payload: { title: string; voteType: 'linear' | 'fibonacci'; stories: Array<{ title: string; tasks: string[]; }>; }) {
  if (!saveProfile()) {
    return showAlert('Please enter a nickname first.');
  }

  try {
    const newRoomId = await roomStore.createRoom(
      payload.title,
      payload.voteType,
      payload.stories
    );
    router.push(`/room/${newRoomId}`);

  } catch (e) {
    showAlert('Error creating room. Please try again.');
  }
}
</script>

<template>
  <PageWrapper>
    <!-- Floating Alert -->
    <div v-if="alertMessage" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4 alert-fade-in">
      <Alert variant="destructive"
        class="bg-slate-950/95 border-red-500/50 text-red-200 backdrop-blur-md shadow-2xl flex items-start gap-3">
        <AlertTriangle class="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
        <div class="flex-1">
          <AlertTitle class="flex items-center justify-between text-sm font-semibold">
            <span>Warning</span>
            <button @click="alertMessage = ''"
              class="text-xs hover:text-white underline opacity-70 hover:opacity-100">Dismiss</button>
          </AlertTitle>
          <AlertDescription class="text-xs text-red-300 mt-1">
            {{ alertMessage }}
          </AlertDescription>
        </div>
      </Alert>
    </div>

    <FlexCol align="center" justify="center" gap="8" class="min-h-[85vh] w-full">
      <!-- Title header -->
      <HeaderComponent />

      <FlexCol gap="6" class="w-full max-w-2xl">
        <!-- Profile setup box -->
        <ProfileComponent v-model:nickname="nickname" v-model:selectedEmoji="selectedEmoji" />

        <!-- Join / Create Navigation tabs -->
        <RoomJoinComponent @join-room="handleJoinRoom" @create-room="handleCreateRoom" />
      </FlexCol>
    </FlexCol>
  </PageWrapper>
</template>

<style scoped>
.alert-fade-in {
  animation: alertFadeIn 0.3s ease-out forwards;
}

@keyframes alertFadeIn {
  from {
    opacity: 0;
    transform: translate(-50%, -10px);
  }

  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}
</style>
