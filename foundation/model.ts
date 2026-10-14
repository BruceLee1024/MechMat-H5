export type MotionMode = 'translation' | 'extension';
export interface FoundationParameters {
  forceKN: number;
  areaMM2: number;
  lengthMM: number;
  displacementMM: number;
  youngGPa: number;
  poisson: number;
  cutPercent: number;
  motion: MotionMode;
}

export const INITIAL_FOUNDATION: FoundationParameters = {
  forceKN: 6, areaMM2: 100, lengthMM: 200, displacementMM: 0.06,
  youngGPa: 200, poisson: 0.3, cutPercent: 50, motion: 'extension',
};
export const MATERIALS = [
  { id: 'steel', name: '钢', youngGPa: 200, poisson: 0.3 },
  { id: 'aluminium', name: '铝', youngGPa: 70, poisson: 0.33 },
  { id: 'brass', name: '黄铜', youngGPa: 100, poisson: 0.34 },
] as const;

/** 统一使用 kN、mm、mm²、GPa 输入，结果中的正应力以 MPa 表示。 */
export function evaluateFoundation(parameters: FoundationParameters) {
  const { forceKN, areaMM2, lengthMM, displacementMM, youngGPa, poisson, cutPercent, motion } = parameters;
  const values = [forceKN, areaMM2, lengthMM, displacementMM, youngGPa, poisson, cutPercent];
  if (!values.every(Number.isFinite)) throw new RangeError('参数必须是有限数值');
  if (forceKN < 0 || areaMM2 <= 0 || lengthMM <= 0 || youngGPa <= 0) throw new RangeError('载荷不能为负，面积、原长和弹性模量须大于零');
  if (poisson <= -1 || poisson >= 0.5) throw new RangeError('稳定各向同性线弹性模型的泊松比须在 −1 与 0.5 之间');
  if (cutPercent <= 0 || cutPercent >= 100) throw new RangeError('截面必须位于试件内部');
  if (motion !== 'translation' && motion !== 'extension') throw new RangeError('位移模式无效');
  const stressMPa = forceKN * 1000 / areaMM2;
  const displacementA = motion === 'translation' ? displacementMM : 0;
  const displacementB = displacementMM;
  const extensionMM = displacementB - displacementA;
  const strain = extensionMM / lengthMM;
  const elasticStrain = stressMPa / (youngGPa * 1000);
  const elasticExtensionMM = elasticStrain * lengthMM;
  const transverseStrain = poisson === 0 || elasticStrain === 0 ? 0 : -poisson * elasticStrain;
  const result = { sectionForceKN: forceKN, stressMPa, displacementA, displacementB, extensionMM, strain, elasticStrain, elasticExtensionMM, transverseStrain };
  if (!Object.values(result).every(Number.isFinite)) throw new RangeError('参数量级超出可计算范围');
  return result;
}
