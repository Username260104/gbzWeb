import styles from './page.module.css';

/**
 * 루트 페이지 — 랜딩 (추후 이벤트 목록으로 교체 예정)
 */
export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <div className={styles.logoMark}>🏃</div>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>GBZ</span>
          <br />
          Running Crew
        </h1>
        <p className={styles.subtitle}>
          함께 달리는 즐거움, GBZ와 함께하세요
        </p>
      </div>
    </main>
  );
}
