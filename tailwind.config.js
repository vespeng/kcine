/** @type {import('tailwindcss').Config} */
// 设计 Token 唯一来源，规范见 STYLE_GUIDE.md
// 引用 CSS 变量的颜色随深浅主题自动切换；静态值（success/warning/danger/panel 等）不随主题变化
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#7cc6ff', // Logo 渐变亮端
          DEFAULT: 'var(--accent-color)', // 亮 #0066cc / 暗 #1a86f2
          hover: '#1a86f2', // Logo 渐变、主色悬停感知基准
          dark: '#004d99', // Logo 渐变深端
        },
        success: {
          light: '#30d158', // 延迟检测「良好」绿
          DEFAULT: '#34c759',
          dark: '#00a63e', // 导入成功等深绿文字（原 green-600）
        },
        warning: '#fe9a00',
        danger: {
          DEFAULT: '#fb2c36',
          light: '#ff6467', // 浅红错误文字（原 red-400）
          dark: '#e7000b', // LIVE 徽章等深红（原 red-600）
        },
        panel: '#1c1c1e', // 播放器深色控制面板 / Toast 底色（双主题固定深色，配 /75 /95 等透明度修饰符）
        surface: {
          DEFAULT: 'var(--glass-bg)', // 玻璃表面：亮 rgba(255,255,255,.72) / 暗 rgba(22,22,24,.72)
          hover: 'var(--glass-hover)', // 玻璃表面悬停态
        },
        text: {
          DEFAULT: 'var(--text-color)', // 亮 #1d1d1f / 暗 #f5f5f7
          secondary: 'var(--text-color-secondary)', // 亮 #6e6e73 / 暗 #8e8e93
        },
        border: 'var(--glass-border)',
        bg: 'var(--bg-color)', // 亮 #f2f4f7 / 暗 #121212
      },
      maxWidth: {
        sidebar: '420px', // 侧滑抽屉（收藏/观看历史）
        content: '1240px', // 页面内容栅格（搜索页/播放页）
        page: '1920px', // 内容栅格最大宽
      },
      backgroundImage: {
        page: 'var(--bg-image)', // 页面主题背景图（暗色渐变）
      },
      maxHeight: {
        list: '300px', // 弹层内可滚动列表（选源/选集）
        panel: '400px', // 面板滚动区（集数面板/搜索历史下拉）
        'panel-lg': '600px', // 集数面板桌面端高度（sm:max-h-panel-lg）
        sheet: '60vh', // 弹窗内滚动列表（导入预览/订阅列表）
        modal: '85vh', // 弹窗整体最大高
      },
      minHeight: {
        touch: '44px', // 可点击目标最小触控高度
      },
      minWidth: {
        cta: '100px', // 对话框/表单主按钮最小宽
        menu: '150px', // 下拉菜单最小宽
        'menu-md': '170px', // 播放器设置菜单最小宽
        'menu-lg': '200px', // 宽下拉菜单最小宽
        'menu-xl': '240px', // 最宽下拉菜单最小宽
      },
      width: {
        icon: '18px', // 菜单行内图标（无默认档位，w-4=16 w-5=20 之间）
        drawer: '85%', // 侧滑抽屉移动端宽度
        'drawer-sm': '90%', // 侧滑抽屉 sm 断点宽度
        modal: '90%', // 弹窗移动端宽度（配 max-w-md 使用）
      },
      dropShadow: {
        'danger-glow': '0 0 10px rgba(251, 44, 54, 0.4)', // 错误图标红色光晕
        'skip-hint': '0 4px 8px rgba(0, 0, 0, 0.8)', // 播放器快进/快退提示文字投影
      },
      gridTemplateColumns: {
        // 播放页双栏栅格（播放器区 + 集数面板区，xl 断点）
        'player-cinema': 'minmax(0, 1.9fr) minmax(280px, 0.55fr)', // 影院模式：播放器最大
        'player-wide': 'minmax(0, 1.65fr) minmax(300px, 0.72fr)', // 宽屏模式
        'player-standard': 'minmax(0, 1.45fr) minmax(320px, 0.9fr)', // 标准模式
      },
      height: {
        icon: '18px', // 与 width.icon 配套（h-icon / sm:h-icon）
      },
      aspectRatio: {
        poster: '2 / 3', // 海报卡片宽高比（影视封面）
      },
      borderRadius: {
        sm: '4px',
        md: '8px', // 覆盖默认 6px；原 8px 场景（旧 rounded-lg）统一用 rounded-md
        lg: '12px', // 覆盖默认 8px，对齐 --radius-lg
        xl: '16px', // 覆盖默认 12px；紧凑面板/列表项档（搜索历史下拉等）
        '2xl': '24px', // 覆盖默认 16px，对齐项目事实标准 --radius-2xl
        '2xl-inset': 'calc(var(--radius-2xl) - 4px)', // 24px 容器内缩 4px 的滑块指示器
        full: '9999px',
      },
      translate: {
        'gate-shift': '7vh', // 门禁页入场垂直位移
      },
      fontFamily: {
        system: 'var(--font-family-system)', // 全站系统字体栈（body 已默认应用）
        mono: [
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ], // 延迟徽章、JSON 文本域等等宽场景
      },
      fontSize: {
        // xs/sm/lg/xl 与 v4 默认值相同，沿用默认（保留其行高配对）；仅补充缺失的 token 命名
        '3xs': ['9px', '12px'], // 角标极限小字（旋转紧凑态/清晰度角标）
        '2xs': ['10px', '14px'], // 徽章/角标主力小字（原 text-[10px]）
        md: ['16px', '24px'], // 等价 text-base
        xxl: ['24px', '32px'], // 等价 text-2xl
      },
      transitionDuration: {
        // 150/200/300/500 等走默认档位；仅补充默认缺失且在用的档位
        '250': '250ms', // 侧滑抽屉滑入（收藏/观看历史）
        '400': '400ms', // 播放器控件显隐过渡
      },
      transitionTimingFunction: {
        fluid: 'cubic-bezier(0.2, 0.8, 0.2, 1)', // 全站标准缓动（ease-fluid）
      },
      transitionProperty: {
        'max-height': 'max-height', // 可折叠面板高度过渡
      },
      backdropBlur: {
        input: '10px', // Input 玻璃模糊
        glass: '25px', // 导航药丸 / 播放器深色玻璃浮层
      },
      backdropSaturate: {
        glass: '1.8', // 玻璃浮层饱和度（saturate(180%)）
      },
      letterSpacing: {
        brand: '0.18em', // Logo 字距
      },
      animation: {
        // keyframes 定义于 app/styles/transitions.css、effects.css、globals.css（全局可用）
        fade: 'fadeIn 0.2s ease-out forwards', // 纯透明度淡入（遮罩层，无位移）
        'fade-in': 'fade-in 0.3s ease-out', // 淡入 + 上浮 10px
        'slide-up': 'slide-up 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)', // 淡入 + 上浮 20px（Toast/对话框入场）
        'scale-in': 'scale-in 0.25s cubic-bezier(0.2, 0.8, 0.2, 1)', // 淡入 + 缩放（菜单/弹层入场）
        'scale-out': 'scale-out 0.25s ease-in', // 缩放退出
        shake: 'shake 0.4s ease-in-out', // 水平抖动（错误提示）
        'spin-slow': 'spin-slow 2s linear infinite',
        shimmer: 'shimmer 1.5s linear infinite', // 骨架屏扫光
        jiggle: 'jiggle 0.2s infinite', // 抖动（长按排序提示）
        'dropdown-in': 'search-dropdown-appear 0.2s ease-out forwards', // 搜索历史下拉入场
      },
      boxShadow: {
        card: 'var(--shadow-sm)', // 随主题切换阴影浓度
        overlay: 'var(--shadow-md)',
        dropdown: '0 2px 4px rgba(0,0,0,0.4)', // 深色浮层固定深投影
        soft: '0 4px 8px var(--shadow-color)', // 卡片悬停浅投影
        'card-hover': '0 8px 24px var(--shadow-color)', // 卡片悬停投影
        'primary-glow': '0 4px 12px rgba(var(--accent-color-rgb), 0.3)', // 主色柔光（选中/强调）
        'primary-glow-sm': '0 2px 8px rgba(var(--accent-color-rgb), 0.25)', // 主色小柔光
        glow: '0 0 24px rgba(0,0,0,0.35)', // 深色表面环境光晕
        elevated: '0 10px 30px rgba(0,0,0,0.3)', // 深色表面悬浮投影
      },
      zIndex: {
        danmaku: 5, // 弹幕画布（播放器内部局部层级）
        toast: 200,
        'page-nav': 1000, // 搜索页吸顶导航（需低于侧滑抽屉）
        'nav-backdrop': 1999, // 侧滑抽屉遮罩
        nav: 2000, // 吸顶导航 / 侧滑抽屉
        backdrop: 9998, // 弹窗遮罩
        modal: 9999, // 弹窗内容 / 全屏浮层
        max: 2147483647, // 播放器桌面菜单（置于一切之上）
      },
    },
  },
};
