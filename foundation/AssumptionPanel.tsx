import React from 'react';
import { ASSUMPTIONS, KNOWLEDGE } from './knowledge';

const HINTS = ['宏观连续', '位置无关', '方向无关', '几何近似'];

// 图形分别对应连续场、等性质取样、方向与变形前后的几何。
function AssumptionSymbol({ index }: { index: number }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {index === 0 ? <><rect x="5" y="5" width="22" height="22" rx="3" /><path d="M5 12h22M5 20h22M12 5v22M20 5v22" opacity=".6" /><path d="m5 23 7-7 8 2 7-9" strokeWidth="2" /></>
      : index === 1 ? <><rect x="4" y="6" width="24" height="20" rx="3" /><circle cx="10" cy="16" r="2.5" /><circle cx="22" cy="16" r="2.5" /><path d="M14 14h4m-4 4h4" /></>
      : index === 2 ? <><circle cx="16" cy="16" r="10" opacity=".4" /><path d="M5 16h22M16 5v22M23 9 9 23m11-14h3v3M24 13l3 3-3 3M13 8l3-3 3 3" /><circle cx="16" cy="16" r="2.5" fill="currentColor" stroke="none" /></>
      : <><path d="M7 25V7h18v18Z" strokeDasharray="3 3" opacity=".45" /><path d="M7 25 10 7h18l-3 18Z" /><path d="M11 29h13M9 3h15" opacity=".65" /></>}
  </svg>;
}

export function AssumptionPanel({ value, onChange }: { value: number; onChange: (index: number) => void }) {
  const active = ASSUMPTIONS[value];
  return <div className="assumption-panel">
    <div className="assumption-options" role="group" aria-label="四个基本假设">
      {ASSUMPTIONS.map((item, index) => <button type="button" key={item.name} aria-label={item.name} aria-pressed={value === index} onClick={() => onChange(index)}>
        <span className="assumption-symbol"><AssumptionSymbol index={index} /></span>
        <span className="assumption-label"><strong>{item.name}</strong><small>{HINTS[index]}</small></span>
        <span className="assumption-indicator" aria-hidden="true">{value === index && <svg viewBox="0 0 16 16" fill="none"><path d="m4 8 2.5 2.5L12 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}</span>
      </button>)}
    </div>
    <div className="assumption-insight">
      <div className="assumption-insight-heading"><span>模型解读</span><span aria-hidden="true">0{value + 1} / 04</span></div>
      <p className="assumption-explanation" role="status"><strong>{active.name}</strong>{active.description}</p>
      <details className="foundation-detail" key={value}><summary>理解这个假设的边界<span aria-hidden="true" /></summary><p>{active.detail}</p></details>
    </div>
  </div>;
}

export function ModelObjectives() {
  return <section className="foundation-knowledge model-objectives" aria-label="基础要点">
    <h2>材料力学的三个关注点</h2>
    <div className="model-objective-list">{KNOWLEDGE.model.map((item, index) => <div className={`model-objective objective-${index}`} key={item.title}>
      <svg viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {index === 0 ? <><path d="m14 3 9 4v7c0 5-5 8-9 11-4-3-9-6-9-11V7Z" /><path d="m9 14 3 3 7-7" /></>
          : index === 1 ? <><path d="M4 6v16M24 6v16M4 14h20M4 9c7 0 6 10 13 10h7" /><path d="m10 10 3 4-3 4" opacity=".6" /></>
          : <><path d="M5 24h18M10 24V7h8v17M9 4h10M14 1v6m-3-3 3 3 3-3" /><path d="M14 9c-6 4 6 8 0 13" strokeDasharray="2 3" opacity=".65" /></>}
      </svg>
      <div><h3>{item.title}</h3><p>{item.description}</p></div>
    </div>)}</div>
  </section>;
}
