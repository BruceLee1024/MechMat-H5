# MechMat-H5

独立的教材 H5 资源项目，基线为 MechMat_Lab 的 `9d8abe9`。不得向原项目写入、推送或发布改动。

- 中文界面。学生扫码直接进入对应模块，不需要激活码或 API Key。
- `h5/modules.mjs` 是模块清单和固定路径的真源；已经印刷的二维码地址不得随意修改。
- 每个模块打包成只含根目录 `index.html` 的 ZIP，脚本、CSS 和公式字体全部内嵌。构建不得引入外部 CDN。
- iframe 默认 600px 只是平台容器尺寸，资源应按真实视口适配，不写死整页高度。
- `npm run typecheck`、`npm test`、`npm run build` 后验证手机视口、iframe 和独立包的交互。
- `dist/` 是生成文件，不提交。工作流只部署本仓库。
