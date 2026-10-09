# 曲线实验室 · Curve Lab

一个中文交互式前端页面，演示外界因素如何改变组织与个体的发展曲线。使用 React、TypeScript 和 Vite，SVG 曲线通过 `requestAnimationFrame` 连续变形，无需后端或 API 密钥。

## 本地开发

使用 Node.js 20.19+ 或 22.12+（当前环境为 Node.js 24）。

```bash
cd /workspace/chatgpt-demo
npm ci --cache /tmp/curve-lab-npm-cache --no-audit --no-fund
npm run dev -- --port 5173
```

## 构建

```bash
npm run build
npm run preview -- --port 4173
```

生产产物位于 `dist/`，可部署到支持单页应用的静态托管平台。

## 交互

- 六类外界因素及其具体情景、七种曲线、五种典型走法。
- 播放 / 暂停、重播、拖动进度与跳转演变阶段。
- 调节冲击强度、持续时间、组织响应速度和个体韧性。
- 原始曲线对比、五个中介变量和管理行动建议。
- 导出当前图表为 SVG，附带情景、阶段和参数。
- 手机布局、键盘操作与减少动画偏好支持。

## 模型边界

曲线、坐标、幅度和比例均为定性机制的示意，不是实测数据或预测，不应直接用于员工评价。分布曲线的横轴分别表示贡献水平、员工排名与年龄；动画进度表示外界影响的演变过程。初始页面展示扰动中的 S 型曲线，之后可重播完整过程。
