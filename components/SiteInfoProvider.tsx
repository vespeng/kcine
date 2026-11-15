'use client';

import { createContext, useContext } from 'react';

export interface SiteInfo {
  name: string;
}

const DEFAULT_SITE_INFO: SiteInfo = {
  name: 'KCine',
};

const SiteInfoContext = createContext<SiteInfo>(DEFAULT_SITE_INFO);

export function SiteInfoProvider({
  children,
  name,
}: {
  children: React.ReactNode;
  name: string;
}) {
  return (
    <SiteInfoContext.Provider value={{ name }}>
      {children}
    </SiteInfoContext.Provider>
  );
}

export function useSiteInfo(): SiteInfo {
  return useContext(SiteInfoContext);
}
