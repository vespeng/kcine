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
        <div className="bg-surface border border-border rounded-2xl shadow-card p-4 sm:p-6">
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
