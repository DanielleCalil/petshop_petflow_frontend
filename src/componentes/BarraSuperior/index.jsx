import styles from "./barra.module.css";
import Image from "next/image";

export default function BarraSuperior() {
  return (
    <header className={styles.header}>
      <span className={styles.titulo}>
        <span className={styles.pet}>Pet</span>
        <span className={styles.flow}>Flow</span>
      </span>
    </header>
  );
}
