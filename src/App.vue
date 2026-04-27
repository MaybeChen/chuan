<template>
  <main class="page">
    <h1>告警拓扑图（Vue3 + G6）</h1>
    <TopologyGraph />
  </main>
</template>

<script setup lang="ts">
import TopologyGraph from './components/TopologyGraph.vue'
</script>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
}

h1 {
  margin: 0 0 16px;
  font-size: 22px;
}
</style>
