<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { FileCheck, Check, Copy, Home } from 'lucide-vue-next';
import GlassCard from './dx/GlassCard.vue';
import FormGroup from './dx/FormGroup.vue';
import FlexCol from './dx/FlexCol.vue';
import FlexRow from './dx/FlexRow.vue';
import PrimaryButton from './dx/PrimaryButton.vue';
import OutlineButton from './dx/OutlineButton.vue';

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

  setTimeout(() => isCopiedMd.value = false, 2000);
}

const copyButtonText = computed(() => isCopiedMd.value ? 'RESULTS.md Copied!' : 'Copy RESULTS.md File Content');
</script>

<template>
  <div class="fixed inset-0 bg-slate-950/90 backdrop-blur-lg flex items-center justify-center z-50 p-4 md:p-8">
    <GlassCard class="w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
      <CardHeader class="text-center border-b border-slate-800/60 pb-4">
        <div
          class="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mx-auto mb-2 shadow-lg shadow-emerald-500/5">
          <FileCheck class="w-6 h-6" />
        </div>
        <CardTitle class="text-white text-2xl font-bold">Session Concluded!</CardTitle>
        <CardDescription class="text-slate-400 text-xs">
          Here are the compiled statistics and results of the Planning Poker session.
        </CardDescription>
      </CardHeader>

      <CardContent class="flex-1 p-6 space-y-6">
        <!-- Quick Stats Panel Grid -->
        <div class="grid grid-cols-3 gap-4">
          <FlexCol align="center" justify="center" class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Stories Voted</div>
            <div class="text-white text-xl md:text-2xl font-extrabold mt-1">
              {{ sessionFinishedData?.totalStories }}
            </div>
          </FlexCol>
          <FlexCol align="center" justify="center" class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Points</div>
            <div class="text-white text-xl md:text-2xl font-extrabold mt-1">
              {{ sessionFinishedData?.totalPoints }}
            </div>
          </FlexCol>
          <FlexCol align="center" justify="center" class="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3.5">
            <div class="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Participants</div>
            <div class="text-white text-xl md:text-2xl font-extrabold mt-1">
              {{ sessionFinishedData?.participantsCount }}
            </div>
          </FlexCol>
        </div>

        <!-- RESULTS.md Preview block -->
        <FormGroup label="RESULTS.md Preview:" id="markdownPreview">
          <div class="bg-slate-950 rounded-xl border border-slate-800/60 p-4 h-56 overflow-y-auto text-left w-full">
            <pre class="text-[10px] font-mono text-slate-400 whitespace-pre-wrap leading-relaxed">
              {{ sessionFinishedData?.markdown }}
            </pre>
          </div>
        </FormGroup>
      </CardContent>

      <FlexRow class="p-6 border-t border-slate-800/60 gap-3" justify="between">
        <PrimaryButton @click="copyResultsMarkdown" class="flex-1 py-6 text-sm">
          <Check v-if="isCopiedMd" class="w-4 h-4 mr-2" />
          <Copy v-else class="w-4 h-4 mr-2" />
          {{ copyButtonText }}
        </PrimaryButton>

        <OutlineButton @click="router.push('/')" class="py-6">
          <Home class="w-4 h-4 mr-2" />
          Lobby Home
        </OutlineButton>
      </FlexRow>
    </GlassCard>
  </div>
</template>
