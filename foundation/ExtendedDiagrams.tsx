import React, { useEffect, useId, useState } from 'react';
import { evaluateSimpleShear, evaluateStressComparison } from './model';
import { DEFORMATION_FORMS, type DeformationForm } from './knowledge';

const CYAN = '#58d9ef', AMBER = '#ffc36c', TEXT = '#dcecff', MUTED = '#8ba6bf';

function Vector({ from, to, color = AMBER }: { from: [number, number]; to: [number, number]; color?: string }) {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const bx = to[0] - 11 * Math.cos(angle), by = to[1] - 11 * Math.sin(angle);
  return <g stroke={color} strokeWidth="3" fill={color}><path d={`M${from}L${bx},${by}`} /><path d={`M${to}L${bx - 5 * Math.sin(angle)},${by + 5 * Math.cos(angle)}L${bx + 5 * Math.sin(angle)},${by - 5 * Math.cos(angle)}Z`} stroke="none" /></g>;
}

export function ModelDiagram({ ideal, assumption }: { ideal: boolean; assumption: number }) {
  const id = useId().replace(/:/g, '');
  const vertices = [[100, 140], [400, 215], [400, 285], [100, 210]];
  return <svg className="foundation-diagram diagram-model" viewBox="15 75 495 265" role="img" aria-label="三维受拉试件，青色轮廓表示理想模型，琥珀色箭头表示相反方向的轴向拉力">
    <defs><linearGradient id={`${id}-steel`} x2="1" y2="1"><stop stopColor="#657f95" stopOpacity=".7" /><stop offset="1" stopColor="#1c354c" stopOpacity=".85" /></linearGradient><filter id={`${id}-glow`}><feGaussianBlur stdDeviation="3" /></filter></defs>
    <path d="M100 140 125 120 425 195 400 215Z" fill="#47647d" fillOpacity=".8" stroke={CYAN} strokeWidth="1.4" />
    <path d="M400 215 425 195 425 265 400 285Z" fill="#214862" stroke={CYAN} strokeWidth="1.4" />
    <path d="M100 140 400 215 400 285 100 210Z" fill={`url(#${id}-steel)`} stroke={CYAN} strokeWidth="1.7" />
    {Array.from({ length: 11 }, (_, index) => { const x = 100 + index * 30, y = 140 + index * 7.5; return <g key={index} stroke={ideal ? '#7695af' : CYAN} strokeOpacity={ideal ? '.35' : '.65'} strokeWidth=".7"><path d={`M${x} ${y}v70`} /><path d={`M${x} ${y}l${index < 10 ? '30 77.5' : '0 70'}`} /></g>; })}
    {[1, 2, 3].map(index => <path key={index} d={`M100 ${140 + index * 17.5}l300 75`} stroke="#9fc0d8" strokeOpacity=".35" strokeWidth=".7" />)}
    {vertices.map(([x, y]) => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="7" fill={CYAN} opacity=".6" filter={`url(#${id}-glow)`} /><circle cx={x} cy={y} r="2.6" fill="#b7f7ff" /></g>)}
    <Vector from={[100, 175]} to={[37, 159]} /><Vector from={[425, 230]} to={[488, 246]} />
    <text x="33" y="145" fill={AMBER} fontSize="24" fontStyle="italic">F</text><text x="490" y="229" fill={AMBER} fontSize="24" fontStyle="italic">F</text>
    <g stroke={MUTED} strokeDasharray="4 4"><path d="M125 115V88M425 190v-27M125 91l300 75" /></g><text x="253" y="109" fill={TEXT} fontSize="17" transform="rotate(14 253 109)">L₀ = 200 mm</text>
    {assumption === 1 && <><circle cx="165" cy="191" r="5" fill={CYAN} /><circle cx="345" cy="236" r="5" fill={CYAN} /><text x="230" y="327" fill={TEXT} fontSize="16" textAnchor="middle">不同位置：E₁ = E₂</text></>}
    {assumption === 2 && <><Vector from={[275, 209]} to={[316, 219]} color={CYAN} /><Vector from={[275, 209]} to={[275, 166]} color={CYAN} /><text x="260" y="327" fill={TEXT} fontSize="16" textAnchor="middle">不同方向：Eₓ = Eᵧ = E_z</text></>}
    {assumption === 3 && <><path d="M100 139 402 214 402 285 100 210Z" stroke={AMBER} strokeDasharray="4 4" fill="none" /><text x="260" y="327" fill={TEXT} fontSize="16" textAnchor="middle">ΔL / L₀ ≪ 1</text></>}
    {assumption === 0 && <text x="260" y="327" fill={MUTED} fontSize="14" textAnchor="middle">{ideal ? '宏观连续体 · 保留尺寸与受力条件' : '微观结构示意 · 不逐颗计算晶粒'}</text>}
  </svg>;
}

