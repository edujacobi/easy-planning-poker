<script setup lang="ts">
import { computed } from "vue";
import { useRoomStore } from "../stores/room";

const roomStore = useRoomStore();

const players = computed(() => roomStore.players);
const votingRevealed = computed(() => roomStore.votingRevealed);
const activeTask = computed(() => roomStore.activeTask);

const activeVotes = computed(() => {
	return players.value
		.filter((p) => p.isOnline && p.hasVoted && p.voteValue !== null)
		.map((p) => p.voteValue as string);
});

const numericVotes = computed(() => {
	return activeVotes.value
		.map((v) => parseFloat(v))
		.filter((v) => !isNaN(v));
});

const meanValue = computed(() => {
	const votes = numericVotes.value;
	if (votes.length === 0) return null;
	const sum = votes.reduce((acc, val) => acc + val, 0);
	return Number((sum / votes.length).toFixed(1)).toString();
});

const medianValue = computed(() => {
	const votes = [...numericVotes.value].sort((a, b) => a - b);
	if (votes.length === 0) return null;
	const mid = Math.floor(votes.length / 2);
	if (votes.length % 2 !== 0) {
		return Number(votes[mid].toFixed(1)).toString();
	}
	return Number(((votes[mid - 1] + votes[mid]) / 2).toFixed(1)).toString();
});

const votesBreakdown = computed(() => {
	const votes = activeVotes.value;
	if (votes.length === 0) return [];

	const counts: Record<string, number> = {};
	for (const v of votes) {
		counts[v] = (counts[v] || 0) + 1;
	}

	return Object.entries(counts)
		.map(([value, count]) => ({
			value,
			count,
			percentage: Math.round((count / votes.length) * 100),
		}))
		.sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
});

// Determine table status message
const tableStatusText = computed(() => {
	if (!activeTask.value) {
		return "No task selected for voting";
	}

	if (votingRevealed.value) {
		return `Votes revealed!`;
	}

	const votedCount = players.value.filter(
		(p) => p.hasVoted && p.isOnline,
	).length;
	
	const onlineCount = players.value.filter((p) => p.isOnline).length;

	if (votedCount === 0) {
		return "Waiting for player's votes...";
	}

	if (votedCount === onlineCount) {
		return "All players have voted! Reveal ready.";
	}

	return `Voted: ${votedCount} / ${onlineCount}`;
});

// Computed headers
const sessionSubtitle = computed(() =>
	activeTask.value ? "Active Vote Session" : "Standby",
);
const sessionTitle = computed(() =>
	activeTask.value ? activeTask.value.title : "Select a task from sidebar",
);

// Player style and text helper functions
function getPlayerVoteDisplay(player: any) {
	return votingRevealed.value ? player.voteValue || "?" : "✓";
}

function getPlayerVotedCardClass() {
	return votingRevealed.value
		? "bg-background border-indigo-500 text-indigo-400 shadow-indigo-500/10"
		: "bg-indigo-700 border-indigo-500 text-white";
}

function getPlayerBadgeClass(player: any) {
	return player.isOnline
		? player.isAdmin
			? "border-amber-500"
			: "border-emerald-500"
		: "border-border opacity-40";
}

function getPlayerNameClass(player: any) {
	return player.isOnline ? "text-foreground" : "text-muted-foreground opacity-40";
}

function getPlayerRoleText(player: any) {
	return player.isOnline ? (player.isAdmin ? "Admin" : "Player") : "Offline";
}

// Dynamic layout distribution coordinate calculations
function getPositionStyles(index: number, total: number) {
	if (total === 0) return {};

	// Distribute points evenly along a circle mapping
	const angle = (index * 2 * Math.PI) / total - Math.PI / 2; // start from top
	const rx = 40; // horizontal radius in percent
	const ry = 35; // vertical radius in percent

	const x = 50 + rx * Math.cos(angle);
	const y = 50 + ry * Math.sin(angle);

	return {
		left: `${x}%`,
		top: `${y}%`,
		transform: "translate(-50%, -50%)",
	};
}
</script>

