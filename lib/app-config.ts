import { envServer } from "./env.server";
import { prisma } from "./prisma/prisma";

export async function getAppConfig() {
  try {
    let config = await prisma.appConfig.findUnique({
      where: { id: "singleton" }
    });

    if (!config) {
      // Create initial config from environment variables
      config = await prisma.appConfig.create({
        data: {
          id: "singleton",
          smtpHost: "",
          smtpPort: 587,
          smtpUser: "",
          smtpPass: "",
          smtpSecure: false,
          fromEmail: "",
          googleClientId: envServer.GOOGLE_CLIENT_ID,
          googleClientSecret: envServer.GOOGLE_CLIENT_SECRET,
          discordClientId: envServer.DISCORD_CLIENT_ID,
          discordClientSecret: envServer.DISCORD_CLIENT_SECRET
        }
      });
    }

    return config;
  } catch (error) {
    console.error("Error fetching app config:", error);
    // Fallback to environment variables if DB fails
    return {
      smtpHost: "",
      smtpPort: 587,
      smtpUser: "",
      smtpPass: "",
      smtpSecure: false,
      fromEmail: "",
      googleClientId: "",
      googleClientSecret: "",
      discordClientId: "",
      discordClientSecret: ""
    };
  }
}
