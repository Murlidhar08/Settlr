import { getOrGenerateSetupToken, isSetupRequired } from "@/lib/setup";
import { redirect } from "next/navigation";
import SetupForm from "./components/setup-form";

export const dynamic = "force-dynamic";

export default async function SetupPage() {
  const setupNeeded = await isSetupRequired();
  if (!setupNeeded) {
    redirect("/login");
  }

  return <SetupForm />;
}
