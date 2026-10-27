// Lib
import { envServer } from "@/lib/env.server";

// Components
import LoginForm from "./components/login-form";

export default function LoginPage() {
  const providers = {
    google: !!(envServer.GOOGLE_CLIENT_ID && envServer.GOOGLE_CLIENT_SECRET),
    discord: !!(envServer.DISCORD_CLIENT_ID && envServer.DISCORD_CLIENT_SECRET),
    facebook: !!(envServer.FACEBOOK_CLIENT_ID && envServer.FACEBOOK_CLIENT_SECRET),
  };

  return <LoginForm providers={providers} />;
}
