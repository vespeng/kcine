# KCINE 样式指南（Style Guide）

> 本文档为 KCINE 全站样式规范。设计 Token 定义在 [tailwind.config.js](./tailwind.config.js) 的 `theme.extend` 中，通过 `@config` 在 [globals.css](./app/globals.css) 挂载。
> 所有组件样式以 Token 为准；主题相关颜色引用 CSS 变量，自动跟随亮暗主题切换。

---

## 1. 设计原则

| # | 原则 | 说明 |
|---|------|------|
| 1 | **Liquid Glass 玻璃拟态** | 表面一律使用半透明背景（`--glass-bg`）+ `backdrop-blur` + 1px 细边框（`--glass-border`），层次靠透明度与模糊，而非重阴影 |
| 2 | **Apple 系统级语义色** | 主色 `#0066cc`（亮）/`#1a86f2`（暗），状态色取自 iOS 系统色板（success/warning/danger），全站禁止出现调色板之外的彩色 |
| 3 | **中性灰文字层级** | 仅两级文字色：主文字、次级文字，靠字号与字重区分更多层级 |
| 4 | **胶囊化大圆角** | 图标按钮、标签、头像一律 `rounded-full`；容器统一 24px 大圆角（`rounded-2xl`） |
| 5 | **移动优先 + 触控友好** | 先写移动端样式，用 `sm:`/`md:` 前缀覆盖桌面端；可点击目标最小 44px（`min-h-[44px]`、`touch-manipulation`） |
| 6 | **深浅双主题** | 主题相关颜色一律通过 CSS 变量切换（Token 类内部已引用变量，自动跟随主题），组件内不允许出现只在单一主题下正确的字面颜色 |

---

## 2. 设计 Token 说明

Token 定义在 [tailwind.config.js](./tailwind.config.js) 的 `theme.extend` 中。**颜色随主题切换的原理**：`primary` / `text` / `bg` / `border` 引用 CSS 变量（亮暗主题自动切换）；`success` / `warning` / `danger` / `primary.hover` 为固定值（双主题通用）。透明度修饰符可用（如 `bg-primary/10`，经 `color-mix` 实现）。

### 2.1 颜色

| Token | Tailwind 类 | 值 / 主题行为 | 使用场景 |
|-------|------------|--------------|---------|
| `primary` | `bg-primary` `text-primary` `border-primary` | `var(--accent-color)`：亮 `#0066cc` / 暗 `#1a86f2` | 主按钮背景、链接/强调文字、选中态指示器、焦点边框 |
| `primary.hover` | `bg-primary-hover` 等 | `#1a86f2` 固定 | 主色悬停感知基准；Logo 渐变 |
| `primary.light` / `primary.dark` | `bg-primary-light` / `bg-primary-dark` | `#7cc6ff` / `#004d99` 固定 | Logo 渐变亮端/深端 |
| `success` | `bg-success` `text-success` | `#34c759` 固定 | 成功 Toast 图标、「直播中」徽章 |
| `success.light` | `text-success-light` | `#30d158` 固定 | 延迟检测「良好」绿 |
| `success.dark` | `text-success-dark` | `#00a63e` 固定 | 导入成功等深绿成功文字 |
| `warning` | `bg-warning` `text-warning` | `#fe9a00` 固定 | 管理员提示、警示徽章 |
| `danger` | `bg-danger` `text-danger` `border-danger` | `#fb2c36` 固定 | 删除按钮/危险操作 hover、错误文字、错误边框 |
| `danger.light` | `text-danger-light` | `#ff6467` 固定 | 浅红错误文字（表单错误提示） |
| `danger.dark` | `bg-danger-dark` | `#e7000b` 固定 | LIVE 徽章等深红背景 |
| `panel` | `bg-panel`（可配 `/75` `/95`） | `#1c1c1e` 固定 | 播放器深色控制面板、Toast 底色（双主题固定深色） |
| `surface` | `bg-surface` `hover:bg-surface-hover` | `var(--glass-bg)` / `var(--glass-hover)`，随主题 | 玻璃表面背景及悬停态 |
| `text` | `text-text` | `var(--text-color)`：亮 `#1d1d1f` / 暗 `#f5f5f7` | 一级正文、标题 |
| `text.secondary` | `text-text-secondary` | `var(--text-color-secondary)`：亮 `#6e6e73` / 暗 `#8e8e93` | 次级说明文字、placeholder、未选中项 |
| `border` | `border-border` | `var(--glass-border)`：亮 `rgba(0,0,0,0.06)` / 暗 `rgba(255,255,255,0.12)` | 所有玻璃表面/卡片的 1px 边框、分隔线 |
| `bg` | `bg-bg` | `var(--bg-color)`：亮 `#f2f4f7` / 暗 `#121212` | 页面/非玻璃实底表面背景 |

