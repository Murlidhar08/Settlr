import { getUserSession } from "./auth/auth";
import { Currency, ThemeMode } from "./generated/prisma/enums";

export const getUserConfig = async () => {
  const session = await getUserSession()
  if (!session?.session?.userSettings)
    return getDefaultConfig();

  return session.session.userSettings;
};

export function getDefaultConfig() {
  return {
    currency: Currency.INR,
    locale: "en-IN",
    dateFormat: "dd MMM, yyyy",
    timeFormat: "hh:mm a",
    language: "en",
    theme: ThemeMode.LIGHT,
    defAccId: null as string | null,
    defIncomeAccId: null as string | null,
    defExpenseAccId: null as string | null,
  }
}
