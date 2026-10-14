import React, { useId } from 'react';
import { evaluateFoundation, FoundationParameters } from './model';
import type { LessonId } from './lessons';

const INK = '#dcecff', ORANGE = '#ffc36c', MUTED = '#8ba6bf';
export function SpecimenMark() {
  return <svg width="40" height="24" viewBox="0 0 56 30" aria-hidden="true"><path d="M2 3h10l8 6h16l8-6h10v24H44l-8-6H20l-8 6H2Z" fill="none" stroke="currentColor" strokeWidth="2" /><path d="M2 3h10v24H2ZM44 3h10v24H44Z" fill="currentColor" /></svg>;
}
export function ResetMark() {
  return <svg width="25" height="25" viewBox="0 0 30 30" aria-hidden="true"><path d="M20 6a10 10 0 1 1-7-1" fill="none" stroke="currentColor" strokeWidth="2.3" /><path d="m13 1 5 4-5 4" fill="none" stroke="currentColor" strokeWidth="2.3" /></svg>;
}
export function DirectionMark({ reverse = false }: { reverse?: boolean }) {
  return <svg width="22" height="20" viewBox="0 0 24 20" aria-hidden="true" style={{ transform: reverse ? 'rotate(180deg)' : undefined }}><path d="M2 10h18m-6-6 6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" /></svg>;
}
export function AnswerMark({ selected, correct }: { selected: boolean; correct: boolean }) {
  return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.7" />{selected && (correct ? <path d="m7 12 3 3 7-7" fill="none" stroke="currentColor" strokeWidth="1.7" /> : <path d="m8 8 8 8m0-8-8 8" fill="none" stroke="currentColor" strokeWidth="1.7" />)}</svg>;
}

function Arrow({ x1, x2, y, color = ORANGE }: { x1: number; x2: number; y: number; color?: string }) {
  const direction = Math.sign(x2 - x1);
  return <g stroke={color} fill={color}><line x1={x1} x2={x2 - direction * 8} y1={y} y2={y} strokeWidth="4" /><path d={`M${x2} ${y}l${-direction * 11} -6v12Z`} stroke="none" /></g>;
}
function Dimension({ from, to, y, label }: { from: number; to: number; y: number; label: string }) {
  return <g stroke="#8ba6bf" fill="#8ba6bf" strokeWidth="1"><line x1={from} x2={to} y1={y} y2={y} /><path d={`M${from + 5} ${y - 3}l-5 3 5 3m${to - from - 10} -6 5 3-5 3`} fill="none" /><line x1={from} x2={from} y1={y - 12} y2={y + 8} /><line x1={to} x2={to} y1={y - 12} y2={y + 8} /><text x={(from + to) / 2} y={y + 23} textAnchor="middle" fill={INK} stroke="none" fontSize="16">{label}</text></g>;
}

