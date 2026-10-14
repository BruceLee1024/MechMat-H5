import React, { Component, useState, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Maximize2, RotateCcw } from 'lucide-react';
import { TheoryPanel } from '../components';
import { DEFAULT_STATE, type ModuleType, type SimulationState } from '../types';
import { updateSimulationState } from '../mechanics/simulationState';
import type { SectionModel, SolverModel } from '../experiments/schema';
import { SIMPLY_SUPPORTED_BEAM } from '../solver/SolverTypes';
import 'katex/dist/katex.min.css';
import './styles.css';
import './resource.css';

export interface ModuleMetadata { id: string; title: string; prompt: string; description: string }
export interface ViewProps {
  state: SimulationState;
  onChange: (value: Partial<SimulationState>) => void;
  solver: SolverModel;
  setSolver: (model: SolverModel) => void;
  section: SectionModel;
  setSection: (model: SectionModel) => void;
}
const defaultSolver = (): SolverModel => ({ kind: 'solver', coordinateUnit: 'mm', ...structuredClone({ nodes: SIMPLY_SUPPORTED_BEAM.nodes, elements: SIMPLY_SUPPORTED_BEAM.elements, loads: SIMPLY_SUPPORTED_BEAM.loads }) });
const defaultSection = (): SectionModel => ({ kind: 'section', coordinateUnit: 'mm', sectionType: 'rectangle', parameters: { b: 100, h: 150 }, paths: [], displayUnit: 'mm' });

class ResourceBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <div className="h5-error" role="alert"><h2>资源暂时无法显示</h2><p>请重新打开本页，再试一次。</p><button type="button" onClick={() => location.reload()}>重新打开</button></div>;
    return this.props.children;
  }
}

function H5Shell({ metadata, render }: { metadata: ModuleMetadata; render: (props: ViewProps) => ReactNode }) {
  const [state, setState] = useState(() => structuredClone(DEFAULT_STATE));
  const [solver, setSolver] = useState(defaultSolver);
  const [section, setSection] = useState(defaultSection);
  const [panel, setPanel] = useState<'experiment' | 'theory'>('experiment');
  const [resetKey, setResetKey] = useState(0);
  const [notice, setNotice] = useState('');
  const reset = () => {
    setState(structuredClone(DEFAULT_STATE)); setSolver(defaultSolver()); setSection(defaultSection());
    setResetKey(key => key + 1); setNotice('已恢复默认参数');
  };
  const fullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
    } catch { setNotice('当前容器不支持全屏，可旋转手机查看图示。'); }
  };
  const focusParameters = () => {
    const main = document.getElementById('experiment');
    const control = Array.from(main?.querySelectorAll<HTMLInputElement>('input[inputmode="decimal"], input[type="number"], input[type="range"]') || []).find(input => input.getClientRects().length > 0);
    const target = control?.closest('.bg-white') || control || main;
    target?.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    control?.focus({ preventScroll: true });
  };
  return <div className={`h5-resource h5-${metadata.id}`}>
    <header className="h5-header">
      <div><p className="h5-subtitle">材料力学 · 交互学习</p><h1>{metadata.title}</h1></div>
      <div className="h5-actions">
        {metadata.id !== 'formulas' && <button type="button" aria-label="恢复默认参数" title="恢复默认参数" onClick={reset}><RotateCcw size={19} /></button>}
        {document.fullscreenEnabled && <button type="button" aria-label="全屏查看" title="全屏查看" onClick={fullscreen}><Maximize2 size={19} /></button>}
      </div>
    </header>
    <div className="h5-intro"><BookOpen size={18} aria-hidden="true" /><p>{metadata.prompt}</p>{metadata.id !== 'formulas' && <button type="button" className="h5-parameter-link" onClick={() => { setPanel('experiment'); requestAnimationFrame(focusParameters); }}>调节参数 ↓</button>}</div>
    {metadata.id !== 'formulas' && <nav className="h5-tabs" role="tablist" aria-label="学习面板">
      <button type="button" role="tab" id="tab-experiment" aria-controls="experiment" aria-selected={panel === 'experiment'} onClick={() => setPanel('experiment')}>交互实验</button>
      <button type="button" role="tab" id="tab-theory" aria-controls="theory" aria-selected={panel === 'theory'} onClick={() => setPanel('theory')}>概念与公式</button>
    </nav>}
    <p role="status" className="h5-status">{notice}</p>
    <main>
      <section className="h5-module" id="experiment" role="tabpanel" aria-labelledby="tab-experiment" hidden={panel !== 'experiment'}>
        <ResourceBoundary key={resetKey}>{render({ state, onChange: value => setState(previous => updateSimulationState(previous, value)), solver, setSolver, section, setSection })}</ResourceBoundary>
      </section>
      {metadata.id !== 'formulas' && <section id="theory" className="h5-theory" role="tabpanel" aria-labelledby="tab-theory" hidden={panel !== 'theory'}><TheoryPanel activeModule={metadata.id as ModuleType} className="h-auto" /></section>}
    </main>
    <footer className="h5-footer">拖动滑块或输入数值，观察图示与计算结果。<br />图中变形可能放大显示，数值请以计算结果为准。</footer>
  </div>;
}

export function mountResource(metadata: ModuleMetadata, render: (props: ViewProps) => ReactNode) {
  document.title = `${metadata.title} · 材料力学 H5`;
  createRoot(document.getElementById('root')!).render(<H5Shell metadata={metadata} render={render} />);
}
