import { build } from 'vite';
import { mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import path from 'node:path';
import { zipSync, strToU8 } from 'fflate';
import QRCode from 'qrcode';
import { modules } from '../h5/modules.mjs';

const baseUrl = (process.env.H5_BASE_URL || 'https://brucelee1024.github.io/MechMat-H5/').replace(/\/?$/, '/');
const escape = value => String(value).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);
const links = [];
await rm('dist', { recursive: true, force: true });
await mkdir('dist/downloads', { recursive: true });
await mkdir('dist/qrcodes', { recursive: true });
const template = await readFile('index.html', 'utf8');
try {
  for (const module of modules) {
    const render = module.id === 'solver' ? '<View model={props.solver} onModelChange={props.setSolver} />' : module.id === 'section' ? '<View model={props.section} onModelChange={props.setSection} />' : module.id === 'formulas' ? '<View />' : '<View state={props.state} onChange={props.onChange} />';
    const entry = `import React from 'react';\nimport { mountResource } from './h5/H5Shell';\nimport { ${module.component} as View } from './${module.source}';\nmountResource(${JSON.stringify(module)}, props => ${render});\n`;
    await writeFile('.h5-entry.tsx', entry);
    const outDir = `.h5-build/${module.id}`;
    const output = await build({ configFile: './vite.config.ts', logLevel: 'error', build: { outDir, emptyOutDir: true, write: false, rollupOptions: { input: path.resolve('.h5-entry.tsx'), output: { inlineDynamicImports: true } } } });
    const artifacts = (Array.isArray(output) ? output : [output]).flatMap(result => result.output);
    const chunks = artifacts.filter(item => item.type === 'chunk');
    if (chunks.length !== 1 || chunks[0].imports.length || chunks[0].dynamicImports.length) throw new Error(`${module.id} 未生成独立脚本`);
    const css = artifacts.filter(item => item.type === 'asset' && item.fileName.endsWith('.css')).map(item => String(item.source)).join('\n');
    const unbundled = artifacts.filter(item => item.type === 'asset' && !item.fileName.endsWith('.css'));
    if (unbundled.length) throw new Error(`${module.id} 尚有未内嵌资源：${unbundled.map(item => item.fileName).join(', ')}`);
    const script = chunks[0].code.replace(/<\/script/gi, '<\\/script');
    // 用回调插入构建产物，避免 JS 中的 $&、$` 等字符被 String.replace 当成替换指令。
    const html = template.replace('<title>材料力学 H5</title>', () => `<title>${escape(module.title)} · 材料力学 H5</title>`).replace('</head>', () => `<style>${css.replace(/<\/style/gi, '<\\/style')}</style></head>`).replace('<script type="module" src="/h5/dev.tsx"></script>', () => `<script type="module">${script}</script>`);
    await mkdir(`dist/${module.id}`, { recursive: true });
    await writeFile(`dist/${module.id}/index.html`, html);
    const zip = zipSync({ 'index.html': strToU8(html) }, { level: 9 });
    await writeFile(`dist/downloads/${module.id}.zip`, zip);
    const url = new URL(`${module.id}/`, baseUrl).href;
    await QRCode.toFile(`dist/qrcodes/${module.id}.svg`, url, { type: 'svg', errorCorrectionLevel: 'M', margin: 4, width: 600 });
    await QRCode.toFile(`dist/qrcodes/${module.id}.png`, url, { errorCorrectionLevel: 'M', margin: 4, width: 1200 });
    links.push({ id: module.id, title: module.title, url, package: `downloads/${module.id}.zip`, qr: `qrcodes/${module.id}.svg`, htmlBytes: Buffer.byteLength(html), zipBytes: zip.length });
    console.log(`✓ ${module.title} → ${module.id}/index.html · ZIP ${(zip.length / 1024).toFixed(0)} KB`);
  }
  const css = await readFile('h5/catalog.css', 'utf8');
  const rows = links.map((item, index) => `<article><div class="number">${modules[index].chapter}</div><div class="details"><h2><a href="./${item.id}/">${escape(item.title)}</a></h2><p>${escape(modules[index].description)}</p><nav><a href="./${item.id}/">打开实验 ↗</a><a href="./${item.package}" download>下载 H5 包</a><a href="./qrcodes/${item.id}.png" download>PNG 二维码</a><a href="./${item.qr}" download>SVG 二维码</a></nav><code>${escape(item.url)}</code></div><img src="./${item.qr}" alt="${escape(item.title)}二维码" width="112" height="112" /></article>`).join('');
  await writeFile('dist/index.html', `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><title>材料力学 H5 · 教材交互资源</title><style>${css}</style></head><body><main><header><h1>材料力学 H5</h1><p>扫描课本上的二维码，动手改变参数，看见力与变形的关系。</p><div class="guide">每个模块都可独立访问，也可下载 ZIP 包上传教材平台。包内以 index.html 为入口。</div></header><section aria-label="教学资源">${rows}</section><footer>材料力学 · 教材交互资源<br>模块地址保持固定；在线二维码指向各模块，平台上传后的二维码请使用平台提供的资源地址。<br><a href="./modules.csv" download>下载模块与地址清单</a> · <a href="./embed-preview.html">检查 600px 教材嵌入效果</a></footer></main></body></html>`);
  await writeFile('dist/modules.json', JSON.stringify(links, null, 2));
  await writeFile('dist/modules.csv', '\ufeff模块,标识,在线地址,H5上传包,二维码SVG\n' + links.map(item => [item.title, item.id, item.url, new URL(item.package, baseUrl).href, new URL(item.qr, baseUrl).href].map(value => `"${value.replaceAll('"', '""')}"`).join(',')).join('\n'));
  await writeFile('dist/embed-preview.html', `<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>教材 iframe 预览</title><style>body{margin:24px;font:16px/1.6 system-ui;background:#f8fafc}iframe{width:100%;height:600px;border:1px solid #cbd5e1;background:white}select{padding:8px;margin-bottom:16px}</style></head><body><h1>教材嵌入预览</h1><p>固定 600px 容器；资源内部可滚动，布局使用 iframe 的实际宽度。</p><label>模块 <select id="module">${links.map(item => `<option value="${item.id}">${escape(item.title)}</option>`).join('')}</select></label><iframe title="材料力学 H5 模块" src="./fundamentals/" allow="fullscreen"></iframe><script>document.querySelector('select').addEventListener('change',e=>{document.querySelector('iframe').src='./'+e.target.value+'/';});</script></body></html>`);
  const collection = { '模块与地址.csv': new Uint8Array(await readFile('dist/modules.csv')), '使用说明.txt': strToU8('每个 modules/ 下的 ZIP 对应一个教材交互资源。分别上传所需模块；不要将本合集整体作为一个 H5 上传。二维码指向在线部署，平台上传后的二维码请使用平台提供的资源地址。\n') };
  for (const item of links) {
    collection[`modules/${item.id}.zip`] = new Uint8Array(await readFile(`dist/${item.package}`));
    collection[`qrcodes/${item.id}.svg`] = new Uint8Array(await readFile(`dist/qrcodes/${item.id}.svg`));
    collection[`qrcodes/${item.id}.png`] = new Uint8Array(await readFile(`dist/qrcodes/${item.id}.png`));
  }
  await writeFile('dist/downloads/mechmat-h5-all.zip', zipSync(collection, { level: 9 }));
  const catalog = await readFile('dist/index.html', 'utf8');
  await writeFile('dist/index.html', catalog.replace('包内以 index.html 为入口。', '包内以 index.html 为入口。 <a href="./downloads/mechmat-h5-all.zip" download>下载全部资源与二维码</a>'));
  console.log(`完成：${links.length} 个独立模块、上传包与在线二维码。`);
} finally { await rm('.h5-entry.tsx', { force: true }); await rm('.h5-build', { recursive: true, force: true }); }
