<script setup lang="ts">
import { useId } from "vue";
import FlexCol from "./dx/FlexCol.vue";
import FlexRow from "./dx/FlexRow.vue";
import FormGroup from "./dx/FormGroup.vue";
import { Input } from "./ui/input";
import SelectableItem from "./dx/SelectableItem.vue";

const selectedNickname = defineModel<string>("nickname", { required: true });
const selectedEmoji = defineModel<string>("emoji", { required: true });
const nicknameId = useId();

const emojis = [
	"😎",
	"😊",
	"🦊",
	"🚀",
	"💻",
	"🍕",
	"🎮",
	"🐱",
	"🦁",
	"🦉",
	"🎩",
	"🦄",
	"🔥",
	"🌈",
	"🥑",
	"👾",
	"🍊",
	"🍓",
	"🍒",
	"🍋",
	"🍍",
	"🍉",
	"🍇",
	"🐔",
];

const emit = defineEmits<{
	(e: "submit"): void;
}>();
</script>

<template>
	<!-- Nickname input -->
	<FormGroup
		:id="nicknameId"
		label="Nickname"
	>
		<Input
			:id="nicknameId"
			v-model="selectedNickname"
			placeholder="Type your name..."
			maxlength="20"
			@submit="emit('submit')"
		/>
	</FormGroup>

	<!-- Quick avatar options -->
	<FlexRow
		gap="8"
		align="end"
	>
		<FlexCol>
			<p class="text-sm font-medium">
				Avatar
			</p>
			<div
				class="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl border"
			>
				{{ selectedEmoji }}
			</div>
		</FlexCol>

		<FlexCol>
			<div
				class="flex flex-wrap gap-1 justify-start"
				role="group"
				aria-label="Choose an avatar"
			>
				<SelectableItem
					v-for="emoji in emojis"
					:key="emoji"
					:active="selectedEmoji === emoji"
					:aria-label="`Avatar ${emoji}`"
					class="w-10 h-10 flex items-center justify-center text-xl"
					@click="selectedEmoji = emoji"
				>
					{{ emoji }}
				</SelectableItem>
			</div>
		</FlexCol>
	</FlexRow>
</template>
