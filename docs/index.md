---
title: Sky Modules
---

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter, withBase } from 'vitepress'

const router = useRouter()

onMounted(() => {
    const language = navigator.language.startsWith('ru') ? 'ru' : 'en'
    router.go(withBase(`/${language}/`))
})
</script>

[English](/en/) · [Русский](/ru/)
