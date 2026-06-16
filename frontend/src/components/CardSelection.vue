<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { useRoomStore } from "../stores/room";
import FlexCol from "./dx/FlexCol.vue";
import FlexRow from "./dx/FlexRow.vue";

const roomStore = useRoomStore();

const activeVote = ref<string | null>(null);

// Get the correct card set based on Room Config
const cardOptions = computed(() => {
	if (roomStore.room?.voteType === "linear") {
		return ["0", "1", "2", "3", "4", "5", "6", "7", "8", "?"];
	}
	return ["0", "1", "2", "3", "5", "8", "13", "21", "?"];
});

// Watch activeTaskId: reset vote card highlights if the task changes
watch(
	() => roomStore.activeTaskId,
	() => {
		activeVote.value = null;
	},
);

// Watch roomState votingRevealed: reset local card state when task gets confirmed
watch(
	() => roomStore.votingRevealed,
	(newVal) => {
		if (!newVal && Object.keys(roomStore.players).length > 0) {
			const myPlayerState = roomStore.players.find(
				(p) => p.userId === roomStore.myHashedUserId,
			);

			if (myPlayerState && !myPlayerState.hasVoted) {
				activeVote.value = null;
			}
		}
	},
);

function selectCard(card: string) {
	if (roomStore.votingRevealed || !roomStore.activeTaskId) return;

	if (activeVote.value === card) {
		activeVote.value = null;
		roomStore.castVote("");
	} else {
		activeVote.value = card;
		roomStore.castVote(card);
	}
}

// Computed labels and styles helper
const chooseCardLabel = computed(() =>
	roomStore.activeTaskId
		? "Choose your card"
		: "Select a task to start voting",
);

function getCardClass(card: string) {
	const isVoteActive = activeVote.value === card;
	const isInteractionDisabled =
		roomStore.votingRevealed || !roomStore.activeTaskId;

	return [
		isVoteActive
			? "bg-indigo-700 border-indigo-500 text-white -translate-y-2 scale-105"
			: "bg-slate-950 border-slate-800 text-slate-500 hover:bg-slate-900 hover:border-slate-700 hover:text-slate-400 hover:-translate-y-1",

		isInteractionDisabled
			? "opacity-40 cursor-not-allowed hover:translate-y-0"
			: "cursor-pointer",
	];
}
</script>

<template>
	<FlexCol
		align="center"
		gap="4"
	>
		<p class="text-slate-400 text-xs font-semibold uppercase tracking-wider">
			{{ chooseCardLabel }}
		</p>

		<!-- Cards container -->
		<FlexRow
			gap="3"
			wrap
			align="center"
		>
			<button
				v-for="card in cardOptions"
				:key="card"
				type="button"
				:disabled="roomStore.votingRevealed || !roomStore.activeTaskId"
				class="h-16 w-11 md:h-20 md:w-14 rounded-xl border-2 flex items-center justify-center font-bold text-lg md:text-xl transition-all duration-150 select-none shadow-md"
				:class="getCardClass(card)"
				@click="selectCard(card)"
			>
				{{ card }}
			</button>
		</FlexRow>
	</FlexCol>
</template>

<style scoped>
/* Hover animation override */
button:disabled {
	transform: none !important;
}
</style>
