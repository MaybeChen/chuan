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
const alarmIcon = '/assets/alarm.svg'
const kpiIcon = '/assets/kpi.svg'
const normalIcon = '/assets/normal.png'

const levelOrder = ['概念抽象层对象', '知识层对象', '状态层对象', '资源层对象']

const layerY: Record<string, number> = {
  概念抽象层对象: 90,
  知识层对象: 250,
  状态层对象: 410,
  资源层对象: 590
}

const colorByGroup: Record<string, string> = {
  概念抽象层对象: 'l(0) 0:#9ca3af 1:#6b7280',
  知识层对象: 'l(0) 0:#9ca3af 1:#6b7280',
  状态层对象: 'l(0) 0:#94a3b8 1:#64748b',
  资源层对象: 'l(0) 0:#9ca3af 1:#6b7280'
}

function normalizeGroup(viewGroup: string): string {
  if (viewGroup.startsWith('资源层对象')) return '资源层对象'
  return viewGroup
}

function shortId(raw: string): string {
  const last = raw.split(':')[3] || raw
  return last.length > 18 ? `${last.slice(0, 18)}...` : last
}

function pickNodeIcon(name: string): string {
  if (name.includes('Alarm') || name.includes('告警')) return alarmIcon
  if (name.includes('KPI')) return kpiIcon
  return normalIcon
}

if (!G6['__trapezoidLaneRegistered']) {
  G6.registerNode(
    'trapezoid-lane',
    {
      draw(cfg, group) {
        const width = Number(cfg?.size?.[0] ?? 920)
        const height = Number(cfg?.size?.[1] ?? 82)
        const skew = Number(cfg?.skew ?? 42)
        const fill = String(cfg?.color ?? 'l(0) 0:#9ca3af 1:#6b7280')
        const label = String(cfg?.label ?? '')
        const path = [
          ['M', -width / 2 + skew, -height / 2],
          ['L', width / 2 - skew, -height / 2],
          ['L', width / 2, height / 2],
          ['L', -width / 2, height / 2],
          ['Z']
        ]
        const shape = group!.addShape('path', {
          attrs: {
            path,
            fill,
            opacity: 0.9,
            stroke: '#d1d5db',
            lineWidth: 1.2,
            shadowBlur: 8,
            shadowColor: 'rgba(15, 23, 42, 0.12)',
            shadowOffsetY: 2
          },
          name: 'lane-bg'
        })
        group!.addShape('text', {
          attrs: {
            x: -width / 2 + 14,
            y: height / 2 - 8,
            text: label,
            fill: '#e5e7eb',
            fontSize: 11,
            textAlign: 'left',
            textBaseline: 'middle',
            fontWeight: 700
          },
          name: 'lane-label'
        })
        return shape
      }
    },
    'single-node'
  )
  G6['__trapezoidLaneRegistered'] = true
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

  const laneNodes = levelOrder.map((group) => ({
    id: `layer-${group}`,
    type: 'trapezoid-lane',
    x: Math.round(width / 2),
    y: layerY[group],
    label: group,
    size: [Math.max(width - 60, 560), 86],
    color: colorByGroup[group] ?? '#475569',
    skew: 48,
    isLayer: true
  }))

  const dataNodes = Array.from(groups.entries()).flatMap(([group, items]) => {
    const sorted = [...items].sort((a, b) => a.standardName.localeCompare(b.standardName))
    const spacing = width / (sorted.length + 1)
    const y = layerY[group] ?? 680

    return sorted.map((item, index) => ({
      id: item.id,
      label: shortId(item.standardName),
      fullLabel: item.standardName,
      group,
      type: 'image',
      img: pickNodeIcon(item.standardName),
      x: Math.round((index + 1) * spacing),
      y,
      size: 32,
      isLayer: false,
      labelCfg: {
        style: {
          fontSize: 10,
          fill: '#f8fafc',
          fontWeight: 600
        },
        position: 'bottom' as const,
        offset: 8
      }
    }))
  })
  const nodes = [...laneNodes, ...dataNodes]

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
        stroke: isAffect ? '#ef4444' : '#0ea5e9',
        lineWidth: isAffect ? 2.6 : 2.1,
        endArrow: true,
        lineDash: isAffect ? undefined : [8, 4],
        opacity: 1
      },
      labelCfg: {
        autoRotate: true,
        style: {
          fill: '#0f172a',
          fontSize: 11,
          fontWeight: 600,
          background: {
            fill: '#f8fafce6',
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
        lineWidth: 3.2,
        shadowBlur: 10,
        shadowColor: 'rgba(250, 204, 21, 0.6)',
        opacity: 1
      },
      inactive: {
        opacity: 0.12
      }
    },
    plugins: [
      new G6.Tooltip({
        itemTypes: ['node'],
        getContent: (evt) => {
          const model = evt.item?.getModel() as { fullLabel?: string; group?: string } | undefined
          if (model?.isLayer) return '<div style="padding:6px 8px;">分层背景</div>'
          return `<div style="padding:6px 8px;">${model?.fullLabel ?? ''}<br/><small>${model?.group ?? ''}</small></div>`
        }
      })
    ]
  })

  graph.data({ nodes, edges })
  graph.render()

  graph.getEdges().forEach((edgeItem) => edgeItem.toFront())
  graph.getNodes().forEach((nodeItem) => {
    const model = nodeItem.getModel() as { isLayer?: boolean }
    if (!model.isLayer) nodeItem.toFront()
  })

  graph.on('node:click', (evt) => {
    const currentNode = evt.item
    if (!currentNode) return
    const currentModel = currentNode.getModel() as { isLayer?: boolean }
    if (currentModel.isLayer) return

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
  background: linear-gradient(180deg, #f3f4f6 0%, #e5e7eb 100%);
}
</style>
