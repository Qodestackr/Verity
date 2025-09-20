import { create } from "zustand";
import { useCurrency } from "@/hooks/useCurrency";
import type { OrgSettings, UserSettings } from "@/types/app-settings";

interface SettingsStore {
  orgSettings: OrgSettings | null;
  userSettings: UserSettings | null;
  setOrgSettings: (s: OrgSettings) => void;
  setUserSettings: (s: UserSettings) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  orgSettings: null,
  userSettings: null,
  setOrgSettings: (s) => set({ orgSettings: s }),
  setUserSettings: (s) => set({ userSettings: s }),
}));
