"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";
import styles from "./AiParser.module.css";

const EXAMPLE_INPUT = "당근마켓 같은 거 만들고 싶어요";
const EXAMPLE_OUTPUT = `정리된 요구사항
─────────────────
• 회원   카카오 로그인 / 프로필
• 채팅   1:1 실시간 메시지
• 위치   동네 인증 · 지역 기반 노출
• 결제   안전결제(에스크로) 연동

추천 범위: 풀MVP (~4주)`;

type Status = "idle" | "loading" | "error";

function TerminalFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.terminal}>
      <div className={styles.bar}>
        <span className={`${styles.dot} ${styles.red}`} />
        <span className={`${styles.dot} ${styles.yellow}`} />
        <span className={`${styles.dot} ${styles.green}`} />
        <span className={styles.barLabel}>idea → spec</span>
      </div>
      {children}
    </div>
  );
}

function GatePreview() {
  return (
    <div className={styles.gate}>
      <span className="seclabel">
        <span className="dot" />
        AI 요구사항 정리기 · 예시 미리보기
      </span>
      <p className={styles.gateLead}>
        막연한 한 줄을 적으면, 필요한 기능과 범위를 정리해 드려요. 아래는 실제 출력 모습입니다.
      </p>

      <TerminalFrame>
        <pre className={styles.pre}>
          <span className={styles.prompt}>$ </span>
          {EXAMPLE_INPUT}
          {"\n\n"}
          {EXAMPLE_OUTPUT}
        </pre>
      </TerminalFrame>

      <button
        className={styles.kakao}
        type="button"
        onClick={() => signIn("kakao")}
      >
        카카오로 로그인하고 내 아이디어 정리하기
      </button>
    </div>
  );
}

function Editor() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const loading = status === "loading";

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!input.trim() || loading) return;
    setStatus("loading");
    setOutput("");

    try {
      const res = await fetch("/api/ai-parse", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ input }),
      });

      if (!res.ok || !res.body) {
        setStatus("error");
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        setOutput((prev) => prev + decoder.decode(value, { stream: true }));
      }
      setStatus("idle");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className={styles.editor}>
      <span className="seclabel">
        <span className="dot" />
        AI 요구사항 정리기
      </span>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label className={styles.label} htmlFor="aiInput">
          만들고 싶은 걸 편하게 적어주세요
        </label>
        <textarea
          id="aiInput"
          className={styles.textarea}
          rows={3}
          placeholder="예: 당근마켓 같은 동네 중고거래 앱이요"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className={styles.submit}
          type="submit"
          disabled={loading || !input.trim()}
        >
          {loading ? "정리하는 중…" : "정리하기"}
        </button>
      </form>

      {(output || loading) && (
        <TerminalFrame>
          <pre className={styles.pre} aria-live="polite">
            {output}
            {loading && <span className={styles.cursor} aria-hidden="true">▋</span>}
          </pre>
        </TerminalFrame>
      )}

      {status === "error" && (
        <p className={styles.error} role="alert">
          정리에 실패했어요. 잠시 후 다시 시도해 주세요.
        </p>
      )}
    </div>
  );
}

export function AiParser() {
  const { status } = useSession();

  if (status === "authenticated") {
    return <Editor />;
  }

  return <GatePreview />;
}
