import { X } from "lucide-react";

export default function ProdutoFormModal({
  styles,
  modalAberto,
  fecharModal,
  produtoEmEdicao,
  salvarProduto,
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
          <h2>{produtoEmEdicao ? "Editar Produto" : "Novo Produto"}</h2>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <form className={styles.formulario} onSubmit={salvarProduto}>
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

          <label htmlFor="categoria" className={styles.campo}>
            Categoria
            <input
              id="categoria"
              name="categoria"
              type="text"
              value={formulario.categoria}
              onChange={atualizarCampo}
              required
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

          <label htmlFor="estoque" className={styles.campo}>
            Estoque
            <input
              id="estoque"
              name="estoque"
              type="number"
              value={formulario.estoque}
              onChange={atualizarCampo}
              min="0"
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
              : produtoEmEdicao
                ? "Atualizar"
                : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
