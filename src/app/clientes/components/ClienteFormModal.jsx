import { X } from "lucide-react";

export default function ClienteFormModal({
  styles,
  modalAberto,
  fecharModal,
  clienteEmEdicao,
  salvarCliente,
  erro,
  formulario,
  atualizarCampo,
  salvando,
}) {
  if (!modalAberto) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={fecharModal}>
      <section
        className={styles.modal}
        onClick={(evento) => evento.stopPropagation()}
        aria-modal="true"
        role="dialog"
      >
        <div className={styles.modalHeader}>
          <h2>{clienteEmEdicao ? "Editar Cliente" : "Novo Cliente"}</h2>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <form className={styles.formulario} onSubmit={salvarCliente}>
          {erro && <p className={styles.mensagemErroModal}>{erro}</p>}

          <label htmlFor="nome" className={styles.campo}>
            Nome
            <input
              id="nome"
              name="nome"
              type="text"
              value={formulario.nome}
              onChange={atualizarCampo}
              required
              autoFocus
            />
          </label>

          <label htmlFor="cpf" className={styles.campo}>
            CPF
            <input
              id="cpf"
              name="cpf"
              type="text"
              inputMode="numeric"
              maxLength={14}
              placeholder="000.000.000-00"
              value={formulario.cpf}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="telefone" className={styles.campo}>
            Telefone
            <input
              id="telefone"
              name="telefone"
              type="text"
              inputMode="tel"
              maxLength={15}
              placeholder="(00) 00000-0000"
              value={formulario.telefone}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="email" className={styles.campo}>
            Email
            <input
              id="email"
              name="email"
              type="email"
              value={formulario.email}
              onChange={atualizarCampo}
              required
            />
          </label>

          <button
            type="submit"
            className={styles.botaoSalvar}
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : clienteEmEdicao
                ? "Atualizar"
                : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
