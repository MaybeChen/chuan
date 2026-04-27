<template>
  <section class="graph-card">
    <div ref="containerRef" class="graph-container" />
  </section>
</template>

<script setup lang="ts">
import G6 from '@antv/g6'
import { onMounted, onUnmounted, ref } from 'vue'
import { topologyData } from '../data/topology'

const containerRef = ref<HTMLDivElement | null>(null)
let graph: G6.Graph | null = null

const levelOrder = ['概念抽象层对象', '知识层对象', '状态层对象', '资源层对象-物理资源', '资源层对象-环境', '资源层对象-逻辑资源', '资源层对象-业务']

const layerY: Record<string, number> = {
  概念抽象层对象: 90,
  知识层对象: 220,
  状态层对象: 350,
  '资源层对象-逻辑资源': 470,
  '资源层对象-物理资源': 600,
  '资源层对象-环境': 730,
  '资源层对象-业务': 830
}

const colorByGroup: Record<string, string> = {
  概念抽象层对象: '#6366f1',
  知识层对象: '#14b8a6',
  状态层对象: '#f59e0b',
  '资源层对象-逻辑资源': '#60a5fa',
  '资源层对象-物理资源': '#10b981',
  '资源层对象-环境': '#8b5cf6',
  '资源层对象-业务': '#ef4444'
}

function shortId(raw: string): string {
  const last = raw.split(':')[3] || raw
  return last.length > 18 ? `${last.slice(0, 18)}...` : last
}

onMounted(() => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = 920

  const groups = new Map<string, typeof topologyData.objects>()
  topologyData.objects.forEach((obj) => {
    if (!groups.has(obj.viewGroup)) {
      groups.set(obj.viewGroup, [])
    }
    groups.get(obj.viewGroup)?.push(obj)
  })

  const nodes = Array.from(groups.entries()).flatMap(([group, items]) => {
    const sorted = [...items].sort((a, b) => a.standardName.localeCompare(b.standardName))
    const spacing = width / (sorted.length + 1)
    const y = layerY[group] ?? 860

    return sorted.map((item, index) => ({
      id: item.id,
      label: shortId(item.standardName),
      fullLabel: item.standardName,
      group,
      x: Math.round((index + 1) * spacing),
      y,
      size: 42,
      style: {
        fill: '#fff',
        stroke: colorByGroup[group] ?? '#64748b',
        lineWidth: 2,
        shadowBlur: 10,
        shadowColor: 'rgba(15, 23, 42, 0.08)'
      },
      labelCfg: {
        style: {
          fontSize: 11,
          fill: '#0f172a'
        },
        position: 'bottom' as const,
        offset: 8
      }
    }))
  })

  const edges = topologyData.edges.map((edge, index) => {
    const isThreshold = edge.function.type === 'Threshold'
    const label = isThreshold ? `${edge.function.operator ?? ''} ${edge.function.value ?? ''}`.trim() : edge.bizSemanticRel
    const isAffect = edge.bizSemanticRel === 'affect'
    return {
      id: `e-${index}`,
      source: edge.srcVid,
      target: edge.dstVid,
      label,
      style: {
        stroke: isAffect ? '#ef4444' : '#64748b',
        lineWidth: isAffect ? 2 : 1.5,
        endArrow: true,
        lineDash: isAffect ? undefined : [6, 4],
        opacity: 0.9
      },
      labelCfg: {
        autoRotate: true,
        style: {
          fill: '#334155',
          fontSize: 10,
          background: {
            fill: '#ffffffcc',
            radius: 2,
            padding: [2, 4, 2, 4]
          }
        }
      }
    }
  })

  graph = new G6.Graph({
    container: containerRef.value,
    width,
    height,
    modes: {
      default: ['drag-canvas', 'zoom-canvas', 'drag-node']
    },
    defaultNode: {
      type: 'circle'
    },
    defaultEdge: {
      type: 'quadratic'
    },
    plugins: [
      new G6.Tooltip({
        itemTypes: ['node'],
        getContent: (evt) => {
          const model = evt.item?.getModel() as { fullLabel?: string; group?: string } | undefined
          return `<div style="padding:6px 8px;">${model?.fullLabel ?? ''}<br/><small>${model?.group ?? ''}</small></div>`
        }
      })
    ]
  })

  graph.data({ nodes, edges })
  graph.render()

  const canvas = graph.get('canvas')
  levelOrder.forEach((group) => {
    const y = layerY[group]
    if (!y) return
    canvas.addShape('rect', {
      attrs: {
        x: 20,
        y: y - 40,
        width: width - 40,
        height: 85,
        fill: '#94a3b833',
        stroke: '#94a3b8',
        radius: 8
      },
      draggable: false,
      name: `layer-${group}`
    })
    canvas.addShape('text', {
      attrs: {
        x: 28,
        y: y - 26,
        text: group,
        fill: '#334155',
        fontSize: 12,
        fontWeight: 600
      },
      draggable: false,
      name: `layer-text-${group}`
    })
  })

  graph.getEdges().forEach((edgeItem) => edgeItem.toFront())
  graph.getNodes().forEach((nodeItem) => nodeItem.toFront())

  window.addEventListener('resize', onResize)
})

function onResize(): void {
  if (!graph || !containerRef.value) return
  graph.changeSize(containerRef.value.clientWidth, 920)
}

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  graph?.destroy()
  graph = null
})
</script>

<style scoped>
.graph-card {
  background: #fff;
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
}

.graph-container {
  width: 100%;
  height: 920px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
}
</style>
