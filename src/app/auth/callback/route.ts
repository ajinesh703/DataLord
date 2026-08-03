import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import prisma from "@/lib/prisma";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") || "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError && data?.session?.user) {
      const user = data.session.user;
      const email = user.email!;
      
      const emailPrefix = email.split("@")[0];
      const fullName = user.user_metadata?.full_name || emailPrefix;
      const baseUsername = slugify(emailPrefix, { lower: true, strict: true });
      const username = `${baseUsername}-${Math.floor(Math.random() * 10000)}`;
      const avatarUrl = user.user_metadata?.avatar_url || null;

      try {
        await prisma.user.upsert({
          where: { id: user.id },
          update: {
            email,
            name: fullName,
            avatarUrl,
          },
          create: {
            id: user.id,
            email,
            name: fullName,
            username,
            avatarUrl,
          },
        });
      } catch (prismaError) {
        console.error("Error syncing user to database:", prismaError);
        // Continue anyway since auth succeeded
      }

      return NextResponse.redirect(new URL(next, request.url));
    } else {
      console.error("Error exchanging code:", exchangeError);
      return NextResponse.redirect(
        new URL(`/auth/login?error=Could not authenticate`, request.url)
      );
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(new URL("/auth/login?error=Invalid link", request.url));
}
