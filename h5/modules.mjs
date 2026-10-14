export const modules = [
  { id: 'fundamentals', title: '基础概念', chapter: '01', description: '七节基础实验：基本假设、截面法、应力、位移应变、材料关系、基本变形与应力对照。', prompt: '先观察，再动手，最后用一个判断题检验理解。', component: 'FundamentalsModule', source: 'modules/FundamentalsModule.tsx', standalone: true },
  { id: 'axial', title: '轴向拉伸与压缩', chapter: '02', description: '改变轴力、面积和材料，观察正应力与轴向变形。', prompt: '增大轴力或截面面积，观察应力和伸长量如何变化。', component: 'AxialModule', source: 'modules/AxialModule.tsx' },
  { id: 'torsion', title: '圆轴扭转', chapter: '03', description: '观察扭矩、圆轴半径与剪应力、扭转角的关系。', prompt: '改变扭矩和圆轴半径，比较剪应力与扭转角的变化。', component: 'TorsionModule', source: 'modules/TorsionModule.tsx' },
  { id: 'bending', title: '梁的弯曲', chapter: '04', description: '移动集中力，观察剪力图、弯矩图与弯曲应力。', prompt: '移动载荷位置，再调整截面高度，观察内力与变形。', component: 'BendingModule', source: 'modules/BendingModule.tsx' },
  { id: 'stress', title: '应力状态', chapter: '05', description: '旋转平面应力单元，理解应力变换和莫尔圆。', prompt: '旋转应力单元，观察正应力、剪应力及莫尔圆上的位置。', component: 'StressModule', source: 'modules/StressModule.tsx' },
  { id: 'combined', title: '组合变形', chapter: '06', description: '探索偏心受压、弯扭组合与强度校核。', prompt: '切换偏心受压或弯扭组合，改变载荷并观察应力分布。', component: 'CombinedModule', source: 'modules/CombinedModule.tsx' },
  { id: 'buckling', title: '压杆稳定', chapter: '07', description: '比较外载与欧拉临界力，观察两端铰支杆的稳定性。', prompt: '增大杆长或改变截面尺寸，比较载荷与临界力。', component: 'BucklingModule', source: 'modules/BucklingModule.tsx' },
  { id: 'solver', title: '结构求解器', chapter: '08', description: '载入梁与框架例题，查看变形、内力与应力结果。', prompt: '已载入简支梁例题，点击求解，再调整载荷进行比较。', component: 'SolverModule', source: 'solver/SolverModule.tsx' },
  { id: 'section', title: '截面几何性质', chapter: '09', description: '切换截面形式和尺寸，查看形心与惯性矩。', prompt: '改变截面类型与尺寸，观察面积、形心和惯性矩。', component: 'SectionModule', source: 'modules/SectionModule.tsx' },
  { id: 'formulas', title: '常用公式手册', chapter: '10', description: '检索材料力学常用公式，对照图示与适用条件。', prompt: '选择分类或搜索关键词，查看对应公式与图示。', component: 'FormulasModule', source: 'modules/FormulasModule.tsx' },
];
