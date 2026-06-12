<script setup lang="ts">
import { AlertTriangle } from 'lucide-vue-next';
import { Alert, AlertTitle, AlertDescription, type AlertVariants } from '@/components/ui/alert';
import DestrutiveButton from './DestrutiveButton.vue';
import FlexCol from './FlexCol.vue';
import FlexRow from './FlexRow.vue';
import { X } from '@lucide/vue';

const props = defineProps<{
    alertMessage: string;
    variant?: AlertVariants['variant'];
}>();

const emit = defineEmits<{
    (e: 'close'): void;
}>();

</script>
<template>
    <div v-if="alertMessage" class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4">
        <Alert :variant="variant">
            <FlexRow class="w-full" gap="4">
                <AlertTriangle class="w-5 h-5 text-red-400" />
                <FlexCol class="flex-1" gap="1">
                    <AlertTitle>
                        Warning
                    </AlertTitle>
                    <AlertDescription class="text-xs text-red-300 mt-1">
                        {{ alertMessage }}
                    </AlertDescription>
                </FlexCol>
                <DestrutiveButton @click="emit('close')">
                    <X />
                </DestrutiveButton>
            </FlexRow>
        </Alert>
    </div>
</template>