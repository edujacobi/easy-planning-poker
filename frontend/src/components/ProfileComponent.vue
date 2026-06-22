<script setup lang="ts">
import AvatarSelection from "./AvatarSelection.vue";
import GlassCard from "./dx/GlassCard.vue";
import OutlineButton from "./dx/OutlineButton.vue";
import { CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Sun, Moon } from "lucide-vue-next";
import { useTheme } from "../lib/theme";

const nickname = defineModel<string>("nickname", { required: true });
const selectedEmoji = defineModel<string>("selectedEmoji", { required: true });

const { isDark, toggleTheme } = useTheme();
</script>

<template>
	<GlassCard>
		<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
			<div class="space-y-1">
				<CardTitle>
					Your profile
				</CardTitle>
				<CardDescription>
					Choose a nickname and avatar that others will see
				</CardDescription>
			</div>
			<OutlineButton
				size="sm"
				class="shrink-0"
				@click="toggleTheme"
				aria-label="Toggle theme"
			>
				<Sun v-if="isDark" class="h-4 w-4" />
				<Moon v-else class="h-4 w-4" />
			</OutlineButton>
		</CardHeader>

		<CardContent>
			<AvatarSelection
				v-model:nickname="nickname"
				v-model:emoji="selectedEmoji"
			/>
		</CardContent>
	</GlassCard>
</template>

