import type { LessonId } from './lessons';

export const ASSUMPTIONS = [
  { name: '连续性', description: '以连续体描述宏观材料，不逐个计算微观颗粒。', detail: '忽略微观孔隙，在研究尺度上用连续函数描述位移、应力等量。' },
  { name: '均匀性', description: '同一材料在不同位置具有相同的力学性质。', detail: '比较的是位置：材料内部各处的 E、G、ν 等参数相同。复合或分层材料需要分区建模。' },
  { name: '各向同性', description: '同一点的力学性质不随研究方向改变。', detail: '比较的是方向，与均匀性不同。木材沿纹理和横纹方向的性能不同，是各向异性的例子。' },
  { name: '小变形', description: '位移和转角足够小，可以按原始几何建立平衡关系。', detail: '这是几何近似；它不等于线弹性假设。大挠度、屈曲后等问题需考虑几何变化。' },
] as const;

export const KNOWLEDGE: Record<LessonId, readonly { title: string; description: string }[]> = {
  model: [{ title: '强度', description: '抵抗破坏' }, { title: '刚度', description: '抵抗变形' }, { title: '稳定性', description: '保持原有平衡形态' }],
  force: [{ title: '切开', description: '沿假想截面分成两段' }, { title: '替代', description: '用截面内力代替另一段' }, { title: '平衡', description: '列力与力矩的平衡方程' }],
  stress: [{ title: '正应力 σ', description: '作用方向垂直于截面' }, { title: '切应力 τ', description: '作用方向平行于截面' }, { title: '平均值', description: 'F/A 适用于本节均匀轴向模型' }],
  strain: [{ title: '位移', description: '一个点位置的改变' }, { title: '线应变 ε', description: '单位原长的伸缩' }, { title: '切应变 γ', description: '原来直角的角度变化' }],
  material: [{ title: '胡克定律', description: '线弹性范围内 σ = Eε' }, { title: '泊松关系', description: '单轴应力下 εₜ = −νε' }, { title: '剪切模量 G', description: '各向同性线弹性：G = E / [2(1+ν)]' }],
  forms: [{ title: '轴向 / 剪切', description: '对应轴力 N / 剪力 Q' }, { title: '扭转 / 弯曲', description: '对应扭矩 T / 弯矩 M' }, { title: '组合变形', description: '两种及以上基本形式同时出现' }],
  compare: [{ title: '工程应力', description: 'σₑ = F / A₀' }, { title: '真应力', description: 'σₜ = F / A' }, { title: '体积不变', description: '均匀变形时 A₀L₀ = AL' }],
};

export const DEFORMATION_FORMS = [
  { id: 'tension', name: '拉伸', action: '轴向拉力', internal: '轴力 N', description: '轴向长度增加；一般伴随横向收缩。' },
  { id: 'compression', name: '压缩', action: '轴向压力', internal: '轴力 N', description: '轴向长度减小；一般伴随横向扩张。' },
  { id: 'shear', name: '剪切', action: '横向错动力', internal: '剪力 Q', description: '相邻截面发生相对错动，原来的直角改变。' },
  { id: 'torsion', name: '扭转', action: '绕轴力偶', internal: '扭矩 T', description: '各截面绕杆件轴线发生相对转动。' },
  { id: 'bending', name: '弯曲', action: '横向力或弯曲力偶', internal: '弯矩 M', description: '杆件轴线变弯，截面两侧出现拉伸与压缩。' },
] as const;
export type DeformationForm = typeof DEFORMATION_FORMS[number]['id'];