> `surface` 即玻璃背景（`--glass-bg`）；与 `surface.hover`、`border-border` 搭配构成完整玻璃表面（背景 + 悬停 + 边框）。

### 2.2 间距 / 圆角 / 字号 / 阴影

| 类别 | Tailwind 类 → 值 | 说明 |
|------|-----------------|------|
| 间距 | `p-1` 4px · `p-2` 8px · `p-4` 16px · `p-6` 24px · `p-8` 32px · `p-12` 48px（含 `m-/gap-/w-/h-` 等所有间距前缀） | 项目不定义命名 spacing token，统一用数字默认档（详见第 4 节） |
| 圆角 | `rounded-sm` 4px · `rounded-md` 8px · `rounded-lg` 12px · `rounded-xl` 16px · `rounded-2xl` 24px · `rounded-full` | ⚠️ `rounded-md`/`rounded-lg`/`rounded-xl`/`rounded-2xl` 为项目自定义覆盖（8/12/16/24px），非 Tailwind 默认值；8px 场景一律用 `rounded-md`；16px 用于紧凑面板/列表项（搜索历史下拉） |
| 字号 | `text-3xs` 9px · `text-2xs` 10px · `text-xs` 12px · `text-sm` 14px · `text-md` 16px · `text-lg` 18px · `text-xl` 20px · `text-xxl` 24px | `text-2xs`/`text-3xs` 用于徽章/角标小字（含行高配对）；`text-md`/`text-xxl` 分别等价 `text-base`/`text-2xl`；其余沿用 v4 默认值 |
| 阴影 | `shadow-card` = `var(--shadow-sm)` · `shadow-overlay` = `var(--shadow-md)` · `shadow-dropdown` = `0 2px 4px rgba(0,0,0,0.4)` | 前两者随主题切换阴影浓度（亮 0.05 / 暗 0.3）；`dropdown` 用于深色浮层，固定深投影 |

阴影使用场景：`card` → 导航药丸、徽章、静态卡片；`overlay` → 弹窗、下拉菜单、悬浮卡片；`dropdown` → 深色背景上的浮层（播放器桌面菜单）。

### 2.3 尺寸 / 字体 / 动效 / 层级

