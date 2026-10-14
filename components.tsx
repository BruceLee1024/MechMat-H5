import React, { useEffect, useState } from "react";
import {
  ArrowRight, MoveVertical, RotateCw, Minimize2, MoveDiagonal,
  BookOpen, Lightbulb, X, Layers, Beaker, GraduationCap, Calculator, Home, Settings, Library, Shapes,
  MessageCircle, Lock
} from "lucide-react";
import katex from "katex";
import { ModuleType, THEORY_INFO, SectionType, SectionProperties } from "./types";
import { NumericInput } from "./components/NumericInput";
import { NumericConstraints, validateNumber } from "./mechanics/validation";
import { calculateSectionProperties, validateSection, SECTION_FIELDS } from "./mechanics/sections";
import { ThemeName } from "./theme";


// --- Latex Renderer ---
export const LatexRenderer = ({ formula }: { formula: string }) => {
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!formula) return;
    try {
      const rendered = katex.renderToString(formula, {
        throwOnError: false,
        displayMode: true,
        output: "html",
        strict: false,
      });
      setHtml(rendered);
    } catch (e: any) {
      console.error("KaTeX render error:", e);
      setHtml(`<div class="font-mono text-sm text-rose-600 bg-rose-50 p-2 rounded">Error: ${formula}</div>`);
    }
  }, [formula]);

  return (
    <div 
      className="overflow-x-auto overflow-y-hidden text-slate-800 py-1"
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
};

