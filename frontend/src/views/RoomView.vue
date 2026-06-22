<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";
import { useRoute } from "vue-router";
import CardSelection from "../components/CardSelection.vue";
import ChatSidebar from "../components/ChatSidebar.vue";
import FlexCol from "../components/dx/FlexCol.vue";
import PageWrapper from "../components/dx/PageWrapper.vue";
import FinishSessionModal from "../components/FinishSessionModal.vue";
import IssuesSidebar from "../components/IssuesSidebar.vue";
import RoomAddStoriesComponent from "../components/RoomAddStoriesComponent.vue";
import RoomHeaderComponent from "../components/RoomHeaderComponent.vue";
import RoomProfileSetupComponent from "../components/RoomProfileSetupComponent.vue";
import RoomResultsComponent from "../components/RoomResultsComponent.vue";
import RoomTable from "../components/RoomTable.vue";
import { useRoomStore } from "../stores/room";

const route = useRoute();
const roomStore = useRoomStore();

const roomId = route.params.id as string;

// Profile configuration overlay
const showProfileSetup = ref(false);
const localNickname = ref("");
const localEmoji = ref("");

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

const endMessage = computed(() =>
	roomStore.isAdmin
		? "Define more stories/tasks and append them to this room."
		: "Waiting for Admin to add more stories.",
);
</script>

<template>
	<PageWrapper>
		<RoomResultsComponent
			v-if="roomStore.isSessionFinished"
			:sessionFinishedData="roomStore.sessionFinishedData"
		/>

		<RoomAddStoriesComponent
			v-if="roomStore.sessionMode === 'add_stories'"
			:isAdmin="roomStore.isAdmin"
			:endMessage="endMessage"
			@submit="handleAddStories"
			@cancel="roomStore.finishSession('cancel')"
		/>

		<RoomProfileSetupComponent
			v-if="showProfileSetup"
			v-model:nickname="localNickname"
			v-model:emoji="localEmoji"
			@submit="submitProfile"
		/>

		<FlexCol
			v-else
			gap="6"
			class="mx-3"
		>
			<RoomHeaderComponent
				:roomTitle="roomStore.room?.title"
				:roomId="roomStore.room?.id"
			/>

			<section class="grid grid-cols-4 gap-6 items-start">
				<IssuesSidebar />

				<section class="col-span-2 space-y-4">
					<RoomTable />
					<CardSelection />
				</section>

				<ChatSidebar />
			</section>
		</FlexCol>

		<FinishSessionModal />
	</PageWrapper>
</template>
