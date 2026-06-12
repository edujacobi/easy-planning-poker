<script setup lang="ts">
import AvatarSelection from './AvatarSelection.vue';
import GlassCard from './dx/GlassCard.vue';
import { CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const nickname = defineModel<string>('nickname', { required: true });
const selectedEmoji = defineModel<string>('selectedEmoji', { required: true });

</script>

<template>
	<GlassCard>
		<CardHeader>
			<CardTitle>
				Your profile
			</CardTitle>
			<CardDescription>
				Choose a nickname and avatar that others will see
			</CardDescription>
		</CardHeader>

		<CardContent>
			<AvatarSelection v-model:nickname="nickname" v-model:emoji="selectedEmoji" />
		</CardContent>
	</GlassCard>
</template>