<template>
	<div class="relative w-full h-[400px] md:h-[500px] overflow-hidden">
		<!-- Table Ring Center -->
		<div
			class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[55%] h-[40%] min-w-[240px] min-h-[170px] bg-gradient-to-br from-indigo-900/40 to-card/60 border border-indigo-500/20 rounded-[3rem] flex flex-col items-center justify-center text-center px-4 shadow-2xl shadow-indigo-500/5 backdrop-blur-md transition-all duration-300 z-10"
		>
			<p class="text-xs uppercase tracking-wider text-indigo-400 font-semibold mb-1">
				{{ sessionSubtitle }}
			</p>
			<p class="text-white text-sm md:text-base font-medium max-w-[85%] truncate mb-1">
				{{ sessionTitle }}
			</p>
			
			<template v-if="votingRevealed">
				<div class="flex items-center gap-6 mt-1">
					<div class="flex flex-col items-center">
						<p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
							Mean
						</p>
						<p class="text-lg md:text-xl font-extrabold text-white">
							{{ meanValue !== null ? meanValue : '-' }}
						</p>
					</div>
					<div class="w-px h-6 bg-border"></div>
					<div class="flex flex-col items-center">
						<p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium">
							Median
						</p>
						<p class="text-lg md:text-xl font-extrabold text-white">
							{{ medianValue !== null ? medianValue : '-' }}
						</p>
					</div>
				</div>

				<!-- Votes Breakdown -->
				<div class="w-full mt-2 flex flex-col items-center">
					<p class="text-[10px] uppercase tracking-wider text-slate-400 font-medium mb-1">
						Votes Breakdown
					</p>
					<div class="flex flex-wrap gap-1.5 justify-center max-w-full max-h-[50px] overflow-y-auto px-2 py-0.5 scrollbar-thin">
						<div
							v-for="item in votesBreakdown"
							:key="item.value"
							class="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 flex items-center gap-1 font-mono font-bold"
							:title="`${item.count} vote(s) (${item.percentage}%)`"
						>
							<p class="text-white text-xs">
								{{ item.value }}
							</p>
							<p class="text-indigo-400 font-normal">
								x{{ item.count }}
							</p>
						</div>
					</div>
				</div>
			</template>
			<template v-else>
				<p class="text-slate-400 text-xs animate-pulse">
					{{ tableStatusText }}
				</p>
			</template>
		</div>

		<!-- Players distributed circularly around the table -->
		<div
			v-for="(player, idx) in players"
			:key="player.userId"
			class="absolute transition-all duration-500 flex flex-col items-center gap-1.5 z-20"
			:style="getPositionStyles(idx, players.length)"
		>
			<!-- Voted Card Space slot -->
			<div class="h-14 w-10 flex items-center justify-center relative">
				<div
					v-if="player.hasVoted && player.isOnline"
					class="h-12 w-9 min-w-9 rounded-lg flex items-center justify-center font-bold text-sm border transition-all duration-300"
					:class="getPlayerVotedCardClass()"
				>
					{{ getPlayerVoteDisplay(player) }}
				</div>

				<!-- Empty spacer when has not voted -->
				<div
					v-else-if="player.isOnline"
					class="h-12 w-9 min-w-9 rounded-lg border border-dashed border-border bg-card/20 flex items-center justify-center text-muted-foreground text-xs font-semibold"
				></div>
			</div>

			<!-- Avatar & Name details -->
			<div class="relative flex flex-col items-center">
				<!-- Emoji Badge with online state border -->
				<div
					class="w-11 h-11 rounded-full flex items-center justify-center text-2xl border-2 relative"
					:class="getPlayerBadgeClass(player)"
				>
					{{ player.emoji }}
				</div>

				<!-- Name Label -->
				<div class="mt-1 text-center max-w-[80px]">
					<p
						class="text-xs font-semibold truncate"
						:class="getPlayerNameClass(player)"
					>
						{{ player.nickname }}
					</p>
					<p
						class="text-xs text-muted-foreground"
						:class="player.isAdmin ? 'text-amber-500' : ''"
					>
						{{ getPlayerRoleText(player) }}
					</p>
				</div>
			</div>
		</div>
	</div>
</template>
