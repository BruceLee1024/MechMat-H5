import { describe, expect, it } from 'vitest';
import { evaluateFoundation, evaluateSimpleShear, evaluateStressComparison, INITIAL_FOUNDATION } from '../foundation/model';

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

describe('新增基础概念：剪切几何与应力定义', () => {
  it('顶面位移5mm、原高100mm，切应变为0.05，实际角变为atan(0.05)', () => {
    const result = evaluateSimpleShear(5);
    expect(result.gamma).toBe(.05);
    expect(result.angleDegrees).toBeCloseTo(2.862405, 5);
  });
  it('负向剪切改变符号，零位移没有切应变', () => {
    expect(evaluateSimpleShear(-5).gamma).toBe(-.05);
    expect(evaluateSimpleShear(0).angleDegrees).toBe(0);
  });
  it('均匀拉伸20%、体积不变，当前面积为原面积的1/1.2', () => {
    const result = evaluateStressComparison(6, 100, .2);
    expect(result.areaMM2).toBeCloseTo(100 / 1.2, 12);
    expect(result.areaMM2 * 200 * result.stretch).toBeCloseTo(100 * 200, 9);
    expect(result.engineeringMPa).toBe(60);
    expect(result.trueMPa).toBeCloseTo(72, 12);
  });
  it('零伸长时两种应力定义一致，拉力加倍时两者都加倍', () => {
    expect(evaluateStressComparison(6, 100, 0).trueMPa).toBe(60);
    expect(evaluateStressComparison(12, 100, .2).trueMPa).toBeCloseTo(144, 12);
  });
  it('零拉力时两种应力均为零', () => {
    expect(evaluateStressComparison(0, 100, .5)).toMatchObject({ engineeringMPa: 0, trueMPa: 0 });
  });
  it.each([[NaN, 100, .2], [6, 0, .2], [6, 100, -.1], [Number.MAX_VALUE, 1, .5]])('应力定义拒绝无效或溢出的输入 %j', (force, area, strain) => {
    expect(() => evaluateStressComparison(force, area, strain)).toThrow(RangeError);
  });
  it('剪切高度为零、非有限位移或溢出梯度时拒绝计算', () => {
    expect(() => evaluateSimpleShear(1, 0)).toThrow(RangeError);
    expect(() => evaluateSimpleShear(Infinity)).toThrow(RangeError);
    expect(() => evaluateSimpleShear(Number.MAX_VALUE, Number.MIN_VALUE)).toThrow(RangeError);
  });
});
