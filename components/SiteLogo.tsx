'use client';

import Image from 'next/image';
import { useSiteIcon } from '@/components/SiteIconProvider';
import { useSiteInfo } from '@/components/SiteInfoProvider';
import { useTheme } from '@/components/ThemeProvider';

const DEFAULT_LOGO_PATH = '/logo.svg';

/**
 * 站点 Logo：默认 logo 以内联 SVG 渲染，使播放三角的颜色跟随应用实际主题
 * （亮色=黑色、暗色=白色）；自定义站点图标则原样以 <img> 渲染。
 */
export function SiteLogo() {
    const siteIconSrc = useSiteIcon();
    const siteInfo = useSiteInfo();
    const { actualTheme } = useTheme();

    if (siteIconSrc !== DEFAULT_LOGO_PATH) {
        return (
            <Image
                src={siteIconSrc}
                alt={siteInfo.name}
                width={40}
                height={40}
                unoptimized
                className="object-contain"
            />
        );
    }

    const triangleColor = actualTheme === 'dark' ? '#ffffff' : '#000000';

    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 256 256"
            width="40"
            height="40"
            role="img"
            aria-label={siteInfo.name}
            className="w-full h-full"
        >
            <defs>
                <linearGradient id="topBand" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#7cc6ff" />
                    <stop offset="100%" stopColor="#1a86f2" />
                </linearGradient>
                <linearGradient id="bottomBand" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#1a86f2" />
                    <stop offset="100%" stopColor="#0066cc" />
                </linearGradient>
                <linearGradient id="tailGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0066cc" />
                    <stop offset="100%" stopColor="#004d99" />
                </linearGradient>
            </defs>

            {/* 上半丝带（Bing 折带风格，亮色层） */}
            <path
                d="M 66.3 201.5 A 96 96 0 1 1 189.7 201.5"
                fill="none"
                stroke="url(#topBand)"
                strokeWidth="36"
                strokeLinecap="round"
            />
            {/* 下半丝带（深色层，覆盖两端形成折痕） */}
            <path
                d="M 189.7 201.5 A 96 96 0 0 1 66.3 201.5"
                fill="none"
                stroke="url(#bottomBand)"
                strokeWidth="36"
                strokeLinecap="round"
            />
            {/* 朝右的圆角播放三角 */}
            <path
                d="M 98 86 L 180 128 L 98 170 Z"
                fill={triangleColor}
                stroke={triangleColor}
                strokeWidth="12"
                strokeLinejoin="round"
            />
        </svg>
    );
}
