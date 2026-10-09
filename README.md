# 曲线实验室 · Curve Lab

一个中文交互式前端页面，演示外界因素如何改变组织与个体的发展曲线。使用 React、TypeScript 和 Vite，SVG 曲线通过 `requestAnimationFrame` 连续变形，无需后端或 API 密钥。

## 本地开发

使用 Node.js 20.19+ 或 22.12+（当前环境为 Node.js 24）。

```bash
cd chatgpt-demo
npm ci
npm run dev -- --port 5173
```

## 构建

```bash
npm run build
npm run preview -- --port 4173
```

生产产物位于 `dist/`。本项目使用相对资源路径，可以部署在域名根目录或 `/chatgpt-demo/` 等子目录下。

## 静态部署与模块加载错误

本项目的源码使用 TypeScript 和 JSX，浏览器需要构建后的 JavaScript。直接把仓库根目录当作静态网站发布，会让页面尝试加载 `/src/main.tsx`，产生模块 MIME 类型或语法错误。

部署设置：

- 安装命令：`npm ci`
- 构建命令：`npm run build`
- 发布目录：`dist`

如果手动上传文件，请上传 **`dist/` 里面的全部内容**，包括 `index.html`、`assets/` 和 `favicon.svg`。保留目录结构。

不要直接双击源码 `index.html`。本地开发使用 `npm run dev`；验证构建结果使用 `npm run preview`，然后打开终端显示的地址。

如果构建后仍有 MIME 错误，在浏览器开发者工具的 Network 中查看失败的脚本请求。正常页面加载的是 `assets/*.js`，请求应成功并返回 JavaScript MIME 类型（如 `text/javascript`）；返回 HTML、空响应或 404 时，需要检查服务器发布目录与资源路径。更改 `.tsx` 的响应类型不能替代编译。

## 交互

- 六类外界因素及其具体情景、七种曲线、五种典型走法。
- 播放 / 暂停、重播、拖动进度与跳转演变阶段。
- 调节冲击强度、持续时间、组织响应速度和个体韧性。
- 原始曲线对比、五个中介变量和管理行动建议。
- 导出当前图表为 SVG，附带情景、阶段和参数。
- 手机布局、键盘操作与减少动画偏好支持。

## 模型边界

曲线、坐标、幅度和比例均为定性机制的示意，不是实测数据或预测，不应直接用于员工评价。分布曲线的横轴分别表示贡献水平、员工排名与年龄；动画进度表示外界影响的演变过程。初始页面展示扰动中的 S 型曲线，之后可重播完整过程。
