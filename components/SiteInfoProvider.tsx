'use client';

import { createContext, useContext } from 'react';

export interface SiteInfo {
  name: string;
  description: string;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  name: 'KCine',
  description: '视频聚合平台',
};

const SiteInfoContext = createContext<SiteInfo>(DEFAULT_SITE_INFO);

export function SiteInfoProvider({
  children,
  name,
  description,
}: {
  children: React.ReactNode;
  name: string;
  description: string;
}) {
  return (
    <SiteInfoContext.Provider value={{ name, description }}>
      {children}
    </SiteInfoContext.Provider>
  );
}

export function useSiteInfo(): SiteInfo {
  return useContext(SiteInfoContext);
}
