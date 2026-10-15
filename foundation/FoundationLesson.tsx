import React, { useEffect, useId, useState } from 'react';
import { INITIAL_FOUNDATION, MATERIALS, evaluateFoundation, evaluateSimpleShear, evaluateStressComparison, type FoundationParameters } from './model';
import { LESSONS } from './lessons';
import { AnswerMark, DirectionMark, FoundationDiagram, ResetMark, SpecimenMark } from './diagrams';
import { DEFORMATION_FORMS, KNOWLEDGE, type DeformationForm } from './knowledge';
import { AssumptionPanel, ModelObjectives } from './AssumptionPanel';
import { AnimatedFormDiagram, ComparisonDiagram, ModelDiagram, ShearDiagram } from './ExtendedDiagrams';
import './foundation.css';

function Parameter({ label, value, min, max, step, unit, digits = 0, onChange }: {
  label: string; value: number; min: number; max: number; step: number; unit: string; digits?: number; onChange: (value: number) => void;
}) {
  const id = useId();
  return <div className="foundation-parameter">
    <div className="parameter-heading"><label htmlFor={id}>{label}</label><output htmlFor={id}>{value.toFixed(digits)} <span>{unit}</span></output></div>
    <input id={id} type="range" value={value} min={min} max={max} step={step} onChange={event => onChange(Number(event.target.value))} />
    <div className="parameter-limits"><span>{min}</span><span>{max}</span></div>
  </div>;
}

