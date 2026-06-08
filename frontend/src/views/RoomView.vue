<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRoomStore } from '../stores/room';
import RoomTable from '../components/RoomTable.vue';
import CardSelection from '../components/CardSelection.vue';
import IssuesSidebar from '../components/IssuesSidebar.vue';
import ChatPanel from '../components/ChatPanel.vue';
import FinishSessionModal from '../components/FinishSessionModal.vue';

// DX Components
import PageWrapper from '../components/dx/PageWrapper.vue';
import FlexCol from '../components/dx/FlexCol.vue';

// Subcomponents
import RoomProfileSetupComponent from '../components/RoomProfileSetupComponent.vue';
import RoomResultsComponent from '../components/RoomResultsComponent.vue';
import RoomHeaderComponent from '../components/RoomHeaderComponent.vue';
import RoomAddStoriesComponent from '../components/RoomAddStoriesComponent.vue';

const route = useRoute();
const roomStore = useRoomStore();

const roomId = route.params.id as string;

// Profile configuration overlay
const showProfileSetup = ref(false);
const localNickname = ref('');
const localEmoji = ref('😎');

onMounted(async () => {
  roomStore.loadUser();

  if (!roomStore.user || !roomStore.user.nickname) {
    showProfileSetup.value = true;

    if (roomStore.user) {
      localEmoji.value = roomStore.user.emoji;
    }

  } else {
    await roomStore.connectSocket(roomId);
  }
});

onUnmounted(() => {
  roomStore.disconnectSocket();
});

async function submitProfile() {
  if (!localNickname.value.trim()) return;

  roomStore.saveUser(localNickname.value.trim(), localEmoji.value);
  showProfileSetup.value = false;

  await roomStore.connectSocket(roomId);
}

function handleAddStories(stories: Array<{ title: string; tasks: string[] }>) {
  roomStore.addStories(stories);
}

const endMessage = computed(() => roomStore.isAdmin ? 'Define more stories/tasks and append them to this room.' : 'Waiting for Admin to add more stories.')
</script>

<template>
  <PageWrapper>
    <!-- 1. Profile Setup Overlay Screen -->
    <RoomProfileSetupComponent v-if="showProfileSetup" v-model:nickname="localNickname" v-model:emoji="localEmoji"
      @submit="submitProfile" />

    <!-- 2. Finished Session Dashboard Overlay -->
    <RoomResultsComponent v-else-if="roomStore.isSessionFinished"
      :sessionFinishedData="roomStore.sessionFinishedData" />

    <!-- 3. Add Stories Screen Overlay -->
    <RoomAddStoriesComponent v-else-if="roomStore.sessionMode === 'add_stories'" :isAdmin="roomStore.isAdmin"
      :endMessage="endMessage" @submit="handleAddStories" @cancel="roomStore.finishSession('cancel')" />

    <!-- 4. Active Estimation Workbench -->
    <FlexCol v-else gap="6" class="max-w-7xl mx-auto">
      <!-- Top Action bar / Header -->
      <RoomHeaderComponent :roomTitle="roomStore.room?.title" :roomId="roomStore.room?.id" />

      <!-- Main Columns view Grid layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <!-- Left Side: Table & Cards Deck (Span 2) -->
        <div class="lg:col-span-2 space-y-4">
          <RoomTable />
          <CardSelection />
        </div>

        <!-- Right Side: Sidebar Accordion list & Chat log (Span 1) -->
        <div class="grid grid-cols-1 gap-6 h-full">
          <IssuesSidebar />
          <ChatPanel />
        </div>
      </div>
    </FlexCol>

    <!-- 5. Finish session check modal -->
    <FinishSessionModal />
  </PageWrapper>
</template>

<style scoped>
.animate-fade-in {
  animation: alertFadeIn 0.3s ease-out forwards;
}
@keyframes alertFadeIn {
  from { opacity: 0; transform: translate(-50%, -10px); }
  to { opacity: 1; transform: translate(-50%, 0); }
}
</style>
