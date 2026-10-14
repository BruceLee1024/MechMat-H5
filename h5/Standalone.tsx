import React, { Component, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

class StandaloneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    return this.state.failed ? <main style={{ padding: 24, fontFamily: 'system-ui' }} role="alert"><h1>实验暂时无法显示</h1><p>请重新打开本页，再试一次。</p><button type="button" onClick={() => location.reload()}>重新打开</button></main> : this.props.children;
  }
}
export function mountStandalone(metadata: { title: string }, content: ReactNode) {
  document.title = `${metadata.title} · 材料力学 H5`;
  document.body.style.margin = '0'; document.body.style.background = '#ffffff';
  createRoot(document.getElementById('root')!).render(<StandaloneBoundary>{content}</StandaloneBoundary>);
}
