# 材料力学 H5 · 教材交互资源

面向课本二维码和教材平台的独立交互资源。学生扫码直接进入相应模块，在手机或教材 iframe 内改变参数，观察图示和计算结果。

本仓库基于 [MechMat_Lab](https://github.com/BruceLee1024/MechMat_Lab) 的 `9d8abe9` 提取教学组件及计算代码，使用独立应用入口、构建流程、Git 历史和部署。后续改动只在本仓库中进行。

## 在线资源

[打开资源目录](https://brucelee1024.github.io/MechMat-H5/)。目录提供每个模块的在线入口、H5 上传包、1200px PNG 二维码、SVG 二维码和地址清单。

| 模块 | 固定地址后缀 | 上传包 |
| --- | --- | --- |
| 基础概念 | `fundamentals/` | `fundamentals.zip` |
| 轴向拉伸与压缩 | `axial/` | `axial.zip` |
| 圆轴扭转 | `torsion/` | `torsion.zip` |
| 梁的弯曲 | `bending/` | `bending.zip` |
| 应力状态 | `stress/` | `stress.zip` |
| 组合变形 | `combined/` | `combined.zip` |
| 压杆稳定 | `buckling/` | `buckling.zip` |
| 结构求解器 | `solver/` | `solver.zip` |
| 截面几何性质 | `section/` | `section.zip` |
| 常用公式手册 | `formulas/` | `formulas.zip` |

首页、设置、激活系统、AI 助教及外部资源库不包含在学生资源包内。计算模型和假设沿用提取基线；图示变形可能放大显示，弯曲挠度为载荷点挠度，压杆模型为两端铰支，非圆截面扭转的未验证结论不应作为设计依据。

## 上传教材平台

1. 下载对应模块的 ZIP。每个 ZIP 的根目录只有 `index.html`，脚本、样式、图标和公式字体均已内嵌。
2. 在教材平台的“添加 H5 交互资源”中上传该 ZIP。若平台明确要求 `.hep5` 扩展名，可以对该 ZIP 的副本改名为 `.hep5`；不要改动压缩包内部结构。
3. 发布后使用平台提供的资源地址及二维码。目录中的在线二维码指向本项目部署，并不会自动指向教材平台上传后的资源。

ZIP 不依赖外部 CDN，也不要求填写密钥或激活码。平台仍需允许执行 HTML 中的脚本；封闭教材平台的实际上传、审核和发布需在该平台完成。平台若限制资源包大小、脚本策略或不接受单文件内嵌格式，应按其规则验证。

资源按实际容器宽度适配，使用纵向滚动。可用 [600px 嵌入预览](https://brucelee1024.github.io/MechMat-H5/embed-preview.html) 检查固定高度的教材页面。

## 印刷二维码

- `dist/qrcodes/*.svg`：适合排版与印刷，不受放大影响。
- `dist/qrcodes/*.png`：1200 × 1200 像素，保留四模块宽的白色边距。
- `dist/modules.csv`：模块名称、固定在线地址、上传包地址、SVG 二维码地址。
- 目录页面支持打印；二维码与模块标题排列在一起。

印刷前扫描实际排版样张，核对标题和入口。印刷后保持域名与模块路径稳定。如果改用出版社域名，先设置 `H5_BASE_URL`，重新生成二维码，再排版。

## 开发与构建

需要 Node.js 22.12+。首次安装：

```sh
npm ci
npm run dev
```

本地开发目录：`http://127.0.0.1:3100/`；单模块：`http://127.0.0.1:3100/?module=axial`。

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

预览构建产物：`http://127.0.0.1:3101/`。自定义二维码域名：

```sh
H5_BASE_URL=https://example.edu/mechanics/ npm run build
```

输出目录：

```text
dist/
├── index.html                # 资源目录
├── axial/index.html          # 每个模块的独立入口
├── downloads/axial.zip       # 每个模块的上传包
├── downloads/mechmat-h5-all.zip # 供编辑下载的资源合集；不要整体上传平台
├── qrcodes/axial.svg
├── qrcodes/axial.png
├── modules.json
├── modules.csv
└── embed-preview.html        # 固定 600px iframe 验证页
```

`h5/modules.mjs` 是模块清单的真源。构建脚本逐模块编译，只打入当前模块；要求只生成一个脚本，拒绝未内嵌的资源。工作流在本仓库 `main` 更新后执行类型检查、测试、构建并部署到本仓库的 GitHub Pages。

## 代码结构

- `h5/`：学生入口、响应式外壳、目录样式和模块清单。
- `scripts/build.mjs`：独立 HTML、ZIP、二维码及清单生成。
- `modules/`、`components/`：提取的教学图示和参数控件。
- `mechanics/`、`solver/`：计算与求解器。
- `experiments/`：模型格式、校验及计算结果工具。
- `tests/`：沿用基线的计算、求解器与实验模型回归。

当前浏览器测试以 Chromium 为主；手机真机、微信内置浏览器以及目标教材平台需要进一步验收。学生在当前页面中的参数保留到刷新或点击恢复默认为止，包内不包含跨设备同步。
