"use client";

import { useEffect } from "react";
import type { OrgSettings, UserSettings } from "@/types/app-settings";
import { defaultOrgSettings, defaultUserSettings } from "@/lib/app-settings/default";
import { useSettingsStore } from "@/stores/app-settings-store";

export function HydrateSettings({
    orgSettings,
    userSettings,
    children,
}: {
    orgSettings: Partial<OrgSettings>;
    userSettings: Partial<UserSettings>;
    children: React.ReactNode;
}) {
    const { setOrgSettings, setUserSettings } = useSettingsStore();

    useEffect(() => {
        setOrgSettings({ ...defaultOrgSettings, ...orgSettings });
        setUserSettings({ ...defaultUserSettings, ...userSettings });
    }, [orgSettings, userSettings, setOrgSettings, setUserSettings]);

    return <>{children}</>;
}