import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((request) => {
  const user = request.auth?.user;
  const pathname = request.nextUrl.pathname;

  if (!user) {
    return NextResponse.redirect(
      new URL("/login", request.url)
    );
  }

  if (
    pathname.startsWith("/tenant") &&
    user.role !== "TENANT"
  ) {
    return NextResponse.redirect(
      new URL("/unauthorized", request.url)
    );
  }

  if (
    pathname.startsWith("/landlord") &&
    user.role !== "LANDLORD"
  ) {
    return NextResponse.redirect(
      new URL("/unauthorized", request.url)
    );
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/tenant/:path*",
    "/landlord/:path*",
  ],
};
