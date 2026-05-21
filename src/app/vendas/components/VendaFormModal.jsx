import { Plus, Trash2, X } from "lucide-react";
import { formatarMoeda } from "../utils/vendas";

export default function VendaFormModal({
  styles,
  modalAberto,
  fecharModal,
  vendaEmEdicao,
  salvarVenda,
  erro,
  formulario,
  atualizarCampo,
  clientes,
  produtos,
  atualizarCampoProduto,
  removerProduto,
  adicionarProduto,
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
          <h2>{vendaEmEdicao ? "Editar Venda" : "Nova Venda"}</h2>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <form className={styles.formulario} onSubmit={salvarVenda}>
          {erro && <p className={styles.mensagemErroModal}>{erro}</p>}
          <label
            htmlFor="cliente"
            className={`${styles.campo} ${styles.campoSemMargem}`}
          >
            Cliente
            <select
              id="cliente"
              name="cliente"
              value={formulario.cliente}
              onChange={atualizarCampo}
              required
              autoFocus
              className={styles.inputPersonalizado}
            >
              <option value="">Selecione um cliente</option>
              {clientes.map((c) => (
                <option key={c.id || c.nome} value={c.nome}>
                  {c.nome}
                </option>
              ))}
            </select>
          </label>

          <div className={styles.listaProdutos}>
            {formulario.produtos.map((p, index) => (
              <div key={p.idTemporario} className={styles.linhaProduto}>
                <label className={`${styles.campo} ${styles.campoFlex3}`}>
                  {index === 0 && (
                    <span className={styles.labelInterna}>Produto</span>
                  )}
                  <select
                    value={p.produto}
                    onChange={(e) =>
                      atualizarCampoProduto(
                        p.idTemporario,
                        "produto",
                        e.target.value,
                      )
                    }
                    required
                    className={styles.inputPersonalizado}
                  >
                    <option value="">Selecione</option>
                    {produtos.map((prod) => (
                      <option key={prod.id || prod.nome} value={prod.nome}>
                        {prod.nome}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={`${styles.campo} ${styles.campoFlex1}`}>
                  {index === 0 && (
                    <span className={styles.labelInterna}>Qtd</span>
                  )}
                  <input
                    type="number"
                    min="1"
                    value={p.quantidade}
                    onChange={(e) =>
                      atualizarCampoProduto(
                        p.idTemporario,
                        "quantidade",
                        e.target.value,
                      )
                    }
                    required
                    className={styles.inputPersonalizado}
                  />
                </label>

                <label className={`${styles.campo} ${styles.campoFlex15}`}>
                  {index === 0 && (
                    <span className={styles.labelInterna}>Subtotal</span>
                  )}
                  <input
                    type="text"
                    value={p.subtotal}
                    readOnly
                    className={styles.inputPersonalizado}
                  />
                </label>

                <button
                  type="button"
                  onClick={() => removerProduto(p.idTemporario)}
                  className={styles.botaoRemoverLinha}
                  aria-label="Remover produto"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={adicionarProduto}
              className={styles.botaoAdicionarProduto}
            >
              <Plus size={20} />
              Adicionar Produto
            </button>
          </div>

          <div className={styles.bannerTotal}>
            <span className={styles.textoTotalLabel}>Total da Venda</span>
            <span className={styles.textoTotalValor}>
              {formatarMoeda(formulario.totalVenda)}
            </span>
          </div>

          <button
            type="submit"
            className={`${styles.botaoSalvar} ${styles.botaoSalvarArredondado}`}
            disabled={salvando}
          >
            {salvando ? "Salvando..." : vendaEmEdicao ? "Atualizar" : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
