# KCine - 视频聚合平台

<p align="center">
  <img src="public/logo.svg" alt="KCine Logo" width="144" height="144">
</p>

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js) ![React](https://img.shields.io/badge/React-19-61DAFB?logo=react) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss) ![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript) [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

基于 [KVideo](https://github.com/KuekHaoYang/KVideo) **4.9.18** 版本二次开发的 **KCine** 视频聚合平台，在继承原版核心能力的基础上进行了深度重构与优化：

- **视觉统一**：高度统一、简约的设计语言，带来一致清爽的界面体验
- **性能提升**：多轮加载与渲染优化，访问速度显著提升
- **Bug 修复**：修复了大量潜在缺陷，整体稳定性大幅增强
- **功能打磨**：持续优化搜索、播放、IPTV、弹幕等核心功能
- **精简取舍**：去除部分非必要功能，聚焦核心使用场景，保持轻量专注

> ⚠️ **维护说明**：KCine 已脱离原版（KVideo）**独立维护**，不再属于官方精简版本，更新节奏与功能取舍完全以本仓库为准。

> 📖 **文档说明**：本 README 仅保留部署与使用所必要的核心内容，如需了解原项目的完整技术文档，可前往上文所述的原项目仓库查看。

> 🙏 **特别感谢**：本项目的基础功能与核心实现均源自 [KuekHaoYang](https://github.com/KuekHaoYang) 的 KVideo 原项目，在此对原作者致以诚挚的感谢。

> ⚖️ **资源与免责声明**：本仓库**不包含任何影视资源内容**，所有视频源、IPTV 直播源等资源均需用户自行查找、整理并导入。本项目仅供学习与技术研究之用，若因使用本项目导入或播放的内容涉嫌违规、违法，相关责任由使用者自行承担，与本项目及作者本人无关。

## 核心功能

- **智能视频播放**：HLS 流媒体支持、播放控制、自动连播、跳过片头片尾、画中画、Chromecast 投屏
- **多源并行搜索**：聚合多个视频源并行搜索，SSE 实时返回结果，自动简繁转换
- **广告过滤**：智能识别并过滤流媒体广告，支持关键词自定义
- **源智能优选**：多源延迟检测与排序，播放分辨率自动探测
- **IPTV 直播**：M3U/JSON 格式支持，HEVC 智能兼容，流媒体代理
- **弹幕系统**：Canvas 高性能渲染，支持多 API 管理
- **豆瓣集成**：影视信息获取、推荐系统、标签管理
- **个性化功能**：收藏管理、观看历史、断点续播
- **订阅管理**：订阅源自动同步，自定义视频源，数据一键导入导出
- **账户与权限**：多账户体系与细粒度角色权限控制
- **响应式设计**：桌面/移动端/TV 全适配，支持电视遥控器导航
- **PWA 支持**：可安装为独立应用
- **跨设备同步**：基于 Redis 的配置同步（可选）
- **移动端手势**：长按倍速播放、屏幕亮度及音量控制

## 快速部署

### Docker 部署（推荐）

```bash
# 最简启动
docker run -d -p 3000:3000 --name kcine vespeng/kcine:latest

# 完整配置示例
docker run -d -p 3000:3000 \
  -e ADMIN_PASSWORD="admin123" \
  -e PREMIUM_PASSWORD="premium456" \
  -e ACCOUNTS="user1:用户一:admin,user2:用户二:viewer" \
  -e SITE_NAME="我的视频" \
  --name video vespeng/video:latest
```

### Node.js 部署

```bash
git clone https://github.com/vespeng/kcine.git
cd kcine
npm install
npm run build
npm start
```

### Vercel / Cloudflare 托管部署

> 注意：托管模式会禁用外部媒体代理和 IPTV 流中继，仅支持直连播放。完整功能请使用 Docker 或 Node.js 自托管。

1. 本地构建：`npm install && npm run pages:build`
2. 上传 `.vercel/output/static` 目录（不要上传源码或 .next 目录）

## 环境变量配置

### 认证相关

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `ADMIN_PASSWORD` | 管理员密码 | - |
| `ACCOUNTS` | 多账户配置，格式：`用户名:密码:名称[:角色[:权限]]` | - |
| `PREMIUM_PASSWORD` | 高级内容独立密码 | - |
| `AUTH_SECRET` | 托管账户模式密钥（需配合 Redis） | - |
| `UPSTASH_REDIS_REST_URL` | Redis REST URL（用于托管账户和数据同步） | - |
| `UPSTASH_REDIS_REST_TOKEN` | Redis REST Token | - |

### 站点自定义

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SITE_NAME` | 站点名称 | `KCine` |
| `SITE_TITLE` | 浏览器标题 | `KCine - 视频聚合平台` |
| `SITE_DESCRIPTION` | 站点描述 | `视频聚合平台` |
| `SITE_ICON_FILE` | Docker 图标文件路径 | - |
| `SITE_ICON_URL` | Docker 图标 URL | - |

### 功能配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `SUBSCRIPTION_SOURCES` | 自动订阅源（JSON 数组或 URL） | - |
| `IPTV_SOURCES` | IPTV 直播源配置 | - |
| `DANMAKU_API_URL` | 弹幕 API 地址 | - |
| `AD_KEYWORDS` | 广告过滤关键词 | - |
| `MERGE_SOURCES` | 合并同名源（`true`/`1`） | - |

### 网络配置

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `PORT` | 应用端口 | `3000` |
| `ALLOW_LAN_ACCESS` | 允许局域网访问 | `false` |
| `PERSIST_SESSION` | 持久化登录会话 | `true` |

## 视频源 JSON 格式

```json
[
  {
    "id": "my_source_1",
    "name": "我的精选源",
    "baseUrl": "https://api.example.com/vod",
    "group": "normal",
    "priority": 1
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `name` | string | 是 | 显示名称 |
| `baseUrl` | string | 是 | API 地址 |
| `group` | string | 否 | 分组：`normal` 或 `premium` |
| `priority` | number | 否 | 优先级（数字越小越优先） |
| `enabled` | boolean | 否 | 是否启用 |
| `headers` | object | 否 | 自定义请求头 |

> **订阅源 vs 视频源**：订阅源是包含多个源的 JSON 文件链接，在「订阅管理」添加；单个 API 接口地址请在「自定义源」中添加。

## 更新方法

### Docker

```bash
docker stop kcine && docker rm kcine
docker pull vespeng/kcine:latest
docker run -d -p 3000:3000 --name kcine vespeng/kcine:latest
```

### Node.js

```bash
git pull origin main
npm install && npm run build && npm start
```

### Vercel / Cloudflare

本地重新构建并上传

## 常见问题

**Q: Cloudflare Pages 部署后 404？**
A: 请确保上传的是 `.vercel/output/static` 目录，而非仓库根目录或 `.next` 目录。

**Q: IPTV 无法播放？**
A: 托管部署（Vercel/Cloudflare）默认禁用 IPTV 中继，需使用 Docker 或 Node.js 自托管。

**Q: CCTV 等频道只有声音？**
A: 部分 HEVC 编码流兼容性问题，建议使用 Chrome/Edge 浏览器，v4.5.0+ 已自动检测并优先选择 H.264。

**Q: 移动端浏览器无法播放？**
A: 部分内置浏览器不支持 MSE/HLS.js，建议使用 Chrome、Safari、Firefox 等主流浏览器。

## 技术栈

- **Next.js 16** + **React 19** + **TypeScript 5** + **Tailwind CSS 4**
- **Zustand** 状态管理、**hls.js** 播放引擎、**Lucide** 图标库

## 许可证

[MIT License](LICENSE)
