import { X } from "lucide-react";

export default function ServicoFormModal({
  styles,
  modalAberto,
  fecharModal,
  servicoEmEdicao,
  salvarServico,
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
          <h2>{servicoEmEdicao ? "Editar Serviço" : "Novo Serviço"}</h2>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <form className={styles.formulario} onSubmit={salvarServico}>
          {erro && <p className={styles.mensagemErroModal}>{erro}</p>}

          <label htmlFor="nome" className={styles.campo}>
            Descrição
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

          <label htmlFor="preco" className={styles.campo}>
            Preço
            <input
              id="preco"
              name="preco"
              type="text"
              value={formulario.preco}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="duracao" className={styles.campo}>
            Duração
            <input
              id="duracao"
              name="duracao"
              type="number"
              value={formulario.duracao}
              onChange={atualizarCampo}
              min="1"
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
              : servicoEmEdicao
                ? "Atualizar"
                : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
