<script setup lang="ts">
import { Plus, Trash2 } from "lucide-vue-next";
import { ref } from 'vue';
import type { StoryInput } from "../stores/room";
import DeleteButton from './dx/DeleteButton.vue';
import FlexCol from './dx/FlexCol.vue';
import FlexRow from './dx/FlexRow.vue';
import OutlineButton from './dx/OutlineButton.vue';
import { Input } from './ui/input';
import Label from './ui/label/Label.vue';

const props = defineProps<{
    label: string;
	stories: StoryInput[];
}>();

const stories = ref(props.stories);

function addStory() {
    stories.value.push({
		title: `New Story ${stories.value.length + 1}`,
		tasks: [{ title: "Task 1", description: "" }],
	});
}

function removeStory(index: number) {
	stories.value.splice(index, 1);
}

function addTask(storyIndex: number) {
	const currentTasks = stories.value[storyIndex].tasks;
	currentTasks.push({ title: `Task ${currentTasks.length + 1}`, description: "" });
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
						v-for="(task, tIdx) in story.tasks"
						:key="tIdx"
						class="items-start"
					>
						<span
							class="text-sm text-muted-foreground font-mono shrink-0"
						>
							Task {{ tIdx + 1 }}
						</span>
						<FlexCol
							class="flex-1"
							gap="2"
						>
							<Input
								v-model="task.title"
								:aria-label="`Task ${tIdx + 1} title`"
								placeholder="Task Title..."
								class="text-xs h-7"
							/>
							<textarea
								v-model="task.description"
								:aria-label="`Task ${tIdx + 1} description`"
								placeholder="Task description (optional)..."
								class="w-full rounded-md border bg-background px-3 py-2 text-xs"
								rows="2"
							/>
						</FlexCol>
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