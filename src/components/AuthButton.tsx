"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import styles from "./AuthButton.module.css";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "authenticated") {
    return (
      <span className={styles.wrap}>
        {session?.user?.name && <span className={styles.name}>{session.user.name}</span>}
        <button className={`${styles.pill} ${styles.ghost}`} onClick={() => signOut()}>
          로그아웃
        </button>
      </span>
    );
  }

  return (
    <button className={styles.pill} onClick={() => signIn("kakao")}>
      카카오로 로그인
    </button>
  );
}