| 类别 | Tailwind 类 → 值 | 说明 |
|------|-----------------|------|
| 最大宽度 | `max-w-sidebar` 420px · `max-w-content` 1240px · `max-w-page` 1920px | 侧滑抽屉、内容栅格（搜索页/播放页）、海报栅格；其余用默认档（`max-w-md` 弹窗 448px、`max-w-7xl` 导航 1280px） |
| 最大高度 | `max-h-list` 300px · `max-h-panel` 400px · `max-h-panel-lg` 600px · `max-h-sheet` 60vh · `max-h-modal` 85vh | 弹层内滚动列表（选源/选集）、面板滚动区（集数面板/搜索历史下拉）、集数面板桌面端、弹窗内滚动列表（导入/订阅）、弹窗整体 |
| 最小宽度 | `min-w-cta` 100px | 对话框/表单主按钮最小宽（ConfirmDialog 等） |
| 最小高度 | `min-h-touch` 44px | 所有可点击目标（触控标准） |
| 图标尺寸 | `w-icon` / `h-icon` 18px（可配 `sm:w-icon` 等） | 菜单行内图标（16/20/24px 等走默认档 `w-4`/`w-5`/`w-6`） |
| 宽高比 | `aspect-poster` = `2 / 3` | 海报卡片（MovieCard/VideoCard 等）；16:9 视频用默认 `aspect-video` |
| 字体 | `font-system` · `font-mono` | `font-system` 系统字体栈（body 默认应用，一般无需手动添加）；`font-mono` 等宽栈（延迟徽章、JSON 文本域） |
| 缓动 | `ease-fluid` = `cubic-bezier(0.2, 0.8, 0.2, 1)` | 全站标准缓动；时长默认档 `duration-150/200/300/500`，补充档 `duration-250`（侧滑抽屉滑入） |
| 动画 | `animate-fade` 0.2s 纯透明度 · `animate-fade-in` 0.3s · `animate-slide-up` 0.3s · `animate-scale-in` 0.25s · `animate-scale-out` 0.25s · `animate-shake` 0.4s · `animate-spin-slow` 2s · `animate-shimmer` 1.5s · `animate-jiggle` 0.2s | keyframes 位于 transitions.css / effects.css / globals.css；`animate-fade` 用于遮罩层淡入；`animate-pulse`/`animate-spin` 使用 v4 内置 |
| z-index | `z-danmaku` 5 · `z-toast` 200 · `z-nav-backdrop` 1999 · `z-nav` 2000 · `z-backdrop` 9998 · `z-modal` 9999 · `z-max` 2147483647 | 层级唯一取值来源；组件内部相对层级（`z-10`/`z-20`）除外。`z-danmaku` 为播放器弹幕画布局部层级 |

---

## 3. 组件规范

> 间距映射遵循就近归档、同距取大档原则（如 12px → `md 16px`）。

### 3.1 按钮（Button） — [Button.tsx](./components/ui/Button.tsx)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 内边距（移动） | `px-4 py-2`（水平 `md 16px` / 垂直 `sm 8px`） | |
| 内边距（≥md） | `md:px-6 md:py-4`（水平 `lg 24px` / 垂直 `md 16px`） | |
| 最小高度 | `min-h-touch`（44px 触控标准，固定尺寸例外） | |
| 字号 | 移动 `text-sm` / 桌面 `text-md`，`font-semibold` | |
| 圆角 | `rounded-2xl`（24px） | |
| primary 背景 | `bg-primary` | |
| primary 文字色 | `text-white` | |
| primary 边框 | 无（`border-none`） | |
| primary 阴影 | 基于 `shadow-color` 的柔和投影（由 Token 派生） | |
| 悬停 | 亮度 +10%（感知为 `primary-hover`），阴影增强 | |
| 按下 | `scale(0.98)` + 亮度 95% | |
| 禁用 | `opacity 0.5` + `cursor-not-allowed`，背景不变 | |
| secondary | 背景 `--glass-bg` + blur、边框 `border-border`、文字 `text-text` | 玻璃按钮 |
| ghost | 背景透明，悬停背景 `border-border` | 弱操作 |

### 3.2 卡片（Card） — [Card.tsx](./components/ui/Card.tsx)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 内边距 | `p-4 md:p-6`（移动 `md 16px` / 桌面 `lg 24px`） | |
| 圆角 | `rounded-2xl`（24px） | |
| 边框 | 1px `border-border` | |
| 阴影 | 默认无；悬停 `translate-y(-2px)` + `0 8px 24px var(--shadow-color)` | 层次靠 hover，不靠常驻阴影 |
| 背景 | 玻璃模式 `--glass-bg` + blur(16px)；实底模式 `bg-bg` 90% | 可点击卡片渲染为 `<button>` |

