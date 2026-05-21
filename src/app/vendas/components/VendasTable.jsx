import { Pencil, Trash2 } from "lucide-react";
import { formatarData, formatarMoeda } from "../utils/vendas";

export default function VendasTable({
  styles,
  carregando,
  vendas,
  excluindoId,
  onEditar,
  onExcluir,
}) {
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Data</th>
            <th>Itens</th>
            <th>Valor Total</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {carregando ? (
            <tr>
              <td colSpan="5" className={styles.estadoTabela}>
                Carregando vendas...
              </td>
            </tr>
          ) : vendas.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.estadoTabela}>
                Nenhuma venda encontrada.
              </td>
            </tr>
          ) : (
            vendas.map((venda) => (
              <tr key={venda.id ?? `${venda.cliente}-${venda.totalVenda}`}>
                <td>{venda.cliente}</td>
                <td>{formatarData(venda.data)}</td>
                <td>{venda.qtd_itens || 0}</td>
                <td>{formatarMoeda(venda.totalVenda)}</td>
                <td>
                  <div className={styles.acoesLinha}>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                      onClick={() => onEditar(venda)}
                      aria-label={`Editar venda de ${venda.cliente}`}
                    >
                      <Pencil size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                      onClick={() => onExcluir(venda)}
                      disabled={excluindoId === venda.id}
                      aria-label={`Excluir venda de ${venda.cliente}`}
                    >
                      <Trash2 size={16} />
                      <span>
                        {excluindoId === venda.id ? "Excluindo..." : "Excluir"}
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
