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
        <div className="bg-surface backdrop-blur-glass border border-border rounded-2xl shadow-overlay p-5 mb-4 transition-all duration-400 ease-fluid hover:-translate-y-1 hover:scale-102 hover:shadow-card-hover hover:z-10">
            <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-text">{title}</h2>
                {headerAction && <div className="flex gap-2 flex-wrap">{headerAction}</div>}
            </div>
            {description && (
                <p className="text-sm text-text-secondary mb-4 leading-relaxed">
                    {description}
                </p>
            )}
            {children}
        </div>
    );
}
