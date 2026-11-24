import { envServer } from "@/lib/env.server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const error = searchParams.get("error");
    let errorUrl = new URL("/error", envServer.BETTER_AUTH_URL);

    if (error === "banned") {
        errorUrl = new URL("/banned", envServer.BETTER_AUTH_URL);
        errorUrl.searchParams.set("reason", "You are banned from using this service.");
    } else if (error) {
        errorUrl.searchParams.set("title", "Authentication Error");
        const formattedError = error
            .replace(/[_-]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());
        errorUrl.searchParams.set("description", formattedError);
    }

    return NextResponse.redirect(errorUrl);
}
