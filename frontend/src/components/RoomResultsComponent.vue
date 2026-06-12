<script setup lang="ts">
import { Check, Copy, FileCheck, Home } from 'lucide-vue-next';
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import Divider from './dx/Divider.vue';
import FlexRow from './dx/FlexRow.vue';
import FormGroup from './dx/FormGroup.vue';
import GlassCard from './dx/GlassCard.vue';
import Grid from './dx/Grid.vue';
import HighlightedIcon from './dx/HighlightedIcon.vue';
import HighlightedValue from './dx/HighlightedValue.vue';
import OutlineButton from './dx/OutlineButton.vue';
import PreFormattedText from './dx/PreFormattedText.vue';
import PrimaryButton from './dx/PrimaryButton.vue';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const props = defineProps<{
	sessionFinishedData: {
		totalStories: number;
		totalPoints: number;
		participantsCount: number;
		markdown: string;
	} | null;
}>();

const router = useRouter();
const isCopiedMd = ref(false);

function copyResultsMarkdown() {
	if (!props.sessionFinishedData?.markdown) return;

	navigator.clipboard.writeText(props.sessionFinishedData.markdown);
	isCopiedMd.value = true;

	setTimeout(() => isCopiedMd.value = false, 2_000);
}

const copyButtonText = computed(() => isCopiedMd.value ? 'RESULTS.md Copied!' : 'Copy RESULTS.md File Content');
</script>

<template>
	<div class="fixed inset-0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 md:p-8">
		<GlassCard class="w-full max-w-2xl">
			<CardHeader class="text-center">
				<HighlightedIcon>
					<FileCheck class="w-6 h-6" />
				</HighlightedIcon>
				<CardTitle size="big">
					Session concluded!
				</CardTitle>
				<CardDescription>
					Here are the compiled statistics and results of the Planning Poker session.
				</CardDescription>
			</CardHeader>

			<Divider />

			<CardContent>
				<!-- Quick Stats Panel Grid -->
				<Grid columns="3" gap="4">
					<HighlightedValue title="Stories voted" :value="sessionFinishedData?.totalStories" />
					<HighlightedValue title="Total points" :value="sessionFinishedData?.totalPoints" />
					<HighlightedValue title="Participants" :value="sessionFinishedData?.participantsCount" />
				</Grid>

				<!-- RESULTS.md Preview block -->
				<FormGroup label="RESULTS.md Preview:" id="markdownPreview">
					<PreFormattedText :markdownContent="sessionFinishedData?.markdown" />
				</FormGroup>
			</CardContent>

			<Divider />

			<FlexRow class="p-4 py-0 gap-3" justify="between">
				<PrimaryButton @click="copyResultsMarkdown" class="flex-1 py-6 text-sm">
					<Check v-if="isCopiedMd" />
					<Copy v-else />
					{{ copyButtonText }}
				</PrimaryButton>

				<OutlineButton @click="router.push('/')" class="py-6">
					<Home />
					Return
				</OutlineButton>
			</FlexRow>
		</GlassCard>
	</div>
</template>
