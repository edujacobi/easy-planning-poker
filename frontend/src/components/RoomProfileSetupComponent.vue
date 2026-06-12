<script setup lang="ts">
import AvatarSelection from './AvatarSelection.vue';
import GlassCard from './dx/GlassCard.vue';
import PrimaryButton from './dx/PrimaryButton.vue';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const localNickname = defineModel<string>('nickname', { required: true });
const localEmoji = defineModel<string>('emoji', { required: true });

const emit = defineEmits<{
	(e: 'submit'): void;
}>();

</script>

<template>
	<div class="fixed inset-0 backdrop-blur-md flex items-center justify-center z-50 p-4">
		<GlassCard class="w-full max-w-2xl">
			<CardHeader>
				<CardTitle>
					Configure your profile
				</CardTitle>
				<CardDescription>
					Join room estimation session by setting your nickname.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<AvatarSelection v-model:nickname="localNickname" v-model:emoji="localEmoji" />

				<PrimaryButton @click="emit('submit')" :disabled="!localNickname.trim()" class="w-full py-5 mt-2">
					Enter Room
				</PrimaryButton>
			</CardContent>
		</GlassCard>
	</div>
</template>