export function ShearDiagram({ displacement }: { displacement: number }) {
  const { gamma, angleDegrees } = evaluateSimpleShear(displacement);
  const offset = displacement * 10;
  return <svg className="foundation-diagram" viewBox="0 0 420 260" role="img" aria-label="简单剪切方块：底边固定，顶边水平移动；虚线表示原来的正方形，实线表示变形后">
    <rect x="130" y="70" width="100" height="100" fill="none" stroke={MUTED} strokeDasharray="4 4" />
    <path d={`M130 170h100l${offset} -100h-100Z`} fill="#254e69" fillOpacity=".7" stroke={CYAN} strokeWidth="2" />
    <path d="M120 177h120m-110 0-6 8m26-8-6 8m26-8-6 8m26-8-6 8m26-8-6 8" stroke={MUTED} />
    <Vector from={[130, 49]} to={[130 + Math.max(offset, 1), 49]} /><text x="210" y="28" textAnchor="middle" fill={TEXT} fontSize="16">顶面位移 δ = {displacement.toFixed(1)} mm</text>
    <text x="90" y="122" textAnchor="middle" fill={MUTED} fontSize="15">H₀</text><text x="210" y="217" textAnchor="middle" fill={TEXT} fontSize="16">γ = {gamma.toFixed(3)} · 实际角变 {angleDegrees.toFixed(2)}°</text><text x="210" y="245" textAnchor="middle" fill={MUTED} fontSize="13">原高 100 mm · 位移放大 10 倍</text>
  </svg>;
}

export function FormDiagram({ form, amount }: { form: DeformationForm; amount: number }) {
  const info = DEFORMATION_FORMS.find(item => item.id === form)!;
  const d = amount / 100, extension = (form === 'compression' ? -1 : 1) * d * 48, shear = d * 42, bend = d * 60;
  return <svg className="foundation-diagram" viewBox="0 0 420 270" role="img" aria-label={`${info.name}示意：${info.description}`}>
    <text x="210" y="34" textAnchor="middle" fill={TEXT} fontSize="17">{info.action} → {info.internal}</text>
    {(form === 'tension' || form === 'compression') && <><rect x="90" y="103" width="240" height="52" fill="none" stroke={MUTED} strokeDasharray="4 4" /><rect x={90 - extension / 2} y={103 + extension * .05} width={240 + extension} height={52 - extension * .1} fill="#254e69" stroke={CYAN} strokeWidth="2" /><Vector from={form === 'tension' ? [90 - extension / 2, 129] : [35, 129]} to={form === 'tension' ? [35, 129] : [90 - extension / 2, 129]} /><Vector from={form === 'tension' ? [330 + extension / 2, 129] : [385, 129]} to={form === 'tension' ? [385, 129] : [330 + extension / 2, 129]} /></>}
    {form === 'shear' && <><rect x="145" y="86" width="110" height="100" fill="none" stroke={MUTED} strokeDasharray="4 4" /><path d={`M145 186h110l${shear} -100H${145 + shear}Z`} fill="#254e69" stroke={CYAN} strokeWidth="2" /><Vector from={[145 + shear, 71]} to={[290 + shear, 71]} /><Vector from={[255, 202]} to={[110, 202]} /></>}
    {form === 'bending' && <><rect x="70" y="106" width="280" height="40" fill="none" stroke={MUTED} strokeDasharray="4 4" /><path d={`M70 106Q210 ${106 + bend} 350 106v40Q210 ${146 + bend} 70 146Z`} fill="#254e69" stroke={CYAN} strokeWidth="2" /><path d="m70 151-12 18h24Zm280 0-12 18h24Z" fill="none" stroke={MUTED} /><Vector from={[210, 55]} to={[210, 106 + bend / 2]} /></>}
    {form === 'torsion' && <><path d="M90 100h240v60H90" fill="#254e69" stroke={CYAN} strokeWidth="2" /><ellipse cx="90" cy="130" rx="15" ry="30" fill="#183c53" stroke={CYAN} /><ellipse cx="330" cy="130" rx="15" ry="30" fill="#315a74" stroke={CYAN} />{[-1, 0, 1].map(row => <path key={row} d={`M90 ${130 + row * 20}Q210 ${130 + row * 20 + Math.sin(d * Math.PI / 3) * 35} 330 ${130 + row * 20 * Math.cos(d * Math.PI / 3)}`} fill="none" stroke={CYAN} strokeOpacity=".7" />)}<g transform={`rotate(${d * 60} 330 130)`}><path d="M330 104v52" stroke={AMBER} strokeWidth="2" /></g><path d="M352 91a48 48 0 0 1 0 78m-2-8 2 8 8-3M68 169a48 48 0 0 1 0-78m2 8-2-8-8 3" fill="none" stroke={AMBER} strokeWidth="3" /><text x="378" y="136" fill={AMBER} fontSize="17">T</text></>}
    <text x="210" y="242" textAnchor="middle" fill={MUTED} fontSize="14">虚线为原形 · 实线为放大后的变形示意</text>
  </svg>;
}

