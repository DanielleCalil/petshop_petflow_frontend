import { Pencil, Trash2 } from "lucide-react";
import { formatarMoeda } from "../utils/produtos";

export default function ProdutosTable({
  styles,
  carregando,
  produtos,
  excluindoId,
  onEditar,
  onExcluir,
}) {
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Categoria</th>
            <th>Preço</th>
            <th>Estoque</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {carregando ? (
            <tr>
              <td colSpan="5" className={styles.estadoTabela}>
                Carregando produtos...
              </td>
            </tr>
          ) : produtos.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.estadoTabela}>
                Nenhum produto encontrado.
              </td>
            </tr>
          ) : (
            produtos.map((produto) => (
              <tr key={produto.id ?? `${produto.nome}-${produto.preco}`}>
                <td>{produto.nome}</td>
                <td>{produto.categoria}</td>
                <td>{formatarMoeda(produto.preco)}</td>
                <td>{produto.estoque}</td>
                <td>
                  <div className={styles.acoesLinha}>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                      onClick={() => onEditar(produto)}
                      aria-label={`Editar produto ${produto.nome}`}
                    >
                      <Pencil size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                      onClick={() => onExcluir(produto)}
                      disabled={excluindoId === produto.id}
                      aria-label={`Excluir produto ${produto.nome}`}
                    >
                      <Trash2 size={16} />
                      <span>
                        {excluindoId === produto.id
                          ? "Excluindo..."
                          : "Excluir"}
                      </span>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
