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
	stories: Array<{ title: string; tasks: any[] }>;
}>();

const stories = ref(props.stories);

function getTaskTitle(task: any): string {
	return typeof task === "string" ? task : task.title;
}

function setTaskTitle(storyIndex: number, taskIndex: number, val: string) {
	const task = stories.value[storyIndex].tasks[taskIndex];
	if (typeof task === "string") {
		stories.value[storyIndex].tasks[taskIndex] = val;
	} else {
		task.title = val;
	}
}

function addStory() {
	const hasObjectTasks = stories.value.length > 0 &&
		stories.value[0].tasks.length > 0 &&
		typeof stories.value[0].tasks[0] !== "string";

    stories.value.push({
		title: `New Story ${stories.value.length + 1}`,
		tasks: hasObjectTasks ? [{ title: "Task 1" }] : ["Task 1"],
	});
}

function removeStory(index: number) {
	stories.value.splice(index, 1);
}

function addTask(storyIndex: number) {
	const currentTasks = stories.value[storyIndex].tasks;
	const hasObjectTasks = currentTasks.length > 0 && typeof currentTasks[0] !== "string";

	currentTasks.push(
		hasObjectTasks
			? { title: `Task ${currentTasks.length + 1}` }
			: `Task ${currentTasks.length + 1}`
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
						class="text-sm bg-muted text-muted-foreground px-3 py-0.5 rounded font-mono shrink-0"
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
					class="pl-6 space-y-2 border-l pb-3"
				>
					<FlexRow
						v-for="(_, tIdx) in story.tasks"
						:key="tIdx"
					>
						<span
							class="text-sm text-muted-foreground font-mono shrink-0"
						>
							Task {{ tIdx + 1 }}
						</span>
						<Input
							:model-value="getTaskTitle(story.tasks[tIdx])"
							placeholder="Task Title..."
							class="text-xs h-7"
							@update:model-value="val => setTaskTitle(sIdx, tIdx, String(val))"
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