export function FoundationDiagram({ lesson, parameters, ideal, cut }: { lesson: Exclude<LessonId, 'forms' | 'compare'>; parameters: FoundationParameters; ideal: boolean; cut: boolean }) {
  const id = useId().replace(/:/g, '');
  const result = evaluateFoundation(parameters);
  const label = {
    model: '受拉试件及晶粒局部放大，比较真实试件与理想连续体模型',
    force: '截面法：左段外拉力向左、截面内力向右，轴向内力与截面位置无关',
    stress: '同一拉力下两个正方形截面的面积与平均正应力比较，圆点表示垂直截面向外的法向力',
    strain: '原位置与移动后的试件对照，展示整体平移和轴向伸长的区别',
    material: '不同弹性模量与泊松比下，试件的纵向伸长与横向收缩示意',
  }[lesson];
  const width = 280, start = 65, end = start + width;
  const cutX = start + width * parameters.cutPercent / 100;
  const shiftA = result.displacementA * 140, shiftB = result.displacementB * 140;
  const extension = result.elasticStrain * width * 100;
  const contraction = Math.min(result.transverseStrain * 46 * 100, 0);
  const dotGrid = (center: number, side: number) => [-1, 0, 1].flatMap(row => [-1, 0, 1].map(column => <g key={`${center}-${row}-${column}`} transform={`translate(${center + column * side * 0.3} ${99 + row * side * 0.3})`}><circle r="4" fill="none" stroke={ORANGE} strokeWidth="1.3" /><circle r="1.6" fill={ORANGE} /></g>));
  return <svg className={`foundation-diagram diagram-${lesson}`} viewBox={lesson === 'stress' ? '0 0 420 250' : '0 0 420 210'} role="img" aria-label={label}>
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" x2="0" y1="0" y2="1"><stop stopColor="#496b85" /><stop offset=".25" stopColor="#688da9" /><stop offset="1" stopColor="#25435c" /></linearGradient>
      <clipPath id={`${id}-grain`}><circle cx="286" cy="49" r="35" /></clipPath>
      <pattern id={`${id}-texture`} width="24" height="20" patternUnits="userSpaceOnUse"><path d="M0 9 10 2 24 7M10 2 12 16 24 20M12 16 0 13" fill="none" stroke="#7c8c85" strokeWidth=".6" /></pattern>
    </defs>
    {lesson === 'model' && <>
      <path d="M65 105 78 92h280l-13 13Z" fill="#d5dcd8" stroke="#5c6c66" />
      <path d="M345 105 358 92v43l-13 14Z" fill="#85968d" stroke="#5c6c66" />
      <rect x="65" y="105" width="280" height="44" fill={ideal ? '#254e69' : `url(#${id}-metal)`} stroke={INK} strokeWidth="1.5" />
      {!ideal && <rect x="65" y="105" width="280" height="44" fill={`url(#${id}-texture)`} opacity=".6" />}
      <Arrow x1={65} x2={17} y={126} /><Arrow x1={358} x2={405} y={126} />
      <text x="27" y="110" fill={ORANGE} fontSize="23" fontFamily="Georgia,serif" fontStyle="italic">F</text><text x="383" y="110" fill={ORANGE} fontSize="23" fontFamily="Georgia,serif" fontStyle="italic">F</text>
      <line x1="224" y1="111" x2="263" y2="76" stroke={INK} strokeWidth="1" /><circle cx="224" cy="111" r="5" fill="none" stroke={INK} />
      <circle cx="286" cy="49" r="35" fill="#d4d9d6" stroke={INK} strokeWidth="1.2" />
      <g clipPath={`url(#${id}-grain)`} stroke="#7e8e85" fill="none" strokeWidth="1.2"><path d="m256 30 16 4 5 15-10 12-18-2m23-25 13-12 18 5 6 18-12 13-20-9m32-4 13 5 8 20-15 13-17-4-2-20m-30 3 15 6 3 17-17 12-12-9-2-13m30-7 16 10-2 18-16 6-11-10-3-17" /><path d="M250 41h9m29-19 3-15m29 27 12-6m-44 55-2 9" /></g>
      <text x="330" y="44" fontSize="12" fill={INK}><tspan x="330">材料的</tspan><tspan x="330" dy="17">微观晶粒</tspan></text>
      <Dimension from={65} to={345} y={169} label="L₀ = 200 mm" />
    </>}
    {lesson === 'force' && <>
      <rect x={start} y="98" width={cut ? cutX - start : width} height="47" fill="#254e69" stroke={INK} strokeWidth="1.5" />
      {cut && <rect x={cutX + 15} y="98" width={end - cutX} height="47" fill="#254e69" stroke={MUTED} opacity=".25" strokeDasharray="4 4" />}
      <Arrow x1={start} x2={20} y={122} />
      <text x="22" y="84" fill={ORANGE} fontSize="15">F = {parameters.forceKN.toFixed(1)} kN</text>
      {!cut && <Arrow x1={end} x2={396} y={122} />}
      <line x1={cutX} x2={cutX} y1="80" y2="164" stroke={INK} strokeWidth="1.3" strokeDasharray="4 4" />
      {cut && <><Arrow x1={cutX} x2={cutX + 55} y={122} color={INK} /><text x={Math.min(cutX + 20, 345)} y="72" textAnchor="middle" fontSize="15" fill={INK}>N = {result.sectionForceKN.toFixed(1)} kN</text></>}
      <text x={cutX} y="183" textAnchor="middle" fontSize="14" fill={INK}>截面 x = {parameters.cutPercent}% L₀</text>
      <text x="210" y="24" textAnchor="middle" fontSize="14" fill={INK}>{cut ? '留下左段，补上右段对它的作用' : '假想一个截面，试着把杆分成两段'}</text>
    </>}
    {lesson === 'stress' && <>
      <text x="210" y="24" textAnchor="middle" fill={INK} fontSize="16">同一拉力 F = {parameters.forceKN.toFixed(1)} kN</text>
      {[{ center: 106, side: 78, area: 100, reference: true }, { center: 309, side: 78 * Math.sqrt(parameters.areaMM2 / 100), area: parameters.areaMM2, reference: false }].map(item => <g key={item.center}>
        <rect x={item.center - item.side / 2} y={99 - item.side / 2} width={item.side} height={item.side} fill={`url(#${id}-metal)`} stroke={INK} strokeWidth="1.4" />
        {dotGrid(item.center, item.side)}
        <Dimension from={item.center - item.side / 2} to={item.center + item.side / 2} y={178} label={`${Math.sqrt(item.area).toFixed(1)} mm`} />
        <text x={item.center} y="215" textAnchor="middle" fill={INK} fontSize="14">{item.reference ? 'A₀' : 'A'} = {item.area} mm²</text>
        <text x={item.center} y="237" textAnchor="middle" fill={INK} fontSize="16">{item.reference ? 'σ₀' : 'σ'} = {(parameters.forceKN * 1000 / item.area).toFixed(1)} MPa</text>
      </g>)}
    </>}
    {lesson === 'strain' && <>
      <text x="210" y="27" textAnchor="middle" fill={INK} fontSize="15">{parameters.motion === 'translation' ? '两端一起移动，长度不变' : '右端相对左端移动，长度改变'}</text>
      <rect x={start} y="91" width={width} height="43" fill="none" stroke={MUTED} strokeDasharray="4 4" />
      <rect x={start + shiftA} y="102" width={width + shiftB - shiftA} height="43" fill="#254e69" fillOpacity=".75" stroke={INK} strokeWidth="1.5" />
      <line x1={start} x2={start} y1="78" y2="156" stroke={MUTED} strokeDasharray="3 4" /><line x1={end} x2={end} y1="78" y2="156" stroke={MUTED} strokeDasharray="3 4" />
      <text x={start + shiftA} y="75" textAnchor="middle" fill={INK} fontSize="14">A</text><text x={end + shiftB} y="75" textAnchor="middle" fill={INK} fontSize="14">B</text>
      <text x="210" y="123" textAnchor="middle" fill={INK} fontSize="15">ΔL = {result.extensionMM.toFixed(3)} mm</text>
      <Dimension from={start} to={end} y={168} label="原长 L₀ = 200 mm" />
    </>}
    {lesson === 'material' && <>
      <text x="210" y="28" textAnchor="middle" fill={INK} fontSize="15">同一应力下，E 决定伸长，ν 影响横向收缩</text>
      <rect x={start} y="84" width={width} height="46" fill="none" stroke={MUTED} strokeDasharray="4 4" />
      <rect x={start - extension / 2} y={84 - contraction / 2} width={width + extension} height={46 + contraction} fill="#254e69" stroke={INK} strokeWidth="1.5" />
      <Arrow x1={start - extension / 2} x2={5} y={107} /><Arrow x1={end + extension / 2} x2={415} y={107} />
      <text x="210" y="67" textAnchor="middle" fill={INK} fontSize="15">纵向 ε = {(result.elasticStrain * 100).toFixed(4)}%</text>
      <text x="210" y="161" textAnchor="middle" fill={INK} fontSize="14">横向 εₜ = {(result.transverseStrain * 100).toFixed(4)}%</text>
      <text x="210" y="190" textAnchor="middle" fill={MUTED} fontSize="13">实线：变形后　虚线：变形前</text>
    </>}
  </svg>;
}