// --- Markdown Renderer ---
export const MarkdownRenderer = ({ content }: { content: string }) => {
  if (!content) return null;
  
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let listItems: React.ReactNode[] = [];
  
  const flushList = () => {
      if (listItems.length > 0) {
          elements.push(<ul key={`ul-${elements.length}`} className="list-disc list-outside ml-5 mb-4 space-y-1">{[...listItems]}</ul>);
          listItems = [];
      }
  };

  const parseInline = (text: string) => {
      const parts = text.split(/(\*\*.*?\*\*)/g);
      return parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
              return <strong key={i} className="font-bold text-indigo-900">{part.slice(2, -2)}</strong>;
          }
          return part;
      });
  };

  lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed) { flushList(); return; }

      if (trimmed.startsWith('###')) {
          flushList();
          elements.push(<h3 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2">{parseInline(trimmed.replace(/^#{3,}\s*/, ''))}</h3>);
      } else if (trimmed.startsWith('##')) {
           flushList();
          elements.push(<h2 key={index} className="text-xl font-bold text-slate-800 mt-5 mb-2">{parseInline(trimmed.replace(/^#{2,}\s*/, ''))}</h2>);
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          listItems.push(<li key={index} className="text-slate-700 marker:text-indigo-400">{parseInline(trimmed.replace(/^[-*]\s*/, ''))}</li>);
      } else {
          flushList();
          elements.push(<p key={index} className="mb-2 text-slate-700 leading-relaxed">{parseInline(trimmed)}</p>);
      }
  });
  flushList();

  return <div className="text-sm">{elements}</div>;
};

export { NumericInput } from './components/NumericInput';
export { calculateSectionProperties } from './mechanics/sections';
export type { SectionType, SectionProperties } from './types';

interface SliderProps extends NumericConstraints {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

// 滑块范围是常用范围；只有 minimum / maximum 是硬边界。
export const SliderInputControl = ({ label, value, min, max, step, unit, onChange, domain = min < 0 ? 'signed' : min === 0 ? 'nonnegative' : 'positive', minimum, maximum }: SliderProps) => {
  const lower = minimum ?? (domain === 'positive' ? Math.min(min, value) : domain === 'nonnegative' ? 0 : Math.min(min, value));
  const upper = maximum ?? Math.max(max, value);
  return <div className="mb-4">
    <NumericInput label={label} value={value} unit={unit} onChange={onChange} domain={domain} minimum={minimum} maximum={maximum} compact />
    <input type="range" aria-label={`${label}滑块`} min={lower} max={upper} step={step} value={value}
      onChange={event => {
        const next = Number(event.target.value);
        if (!validateNumber(next, { domain, minimum, maximum })) onChange(next);
      }} className="w-full h-2 mt-2 bg-slate-200 rounded-lg appearance-none cursor-pointer" />
  </div>;
};

export const SliderControl = (props: SliderProps) => <SliderInputControl {...props} minimum={props.minimum ?? props.min} maximum={props.maximum ?? props.max} />;

// --- 截面选择器组件 ---
export const SectionSelector = ({
  section,
  onChange,
}: {
  section: SectionProperties;
  onChange: (s: SectionProperties) => void;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const sectionTypes: { type: SectionType; label: string; icon: string }[] = [
    { type: 'rectangle', label: '矩形', icon: '▭' },
    { type: 'circle', label: '圆形', icon: '○' },
    { type: 'hollow_circle', label: '空心圆', icon: '◎' },
    { type: 'i_beam', label: '工字钢', icon: 'Ⅰ' },
    { type: 't_beam', label: 'T型', icon: '⊤' },
    { type: 'channel', label: '槽钢', icon: '⊏' },
    { type: 'composite', label: '组合', icon: '⊞' },
    { type: 'custom', label: '自定义', icon: '✎' },
  ];

  const props = calculateSectionProperties(section);
  const currentType = sectionTypes.find(st => st.type === section.type);

  return (
    <div className="mb-4 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      {/* 可点击的标题栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Shapes className="w-4 h-4" style={{ color: 'var(--color-2)' }} />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">截面类型</span>
          <span className="text-sm font-medium text-slate-700 ml-2">
            {currentType?.icon} {currentType?.label}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            A={props.area.toFixed(0)}mm² | Iz={(props.Iz/1e4).toFixed(1)}×10⁴mm⁴
          </span>
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
      
      {/* 可折叠内容 */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-slate-200">
          {/* 截面类型选择 */}
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-1 mb-3 mt-3">
            {sectionTypes.map((st) => (
              <button
                key={st.type}
                onClick={() => onChange({ ...section, type: st.type })}
                className={`p-2 text-center rounded border transition-colors ${
                  section.type === st.type
                    ? 'border-2 bg-white shadow-sm'
                    : 'border-slate-200 hover:bg-white'
                }`}
                style={section.type === st.type ? { borderColor: 'var(--color-1)' } : {}}
              >
                <div className="text-lg">{st.icon}</div>
                <div className="text-xs text-slate-600">{st.label}</div>
              </button>
            ))}
          </div>

          {/* 截面参数按类型校验，错误草稿不会提交给计算层。 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SECTION_FIELDS[section.type].map(field => <NumericInput key={field.key} label={field.label}
              value={section[field.key] ?? field.defaultValue} domain={field.allowZero ? 'nonnegative' : 'positive'}
              onChange={value => onChange({ ...section, [field.key]: value })}
              validate={value => validateSection({ ...section, [field.key]: value })} />)}
          </div>

          {/* 计算结果显示 */}
          <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-3 gap-2 text-xs text-slate-500 font-mono">
            <span>A: {props.area.toFixed(0)} mm²</span>
            <span>Iz: {(props.Iz / 1e4).toFixed(1)}×10⁴ mm⁴</span>
            <span>Iy: {(props.Iy / 1e4).toFixed(1)}×10⁴ mm⁴</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- 材料数据库 ---
export interface MaterialData {
  name: string;
  E: number;      // 弹性模量 GPa
  G: number;      // 剪切模量 GPa
  yield: number;  // 屈服强度 MPa
  poisson: number; // 泊松比
  density?: number; // 密度 kg/m³
  category: 'metal' | 'concrete' | 'wood' | 'polymer' | 'composite' | 'custom';
}

// 预设材料库（常见工程材料的真实参数）
const DEFAULT_MATERIALS: MaterialData[] = [
  // 钢材
  { name: "Q235钢", E: 206, G: 79, yield: 235, poisson: 0.3, density: 7850, category: 'metal' },
  { name: "Q345钢", E: 206, G: 79, yield: 345, poisson: 0.3, density: 7850, category: 'metal' },
  { name: "Q460高强钢", E: 206, G: 79, yield: 460, poisson: 0.3, density: 7850, category: 'metal' },
  { name: "304不锈钢", E: 193, G: 77, yield: 205, poisson: 0.29, density: 7930, category: 'metal' },
  { name: "316不锈钢", E: 193, G: 77, yield: 290, poisson: 0.29, density: 7980, category: 'metal' },
  // 铝合金
  { name: "6061-T6铝合金", E: 68.9, G: 26, yield: 276, poisson: 0.33, density: 2700, category: 'metal' },
  { name: "7075-T6铝合金", E: 71.7, G: 26.9, yield: 503, poisson: 0.33, density: 2810, category: 'metal' },
  { name: "2024-T3铝合金", E: 73.1, G: 28, yield: 345, poisson: 0.33, density: 2780, category: 'metal' },
  // 其他金属
  { name: "Ti-6Al-4V钛合金", E: 113.8, G: 44, yield: 880, poisson: 0.34, density: 4430, category: 'metal' },
  { name: "H62黄铜", E: 105, G: 39, yield: 250, poisson: 0.35, density: 8430, category: 'metal' },
  { name: "T2紫铜", E: 108, G: 40, yield: 70, poisson: 0.34, density: 8900, category: 'metal' },
  { name: "铸铁HT200", E: 100, G: 40, yield: 200, poisson: 0.26, density: 7200, category: 'metal' },
  // 混凝土
  { name: "C20混凝土", E: 25.5, G: 10.6, yield: 9.6, poisson: 0.2, density: 2400, category: 'concrete' },
  { name: "C30混凝土", E: 30, G: 12.5, yield: 14.3, poisson: 0.2, density: 2400, category: 'concrete' },
  { name: "C40混凝土", E: 32.5, G: 13.5, yield: 19.1, poisson: 0.2, density: 2400, category: 'concrete' },
  { name: "C50混凝土", E: 34.5, G: 14.4, yield: 23.1, poisson: 0.2, density: 2450, category: 'concrete' },
  // 木材
  { name: "松木", E: 12, G: 0.7, yield: 30, poisson: 0.35, density: 500, category: 'wood' },
  { name: "橡木", E: 12.5, G: 0.8, yield: 40, poisson: 0.35, density: 700, category: 'wood' },
  { name: "胶合板", E: 8.5, G: 0.5, yield: 25, poisson: 0.3, density: 600, category: 'wood' },
  // 高分子/复合材料
  { name: "环氧树脂", E: 3.5, G: 1.3, yield: 80, poisson: 0.35, density: 1200, category: 'polymer' },
  { name: "尼龙PA66", E: 3.0, G: 1.1, yield: 85, poisson: 0.4, density: 1140, category: 'polymer' },
  { name: "GFRP玻璃钢", E: 25, G: 4, yield: 200, poisson: 0.25, density: 1900, category: 'composite' },
  { name: "CFRP碳纤维", E: 135, G: 5, yield: 1500, poisson: 0.3, density: 1600, category: 'composite' },
  // 其他
  { name: "玻璃", E: 70, G: 28, yield: 50, poisson: 0.22, density: 2500, category: 'polymer' },
  { name: "橡胶", E: 0.01, G: 0.003, yield: 15, poisson: 0.49, density: 1100, category: 'polymer' },
];

// --- Material Selector ---
export const MaterialSelector = ({ 
  onSelect,
  currentE,
  currentG,
  currentYield,
  currentPoisson
}: { 
  onSelect: (mat: { name: string, E: number, G: number, yield: number, poisson: number }) => void;
  currentE?: number;
  currentG?: number;
  currentYield?: number;
  currentPoisson?: number;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customE, setCustomE] = useState(currentE || 200);
  const [customG, setCustomG] = useState(currentG || 77);
  const [customYield, setCustomYield] = useState(currentYield || 250);
  const [customPoisson, setCustomPoisson] = useState(currentPoisson ?? 0.3);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const materials = DEFAULT_MATERIALS;

  const categories = [
    { id: 'all', label: '全部' },
    { id: 'metal', label: '金属' },
    { id: 'concrete', label: '混凝土' },
    { id: 'wood', label: '木材' },
    { id: 'polymer', label: '高分子' },
    { id: 'composite', label: '复合材料' },
  ];

  const filteredMaterials = selectedCategory === 'all' 
    ? materials 
    : materials.filter(m => m.category === selectedCategory);

  const activeMat = materials.find(m => 
    currentE && Math.abs(m.E - currentE) < 0.5 &&
    currentYield && Math.abs(m.yield - currentYield) < 1
  );

  // 当泊松比改变时自动计算剪切模量 G = E / (2(1+ν))
  const calculateG = (E: number, poisson: number) => {
    return E / (2 * (1 + poisson));
  };

  const handleCustomApply = () => {
    onSelect({
      name: '自定义材料',
      E: customE,
      G: customG,
      yield: customYield,
      poisson: customPoisson
    });
    setIsCustomMode(false);
  };

  // 同步外部值到自定义输入
  useEffect(() => {
    if (currentE) setCustomE(currentE);
    if (currentG) setCustomG(currentG);
    if (currentYield) setCustomYield(currentYield);
    if (currentPoisson !== undefined) setCustomPoisson(currentPoisson);
  }, [currentE, currentG, currentYield, currentPoisson]);

  return (
    <div className="mb-4 bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
      {/* 可点击的标题栏 */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Beaker className="w-4 h-4" style={{ color: 'var(--color-2)' }} />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">材料</span>
          <span className="text-sm font-medium text-slate-700 ml-2">
            {activeMat?.name || '自定义材料'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-mono hidden sm:inline">
            E={currentE}GPa | σy={currentYield}MPa
          </span>
          <svg 
            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* 可折叠内容 */}
      {isExpanded && (
        <div className="p-3 pt-0 border-t border-slate-200">
          {/* 模式切换 */}
          <div className="flex gap-2 mt-3 mb-3">
            <button
              onClick={() => setIsCustomMode(false)}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                !isCustomMode 
                  ? 'bg-white shadow-sm border-2' 
                  : 'bg-slate-100 border border-slate-200 hover:bg-white'
              }`}
              style={!isCustomMode ? { borderColor: 'var(--color-1)', color: 'var(--color-1)' } : {}}
            >
              📚 材料库选择
            </button>
            <button
              onClick={() => setIsCustomMode(true)}
              className={`flex-1 py-1.5 text-xs font-medium rounded transition-colors ${
                isCustomMode 
                  ? 'bg-white shadow-sm border-2' 
                  : 'bg-slate-100 border border-slate-200 hover:bg-white'
              }`}
              style={isCustomMode ? { borderColor: 'var(--color-1)', color: 'var(--color-1)' } : {}}
            >
              ✏️ 自定义参数
            </button>
          </div>

          {!isCustomMode ? (
            <>
              {/* 分类筛选 */}
              <div className="flex flex-wrap gap-1 mb-2">
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      selectedCategory === cat.id
                        ? 'bg-slate-700 text-white'
                        : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* 材料列表 */}
              <div className="max-h-48 overflow-y-auto space-y-1 custom-scrollbar">
                {filteredMaterials.map(mat => (
                  <button
                    key={mat.name}
                    onClick={() => onSelect(mat)}
                    className={`w-full p-2 text-left rounded border transition-colors ${
                      activeMat?.name === mat.name
                        ? 'bg-white border-2 shadow-sm'
                        : 'bg-white/50 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                    style={activeMat?.name === mat.name ? { borderColor: 'var(--color-1)' } : {}}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-slate-700">{mat.name}</span>
                      {mat.density && (
                        <span className="text-xs text-slate-400">{mat.density} kg/m³</span>
                      )}
                    </div>
                    <div className="flex gap-3 mt-1 text-xs text-slate-500 font-mono">
                      <span>E:{mat.E}</span>
                      <span>G:{mat.G}</span>
                      <span>σy:{mat.yield}</span>
                      <span>ν:{mat.poisson}</span>
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* 自定义参数输入 */
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <NumericInput label="弹性模量 E (GPa)" value={customE} onChange={E => { setCustomE(E); setCustomG(calculateG(E, customPoisson)); }} />
                <NumericInput label="剪切模量 G (GPa)" value={customG} onChange={setCustomG} />
                <NumericInput label="屈服强度 σy (MPa)" value={customYield} onChange={setCustomYield} />
                <NumericInput label="泊松比 ν" value={customPoisson} domain="nonnegative" maximum={0.4999}
                  onChange={nu => { setCustomPoisson(nu); setCustomG(calculateG(customE, nu)); }} />
              </div>
              
              <div className="text-xs text-slate-400 bg-slate-100 p-2 rounded">
                💡 提示：G = E / 2(1+ν)，修改 E 或 ν 时会自动计算 G
              </div>

              <button
                onClick={handleCustomApply}
                className="w-full py-2 text-sm font-medium text-white rounded transition-colors"
                style={{ backgroundColor: 'var(--color-1)' }}
              >
                应用自定义材料
              </button>
            </div>
          )}

          {/* 当前参数显示 */}
          <div className="mt-3 pt-2 border-t border-slate-200 grid grid-cols-4 gap-2 text-xs text-slate-500 font-mono">
            <span>E: {currentE} GPa</span>
            <span>G: {currentG || calculateG(currentE || 200, currentPoisson ?? 0.3).toFixed(1)} GPa</span>
            <span>σy: {currentYield} MPa</span>
            <span>ν: {currentPoisson}</span>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sidebar ---
// --- Theory Panel ---
export const TheoryPanel = ({ activeModule, className }: { activeModule: ModuleType; className?: string }) => {
  const info = THEORY_INFO[activeModule];
  
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col ${className || 'h-[500px]'}`}>
      <div className="p-6 pb-0">
        <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2 pb-2 border-b border-slate-100">
            <BookOpen className="w-5 h-5" style={{ color: 'var(--color-2)' }} /> 核心概念与公式
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div className="space-y-6">
            {info.formulas.map((item, idx) => (
                <div key={idx}>
                    <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-semibold text-slate-700">{item.label}</span>
                    </div>
                    <div className="bg-slate-50 border rounded px-3 text-slate-800 mb-2 py-1" style={{ borderColor: 'var(--color-3)' }}>
                        <LatexRenderer formula={item.latex} />
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
            ))}
        </div>
        <div className="mt-6 pt-4 border-t border-slate-100">
            <h4 className="font-bold text-sm mb-2 flex items-center gap-2" style={{ color: 'var(--color-5)' }}>
                <Lightbulb className="w-4 h-4" /> 物理直觉
            </h4>
            <p className="text-sm text-slate-600 leading-relaxed p-3 rounded border" style={{ backgroundColor: 'rgba(var(--color-5-rgb), 0.1)', borderColor: 'var(--color-5)' }}>
                {info.insight}
            </p>
        </div>
      </div>
    </div>
  );
};