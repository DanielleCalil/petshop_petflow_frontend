import Link from "next/link";
import styles from "./not-found.module.css";

export default function NotFound() {
  return (
    <main className={styles.wrapper}>
      <section className={styles.card}>
        <p className={styles.code}>404</p>
        <h1 className={styles.title}>Página não encontrada</h1>
        <p className={styles.description}>
          A rota que você tentou acessar não existe ou foi movida.
        </p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primaryButton}>
            Ir para dashboard
          </Link>
          <Link href="/login" className={styles.secondaryButton}>
            Ir para login
          </Link>
        </div>
      </section>
    </main>
  );
}
