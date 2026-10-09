import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

type Curve = 'productivity' | 'vitality' | 's' | 'learning' | 'power' | 'star' | 'age';
type Factor = 'market' | 'ai' | 'organization' | 'remote' | 'compliance' | 'management';
type Motion = 'shift' | 'deform' | 'break' | 'restart' | 'split';
type Params = { intensity: number; duration: number; response: number; resilience: number };
const initialParams: Params = { intensity: 65, duration: 55, response: 60, resilience: 70 };
const curveLabels: Record<Curve, string> = { productivity: '生产力曲线', vitality: '活力 / 钟形曲线', s: 'S 型曲线', learning: '学习曲线', power: '幂律分布', star: '明星贡献曲线', age: '年龄–贡献曲线' };
const curves = Object.keys(curveLabels) as Curve[];
const factors: { id: Factor; label: string; english: string; icon: string; subtitle: string; variants: string[]; effects: number[]; motion: Motion }[] = [
  { id: 'market', label: '经济与市场', english: 'MARKET CYCLE', icon: 'market', subtitle: '资源与机会，随周期重新分配', variants: ['繁荣期', '衰退期', '剧烈波动'], effects: [24, -30, 8, 21, 12], motion: 'shift' },
  { id: 'ai', label: '技术与 AI', english: 'TECHNOLOGY & AI', icon: 'spark', subtitle: '旧技能到顶，新技能尚未起飞', variants: ['技术迭代', '经验溢价行业'], effects: [18, -12, 35, -18, 14], motion: 'restart' },
  { id: 'organization', label: '组织变革', english: 'ORGANIZATIONAL CHANGE', icon: 'organization', subtitle: '结构重组，让贡献与协作重新连接', variants: ['重组与裁员', '危机中的明星'], effects: [-14, -28, 18, -32, -35], motion: 'break' },
  { id: 'remote', label: '远程与混合办公', english: 'WAYS OF WORKING', icon: 'remote', subtitle: '同一种工作模式，两条不同的轨迹', variants: ['混合办公', '新人远程学习'], effects: [8, 12, 20, -8, -28], motion: 'split' },
  { id: 'compliance', label: '政策与合规', english: 'POLICY & COMPLIANCE', icon: 'shield', subtitle: '流程约束增加，专业岗位价值跃迁', variants: ['整体组织', '合规 / 法务 / 安全'], effects: [-12, -22, 24, -10, 20], motion: 'shift' },
  { id: 'management', label: '团队与管理', english: 'TEAM & LEADERSHIP', icon: 'team', subtitle: '管理方式，决定成长的速度与边界', variants: ['赋能型管理', '控制型管理', '明星过多'], effects: [15, -18, 14, 28, 30], motion: 'deform' },
];
const motions: { id: Motion; name: string; english: string; text: string; factor: Factor; variant: number }[] = [
  { id: 'shift', name: '平移', english: 'SHIFT', text: '资源变化，整体上移或下移', factor: 'market', variant: 0 },
  { id: 'deform', name: '变形', english: 'RESHAPE', text: '峰值、斜率与平台重新塑造', factor: 'management', variant: 0 },
  { id: 'break', name: '断裂', english: 'DISRUPT', text: '外部冲击，效能突然下跌', factor: 'organization', variant: 0 },
  { id: 'restart', name: '重启', english: 'RESTART', text: '穿越低谷，启动第二条曲线', factor: 'ai', variant: 0 },
  { id: 'split', name: '分化', english: 'DIVERGE', text: '不同群体，走向不同轨迹', factor: 'remote', variant: 0 },
];
const details: Record<Factor, Record<Curve, string>> = {
  market: { productivity: '繁荣带来资源与机会，曲线整体上移、平台延后；衰退让曲线下移、平台提前。剧烈波动使路径呈现锯齿与多峰。', vitality: '衰退时 C 类比例可能被动上升，强制分布难以反映真实贡献；不确定性让钟形分布失去稳定性。', s: '需求的剧烈波动可能打断原有 S 型成长路径。危机中的及时响应，也可能推动组织跳跃进入第二曲线。', learning: '资源充裕时培训与反馈更及时；预算削减会拉长学习周期，让单位任务工时下降得更慢。', power: '繁荣期明星员工价值被放大，头部更突出；衰退期关键员工流失可能削弱幂律头部。', star: '机会增多使明星贡献放大；需求萎缩与人才流失则削弱直接贡献和对团队的正向溢出。', age: '经济下行时，组织可能偏好年轻、低成本的人才，让贡献峰值前移；这不是个体能力的年龄定律。' },
  ai: { productivity: '工具迁移初期会消耗时间与资源，短期效能下降；掌握新工具后，生产力可能跃迁到新的平台。', vitality: '新工具使用能力拉大个体差异，原有绩效分布被重排，贡献可能向少数熟练使用者集中。', s: '旧技能曲线已到平台，新技能曲线尚未起来，两者之间形成“死亡谷”。再学习与工具熟练推动第二次爬升。', learning: '旧学习曲线作废，进入再学习：适应新工具时单位工时先上升，掌握之后再下降。', power: '技术杠杆放大会用新工具的人的产出，幂律变陡，头部与尾部差距拉大。', star: '明星掌握工具后贡献倍增；但如果知识与方法没有传递给团队，协作收益不会自动同步增加。', age: '技术快速迭代可能让经验贬值、峰值前移；在经验溢价行业，技术结合经验也可能让峰值后移。' },
  organization: { productivity: '重组、裁员和领导更换会带来短期效能断崖。恢复速度取决于角色澄清、资源配置与协作关系的修复。', vitality: '原有绩效分布被打乱，钟形曲线可能暂时失效；危机中的实际贡献可能更接近幂律。', s: '组织变革会打断成长路径，在新机制建立前形成低谷。恢复协作后，曲线才有机会重新爬升。', learning: '导师与知识网络中断后，新人的单位工时上升；新的反馈和辅导机制能帮助学习曲线恢复。', power: '危机可能让少数关键员工承担更多价值，也可能因关键人才流失而削弱头部。', star: '危机中明星价值凸显；持续动荡又可能让明星成为负溢出源，协作成本抵消个人贡献。', age: '重组改变岗位需求与资源配置，各年龄群体的贡献会被重新评价，而不是简单随年龄增减。' },
  remote: { productivity: '自律者的生产力可能上移，依赖现场协作者可能下移。平均值掩盖了个体差异，方差随之增大。', vitality: '高效远程者与低效远程者形成两个群体，原有钟形分布可能变为双峰。', s: '缺少即时指导时，新人爬升期被拉长；独立工作能力强的人则可能更快进入高产平台。', learning: '缺乏即时指导让新人成长变慢，学习曲线变缓。建立异步文档与固定反馈节奏可减少损耗。', power: '头部员工产出更突出，中间层可能被压缩，幂律变陡；清晰的协作规范能缓解差距。', star: '明星独立产出可能提高，但隐性知识传递减少；团队需要主动设计远程辅导与协作机制。', age: '远程适应能力、岗位性质与协作需求，比年龄本身更能解释贡献差异。图中只展示可能的群体分化。' },
  compliance: { productivity: '非生产性流程增加，使整体生产力下移、平台提前；合规、法务与安全岗位的价值却可能局部跃迁。', vitality: '稳定流程增强标准化评价，贡献分布可能更接近钟形；但强制比例不能代替真实绩效。', s: '新增规则可能减慢爬升并提前平台；专业合规岗位则可能获得新的成长机会。', learning: '新流程带来额外学习成本，初期工时上升；熟悉规则与流程后，任务效率逐步恢复。', power: '强流程与强合规约束个人英雄主义，幂律变平，贡献分布更接近钟形。', star: '标准化流程降低对单个明星的依赖；合规、安全等专业人才的关键价值同时上升。', age: '合规密集、经验溢价的行业可能更看重长期积累，让贡献峰值后移；具体变化取决于岗位。' },
  management: { productivity: '赋能提高成长速度并延后平台；控制会使曲线变平。明星过多时，外部压力下的协作成本甚至让整体产出下降。', vitality: '控制型管理可能人为制造钟形分布；动态评价与事实反馈更能反映真实贡献。', s: '赋能让 S 型曲线更陡、平台延后；控制让曲线变平、平台提前，成长空间受到限制。', learning: '及时反馈、导师辅导和自主权让单位工时下降更快；控制与沟通阻力让学习变慢。', power: '协作与知识共享能让幂律变平；竞争导向和明星依赖会让贡献更加集中。', star: '明星数量并非越多越好。目标冲突与协调成本会产生负溢出，个人优秀也可能伴随团队产出下降。', age: '管理方式决定不同经验层次的人能否发挥价值。跨代辅导与知识共享有助于拓宽贡献峰值区间。' },
};
const phaseNames = ['原始状态', '外界扰动', '组织适应', '曲线重构'];
const phaseDescriptions = ['观察原始曲线，建立变化前的参照。', '冲击通过五个中介变量传导，原有路径开始改变。', '资源重新配置，个体学习与协作机制逐步适应。', '新的平台与分布形成，下一轮变化仍可能到来。'];
const mediatorNames = ['任务价值', '资源约束', '能力要求', '动机能量', '协作网络'];
const clamp = (v: number, min = 0.03, max = 0.96) => Math.max(min, Math.min(max, v));
const sigmoid = (x: number) => 1 / (1 + Math.exp(-x));
const gaussian = (x: number, mean: number, width: number) => Math.exp(-0.5 * ((x - mean) / width) ** 2);
const eased = (x: number) => { const t = clamp(x, 0, 1); return t * t * (3 - 2 * t); };

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const paths: Record<string, React.ReactNode> = {
    curve: <path d="M3 18c5 0 3-12 9-12s3 12 9-2" />,
    market: <><path d="m3 16 6-6 4 4 8-10" /><path d="M16 4h5v5M4 21h16" /></>,
    spark: <><path d="m12 3 2.4 6.6L21 12l-6.6 2.4L12 21l-2.4-6.6L3 12l6.6-2.4Z" /><path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5Z" /></>,
    organization: <><rect x="8" y="3" width="8" height="5" rx="1" /><path d="M12 8v5M5 16v-3h14v3" /><rect x="2" y="16" width="6" height="5" rx="1" /><rect x="16" y="16" width="6" height="5" rx="1" /></>,
    remote: <><rect x="3" y="4" width="18" height="12" rx="2" /><path d="M8 21h8M12 16v5m-5-11 3-3 3 3 4-4" /></>,
    shield: <><path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6Z" /><path d="m8 12 3 3 5-6" /></>,
    team: <><circle cx="9" cy="8" r="3" /><path d="M3 21v-3a6 6 0 0 1 12 0v3M17 5a3 3 0 0 1 0 6m2 4a5 5 0 0 1 2 4v2" /></>,
    arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
    replay: <><path d="M4 10a8 8 0 1 1 1 8M4 4v6h6" /></>,
    sliders: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" /><circle cx="15" cy="17" r="2" /></>,
    book: <><path d="M12 6v15M3 4c4-1 6 0 9 2 3-2 5-3 9-2v15c-4-1-6 0-9 2-3-2-5-3-9-2Z" /></>,
    info: <><circle cx="12" cy="12" r="9" /><path d="M12 11v6M12 7h.01" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" /></>,
    close: <path d="m6 6 12 12M18 6 6 18" />,
    reset: <><path d="M3 11a9 9 0 1 1 3 8M3 4v7h7M12 7v5l3 2" /></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.curve}</svg>;
}

