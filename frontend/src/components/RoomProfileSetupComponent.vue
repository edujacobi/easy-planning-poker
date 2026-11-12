<script setup lang="ts">
import AvatarSelection from "./AvatarSelection.vue";
import PrimaryButton from "./dx/PrimaryButton.vue";
import { CardContent, CardHeader } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "./ui/dialog";

const localNickname = defineModel<string>("nickname", { required: true });
const localEmoji = defineModel<string>("emoji", { required: true });

const emit = defineEmits<{
	(e: "submit"): void;
}>();
</script>

<template>
	<Dialog :open="true">
		<DialogContent
			:show-close-button="false"
			class="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
			@escape-key-down.prevent
			@pointer-down-outside.prevent
		>
			<CardHeader>
				<DialogTitle>
					Configure your profile
				</DialogTitle>
				<DialogDescription>
					Join room estimation session by setting your nickname.
				</DialogDescription>
			</CardHeader>

			<CardContent>
				<AvatarSelection
					v-model:nickname="localNickname"
					v-model:emoji="localEmoji"
				/>

				<PrimaryButton
					:disabled="!localNickname.trim()"
					class="w-full py-5 mt-2"
					@click="emit('submit')"
				>
					Enter Room
				</PrimaryButton>
			</CardContent>
		</DialogContent>
	</Dialog>
</template>
