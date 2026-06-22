<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import Alert from "../components/dx/Alert.vue";
import FlexCol from "../components/dx/FlexCol.vue";
import PageWrapper from "../components/dx/PageWrapper.vue";
import HeaderComponent from "../components/HeaderComponent.vue";
import ProfileComponent from "../components/ProfileComponent.vue";
import RoomJoinComponent from "../components/RoomJoinComponent.vue";
import { useRoomStore } from "../stores/room";

const router = useRouter();
const roomStore = useRoomStore();

// Profile states
const nickname = ref("");
const selectedEmoji = ref("");

// Alert state
const alertMessage = ref("");

function showAlert(msg: string) {
	alertMessage.value = msg;

	// setTimeout(() => {
	// 	if (alertMessage.value === msg) alertMessage.value = "";
	// }, 50_000);
}

onMounted(() => {
	roomStore.loadUser();

	if (roomStore.user) {
		nickname.value = roomStore.user.nickname;
		selectedEmoji.value = roomStore.user.emoji;
	}
});

function saveProfile() {
	if (!nickname.value.trim() || !selectedEmoji.value) return false;

	roomStore.saveUser(nickname.value.trim(), selectedEmoji.value);

	return true;
}

function handleJoinRoom(roomId: string) {
	if (!saveProfile()) {
		return showAlert("Please enter a nickname and emoji first.");
	}

	router.push(`/room/${roomId}`);
}

async function handleCreateRoom(payload: {
	title: string;
	voteType: "linear" | "fibonacci";
	stories: Array<{ title: string; tasks: string[] }>;
}) {
	if (!saveProfile()) {
		return showAlert("Please enter a nickname first.");
	}

	try {
		const newRoomId = await roomStore.createRoom(
			payload.title,
			payload.voteType,
			payload.stories,
		);
		router.push(`/room/${newRoomId}`);
	} catch (e) {
		showAlert("Error creating room. Please try again.");
	}
}
</script>

<template>
	<PageWrapper>
		<Alert
			:alertMessage="alertMessage"
			variant="destructive"
			@close="alertMessage = ''"
		/>

		<FlexCol
			align="center"
			justify="start"
			gap="8"
			class="min-h-[85vh] w-full pt-10 scrollbar-gutter-stable"
		>
			<HeaderComponent />

			<FlexCol
				gap="6"
				class="w-full max-w-2xl"
			>
				<ProfileComponent
					v-model:nickname="nickname"
					v-model:selectedEmoji="selectedEmoji"
				/>

				<RoomJoinComponent
					@join-room="handleJoinRoom"
					@create-room="handleCreateRoom"
				/>
			</FlexCol>
		</FlexCol>
	</PageWrapper>
</template>
