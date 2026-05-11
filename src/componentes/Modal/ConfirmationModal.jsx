"use client";

import styles from "./ConfirmationModal.module.css";

export default function ConfirmationModal({
  isOpen,
  titulo = "Confirmação",
  mensagem,
  textoBotaoOk = "OK",
  textoBotaoCancelar = "Cancelar",
  onConfirmar,
  onCancelar,
  carregando = false,
}) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal}>
        <div className={styles.container}>
          <h2 className={styles.titulo}>{titulo}</h2>
          <p className={styles.mensagem}>{mensagem}</p>

          <div className={styles.botoes}>
            <button
              className={styles.botaoCancelar}
              onClick={onCancelar}
              disabled={carregando}
            >
              {textoBotaoCancelar}
            </button>
            <button
              className={styles.botaoOk}
              onClick={onConfirmar}
              disabled={carregando}
            >
              {carregando ? "Processando..." : textoBotaoOk}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