### 3.3 输入框（Input） — [Input.tsx](./components/ui/Input.tsx)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 高度 | 自适应（由内边距撑起）；建议补充 `min-h-[44px]` 与按钮一致 | 建议，非强制 |
| 内边距（移动） | `px-4 py-2`（水平 `md 16px` / 垂直 `sm 8px`） | |
| 内边距（≥md） | `md:px-6 md:py-4`（水平 `lg 24px` / 垂直 `md 16px`） | |
| 圆角 | `rounded-2xl`（24px） | |
| 边框 | 1px `border-border`；聚焦 → `border-primary`；错误 → `border-danger` | |
| 背景 | `--glass-bg` + blur(10px) | |
| 文字 | `text-md`（16px），placeholder `text-text-secondary` | |
| Label | `text-sm` + `font-medium`，下边距 `mb-2`（`sm 8px`） | |
| 聚焦 | 移除 outline，仅边框变色 | |

### 3.4 弹窗（Modal） — [AddSourceModal.tsx](./components/settings/AddSourceModal.tsx)、[ConfirmDialog.tsx](./components/ui/ConfirmDialog.tsx)、[ModalBackdrop.tsx](./components/ui/ModalBackdrop.tsx)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 宽度 | 视口 90%，`max-width 448px`（`w-[90%] max-w-md`） | 弹窗属固定最大宽度组件，允许 |
| 内边距 | `p-6`（`lg 24px`） | |
| 圆角 | `rounded-2xl`（24px） | |
| 遮罩颜色 | `rgba(0,0,0,0.3)` + blur（`bg-black/30 backdrop-blur-md`） | |
| 阴影 | `shadow-overlay` | |
| 标题 | `text-xl`（20px）semibold，下边距 `mb-4`（`md 16px`） | |
| 层级 | 遮罩 `z-backdrop`，内容 `z-modal` | |
| 动画 | fade-in / slide-up，300ms | |
| 操作区按钮间距 | `gap-4`（`md 16px`） | |

### 3.5 表格（Table）

> 当前项目暂无表格组件，以下为基于 Token 的建议规范，新建表格时遵循。

| 属性 | 规范值 |
|------|--------|
| 表头背景 | `color-mix(in srgb, var(--text-color) 4%, transparent)`，文字 `text-sm` semibold + `text-text-secondary` |
| 行高 | 最小 44px（对齐触控标准） |
| 单元格内边距 | 垂直 `sm 8px` / 水平 `md 16px` |
| 边框 | 仅行分隔线 1px `border-border`；容器圆角 `rounded-lg`（12px） |
| 单元格文字 | 正文 `text-sm`；数字/次要信息 `text-text-secondary` |

### 3.6 导航（Nav） — [Navbar.tsx](./components/layout/Navbar.tsx)、[SegmentedControl.tsx](./components/ui/SegmentedControl.tsx)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 布局 | `sticky top-0`，`z-nav`，内容区 `max-w-7xl` 居中 | |
| 药丸背景 | `--glass-bg` + blur(25px)、1px `border-border`、阴影 `shadow-card` | |
| 药丸圆角 | `rounded-2xl`（24px） | |
| 内边距（移动） | `px-4 py-2`（水平 `md 16px` / 垂直 `sm 8px`） | |
| 内边距（≥sm） | `sm:px-6 sm:py-2`（水平 `lg 24px` / 垂直 `sm 8px`） | |
| 高度 | 自适应；图标按钮 `w-8 h-8`（移动）/ `sm:w-10 sm:h-10`（桌面）固定 | 固定尺寸例外 |
| 图标悬停态 | 背景 `color-mix(primary 10%, transparent)`（可写 `hover:bg-primary/10`） | |
| 选中态（SegmentedControl） | 背景 `bg-primary` + 白色文字；未选中 `text-text-secondary`，悬停 → `text-text` | 全站选中态统一模式 |
| 页面标题 | `text-lg`（移动）/ `text-xxl`（桌面），bold | |

### 3.7 标签（Tag / Badge） — [Badge.tsx](./components/ui/Badge.tsx)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 内边距 | `px-2 py-1`（水平 `sm 8px` / 垂直 `xs 4px`） | |
| 字号 | `text-xs`（12px），`font-semibold` | |
| 圆角 | `rounded-full` | |
| primary 背景 | `bg-primary` + 白字 + `shadow-card` | |
| secondary 背景 | `--glass-bg` + 1px `border-border` + `text-text` | |
| 图标 | 与文字同色，尺寸 `0.875em`，与文字间距 `xs 4px` | |