function baseline(curve: Curve, x: number) {
  switch (curve) {
    case 'productivity': return 0.15 + 0.52 * (1 - Math.exp(-4.5 * x));
    case 'vitality': return 0.08 + 0.72 * gaussian(x, 0.5, 0.17);
    case 's': return 0.12 + 0.59 * sigmoid((x - 0.27) * 15);
    case 'learning': return 0.17 + 0.65 * Math.exp(-4.3 * x);
    case 'power': return 0.08 + 0.8 * Math.pow(1 + x * 12, -0.8);
    case 'star': return 0.14 + 0.56 * (1 - Math.exp(-3 * x));
    case 'age': return 0.09 + 0.7 * gaussian(x, 0.35, 0.25);
  }
}

function target(curve: Curve, factor: Factor, variant: number, x: number, params: Params, branch = 0) {
  const y = baseline(curve, x);
  const recovery = (params.response + params.resilience) / 200;
  const strength = (0.75 + params.duration / 100 * 0.25) * (1.2 - recovery * 0.4);
  const valleyWidth = 0.05 + params.duration / 100 * 0.14;
  const hit = 0.44;
  const valley = gaussian(x, hit + 0.07, valleyWidth);
  const after = sigmoid((x - hit) * 45);
  let result = y;
  if (factor === 'market') {
    const direction = variant === 1 ? -1 : 1;
    if (variant === 2) result = y + strength * (0.11 * Math.sin(x * 45) + 0.07 * Math.sin(x * 93)) * sigmoid((x - 0.15) * 25);
    else if (curve === 'productivity') result = 0.15 + (0.52 + direction * strength * 0.24) * (1 - Math.exp(-(direction > 0 ? 4.5 - strength * 2.1 : 4.5 + strength * 3.4) * x));
    else if (curve === 'power') result = 0.08 + (0.8 + direction * strength * 0.12) * Math.pow(1 + x * 12, -(0.8 + direction * strength * 0.45));
    else if (curve === 'vitality') result = 0.08 + 0.7 * gaussian(x, 0.5 + direction * strength * 0.14, 0.17);
    else if (curve === 'age') result = 0.09 + (0.7 + direction * strength * 0.1) * gaussian(x, 0.35 - (variant === 1 ? strength * 0.12 : 0), 0.25);
    else result = y + direction * strength * 0.23 * (curve === 'learning' ? -1 : 1) * (0.4 + x * 0.6);
  } else if (factor === 'ai') {
    if (curve === 's' || curve === 'productivity' || curve === 'star') result = y - strength * 0.55 * valley + strength * (0.12 + recovery * 0.12) * sigmoid((x - 0.72) * 20);
    else if (curve === 'learning') result = y + strength * 0.55 * valley - strength * recovery * 0.12 * sigmoid((x - 0.77) * 20);
    else if (curve === 'power') result = 0.04 + 0.87 * Math.pow(1 + x * (12 + strength * 9), -(0.8 + strength * 0.55));
    else if (curve === 'vitality') result = 0.06 + 0.72 * gaussian(x, 0.43, 0.17 - strength * 0.07);
    else result = 0.09 + 0.7 * gaussian(x, 0.35 + (variant === 1 ? 1 : -1) * strength * 0.18, 0.22);
  } else if (factor === 'organization') {
    if (curve === 'power') result = 0.06 + (0.8 + (variant === 1 ? 0.12 : -0.2) * strength) * Math.pow(1 + x * 12, -0.8 - strength * 0.2);
    else if (curve === 'vitality') result = 0.08 + strength * 0.09 * Math.sin(x * 31) + 0.65 * gaussian(x, 0.5 - strength * 0.12, 0.21);
    else if (curve === 'age') result = y * (1 - strength * 0.25) + strength * 0.07 * Math.sin(x * 20);
    else if (curve === 'learning') result = y + after * strength * (0.35 - recovery * 0.25 * sigmoid((x - 0.75) * 18));
    else if (curve === 'star' && variant === 1) result = y + strength * 0.24 * gaussian(x, 0.43, 0.12) - strength * 0.44 * sigmoid((x - 0.6) * 15);
    else result = y - after * strength * (0.55 - recovery * 0.44 * sigmoid((x - 0.7) * 18));
  } else if (factor === 'remote') {
    if (curve === 'vitality') result = 0.06 + 0.58 * gaussian(x, 0.5 - strength * 0.25, 0.13) + 0.58 * gaussian(x, 0.5 + strength * 0.25, 0.13);
    else if (curve === 'power') result = 0.06 + 0.82 * Math.pow(1 + x * 13, -0.8 - strength * 0.6);
    else if (curve === 'learning') result = 0.17 + 0.65 * Math.exp(-(4.3 - strength * 2.4) * x);
    else if (curve === 's') result = 0.12 + (0.59 + (branch ? -1 : 1) * strength * 0.16) * sigmoid((x - (branch ? 0.27 + strength * 0.2 : 0.23)) * (15 - (branch ? strength * 7 : 0)));
    else result = y + (branch ? -1 : 1) * strength * (variant === 1 ? 0.3 : 0.23) * x;
  } else if (factor === 'compliance') {
    const direction = variant === 1 ? 1 : -1;
    if (curve === 'power') result = 0.08 + 0.8 * Math.pow(1 + x * 12, -0.8 + strength * 0.38);
    else if (curve === 'vitality') result = 0.08 + 0.75 * gaussian(x, 0.5, 0.17 - strength * 0.03);
    else if (curve === 'age') result = 0.09 + 0.7 * gaussian(x, 0.35 + strength * 0.13, 0.25);
    else if (curve === 'learning') result = y + strength * 0.28 * gaussian(x, 0.5, valleyWidth);
    else result = y + direction * strength * 0.23 * sigmoid((x - 0.3) * 18);
  } else {
    const empower = variant === 0;
    if (curve === 's' || curve === 'productivity') result = 0.12 + (empower ? 0.59 + strength * 0.2 : 0.59 - strength * 0.27) * sigmoid((x - (empower ? 0.27 - strength * 0.08 : 0.3)) * (empower ? 15 + strength * 9 : 15 - strength * 7));
    else if (curve === 'learning') result = 0.17 + 0.65 * Math.exp(-(empower ? 4.3 + strength * 3 : 4.3 - strength * 2) * x);
    else if (curve === 'power') result = 0.08 + 0.8 * Math.pow(1 + x * 12, -0.8 + (empower ? 1 : -1) * strength * 0.35);
    else if (curve === 'star') result = y + strength * (empower ? 0.18 * x : -0.4 * sigmoid((x - 0.55) * 15));
    else if (curve === 'age') result = 0.09 + 0.7 * gaussian(x, 0.35, empower ? 0.25 + strength * 0.07 : 0.25 - strength * 0.06);
    else result = 0.08 + 0.72 * gaussian(x, 0.5, empower ? 0.17 + strength * 0.06 : 0.17 - strength * 0.06);
  }
  return clamp(y + (result - y) * params.intensity / 100);
}

