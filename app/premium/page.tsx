'use client';

import { Suspense } from 'react';
import { SearchPageLayout } from '@/components/layout/SearchPageLayout';
import { usePremiumHomePage } from '@/lib/hooks/usePremiumHomePage';
import { PremiumContent } from '@/components/premium/PremiumContent';
import { PremiumPasswordGate } from '@/components/PremiumPasswordGate';
import { usePremiumTheme } from '@/lib/hooks/usePremiumTheme';

function PremiumHomePage() {
    const {
        query,
        hasSearched,
        loading,
        results,
        availableSources,
        completedSources,
        totalSources,
        handleSearch,
        handleReset,
        handleCancelSearch,
    } = usePremiumHomePage();

    return (
        <SearchPageLayout
            query={query}
            hasSearched={hasSearched}
            loading={loading}
            results={results}
            availableSources={availableSources}
            completedSources={completedSources}
            totalSources={totalSources}
            isPremium
            placeholder="输入关键词开始搜索..."
            onSearch={handleSearch}
            onReset={handleReset}
            onCancelSearch={handleCancelSearch}
            featured={<PremiumContent />}
        />
    );
}

export default function PremiumPage() {
    usePremiumTheme(true);
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent"></div>
            </div>
        }>
            <PremiumPasswordGate>
                <PremiumHomePage />
            </PremiumPasswordGate>
        </Suspense>
    );
}
