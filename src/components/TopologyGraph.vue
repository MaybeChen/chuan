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

const levelOrder = ['概念抽象层对象', '知识层对象', '状态层对象', '资源层对象']

const layerY: Record<string, number> = {
  概念抽象层对象: 90,
  知识层对象: 250,
  状态层对象: 410,
  资源层对象: 590
}

const colorByGroup: Record<string, string> = {
  概念抽象层对象: '#6366f1',
  知识层对象: '#14b8a6',
  状态层对象: '#f59e0b',
  资源层对象: '#60a5fa'
}

function normalizeGroup(viewGroup: string): string {
  if (viewGroup.startsWith('资源层对象')) return '资源层对象'
  return viewGroup
}

function shortId(raw: string): string {
  const last = raw.split(':')[3] || raw
  return last.length > 18 ? `${last.slice(0, 18)}...` : last
}

onMounted(() => {
  if (!containerRef.value) return

  const width = containerRef.value.clientWidth
  const height = 760

  const groups = new Map<string, typeof topologyData.objects>()
  topologyData.objects.forEach((obj) => {
    const group = normalizeGroup(obj.viewGroup)
    if (!groups.has(group)) {
      groups.set(group, [])
    }
    groups.get(group)?.push(obj)
  })

  const nodes = Array.from(groups.entries()).flatMap(([group, items]) => {
    const sorted = [...items].sort((a, b) => a.standardName.localeCompare(b.standardName))
    const spacing = width / (sorted.length + 1)
    const y = layerY[group] ?? 680

    return sorted.map((item, index) => ({
      id: item.id,
      label: shortId(item.standardName),
      fullLabel: item.standardName,
      group,
      x: Math.round((index + 1) * spacing),
      y,
      size: 36,
      style: {
        fill: '#e2e8f0',
        stroke: '#f8fafc',
        lineWidth: 2,
        shadowBlur: 10,
        shadowColor: 'rgba(15, 23, 42, 0.25)'
      },
      labelCfg: {
        style: {
          fontSize: 11,
          fill: '#f8fafc'
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
        stroke: isAffect ? '#fef2f2' : '#cbd5e1',
        lineWidth: isAffect ? 2.2 : 1.5,
        endArrow: true,
        lineDash: isAffect ? undefined : [6, 4],
        opacity: 0.9
      },
      labelCfg: {
        autoRotate: true,
        style: {
          fill: '#e2e8f0',
          fontSize: 10,
          background: {
            fill: '#334155cc',
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
      default: ['drag-canvas', 'zoom-canvas']
    },
    defaultNode: {
      type: 'circle'
    },
    defaultEdge: {
      type: 'cubic-horizontal'
    },
    edgeStateStyles: {
      active: {
        stroke: '#facc15',
        lineWidth: 3,
        shadowBlur: 10,
        shadowColor: 'rgba(250, 204, 21, 0.6)',
        opacity: 1
      },
      inactive: {
        opacity: 0.2
      }
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
  const layerShapes: Array<{ toBack: () => void }> = []
  levelOrder.forEach((group) => {
    const y = layerY[group]
    if (!y) return
    const topY = y - 44
    const bottomY = y + 28
    const leftX = 60
    const rightX = width - 60
    const skew = 36
    const bgPath = [
      ['M', leftX, topY],
      ['L', rightX, topY],
      ['L', rightX - skew, bottomY],
      ['L', leftX + skew, bottomY],
      ['Z']
    ]
    const shape = canvas.addShape('path', {
      attrs: {
        path: bgPath,
        fill: colorByGroup[group] ?? '#475569',
        opacity: 0.35,
        stroke: '#cbd5e1',
        lineWidth: 1.2,
        shadowBlur: 12,
        shadowColor: 'rgba(15, 23, 42, 0.25)',
        shadowOffsetY: 4
      },
      draggable: false,
      name: `layer-${group}`
    })
    const text = canvas.addShape('text', {
      attrs: {
        x: width / 2,
        y: y - 8,
        text: group,
        fill: '#f8fafc',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 600
      },
      draggable: false,
      name: `layer-text-${group}`
    })
    layerShapes.push(shape, text)
  })
  layerShapes.forEach((shape) => shape.toBack())

  graph.getEdges().forEach((edgeItem) => edgeItem.toFront())
  graph.getNodes().forEach((nodeItem) => nodeItem.toFront())

  graph.on('node:click', (evt) => {
    const currentNode = evt.item
    if (!currentNode) return

    graph?.getEdges().forEach((edge) => {
      const model = edge.getModel()
      const connected = model.source === currentNode.getID() || model.target === currentNode.getID()
      graph?.setItemState(edge, 'active', connected)
      graph?.setItemState(edge, 'inactive', !connected)
    })
  })

  graph.on('canvas:click', () => {
    graph?.getEdges().forEach((edge) => {
      graph?.clearItemStates(edge, ['active', 'inactive'])
    })
  })

  window.addEventListener('resize', onResize)
})

function onResize(): void {
  if (!graph || !containerRef.value) return
  graph.changeSize(containerRef.value.clientWidth, 760)
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
  height: 760px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: radial-gradient(circle at top, #64748b 0%, #1e293b 58%, #0f172a 100%);
}
</style>
