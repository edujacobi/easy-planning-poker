<script setup lang="ts">
import { AlertTriangle, Plus, Trash2 } from 'lucide-vue-next';
import { ref } from 'vue';
import FlexRow from './dx/FlexRow.vue';
import GlassCard from './dx/GlassCard.vue';
import OutlineButton from './dx/OutlineButton.vue';
import PrimaryButton from './dx/PrimaryButton.vue';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';

const props = defineProps<{
	isAdmin: boolean;
	endMessage: string;
}>();

const emit = defineEmits<{
	(e: 'submit', stories: Array<{ title: string; tasks: string[] }>): void;
	(e: 'cancel'): void;
}>();

const newStories = ref<Array<{ title: string; tasks: string[] }>>([
	{ title: 'New Backlog Item', tasks: ['Task 1'] }
]);

const alertMessage = ref('');

function showAlert(msg: string) {
	alertMessage.value = msg;
	setTimeout(function () {
		if (alertMessage.value === msg) {
			alertMessage.value = '';
		}
	}, 4000);
}

function addStoryForm() {
	newStories.value.push({ title: `New Story ${newStories.value.length + 1}`, tasks: ['Task 1'] });
}

function removeStoryForm(idx: number) {
	newStories.value.splice(idx, 1);
}

function addTaskForm(storyIdx: number) {
	newStories.value[storyIdx].tasks.push(`Task ${newStories.value[storyIdx].tasks.length + 1}`);
}

function removeTaskForm(storyIdx: number, taskIdx: number) {
	newStories.value[storyIdx].tasks.splice(taskIdx, 1);
}

function handleSubmit() {
	if (newStories.value.length === 0 || newStories.value.some(function (s) { return s.tasks.length === 0; })) {
		showAlert('Please enter at least one story and verify all stories contain tasks.');
		return;
	}

	emit('submit', newStories.value);
	// Reset local state
	newStories.value = [{ title: 'New Backlog Item', tasks: ['Task 1'] }];
}
</script>

<template>
	<div class="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
		<!-- Floating Alert -->
		<div v-if="alertMessage"
			class="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-full max-w-md px-4 alert-fade-in">
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

		<GlassCard class="w-full max-w-xl shadow-2xl max-h-[85vh] overflow-y-auto flex flex-col">
			<CardHeader class="border-b border-slate-800">
				<CardTitle>
					Add more Stories and Tasks
				</CardTitle>
				<CardDescription>
					{{ endMessage }}
				</CardDescription>
			</CardHeader>

			<CardContent class="flex-1 p-6">
				<!-- Non-Admin waiting screen -->
				<div v-if="!isAdmin" class="text-center py-10 space-y-3">
					<div class="w-10 h-10 rounded-full border-t-2 border-violet-500 animate-spin mx-auto"></div>
					<p class="text-sm text-slate-400">Admin is currently adding more histories to estimation backlog...
					</p>
				</div>

				<!-- Admin Add stories form list -->
				<div v-else class="space-y-4">
					<FlexRow justify="between" class="pb-2">
						<span class="text-xs font-semibold text-slate-400">New Stories Checklist:</span>
						<OutlineButton size="sm" @click="addStoryForm" class="h-8">
							<Plus class="w-3.5 h-3.5 mr-1" /> Add Story
						</OutlineButton>
					</FlexRow>

					<div class="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
						<div v-for="(story, sIdx) in newStories" :key="sIdx"
							class="p-4 rounded-xl border border-slate-800 bg-slate-950/40 space-y-3 relative">
							<FlexRow>
								<Input v-model="story.title" placeholder="Story Title..." class="text-sm h-8" />
								<button type="button" @click="removeStoryForm(sIdx)"
									class="text-slate-500 hover:text-red-400 transition shrink-0">
									<Trash2 />
								</button>
							</FlexRow>

							<!-- Nested tasks -->
							<div class="pl-4 space-y-2 border-l border-slate-800">
								<FlexRow v-for="(_, tIdx) in story.tasks" :key="tIdx">
									<Input v-model="story.tasks[tIdx]" placeholder="Task Title..."
										class="text-xs h-7" />
									<button type="button" @click="removeTaskForm(sIdx, tIdx)"
										class="text-slate-500 hover:text-red-400 transition shrink-0">
										<Trash2 class="w-3.5 h-3.5" />
									</button>
								</FlexRow>

								<button type="button" @click="addTaskForm(sIdx)"
									class="text-xs text-violet-400 hover:text-violet-300 flex items-center mt-1">
									<Plus class="w-3 h-3 mr-1" /> Add Task
								</button>
							</div>
						</div>
					</div>
				</div>
			</CardContent>

			<FlexRow v-slot:default v-if="isAdmin" class="p-6 border-t border-slate-800 gap-2">
				<PrimaryButton @click="handleSubmit" class="flex-1 py-5">
					Append Backlog Stories
				</PrimaryButton>
				<OutlineButton @click="emit('cancel')">
					Cancel
				</OutlineButton>
			</FlexRow>
		</GlassCard>
	</div>
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
