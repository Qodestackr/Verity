
import { useSettingsStore } from "@/stores/app-settings-store";
import { OrgSettings, UserSettings } from "@/types/app-settings";

export const useSettings = () => {
  const { orgSettings, userSettings } = useSettingsStore();

  if (!orgSettings || !userSettings) return null;

  const mergedSettings: OrgSettings = {
    ...orgSettings,
    ...userSettings.overrides,
    posMode: orgSettings.posMode ?? userSettings.defaultPOSMode,
  };

  return {
    orgSettings,
    userSettings,
    mergedSettings,
  };
};

type FullOrgResponse = {
  organization: {
    id: string;
    name: string;
    settings: OrgSettings;
  };
  user: {
    id: string;
    email: string;
    settings: UserSettings;
  };
};