function ChoiceSwitch({ label, options, value, onChange }: { label: string; options: readonly { value: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return <div className="foundation-switch" role="group" aria-label={label}>{options.map(option => <button type="button" key={option.value} aria-pressed={value === option.value} onClick={() => onChange(option.value)}>{option.label}</button>)}</div>;
}

function LessonQuiz({ lesson, selected, onSelect }: { lesson: typeof LESSONS[number]; selected: number | null; onSelect: (index: number) => void }) {
  const id = useId();
  const correct = selected === lesson.correct;
  return <section className="foundation-quiz" aria-labelledby={id}>
    <h2 id={id}>{lesson.question}</h2>
    <div className="quiz-options" role="group" aria-labelledby={id}>{lesson.options.map((option, index) => <button type="button" key={option} aria-pressed={selected === index} onClick={() => onSelect(index)} className={selected === index ? index === lesson.correct ? 'answer-correct' : 'answer-retry' : ''}>
      <AnswerMark selected={selected === index} correct={index === lesson.correct} /><span>{option}</span>
    </button>)}</div>
    <div className={`quiz-feedback ${selected === null ? '' : correct ? 'is-correct' : 'is-retry'}`} role="status">{selected !== null && <><strong>{correct ? '答对了。' : '再观察一次。'}</strong>{correct ? lesson.feedback : lesson.correction}</>}</div>
  </section>;
}

export function FoundationLesson() {
  const [step, setStep] = useState(0);
  const [parameters, setParameters] = useState<FoundationParameters>(() => ({ ...INITIAL_FOUNDATION, areaMM2: 200, displacementMM: 0.03 }));
  const [assumption, setAssumption] = useState(0);
  const [shearMode, setShearMode] = useState(false);
  const [shearDisplacement, setShearDisplacement] = useState(3);
  const [form, setForm] = useState<DeformationForm>('tension');
  const [formAmount, setFormAmount] = useState(60);
  const [playing, setPlaying] = useState(false);
  const [comparisonStrain, setComparisonStrain] = useState(20);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [ideal, setIdeal] = useState(true);
  const [cut, setCut] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() => LESSONS.map(() => null));
  const [resetNotice, setResetNotice] = useState('');
  const lesson = LESSONS[step];
  const result = evaluateFoundation(parameters);
  const shearResult = evaluateSimpleShear(shearDisplacement);
  const comparison = evaluateStressComparison(parameters.forceKN, parameters.areaMM2, comparisonStrain / 100);
  const formInfo = DEFORMATION_FORMS.find(item => item.id === form)!;
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(media.matches);
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);
  const change = (patch: Partial<FoundationParameters>) => setParameters(previous => ({ ...previous, ...patch }));
  const goTo = (next: number) => {
    setStep(next); setPlaying(false); setResetNotice('');
    requestAnimationFrame(() => { document.getElementById('foundation-app')?.scrollIntoView({ behavior: 'auto', block: 'start' }); document.getElementById(`foundation-tab-${LESSONS[next].id}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' }); });
  };
  const reset = () => {
    setParameters({ ...INITIAL_FOUNDATION, areaMM2: 200, displacementMM: 0.03 }); setStep(0); setIdeal(true); setCut(false);
    setAssumption(0); setShearMode(false); setShearDisplacement(3); setForm('tension'); setFormAmount(60); setPlaying(false); setComparisonStrain(20);
    setAnswers(LESSONS.map(() => null)); setResetNotice('已重新开始，所有实验参数和回答均已恢复。');
  };
  const chooseAnswer = (answer: number) => setAnswers(previous => previous.map((value, index) => index === step ? answer : value));
  const completed = LESSONS.every((item, index) => answers[index] === item.correct);
  const percent = (value: number) => `${(value * 100).toFixed(4)}%`;
  const observation = lesson.id === 'model'
    ? ideal ? '忽略微观颗粒，把材料看作连续、均匀的整体。' : '真实材料有微观结构；这里用晶粒图示提醒你，模型是对它的简化。'
    : lesson.id === 'force'
    ? cut ? `截面移到 ${parameters.cutPercent}% L₀，N 仍为 ${result.sectionForceKN.toFixed(1)} kN。左段满足 N − F = 0。` : '点击切开试件，在左段的截面上补上内力，使它重新满足平衡。'
    : lesson.id === 'stress'
    ? parameters.areaMM2 === 200 ? '面积加倍，同一拉力下应力减半。' : `当前面积是参考面积的 ${(parameters.areaMM2 / 100).toFixed(1)} 倍，应力是参考值的 ${(100 / parameters.areaMM2).toFixed(2)} 倍。`
    : lesson.id === 'strain'
    ? parameters.motion === 'translation' ? `两端都移动 ${parameters.displacementMM.toFixed(3)} mm，距离没有改变，轴向应变为零。` : `右端比左端多移动 ${parameters.displacementMM.toFixed(3)} mm，伸长量除以原长，就是轴向应变。`
    : lesson.id === 'forms' ? formInfo.description
    : lesson.id === 'compare' ? `保持拉力不变，原始面积为 ${parameters.areaMM2} mm²，当前面积为 ${comparison.areaMM2.toFixed(1)} mm²。图中曲线对照应力定义，不代表材料本构。`
    : `σ 相同，E 越大，伸长越小。ν = ${parameters.poisson.toFixed(2)} 时，横向应变为纵向应变的 −${parameters.poisson.toFixed(2)} 倍。`;

  return <div className="foundation-app" id="foundation-app">
    <header className="foundation-header"><div className="foundation-brand"><SpecimenMark /><span>力学微实验</span></div><button type="button" className="foundation-reset" aria-label="重新开始基础实验" title="重新开始基础实验" onClick={reset}><ResetMark /></button></header>
    <nav className="foundation-progress" role="tablist" aria-label="基础实验七节学习">
      {LESSONS.map((item, index) => <button type="button" role="tab" id={`foundation-tab-${item.id}`} aria-controls="foundation-panel" aria-selected={step === index} tabIndex={step === index ? 0 : -1} className={step === index ? 'is-active' : answers[index] === item.correct ? 'is-done' : ''} key={item.id} onClick={() => goTo(index)}
        onKeyDown={event => {
          let next = index;
          if (event.key === 'ArrowRight') next = (index + 1) % LESSONS.length;
          else if (event.key === 'ArrowLeft') next = (index + LESSONS.length - 1) % LESSONS.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = LESSONS.length - 1;
          else return;
          event.preventDefault(); goTo(next); document.getElementById(`foundation-tab-${LESSONS[next].id}`)?.focus();
        }}><span>{item.label}</span><i aria-hidden="true" /></button>)}
    </nav>
    <p className="foundation-reset-notice" role="status">{resetNotice}</p>
    <main id="foundation-panel" role="tabpanel" aria-labelledby={`foundation-tab-${lesson.id}`}>
      <div className={`foundation-workspace lesson-${lesson.id}`}>
        <div className="foundation-visual">
          <figure className="foundation-canvas">
            {lesson.id === 'model' ? <ModelDiagram ideal={ideal} assumption={assumption} />
              : lesson.id === 'forms' ? <AnimatedFormDiagram form={form} amount={formAmount} playing={playing && !reducedMotion} />
              : lesson.id === 'compare' ? <ComparisonDiagram forceKN={parameters.forceKN} area={parameters.areaMM2} strain={comparisonStrain / 100} />
              : lesson.id === 'strain' && shearMode ? <ShearDiagram displacement={shearDisplacement} />
              : <FoundationDiagram lesson={lesson.id} parameters={parameters} ideal={ideal} cut={cut} />}
            {lesson.id === 'stress' && <figcaption>⊙ 表示垂直截面向外的拉力分布</figcaption>}
          </figure>
          {lesson.id === 'model' && <ChoiceSwitch label="比较真实试件与理想模型" value={ideal ? 'ideal' : 'real'} options={[{ value: 'real', label: '真实试件' }, { value: 'ideal', label: '理想模型' }]} onChange={value => setIdeal(value === 'ideal')} />}
          {lesson.id === 'strain' && <ChoiceSwitch label="选择位移方式" value={shearMode ? 'shear' : parameters.motion} options={[{ value: 'translation', label: '整体平移' }, { value: 'extension', label: '拉伸变形' }, { value: 'shear', label: '简单剪切' }]} onChange={value => { setShearMode(value === 'shear'); if (value !== 'shear') change({ motion: value as FoundationParameters['motion'] }); }} />}
          {lesson.id === 'forms' && <button type="button" className="foundation-play" aria-pressed={playing && !reducedMotion} disabled={reducedMotion} onClick={() => setPlaying(value => !value)}>{reducedMotion ? '减少动态已开启，请使用滑块' : playing ? '暂停变形演示' : '播放变形演示'}</button>}
          <p className="canvas-note">{lesson.id === 'model' ? '观察结构，建立模型' : lesson.id === 'forms' ? `${formInfo.name} · ${formInfo.internal}` : lesson.id === 'compare' ? '固定拉力下的应力定义对照' : '改变参数，观察图形与结果的联动'}</p>
        </div>
        <div className="foundation-reading">
          <div className="foundation-heading"><h1>{lesson.id === 'model' ? '选择一个假设' : lesson.label}</h1>{lesson.id !== 'model' && <p>{lesson.description}</p>}</div>
          <div className="foundation-controls">
          {lesson.id === 'model' && <AssumptionPanel value={assumption} onChange={setAssumption} />}
          {(lesson.id === 'force' || lesson.id === 'stress') && <Parameter label="拉力 F" value={parameters.forceKN} min={1} max={12} step={0.5} unit="kN" digits={1} onChange={forceKN => change({ forceKN })} />}
          {lesson.id === 'force' && <><Parameter label="截面位置 x" value={parameters.cutPercent} min={20} max={80} step={5} unit="% L₀" onChange={cutPercent => change({ cutPercent })} /><button type="button" className="foundation-cut-button" aria-pressed={cut} onClick={() => setCut(value => !value)}>{cut ? '合回试件' : '切开试件，显示内力'}</button><div className="foundation-equation"><span>N − F = 0</span><strong data-testid="foundation-section-force">N = {result.sectionForceKN.toFixed(1)} <small>kN</small></strong></div></>}
          {lesson.id === 'stress' && <><Parameter label="截面积 A" value={parameters.areaMM2} min={50} max={300} step={10} unit="mm²" onChange={areaMM2 => change({ areaMM2 })} /><div className="foundation-equation"><span>σ = <span className="math-fraction"><span>F</span><span>A</span></span> =</span><strong data-testid="foundation-stress">{result.stressMPa.toFixed(1)} <small>MPa</small></strong></div></>}
          {lesson.id === 'strain' && !shearMode && <><Parameter label="右端位移 uB" value={parameters.displacementMM} min={0} max={0.2} step={0.01} unit="mm" digits={3} onChange={displacementMM => change({ displacementMM })} /><div className="foundation-motion-values"><span>uA <strong>{result.displacementA.toFixed(3)} mm</strong></span><span>uB <strong>{result.displacementB.toFixed(3)} mm</strong></span></div><div className="foundation-equation"><span>ε = <span className="math-fraction"><span>uB − uA</span><span>L₀</span></span> =</span><strong data-testid="foundation-strain">{percent(result.strain)}</strong></div></>}
          {lesson.id === 'strain' && shearMode && <><Parameter label="顶面位移 δ" value={shearDisplacement} min={0} max={5} step={.1} unit="mm" digits={1} onChange={setShearDisplacement} /><div className="foundation-equation"><span>γ ≈ δ / H₀</span><strong data-testid="foundation-shear">{shearResult.gamma.toFixed(3)}</strong></div><p className="foundation-context">原高 H₀ = 100 mm；实际直角改变 {shearResult.angleDegrees.toFixed(2)}°，小角度时 γ 约等于角变的弧度值。</p></>}
          {lesson.id === 'forms' && <><ChoiceSwitch label="选择基本变形" value={form} options={DEFORMATION_FORMS.map(item => ({ value: item.id, label: item.name }))} onChange={value => setForm(value as DeformationForm)} /><Parameter label="示意变形幅度" value={formAmount} min={0} max={100} step={5} unit="%" onChange={setFormAmount} /><div className="foundation-form-result"><span>{formInfo.action}</span><DirectionMark /><strong>{formInfo.internal}</strong></div></>}
          {lesson.id === 'compare' && <><Parameter label="拉力 F" value={parameters.forceKN} min={1} max={12} step={.5} unit="kN" digits={1} onChange={forceKN => change({ forceKN })} /><Parameter label="原始面积 A₀" value={parameters.areaMM2} min={50} max={300} step={10} unit="mm²" onChange={areaMM2 => change({ areaMM2 })} /><Parameter label="工程应变 εₑ" value={comparisonStrain} min={0} max={50} step={1} unit="%" onChange={setComparisonStrain} /><div className="comparison-results"><div><span>工程应力 σₑ</span><strong data-testid="foundation-engineering-stress">{comparison.engineeringMPa.toFixed(1)} <small>MPa</small></strong></div><div><span>真应力 σₜ</span><strong data-testid="foundation-true-stress">{comparison.trueMPa.toFixed(1)} <small>MPa</small></strong></div></div><p className="foundation-context">均匀变形、体积不变时：σₜ = σₑ(1 + εₑ)。这是几何换算，不是材料本构定律。</p></>}
          {lesson.id === 'material' && <><ChoiceSwitch label="选择教学材料" value={String(parameters.youngGPa)} options={MATERIALS.map(material => ({ value: String(material.youngGPa), label: `${material.name} ${material.youngGPa} GPa` }))} onChange={value => { const material = MATERIALS.find(item => String(item.youngGPa) === value)!; change({ youngGPa: material.youngGPa, poisson: material.poisson }); }} /><Parameter label="泊松比 ν" value={parameters.poisson} min={0} max={0.45} step={0.01} unit="" digits={2} onChange={poisson => change({ poisson })} /><div className="foundation-equation material-equation"><span>ε = σ / E</span><strong data-testid="foundation-elastic-strain">{percent(result.elasticStrain)}</strong></div><div className="foundation-motion-values"><span>伸长 ΔL <strong data-testid="foundation-extension">{result.elasticExtensionMM.toFixed(3)} mm</strong></span><span>横向应变 εₜ <strong>{percent(result.transverseStrain)}</strong></span></div><p className="foundation-context">当前拉力 {parameters.forceKN.toFixed(1)} kN，截面积 {parameters.areaMM2} mm²，正应力 {result.stressMPa.toFixed(1)} MPa。</p></>}
          {lesson.id !== 'model' && <p className="foundation-observation">{lesson.id === 'strain' && shearMode ? '长度改变描述线应变；原来直角的改变描述切应变。位移、线应变与切应变不能混为一谈。' : observation}</p>}
          {lesson.id === 'force' && <p className="foundation-context">一般截面可有轴力 N、剪力 Q、扭矩 T 与弯矩 M。本节纯轴向受拉模型只有 N 非零。</p>}
          </div>
          {lesson.id === 'model' ? <ModelObjectives /> : <section className="foundation-knowledge" aria-label="基础要点"><h2>基础要点</h2><div className="knowledge-columns">{KNOWLEDGE[lesson.id].map(item => <div key={item.title}><h3>{item.title}</h3><p>{item.description}</p></div>)}</div></section>}
        </div>
      </div>
      <div className="foundation-review">
        <LessonQuiz lesson={lesson} selected={answers[step]} onSelect={chooseAnswer} />
      </div>
    </main>
    <footer className="foundation-footer"><p>{lesson.id === 'strain' && shearMode ? '简单剪切：原高 100 mm，顶面位移放大 10 倍；切应变数值由真实位移计算。' : lesson.scope}</p><button type="button" className="foundation-next" onClick={() => goTo((step + 1) % LESSONS.length)}>{lesson.next}<DirectionMark /></button></footer>
    {completed && <p className="foundation-complete" role="status">七节已完成。你已经串起了基本假设、内力、应力、应变、材料关系和基本变形。</p>}
  </div>;
}
