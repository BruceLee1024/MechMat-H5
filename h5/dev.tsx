import React from 'react';
import { createRoot } from 'react-dom/client';
import { modules } from './modules.mjs';
import './styles.css';
import './resource.css';

const metadata = modules.find(module => module.id === new URLSearchParams(location.search).get('module'));
if (metadata) {
  const { mountResource } = await import('./H5Shell');
  const views = import.meta.glob('../modules/*Module.tsx');
  const view = metadata.id === 'solver' ? await import('../solver/SolverModule') : await views[`../${metadata.source}`]();
  const View = (view as Record<string, React.ComponentType<any>>)[metadata.component];
  mountResource(metadata, props => metadata.id === 'solver' ? <View model={props.solver} onModelChange={props.setSolver} /> : metadata.id === 'section' ? <View model={props.section} onModelChange={props.setSection} /> : metadata.id === 'formulas' ? <View /> : <View state={props.state} onChange={props.onChange} />);
} else {
  document.title = '材料力学 H5 · 资源目录';
  createRoot(document.getElementById('root')!).render(<main className="h5-catalog"><h1>材料力学 H5</h1><p>每一个模块，都是一个可以独立打开的交互实验。</p><div>{modules.map(module => <a key={module.id} href={`?module=${module.id}`}><span>{module.chapter}</span><div><h2>{module.title}</h2><p>{module.description}</p></div><span aria-hidden="true">↗</span></a>)}</div></main>);
}