/** 动画状态只驱动图形，阅读区与判断题不参与逐帧重渲染。 */
export function AnimatedFormDiagram({ form, amount, playing }: { form: DeformationForm; amount: number; playing: boolean }) {
  const [visualAmount, setVisualAmount] = useState(amount);
  useEffect(() => { setVisualAmount(amount); }, [amount, form]);
  useEffect(() => {
    if (!playing) return;
    let frame: number, start: number | undefined;
    const tick = (time: number) => {
      start ??= time;
      setVisualAmount(amount * (1 - Math.cos((time - start) / 2400 * Math.PI * 2)) / 2);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, amount, form]);
  return <FormDiagram form={form} amount={visualAmount} />;
}

export function ComparisonDiagram({ forceKN, area, strain }: { forceKN: number; area: number; strain: number }) {
  const result = evaluateStressComparison(forceKN, area, strain);
  const x = 52 + strain / .5 * 316;
  const y = (stress: number) => 301 - stress / (result.engineeringMPa * 1.6) * 118;
  const width = 180 * result.stretch, height = 45 / Math.sqrt(result.stretch);
  return <svg className="foundation-diagram diagram-compare" viewBox="0 0 420 350" role="img" aria-label="工程应力与真应力对照：固定拉力，原始面积应力为水平线，当前面积应力随均匀伸长增加">
    <rect x="120" y="48" width="180" height="45" fill="none" stroke={MUTED} strokeDasharray="4 4" /><rect x={210 - width / 2} y={70.5 - height / 2} width={width} height={height} fill="#254e69" stroke={CYAN} strokeWidth="1.7" />
    <text x="210" y="26" textAnchor="middle" fill={TEXT} fontSize="16">A₀ = {area} → A = {result.areaMM2.toFixed(1)} mm²</text><text x="210" y="124" textAnchor="middle" fill={MUTED} fontSize="14">均匀拉伸 · 体积不变</text>
    <g stroke="#385169" strokeWidth="1"><path d="M52 173v128h316" />{[.5, 1, 1.5].map(ratio => <line key={ratio} x1="52" x2="368" y1={y(result.engineeringMPa * ratio)} y2={y(result.engineeringMPa * ratio)} strokeDasharray="3 5" />)}</g>
    <path d={`M52 ${y(result.engineeringMPa)}H368`} fill="none" stroke={CYAN} strokeWidth="2.3" /><path d={`M52 ${y(result.engineeringMPa)}L368 ${y(result.engineeringMPa * 1.5)}`} fill="none" stroke={AMBER} strokeWidth="2.3" />
    <path d={`M${x} 173v128`} stroke={MUTED} strokeDasharray="4 4" /><circle cx={x} cy={y(result.engineeringMPa)} r="4" fill={CYAN} /><circle cx={x} cy={y(result.trueMPa)} r="4" fill={AMBER} />
    <text x="28" y="177" fill={MUTED} fontSize="13">σ</text><text x="52" y="324" fill={MUTED} fontSize="13">0</text><text x="345" y="324" fill={MUTED} fontSize="13">50% ε</text><text x="235" y="158" fill={CYAN} fontSize="14">工程应力</text><text x="315" y="158" fill={AMBER} fontSize="14">真应力</text>
  </svg>;
}
