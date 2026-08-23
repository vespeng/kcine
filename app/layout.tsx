import React from 'react';
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AutoSync } from '@/components/AutoSync'; // <-- importing the auto-sync component
import { SiteIconProvider } from '@/components/SiteIconProvider';
import { SiteInfoProvider } from '@/components/SiteInfoProvider';
import { TVProvider } from "@/lib/contexts/TVContext";
import { TVNavigationInitializer } from "@/components/TVNavigationInitializer";
import { Analytics } from "@vercel/analytics/react";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";
import { PasswordGate } from "@/components/PasswordGate";
import { siteConfig } from "@/lib/config/site-config";
import { AdKeywordsInjector } from "@/components/AdKeywordsInjector";
import { BackToTop } from "@/components/ui/BackToTop";
import { ScrollPositionManager } from "@/components/ScrollPositionManager";
import { LocaleProvider } from "@/components/LocaleProvider";
import { RuntimeFeaturesProvider } from "@/components/RuntimeFeaturesProvider";
import { shouldEnableVercelAnalytics } from '@/lib/config/deployment';
import { getRuntimeFeatures } from "@/lib/server/runtime-features";
import { resolveSiteIconSrc } from '@/lib/server/site-icon';
import fs from 'fs';
import path from 'path';

// Server Component specifically for reading env/file
function AdKeywordsWrapper() {
  let keywords: string[] = [];

  try {
    // 1. Try reading from file (Docker runtime support)
    const keywordsFile = process.env.AD_KEYWORDS_FILE;
    if (keywordsFile) {
      // Resolve absolute path or relative to CWD
      const filePath = path.isAbsolute(keywordsFile)
        ? keywordsFile
        : path.join(process.cwd(), keywordsFile);

      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        keywords = content.split(/[\n,]/).map((k: string) => k.trim()).filter((k: string) => k);
        console.log(`[AdFilter] Loaded ${keywords.length} keywords from file: ${filePath}`);
      } catch (fileError: unknown) {
        // Handle file not found (ENOENT) gracefully
        if ((fileError as NodeJS.ErrnoException).code !== 'ENOENT') {
          console.warn('[AdFilter] Error reading keywords file:', fileError);
        }
      }
    }

    // 2. Fallback to Env var (Runtime or Build time)
    if (keywords.length === 0) {
      const envKeywords = process.env.AD_KEYWORDS;
      if (envKeywords) {
        keywords = envKeywords.split(/[\n,]/).map((k: string) => k.trim()).filter((k: string) => k);
      }
    }
  } catch (error) {
    console.warn('[AdFilter] Failed to load keywords:', error);
  }

  return <AdKeywordsInjector keywords={keywords} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const siteIconSrc = await resolveSiteIconSrc();

  return {
    title: siteConfig.title,
    // description: siteConfig.description,
    icons: {
      icon: siteIconSrc,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const siteIconSrc = await resolveSiteIconSrc();
  const runtimeFeatures = getRuntimeFeatures();
  const vercelAnalyticsEnabled = shouldEnableVercelAnalytics();

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />
        {/* Apple PWA Support */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="KVideo" />
        <link rel="apple-touch-icon" href={siteIconSrc} />
        {/* Theme Color (for browser address bar) */}
        <meta name="theme-color" content="#000000" />
        {/* Mobile viewport */}
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning
      >
        <SiteIconProvider iconSrc={siteIconSrc}>
          <SiteInfoProvider name={siteConfig.name} description={siteConfig.description}>
          <ThemeProvider>
            <RuntimeFeaturesProvider initialFeatures={runtimeFeatures}>
              <LocaleProvider />

              <TVProvider>
                <TVNavigationInitializer />
                <PasswordGate hasAuth={!!(
                  process.env.ADMIN_PASSWORD ||
                  process.env.ACCOUNTS ||
                  process.env.ACCESS_PASSWORD ||
                  (
                    process.env.AUTH_SECRET &&
                    process.env.UPSTASH_REDIS_REST_URL &&
                    process.env.UPSTASH_REDIS_REST_TOKEN
                  )
                )}>
                  <AutoSync />
                  <AdKeywordsWrapper />
                  {children}
                  <BackToTop />
                  <ScrollPositionManager />
                </PasswordGate>
              </TVProvider>
              {vercelAnalyticsEnabled ? <Analytics /> : null}
              <ServiceWorkerRegister />
            </RuntimeFeaturesProvider>
          </ThemeProvider>
          </SiteInfoProvider>
        </SiteIconProvider>

        {/* ARIA Live Region for Screen Reader Announcements */}
        <div
          id="aria-live-announcer"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="sr-only"
        />

        {/* Google Cast SDK */}
        <script src="https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1" async />

        {/* Scroll Performance Optimization Script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                let scrollTimer;
                const body = document.body;
                
                function handleScroll() {
                  body.classList.add('scrolling');
                  clearTimeout(scrollTimer);
                  scrollTimer = setTimeout(function() {
                    body.classList.remove('scrolling');
                  }, 150);
                }
                
                let ticking = false;
                window.addEventListener('scroll', function() {
                  if (!ticking) {
                    window.requestAnimationFrame(function() {
                      handleScroll();
                      ticking = false;
                    });
                    ticking = true;
                  }
                }, { passive: true });
              })();
            `,
          }}
        />
      </body>
    </html>
  );
}
