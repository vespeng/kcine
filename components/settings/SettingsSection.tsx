interface SettingsSectionProps {
    title: string;
    description?: string;
    children: React.ReactNode;
    headerAction?: React.ReactNode;
}

export function SettingsSection({
    title,
    description,
    children,
    headerAction,
}: SettingsSectionProps) {
    return (
        <div className="bg-[var(--glass-bg)] backdrop-filter backdrop-blur-[25px] border border-[var(--glass-border)] rounded-[var(--radius-2xl)] shadow-[var(--shadow-md)] p-5 mb-4 transition-all duration-[0.4s] cubic-bezier(0.2,0.8,0.2,1) hover:translate-y-[-5px] hover:scale-[1.02] hover:shadow-[0_8px_24px_var(--shadow-color)] hover:z-10">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-[var(--text-color)]">{title}</h2>
                {headerAction && <div className="flex gap-2 flex-wrap">{headerAction}</div>}
            </div>
            {description && (
                <p className="text-sm text-[var(--text-color-secondary)] mb-4 leading-[1.6]">
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}
