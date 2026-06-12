<script setup lang="ts">

const props = defineProps<{
    markdownContent?: string;
}>();

</script>
<template>
    <div class="bg-slate-950 rounded-xl border border-slate-800/60 p-4 h-[35dvh] overflow-y-auto text-left w-full">
        <pre class="text-xs font-mono text-slate-400 whitespace-pre-wrap leading-relaxed">
							{{ markdownContent }}
						</pre>
    </div>
</template>