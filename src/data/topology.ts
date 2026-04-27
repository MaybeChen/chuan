export interface TopologyObject {
  id: string
  standardName: string
  viewGroup: string
}

export interface TopologyEdge {
  bizSemanticRel: 'relatedto' | 'affect'
  srcVid: string
  dstVid: string
  function: {
    type: 'Threshold' | 'DirectMapping'
    operator?: string
    value?: number
  }
}

export const topologyData: { edges: TopologyEdge[]; objects: TopologyObject[] } = {
  edges: [
    {
      bizSemanticRel: 'relatedto',
      srcVid: 'dtmi:com:huawei:ict:二次侧出口温度1:1.0',
      dstVid: 'dtmi:com:huawei:ict:CDU温控异常:1.0',
      function: { operator: '>', type: 'Threshold', value: 40.0 }
    },
    {
      bizSemanticRel: 'affect',
      srcVid: 'dtmi:com:huawei:ict:CDU温控异常:1.0',
      dstVid: 'dtmi:com:huawei:ict:服务器温度异常:1.0',
      function: { type: 'DirectMapping' }
    },
    {
      bizSemanticRel: 'relatedto',
      srcVid: 'dtmi:com:huawei:ict:进风口温度:1.0',
      dstVid: 'dtmi:com:huawei:ict:服务器温度异常:1.0',
      function: { operator: '>', type: 'Threshold', value: 40.0 }
    },
    {
      bizSemanticRel: 'affect',
      srcVid: 'dtmi:com:huawei:ict:服务器温度异常:1.0',
      dstVid: 'dtmi:com:huawei:ict:NPU温度异常:1.0',
      function: { type: 'DirectMapping' }
    },
    {
      bizSemanticRel: 'relatedto',
      srcVid: 'dtmi:com:huawei:ict:NPU 核心温度过高:1.0',
      dstVid: 'dtmi:com:huawei:ict:NPU温度异常:1.0',
      function: { type: 'DirectMapping' }
    },
    {
      bizSemanticRel: 'affect',
      srcVid: 'dtmi:com:huawei:ict:NPU温度异常:1.0',
      dstVid: 'dtmi:com:huawei:ict:NPU性能劣化:1.0',
      function: { type: 'DirectMapping' }
    },
    {
      bizSemanticRel: 'relatedto',
      srcVid: 'dtmi:com:huawei:ict:NPU每bytes通信时长:1.0',
      dstVid: 'dtmi:com:huawei:ict:NPU性能劣化:1.0',
      function: { operator: '>', type: 'Threshold', value: 0.81 }
    },
    {
      bizSemanticRel: 'affect',
      srcVid: 'dtmi:com:huawei:ict:NPU性能劣化:1.0',
      dstVid: 'dtmi:com:huawei:ict:模型实例时延过长:1.0',
      function: { type: 'DirectMapping' }
    },
    {
      bizSemanticRel: 'relatedto',
      srcVid: 'dtmi:com:huawei:ict:模型服务实例首Token响应时延（ TTFT ）:1.0',
      dstVid: 'dtmi:com:huawei:ict:模型实例时延过长:1.0',
      function: { operator: '>', type: 'Threshold', value: 1000.0 }
    },
    {
      bizSemanticRel: 'affect',
      srcVid: 'dtmi:com:huawei:ict:HBM内存异常:1.0',
      dstVid: 'dtmi:com:huawei:ict:模型实例时延过长:1.0',
      function: { type: 'DirectMapping' }
    },
    {
      bizSemanticRel: 'relatedto',
      srcVid: 'dtmi:com:huawei:ict:HBM用户内存空间内存颗粒访问多bit ECC错误:1.0',
      dstVid: 'dtmi:com:huawei:ict:HBM内存异常:1.0',
      function: { type: 'DirectMapping' }
    }
  ],
  objects: [
    { id: 'dtmi:com:huawei:ict:CDU温控异常:1.0', standardName: 'CDU温控异常', viewGroup: '知识层对象' },
    { id: 'dtmi:com:huawei:ict:AbnormalStatus:1.0', standardName: 'AbnormalStatus异常状态', viewGroup: '概念抽象层对象' },
    { id: 'dtmi:com:huawei:ict:Alarm:1.0', standardName: 'Alarm告警', viewGroup: '概念抽象层对象' },
    { id: 'dtmi:com:huawei:ict:KPI:1.0', standardName: 'KPI', viewGroup: '概念抽象层对象' },
    { id: 'dtmi:com:huawei:ict:NPU温度异常:1.0', standardName: 'NPU温度异常', viewGroup: '知识层对象' },
    { id: 'dtmi:com:huawei:ict:模型实例时延过长:1.0', standardName: '模型实例时延过长', viewGroup: '知识层对象' },
    { id: 'dtmi:com:huawei:ict:NPU每bytes通信时长:1.0', standardName: 'NPU每bytes通信时长', viewGroup: '状态层对象' },
    { id: 'dtmi:com:huawei:ict:二次侧出口温度1:1.0', standardName: '二次侧出口温度1', viewGroup: '状态层对象' },
    {
      id: 'dtmi:com:huawei:ict:模型服务实例首Token响应时延（ TTFT ）:1.0',
      standardName: '模型服务实例首Token响应时延（ TTFT ）',
      viewGroup: '状态层对象'
    },
    { id: 'dtmi:com:huawei:ict:CDU:1.0', standardName: 'CDU', viewGroup: '资源层对象-环境' },
    {
      id: 'dtmi:com:huawei:ict:InferenceModelInstance:1.0',
      standardName: 'InferenceModelInstance',
      viewGroup: '资源层对象-逻辑资源'
    },
    { id: 'dtmi:com:huawei:ict:PhysicalServer:1.0', standardName: 'PhysicalServer', viewGroup: '资源层对象-物理资源' },
    { id: 'dtmi:com:huawei:ict:NPU:1.0', standardName: 'NPU', viewGroup: '资源层对象-物理资源' },
    { id: 'dtmi:com:huawei:ict:Rack:1.0', standardName: 'Rack', viewGroup: '资源层对象-物理资源' },
    { id: 'dtmi:com:huawei:ict:Application:1.0', standardName: 'Application', viewGroup: '资源层对象-业务' },
    { id: 'dtmi:com:huawei:ict:服务器温度异常:1.0', standardName: '服务器温度异常', viewGroup: '知识层对象' },
    { id: 'dtmi:com:huawei:ict:NPU性能劣化:1.0', standardName: 'NPU性能劣化', viewGroup: '知识层对象' },
    { id: 'dtmi:com:huawei:ict:HBM内存异常:1.0', standardName: 'HBM内存异常', viewGroup: '知识层对象' },
    { id: 'dtmi:com:huawei:ict:进风口温度:1.0', standardName: '进风口温度', viewGroup: '状态层对象' },
    { id: 'dtmi:com:huawei:ict:NPU 核心温度过高:1.0', standardName: 'NPU 核心温度过高', viewGroup: '状态层对象' },
    {
      id: 'dtmi:com:huawei:ict:HBM用户内存空间内存颗粒访问多bit ECC错误:1.0',
      standardName: 'HBM用户内存空间内存颗粒访问多bit ECC错误',
      viewGroup: '状态层对象'
    }
  ]
}
