"use server";

import { signIn, signOut } from "@/auth";

export async function signInKakao() {
  await signIn("kakao", { redirectTo: "/" });
}

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}
