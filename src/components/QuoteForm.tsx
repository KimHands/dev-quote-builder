"use client";

import { useState } from "react";
import type { Selections } from "@/lib/quote/types";
import styles from "./QuoteForm.module.css";

type Props = {
  selections: Selections;
};

type ContactChannel = "kakao" | "phone" | "email";
type Status = "idle" | "submitting" | "success" | "error";

const CHANNEL_OPTIONS: { value: ContactChannel; label: string }[] = [
  { value: "kakao", label: "카카오톡" },
  { value: "phone", label: "전화" },
  { value: "email", label: "이메일" },
];

export function QuoteForm({ selections }: Props) {
  const [contactName, setContactName] = useState("");
  const [contactValue, setContactValue] = useState("");
  const [contactChannel, setContactChannel] = useState<ContactChannel>("kakao");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [shareId, setShareId] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          selections,
          contactName,
          contactValue,
          contactChannel,
          message,
        }),
      });

      if (!res.ok) {
        setStatus("error");
        return;
      }

      const data = await res.json();
      setShareId(data.shareId);
      setStatus("success");
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className={styles.success} role="status">
        <span className={styles.seclabel}>접수 완료</span>
        <p className={styles.successMsg}>접수됐습니다. 곧 연락드리겠습니다.</p>
        <a className={styles.shareLink} href={`/q/${shareId}`}>
          내 견적 보기 — /q/{shareId}
        </a>
      </div>
    );
  }

  const submitting = status === "submitting";

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <span className={styles.seclabel}>상담 문의</span>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contactName">
          이름
        </label>
        <input
          id="contactName"
          className={styles.input}
          type="text"
          required
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contactValue">
          연락처
        </label>
        <input
          id="contactValue"
          className={styles.input}
          type="text"
          required
          value={contactValue}
          onChange={(e) => setContactValue(e.target.value)}
        />
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="contactChannel">
          연락 채널
        </label>
        <select
          id="contactChannel"
          className={styles.input}
          value={contactChannel}
          onChange={(e) => setContactChannel(e.target.value as ContactChannel)}
        >
          {CHANNEL_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="message">
          메모
        </label>
        <textarea
          id="message"
          className={styles.textarea}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {status === "error" && (
        <p className={styles.error} role="alert">
          전송에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}

      <button className={styles.submit} type="submit" disabled={submitting}>
        {submitting ? "보내는 중…" : "견적 문의 보내기"}
      </button>
    </form>
  );
}