const plot = { left: 54, top: 28, width: 750, height: 265 };
function pathFor(curve: Curve, factor: Factor, variant: number, params: Params, blend: number, branch = 0) {
  return Array.from({ length: 101 }, (_, i) => {
    const x = i / 100;
    const y = baseline(curve, x) * (1 - blend) + target(curve, factor, variant, x, params, branch) * blend;
    return `${i ? 'L' : 'M'}${(plot.left + x * plot.width).toFixed(2)},${(plot.top + (1 - y) * plot.height).toFixed(2)}`;
  }).join(' ');
}
function MiniCurve({ motion }: { motion: Motion }) {
  const shape = { shift: ['M8 51C28 51 28 31 47 29S72 26 100 26', 'M8 38C28 38 28 18 47 16S72 13 100 13'], deform: ['M8 51C28 51 28 31 47 29S72 26 100 26', 'M8 51C36 51 26 13 56 13L100 13'], break: ['M8 51C25 51 28 20 46 20L100 20', 'M8 51C25 51 28 20 46 20L49 51L70 42L100 31'], restart: ['M8 51C24 51 23 22 43 22L100 22', 'M8 51C24 51 23 22 43 22C53 22 49 53 62 53S72 12 100 12'], split: ['M8 51C28 51 28 31 47 29S72 26 100 26', 'M8 51C28 51 28 31 47 29S72 10 100 10', 'M8 51C28 51 28 31 47 29S72 46 100 46'] }[motion];
  return <svg viewBox="0 0 110 65" fill="none" aria-hidden="true"><path d="M8 6v51h94" stroke="currentColor" opacity=".1" />{shape.map((d, i) => <path key={i} d={d} stroke={i === 0 ? '#7c8678' : i === 2 ? '#d0a87c' : '#c8f36b'} strokeWidth={i ? 2 : 1.3} strokeDasharray={i ? undefined : '3 4'} strokeLinecap="round" />)}</svg>;
}

