/**
 * Site Configuration
 * Handles environment variables for site branding and customization
 */

export interface SiteConfig {
  title: string;
  description: string;
  name: string;
}

/**
 * Site configuration object
 * Uses environment variables with fallback to default values
 * Note: This module is for server-side use only (e.g., generateMetadata); clients should get site info via SiteInfoProvider
 */
export const siteConfig: SiteConfig = {
  title: process.env.SITE_TITLE || "KCine - 视频聚合平台",
  description: process.env.SITE_DESCRIPTION || "视频聚合平台",
  name: process.env.SITE_NAME || "KCine",
};
