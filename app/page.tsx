import { isSetupRequired } from "@/lib/setup";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function Home() {
    // Check if setup is needed
    if (await isSetupRequired()) {
        redirect("/setup" as any);
    }

    // Always redirect to /welcome where users can view application details and proceed to login
    redirect("/welcome" as any);
}
