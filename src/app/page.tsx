import { Configurator } from "@/components/Configurator";
import { AiParser } from "@/components/AiParser";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <span className="seclabel">
          <span className="dot" />
          개발 외주 견적
        </span>
        <h1 className={styles.title}>개발 외주, 예상 견적을 바로 확인하세요</h1>
        <p className={styles.lead}>
          몇 가지만 고르면 비슷한 작업의 예상 예산대를 즉시 보여드립니다.
          AI로 빠르게 만들고, 보안을 전공한 개발자가 직접 검수합니다.
        </p>
        <p className={styles.sub}>
          금액보다 <strong>포함 범위</strong>를 먼저 보여드려요. 정확한 견적은
          20분 상담 후 함께 확정합니다.
        </p>
      </section>

      <Configurator />

      <section className={styles.aiSection}>
        <AiParser />
      </section>
    </main>
  );
}
