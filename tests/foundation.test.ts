import { describe, expect, it } from 'vitest';
import { evaluateFoundation, INITIAL_FOUNDATION } from '../foundation/model';

describe('教材基础微实验：单位与物理关系', () => {
  it('6kN 由100mm²承担，平均正应力为60MPa', () => {
    expect(evaluateFoundation(INITIAL_FOUNDATION).stressMPa).toBe(60);
  });
  it('无分布轴向荷载时内力不随截面位置变化', () => {
    expect(evaluateFoundation({ ...INITIAL_FOUNDATION, cutPercent: 20 }).sectionForceKN).toBe(6);
    expect(evaluateFoundation({ ...INITIAL_FOUNDATION, cutPercent: 80 }).sectionForceKN).toBe(6);
  });
  it('保持力不变、面积加倍，应力减半', () => {
    expect(evaluateFoundation({ ...INITIAL_FOUNDATION, areaMM2: 200 }).stressMPa).toBe(30);
  });
  it('整体平移有位移而无应变', () => {
    const result = evaluateFoundation({ ...INITIAL_FOUNDATION, motion: 'translation', displacementMM: 0.1 });
    expect(result.displacementA).toBe(0.1); expect(result.displacementB).toBe(0.1);
    expect(result.extensionMM).toBe(0); expect(result.strain).toBe(0);
  });
  it('200mm 杆伸长0.06mm，应变为0.0003，无量纲', () => {
    expect(evaluateFoundation(INITIAL_FOUNDATION).strain).toBeCloseTo(0.0003, 12);
  });
  it('60MPa、200GPa 的钢产生0.0003轴向应变及0.06mm伸长', () => {
    const result = evaluateFoundation(INITIAL_FOUNDATION);
    expect(result.elasticStrain).toBeCloseTo(0.0003, 12);
    expect(result.elasticExtensionMM).toBeCloseTo(0.06, 12);
    expect(result.transverseStrain).toBeCloseTo(-0.00009, 12);
  });
  it('线弹性下 E 加倍、伸长量减半', () => {
    expect(evaluateFoundation({ ...INITIAL_FOUNDATION, youngGPa: 400 }).elasticExtensionMM).toBeCloseTo(0.03, 12);
  });
  it('泊松比为零时无横向应变', () => {
    expect(evaluateFoundation({ ...INITIAL_FOUNDATION, poisson: 0 }).transverseStrain).toBe(0);
  });
  it('零载荷时应力、弹性应变、伸长均为零', () => {
    const result = evaluateFoundation({ ...INITIAL_FOUNDATION, forceKN: 0 });
    expect(result.stressMPa).toBe(0); expect(result.elasticStrain).toBe(0); expect(result.elasticExtensionMM).toBe(0);
  });
  it.each([{ areaMM2: 0 }, { youngGPa: 0 }, { lengthMM: 0 }, { poisson: 0.5 }, { forceKN: NaN }, { cutPercent: 100 }])('拒绝无效模型 %j', invalid => {
    expect(() => evaluateFoundation({ ...INITIAL_FOUNDATION, ...invalid })).toThrow(RangeError);
  });
});