function App() {
  const [factor, setFactor] = useState<Factor>('ai');
  const [variant, setVariant] = useState(0);
  const [curve, setCurve] = useState<Curve>('s');
  const [params, setParams] = useState(initialParams);
  const [progress, setProgress] = useState(0.42);
  const [playing, setPlaying] = useState(() => !window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [showBaseline, setShowBaseline] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [toast, setToast] = useState('');
  const guideCloseRef = useRef<HTMLButtonElement>(null);
  const guideTriggerRef = useRef<HTMLButtonElement>(null);
  const chartRef = useRef<SVGSVGElement>(null);
  const current = factors.find(f => f.id === factor)!;
  const phase = Math.min(3, Math.floor(progress * 4));
  const blend = eased((progress - 0.13) / 0.75);
  const isSplit = factor === 'remote' && !['vitality', 'power', 'learning'].includes(curve);
  const isTemporal = ['productivity', 's', 'learning', 'star'].includes(curve);
  const activeMotion = factor === 'market' && variant === 2 ? 'deform' : current.motion;
  const contribution = factor === 'compliance' && variant === 1 ? [30, 10, 30, 8, 22] : factor === 'market' && variant === 1 ? [-25, 35, 10, -28, -15] : factor === 'management' && variant > 0 ? [-8, 15, 12, -30, -25] : current.effects;
  const timeLabels = curve === 'age' ? ['20', '30', '40', '50', '60', '70'] : curve === 'power' ? ['前 1%', '20%', '40%', '60%', '80%', '100%'] : curve === 'vitality' ? ['低', '', '', '', '', '高'] : ['0', '20', '40', '60', '80', '100'];
  const axisTitle = curve === 'age' ? '年龄（岁）' : curve === 'power' ? '员工贡献排名（由高到低）' : curve === 'vitality' ? '个人贡献水平' : curve === 'learning' ? '练习 / 任务累计次数' : '发展进程';
  const yTitle = curve === 'learning' ? '单位任务工时' : curve === 'vitality' ? '人数密度' : '相对贡献 / 效能';

  useEffect(() => {
    if (!playing) return;
    let frame: number;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min(now - last, 100) / 24000;
      last = now;
      setProgress(prev => Math.min(1, prev + delta));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);
  useEffect(() => { if (progress >= 1) setPlaying(false); }, [progress]);
  useEffect(() => { if (toast) { const id = setTimeout(() => setToast(''), 3200); return () => clearTimeout(id); } }, [toast]);
  useEffect(() => {
    if (!showGuide) return;
    guideCloseRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowGuide(false);
      if (event.key === 'Tab') { event.preventDefault(); guideCloseRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); guideTriggerRef.current?.focus(); };
  }, [showGuide]);

  const restart = () => { setProgress(0); setPlaying(true); };
  const chooseFactor = (id: Factor, nextVariant = 0) => {
    setFactor(id); setVariant(nextVariant); setProgress(0);
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  };
  const chooseVariant = (index: number) => {
    setVariant(index); setProgress(0);
    setPlaying(!window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    if (factor === 'ai') setCurve(index === 1 ? 'age' : 's');
    if (factor === 'organization') setCurve(index === 1 ? 'star' : 'productivity');
    if (factor === 'remote') setCurve(index === 1 ? 'learning' : 'productivity');
    if (factor === 'management' && index === 2) setCurve('star');
  };
  const chooseMotion = (motion: typeof motions[number]) => { chooseFactor(motion.factor, motion.variant); setCurve(motion.id === 'split' ? 'productivity' : 's'); setPlaying(true); };
  const exportChart = () => {
    if (!chartRef.current) return;
    const copy = chartRef.current.cloneNode(true) as SVGSVGElement;
    copy.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    copy.setAttribute('height', '415');
    copy.setAttribute('viewBox', '0 0 850 415');
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '850'); rect.setAttribute('height', '415'); rect.setAttribute('fill', '#1b211c');
    copy.insertBefore(rect, copy.firstChild);
    const addText = (text: string, y: number, size = 12) => {
      const el = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      el.setAttribute('x', '54'); el.setAttribute('y', String(y)); el.setAttribute('fill', '#d4dbcd'); el.setAttribute('font-size', String(size));
      el.textContent = text; copy.appendChild(el);
    };
    addText(`${current.label} · ${current.variants[variant]} · ${curveLabels[curve]} · ${phaseNames[phase]}`, 369, 15);
    addText(`冲击 ${params.intensity}% / 持续 ${params.duration}% / 响应 ${params.response}% / 韧性 ${params.resilience}% · 示意模型，非实际预测`, 393);
    const url = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(copy)], { type: 'image/svg+xml;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = `曲线实验室-${current.label}-${curveLabels[curve]}.svg`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setToast('当前曲线已导出为 SVG，可用于分享与演示');
  };

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#top" aria-label="曲线实验室首页"><span className="brand-mark"><Icon name="curve" size={27} /></span><span>曲线实验室<small>CURVE LAB</small></span></a>
      <div className="sidebar-label">探索外界因素 <span>06</span></div>
      <nav aria-label="外界因素">{factors.map((f, i) => <button key={f.id} className={`factor-link ${factor === f.id ? 'active' : ''}`} onClick={() => chooseFactor(f.id)} aria-pressed={factor === f.id}><Icon name={f.icon} /><span>{f.label}</span><span className="nav-index">0{i + 1}</span></button>)}</nav>
      <div className="sidebar-note"><div className="note-symbol">↗</div><p>变化是常态，<br />曲线不止一条。</p><span>看见扰动，也看见下一次成长。</span></div>
      <button ref={guideTriggerRef} className="guide-button" onClick={() => setShowGuide(true)}><Icon name="book" size={18} />阅读指南<Icon name="arrow" size={16} /></button>
      <div className="sidebar-footer"><span className="status-dot" />交互式概念演示 <span>v1.0</span></div>
    </aside>

    <main id="top">
      <header className="topbar"><div className="breadcrumb">组织与个体发展 <span>/</span> <strong>外界因素的影响</strong></div><div className="topbar-right"><span className="model-badge"><span className="status-dot" />动态模型</span><button className="export-button" onClick={exportChart}><Icon name="download" size={16} /><span>导出曲线</span></button></div></header>
      <div className="content">
        <section className="intro"><div><div className="eyebrow"><span />THE SHAPE OF CHANGE</div><h1>在变化中，<span>看见拐点。</span></h1><p>真实世界的成长不是平滑曲线。探索外界扰动如何改变轨迹，<br className="desktop-break" />从短期波动，到适应，再到新的增长。</p></div><div className="intro-stamp"><span>EXTERNAL FACTORS</span><strong>扰动 <i>→</i> 适应 <i>→</i> 重构</strong><small>一种变化，多种可能。</small></div></section>

        <section className="workspace" aria-label="曲线交互实验">
          <div className="chart-panel">
            <div className="panel-heading"><div><div className="section-kicker">01 <span>曲线观察</span></div><h2>{current.label}<span className="scenario-pill">{current.english}</span></h2><p>{current.subtitle}</p></div><span className="live-label"><span className={`status-dot ${playing ? 'pulse' : ''}`} />{playing ? '演示中' : progress >= 1 ? '已完成' : '已暂停'}</span></div>
            <div className="curve-tabs" role="group" aria-label="选择曲线类型">{curves.map(c => <button key={c} onClick={() => setCurve(c)} className={curve === c ? 'selected' : ''} aria-pressed={curve === c}>{curveLabels[c]}</button>)}</div>
            <div className="chart-toolbar"><div className="scenario-options" role="group" aria-label="情景">{current.variants.map((v, i) => <button key={v} className={variant === i ? 'chosen' : ''} aria-pressed={variant === i} onClick={() => chooseVariant(i)}>{v}</button>)}</div><label className="baseline-toggle"><input type="checkbox" aria-label="原始曲线" checked={showBaseline} onChange={e => setShowBaseline(e.target.checked)} /><span aria-hidden="true" />原始曲线</label></div>
            <div className="graph-container"><div className="graph-unit">{yTitle} <span>归一化示意</span></div>
              <svg className="main-chart" ref={chartRef} viewBox="0 0 850 350" role="img" aria-label={`${current.label}，${current.variants[variant]}下的${curveLabels[curve]}，当前为${phaseNames[phase]}。虚线为原始曲线，绿线为变化后的曲线。`}>
                <defs><linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#c8f36b" stopOpacity=".15" /><stop offset="100%" stopColor="#c8f36b" stopOpacity="0" /></linearGradient></defs>
                {[0, .25, .5, .75, 1].map(t => <g key={t}><line x1={plot.left} x2={804} y1={plot.top + t * plot.height} y2={plot.top + t * plot.height} stroke="#323a32" strokeDasharray="3 5" /><text x="38" y={plot.top + t * plot.height + 4} textAnchor="end" fill="#84917f" fontSize="10" fontFamily="monospace">{((1 - t) * 100).toFixed(0)}</text></g>)}
                {[0, .2, .4, .6, .8, 1].map((t, i) => <g key={t}><line x1={plot.left + t * plot.width} x2={plot.left + t * plot.width} y1={plot.top} y2={293} stroke="#2a322a" strokeDasharray="3 5" /><text x={plot.left + t * plot.width} y="315" textAnchor="middle" fill="#84917f" fontSize="10" fontFamily="sans-serif">{timeLabels[i]}</text></g>)}
                {isTemporal && blend > .04 && params.intensity > 0 && (factor === 'ai' || factor === 'organization') && <g opacity={blend}><rect x="355" y="28" width={130 + params.duration * .5} height="265" fill="#d0a87c" opacity=".05" /><line x1="384" x2="384" y1="28" y2="293" stroke="#b6926e" strokeOpacity=".45" strokeDasharray="4 5" /><text x="394" y="44" fill="#d0a87c" fontSize="10">{curve === 'learning' ? '再学习 / 工时上升' : factor === 'ai' ? '技能切换 / 适应低谷' : '组织冲击'}</text></g>}
                <path d={`${pathFor(curve, factor, variant, params, blend)} L804,293 L54,293 Z`} fill="url(#areaGradient)" />
                {showBaseline && <path d={pathFor(curve, factor, variant, params, 0)} stroke="#82927c" strokeWidth="1.6" strokeDasharray="5 6" fill="none" opacity=".7" />}
                <path d={pathFor(curve, factor, variant, params, blend)} stroke="#c8f36b" strokeWidth="2.8" strokeLinejoin="round" strokeLinecap="round" fill="none" />
                {isSplit && <path d={pathFor(curve, factor, variant, params, blend, 1)} stroke="#d0a87c" strokeWidth="2.5" strokeLinejoin="round" fill="none" />}
                <circle cx="804" cy={plot.top + (1 - (baseline(curve, 1) * (1 - blend) + target(curve, factor, variant, 1, params) * blend)) * plot.height} r="4" fill="#c8f36b" stroke="#1b211c" strokeWidth="2" />
                <text x="429" y="341" textAnchor="middle" fill="#84917f" fontSize="11">{axisTitle}{isTemporal ? '（非实际时间）' : ''}</text>
              </svg>
            </div>
            <div className="graph-caption"><div className="legend"><span><i className="legend-line" />{isSplit ? '自主工作者' : '外界影响后的曲线'}</span>{isSplit && <span><i className="legend-line tan" />依赖现场协作者</span>}{showBaseline && <span><i className="legend-line dashed" />原始曲线</span>}</div><span className="phase-tag">{motions.find(m => m.id === activeMotion)?.name} {activeMotion === 'restart' ? '/ 第二曲线' : '/ 动态演变'}</span></div>
            <div className="playback"><button className="play-button" onClick={() => { if (progress >= 1) setProgress(0); setPlaying(!playing); }} aria-label={playing ? '暂停动画' : '播放动画'}>{playing ? <span className="pause-icon" /> : <span className="play-icon" />}</button><div className="timeline"><div className="timeline-labels">{phaseNames.map((p, i) => <button key={p} className={phase === i ? 'current' : ''} onClick={() => { setProgress(i / 4 + .03); setPlaying(false); }}>{p}</button>)}</div><input aria-label="动画进度" type="range" min="0" max="100" step=".1" value={progress * 100} style={{ '--range-fill': `${progress * 100}%` } as React.CSSProperties} onChange={e => { setProgress(Number(e.target.value) / 100); setPlaying(false); }} /></div><button className="replay-button" aria-label="重新演示" title="重新演示" onClick={restart}><Icon name="replay" size={18} /></button></div>
            <div className="phase-explanation" aria-live="polite"><span className="small-dot" /><strong>{phaseNames[phase]}</strong><span>{phaseDescriptions[phase]}</span></div>
          </div>

          <aside className="control-panel" aria-label="模型控制"><div className="section-kicker">02 <span>影响路径</span><Icon name="sliders" size={17} /></div><h2>改变的，不止是曲线</h2><p className="control-subtitle">外界因素通过五个中介变量传导。</p><div className="mediators">{mediatorNames.map((name, i) => { const amount = Math.round(contribution[i] * params.intensity / 100); return <div className="mediator" key={name}><div><span className="mediator-number">0{i + 1}</span><span>{name}</span><span className={amount >= 0 ? 'positive' : 'negative'}>{amount > 0 ? '+' : ''}{amount}%</span></div><div className="mediator-track"><div style={{ width: `${clamp(50 + amount, 5, 95)}%` }} /><i /></div></div>; })}</div><div className="control-divider" /><div className="parameter-heading"><h3>调节情景</h3><button onClick={() => { setParams(initialParams); setProgress(0); }} aria-label="恢复默认参数" title="恢复默认参数"><Icon name="reset" size={16} /></button></div><div className="parameters">{([{ key: 'intensity', name: '冲击强度', low: '温和', high: '强烈' }, { key: 'duration', name: '持续时间', low: '短期', high: '长期' }, { key: 'response', name: '响应速度', low: '迟缓', high: '敏捷' }, { key: 'resilience', name: '个体韧性', low: '脆弱', high: '稳健' }] as const).map(p => <label className="parameter" key={p.key}><span>{p.name}<strong>{params[p.key]}<small>%</small></strong></span><input type="range" min="0" max="100" value={params[p.key]} aria-label={p.name} style={{ '--range-fill': `${params[p.key]}%` } as React.CSSProperties} onChange={e => setParams(prev => ({ ...prev, [p.key]: Number(e.target.value) }))} /><span className="range-labels"><small>{p.low}</small><small>{p.high}</small></span></label>)}</div><div className="model-note"><Icon name="info" size={14} /><span>参数与数值仅用于机制演示，<br />不构成员工评价或实际预测。</span></div></aside>
        </section>

        <section className="motion-section"><div className="section-header"><div className="section-kicker">03 <span>五种典型走法</span></div><span>点击走法，探索对应情景 <Icon name="arrow" size={15} /></span></div><div className="motion-grid">{motions.map((motion, i) => <button className={`motion-card ${activeMotion === motion.id ? 'active' : ''}`} key={motion.id} onClick={() => chooseMotion(motion)} aria-pressed={activeMotion === motion.id}><div className="motion-top"><span>0{i + 1}</span><span className="motion-indicator">{activeMotion === motion.id ? '当前走法' : '探索'}<Icon name="arrow" size={14} /></span></div><div className="motion-body"><div><h3>{motion.name}</h3><span>{motion.english}</span></div><MiniCurve motion={motion.id} /></div><p>{motion.text}</p></button>)}</div></section>

        <section className="insights"><div className="observation"><div className="section-kicker">04 <span>理解变化</span></div><h2>{curveLabels[curve]}，会怎样变化？</h2><p>{details[factor][curve]}</p><div className="mechanism"><span>{current.label}</span><Icon name="arrow" size={16} /><span>中介变量改变</span><Icon name="arrow" size={16} /><span>曲线路径重构</span></div></div><div className="management"><div className="management-heading"><span className="lightbulb">✳</span><h3>从观察到行动</h3><span>MANAGEMENT NOTES</span></div><div className="management-notes"><p><span>01</span><strong>监测拐点</strong>用动态评价识别平台与断崖，避免静态强制分布。</p><p><span>02</span><strong>提前重启</strong>在旧曲线到顶前，投入再学习与第二曲线。</p><p><span>03</span><strong>建立缓冲</strong>保护关键人才，减少单点依赖，用协作增强韧性。</p></div></div></section>
        <footer className="page-footer"><span>CURVE LAB <i>·</i> 用动态视角，理解组织成长。</span><span>概念模型 / 情景演示 <span className="status-dot" /></span></footer>
      </div>
    </main>
    {toast && <div className="toast" role="status"><span>✓</span>{toast}</div>}
    {showGuide && <div className="modal-backdrop" onClick={() => setShowGuide(false)}><section className="guide-modal" role="dialog" aria-modal="true" aria-labelledby="guide-title" onClick={e => e.stopPropagation()}><button ref={guideCloseRef} className="modal-close" onClick={() => setShowGuide(false)} aria-label="关闭阅读指南"><Icon name="close" /></button><div className="eyebrow">A GUIDE TO CURVE LAB</div><h2 id="guide-title">如何读懂变化？</h2><p>先选左侧外界因素，再切换想观察的曲线。绿色实线是变化后的路径，虚线是原始参照；分化时，棕色线代表另一类群体。</p><ol><li><strong>看过程</strong>播放、暂停或拖动时间轴，观察从扰动到重构的过程。</li><li><strong>改条件</strong>调节冲击强度与持续时间，比较响应速度和个体韧性的作用。</li><li><strong>辨坐标</strong>生产力、S 型、学习与明星曲线展示发展进程；钟形与幂律展示分布，年龄曲线展示年龄维度。时间轴演示的是外界影响的演变，不改变横轴含义。</li><li><strong>留参照</strong>原始曲线帮助比较形状变化。导出按钮可保存当前曲线和参数。</li></ol><div className="guide-disclaimer"><Icon name="info" size={18} /><p>本页面将文字描述转化为定性的交互示意。坐标、幅度和比例不是实测数据，也不应用于评价个体或推断年龄与能力的因果关系。</p></div></section></div>}
  </div>;
}

createRoot(document.getElementById('root')!).render(<App />);
