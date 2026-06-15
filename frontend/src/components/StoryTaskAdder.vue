<script setup lang="ts">
import { Plus, Trash2 } from "lucide-vue-next";
import { ref } from 'vue';
import DeleteButton from './dx/DeleteButton.vue';
import FlexCol from './dx/FlexCol.vue';
import FlexRow from './dx/FlexRow.vue';
import OutlineButton from './dx/OutlineButton.vue';
import { Input } from './ui/input';
import Label from './ui/label/Label.vue';

const props = defineProps<{
    label: string;
	stories: Array<{ title: string; tasks: string[] }>;
}>();

const stories = ref(props.stories);


function addStory() {
    stories.value.push({
		title: `New Story ${props.stories.length + 1}`,
		tasks: ["Task 1"],
	});
}

function removeStory(index: number) {
	stories.value.splice(index, 1);
}

function addTask(storyIndex: number) {
	stories.value[storyIndex].tasks.push(
		`Task ${stories.value[storyIndex].tasks.length + 1}`,
	);
}

function removeTask(storyIndex: number, taskIndex: number) {
	stories.value[storyIndex].tasks.splice(taskIndex, 1);
}

</script>

<template>
	<FlexCol
		gap="3"
	>
		<Label>
			{{ label }}
		</Label>

		<!-- List of input stories -->
		<div class="space-y-4 pr-1">
			<div
				v-for="(story, sIdx) in stories"
				:key="sIdx"
				class="space-y-3 relative group"
			>
				<!-- Story Header -->
				<FlexRow>
					<div
						class="text-sm bg-slate-800 text-slate-300 px-3 py-0.5 rounded font-mono shrink-0"
					>
						Story {{ sIdx + 1 }}
					</div>
					<Input
						v-model="story.title"
						placeholder="Story title..."
						class="text-sm h-8"
					/>
					<DeleteButton
						title="Remove Story"
						@click="removeStory(sIdx)"
					>
						<Trash2 :size="20"/>
					</DeleteButton>
				</FlexRow>

				<!-- Nested Tasks -->
				<div
					class="pl-6 space-y-2 border-l border-slate-800 pb-3"
				>
					<FlexRow
						v-for="(_, tIdx) in story.tasks"
						:key="tIdx"
					>
						<span
							class="text-sm text-slate-500 font-mono shrink-0"
						>
							Task {{ tIdx + 1 }}
						</span>
						<Input
							v-model="story.tasks[tIdx]"
							placeholder="Task Title..."
							class="text-xs h-7"
						/>
						<DeleteButton
							title="Remove Task"
							@click="removeTask(sIdx, tIdx)"
						>
							<Trash2 :size="16" />
						</DeleteButton>
					</FlexRow>

					<OutlineButton
						size="sm"
						@click="addTask(sIdx)"
					>
						<Plus />
						Add Task
					</OutlineButton>
				</div>
			</div>
		</div>
		<OutlineButton
			size="sm"
			@click="addStory"
		>
			<Plus class="w-3.5 h-3.5" />
			Add Story
		</OutlineButton>
	</FlexCol>
</template>