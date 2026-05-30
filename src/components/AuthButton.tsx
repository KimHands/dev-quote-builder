"use client";

import { useSession } from "next-auth/react";
import { signInKakao, signOutAction } from "@/app/auth-actions";
import styles from "./AuthButton.module.css";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return (
      <span className={styles.wrap}>
        {session?.user?.name && <span className={styles.name}>{session.user.name}</span>}
        <form action={signOutAction}>
          <button className={`${styles.pill} ${styles.ghost}`} type="submit">
            로그아웃
          </button>
        </form>
      </span>
    );
  }

  return (
    <form action={signInKakao}>
      <button className={styles.pill} type="submit">
        카카오로 로그인
      </button>
    </form>
  );
}
