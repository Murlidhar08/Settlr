import { getServerSession } from "./auth/auth";
import { DEFAULT_USER_SETTINGS } from "./config/constants";

export const getUserConfig = async () => {
  const session = await getServerSession();
  if (!session?.session?.userSettings) {
    return getDefaultConfig();
  }

  return session.session.userSettings;
};

export function getDefaultConfig() {
  return {
    currency: DEFAULT_USER_SETTINGS.currency,
    locale: DEFAULT_USER_SETTINGS.locale,
    dateFormat: DEFAULT_USER_SETTINGS.dateFormat,
    timeFormat: DEFAULT_USER_SETTINGS.timeFormat,
    language: DEFAULT_USER_SETTINGS.language,
    theme: DEFAULT_USER_SETTINGS.theme,
    debug: DEFAULT_USER_SETTINGS.debug,
    defAccId: null as string | null,
    defIncomeAccId: null as string | null,
    defExpenseAccId: null as string | null,
  };
}
