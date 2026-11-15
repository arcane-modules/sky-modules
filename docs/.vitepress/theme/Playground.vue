<script setup lang="ts">
import { computed } from 'vue'
import { withBase } from 'vitepress'

const props = withDefaults(defineProps<{ name: string; height?: number }>(), { height: 420 })

const source = computed(() => withBase(`/playground/${props.name}/index.html`))
</script>

<template>
    <iframe class="playground" :src="source" :height="props.height" :title="`${props.name} playground`" loading="lazy" />
</template>

<style scoped>
.playground {
    width: 100%;
    border: 1px solid var(--vp-c-divider);
    border-radius: 8px;
}
</style>
