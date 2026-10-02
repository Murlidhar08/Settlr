import zod from "zod";

const envClientSchema = zod.object({
  NEXT_PUBLIC_APP_NAME: zod.string().nonempty(),
  NEXT_PUBLIC_APP_DESCRIPTION: zod.string().nonempty(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: zod.string().optional(),
})

export const envClient = envClientSchema.parse({
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
  NEXT_PUBLIC_APP_DESCRIPTION: process.env.NEXT_PUBLIC_APP_DESCRIPTION,
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY,
})