### 3.8 提示（Toast / Alert）

**Toast（操作反馈浮层）** — 参考实现：[DesktopOverlay.tsx:222-230](./components/player/desktop/DesktopOverlay.tsx#L222-L230)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 背景 | `bg-panel/95` + blur(25px)（双主题固定深色） | |
| 文字 | `text-white`，`text-sm` medium | |
| 图标 | `text-success`，尺寸 18px | |
| 内边距 | `px-6 py-4`（水平 `lg 24px` / 垂直 `md 16px`） | |
| 图标文字间距 | `gap-4`（`md 16px`） | |
| 圆角 | `rounded-2xl`（24px） | |
| 阴影 | `0 8px 32px rgba(0,0,0,0.6)` | 深色浮层用深投影 |
| 最小宽度 | 无（内容自适应） | |

**Alert / 错误提示**（表单错误、确认弹窗）— 参考实现：[AddSourceModal.tsx:102-106](./components/settings/AddSourceModal.tsx#L102-L106)

| 属性 | 规范值 | 说明 |
|------|--------|------|
| 文字色 | `text-danger`，`text-sm` | |
| 背景色 | `color-mix(in srgb, #fb2c36 8%, transparent)`（Token 派生色，双主题一套写法） | |
| 圆角 | `rounded-2xl`（24px） | |
| 内边距 | `px-4 py-2`（水平 `md 16px` / 垂直 `sm 8px`） | |
| ConfirmDialog 危险按钮 | 背景 `bg-danger`，悬停加深 | |

---

## 4. 间距规范（4px 网格系统）

所有间距（padding / margin / gap / 留白类尺寸）必须是 **4 的整数倍**，且仅允许以下 6 档。

> ⚠️ **项目不定义命名 spacing token**：`p-xs`/`p-sm`/`p-md` 等类未注册、不会生成，写了样式不生效。原因：命名 spacing 会遮蔽 Tailwind 默认容器档位（如 `max-w-md` 弹窗 448px、`max-w-lg` 512px）。一律使用数字档。

| 档位 | 值 | Tailwind 类 | 典型场景 |
|------|-----|------------|---------|
| xs | 4px | `p-1` | 图标与文字间距、徽章垂直内边距 |
| sm | 8px | `p-2` | 紧凑元素内边距、Label 与输入框间距 |
| md | 16px | `p-4` | 卡片移动端内边距、列表项间距、栅格 gap |
| lg | 24px | `p-6` | 卡片桌面端内边距、弹窗内边距 |
| xl | 32px | `p-8` | 页面区块垂直间距 |
| xxl | 48px | `p-12` | 页面级大留白（空状态、区块分隔） |

规则：

- 允许 `0` 和 `auto`；边框宽度（1px/2px）、图标/头像固定尺寸（16/20/32/40px）不属于间距 Token，不受此限。
- 禁止使用命名间距类（`p-xs`/`p-sm`/`p-md`/`p-lg`/`p-xl`/`p-xxl` 及 `m-`/`gap-`/`px-`/`py-` 等同形变体）——项目未注册，不会生成样式。
- 禁止使用中间档间距类：`p-0.5`(2) `p-1.5`(6) `p-2.5`(10) `p-3`(12) `p-5`(20) `p-7`(28) `p-9`(36) `p-10`(40) `p-11`(44) 及其 `-x/-y/-t/-r/-b/-l` 变体。
- 组合规则：需要 12px 视觉效果时用 8px（`p-2`）或 16px（`p-4`），不引入新档位。

---

## 5. 禁止事项

| # | 禁止 | 正确做法 |
|---|------|---------|
| 1 | 硬编码颜色值（hex/rgb/named，如 `bg-[#34c759]`、CSS 里的 `color: #666`）；状态色使用 Tailwind 调色板类（`text-red-500`、`text-amber-500` 等） | 用语义 Token 类：`text-danger`、`bg-success`、`text-text-secondary`（主题色类内部引用变量，自动切换主题）。例外：Token 派生色 `color-mix(...)` 与 Toast 固定深色玻璃 |
| 2 | `!important` | 用选择器优先级或调整书写顺序解决 |
| 3 | 小数像素值（`9.6px`、`0.6rem`、`1.5px`） | 归入最近 Token 档位 |
| 4 | 非 Token 间距（2/6/10/12/20/28/36/40/44px…） | 见第 4 节 6 档取值 |
| 5 | 组件内写死宽度（`w-[200px]`、`min-w-[200px]`、`max-w-[60px]`） | 内容自适应 + `flex/grid` 约束。例外：固定尺寸组件（按钮 `min-h-[44px]`、图标按钮 `w-8 h-8`、弹窗 `max-w-md`、Logo 容器） |
| 6 | Tailwind 任意值（`text-[15px]`、`pt-[13px]`、`rounded-[0.6rem]`） | 用 Token 类替代（如 `rounded-2xl`、`shadow-card`、`text-text`） |
| 7 | CSS 文件中硬编码颜色/间距（`app/styles/*.css` 中新写 `padding: 13px`、`color: #eee`） | 引用 `variables.css` 的变量；确需新增变量先在 `variables.css` 定义 |
| 8 | 同一组件混用 Tailwind 与原生 CSS 设置同一属性（如 Tailwind `rounded-*` + CSS `border-radius`） | 一个属性只有一个来源；容器类用 Tailwind，皮肤级复用样式放 CSS 文件 |
| 9 | 新写 `@media` 查询与 `z-index` 随手取值 | 响应式用 Tailwind 前缀（见第 6 节）；层级一律用 Token 类（见 2.3），组件内部相对层级（`z-10`/`z-20`）除外 |

---

## 6. 响应式断点

响应式全部通过 Tailwind 前缀实现；播放器组件内部使用容器查询。

标准断点（Tailwind v4 默认，不自定义覆盖）：

| 前缀 | 断点 | 用途约定 |
|------|------|---------|
| （无前缀） | < 640px | 移动端样式，先写这里 |
| `sm:` | ≥ 640px | 大屏手机/竖屏平板：放开隐藏内容、放大图标 |
| `md:` | ≥ 768px | 平板/小桌面：按钮与卡片升级尺寸 |
| `lg:` | ≥ 1024px | 桌面端栅格列数 |
| `xl:` `2xl:` | ≥ 1280 / 1536px | 暂不引入，需要时先评审 |

容器查询（仅播放器局部响应式使用，新组件不要模仿）：

- [video-player.css:448](./app/styles/video-player.css#L448) `@container (max-width: 36rem)` → 576px
- [video-player.css:479](./app/styles/video-player.css#L479) `@container (max-width: 24rem)` → 384px

原则：**移动优先**——默认写移动端，`sm:`/`md:` 逐级覆盖；桌面专属交互（悬停）不影响移动端。

---

## 7. 样式书写优先级（从高到低）

1. **Tailwind Token 类 / 标准类**（如 `bg-primary`、`p-4`、`rounded-2xl`、`text-md`、`shadow-card`）——首选
2. **CSS 变量类**（如 `bg-[var(--glass-bg)]`、CSS 文件中的 `var(--glass-border)`）——仅用于 Token 未覆盖的场景：玻璃表面、`color-mix` 派生色、过渡时长 `--transition-fluid`
3. **内联 style** —— 禁止，唯一例外：**动态计算值**（如 [SegmentedControl.tsx](./components/ui/SegmentedControl.tsx) 指示器 `left/width`、Navbar 的 GPU 合成提示 `transform: translate3d(0,0,0)`）

同时禁止：

- Tailwind 任意值（`text-[15px]`、`pt-[13px]`）——见第 5 节 #6
- CSS 文件中硬编码颜色/间距——见第 5 节 #7
- 同一组件混用 Tailwind 和原生 CSS 设置同一属性——见第 5 节 #8
