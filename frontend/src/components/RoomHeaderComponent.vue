<script setup lang="ts">
import { ArrowLeft, Check, Share2 } from "lucide-vue-next";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import FlexRow from "./dx/FlexRow.vue";
import GlassCard from "./dx/GlassCard.vue";
import OutlineButton from "./dx/OutlineButton.vue";

defineProps<{
	roomTitle: string | undefined;
	roomId: string | undefined;
}>();

const router = useRouter();
const isCopiedLink = ref(false);

function copyInviteLink() {
	navigator.clipboard.writeText(window.location.href);
	isCopiedLink.value = true;

	setTimeout(() => (isCopiedLink.value = false), 2_000);
}

const inviteButtonText = computed(() =>
	isCopiedLink.value ? "Link copied!" : "Copy invite link",
);
</script>

<template>
	<GlassCard
		class="p-4 flex-row flex-wrap justify-between"
	>
		<FlexRow class="gap-3">
			<OutlineButton
				size="sm"
				@click="router.push('/')"
			>
				<ArrowLeft />
				Return
			</OutlineButton>

			<span class="border-l h-6"></span>

			<div>
				<h2 class="text-lg font-bold text-white leading-none">
					{{ roomTitle }}
				</h2>
				<p class="text-xs text-slate-500 font-mono mt-1">
					Room ID: {{ roomId }}
				</p>
			</div>
		</FlexRow>

		<FlexRow class="gap-2">
			<OutlineButton
				size="sm"
				@click="copyInviteLink"
			>
				<Check
					v-if="isCopiedLink"
					class="text-emerald-400"
				/>
				<Share2 v-else />
				{{ inviteButtonText }}
			</OutlineButton>
		</FlexRow>
	</GlassCard>
</template>
