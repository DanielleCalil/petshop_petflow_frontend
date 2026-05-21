import { Pencil, Trash2 } from "lucide-react";
import { formatarMoeda } from "../utils/servicos";

export default function ServicosTable({
  styles,
  carregando,
  servicos,
  excluindoId,
  onEditar,
  onExcluir,
}) {
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Preço</th>
            <th>Duração</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {carregando ? (
            <tr>
              <td colSpan="4" className={styles.estadoTabela}>
                Carregando serviços...
              </td>
            </tr>
          ) : servicos.length === 0 ? (
            <tr>
              <td colSpan="4" className={styles.estadoTabela}>
                Nenhum serviço encontrado.
              </td>
            </tr>
          ) : (
            servicos.map((servico) => (
              <tr key={servico.id ?? `${servico.nome}`}>
                <td>{servico.nome}</td>
                <td>{formatarMoeda(servico.preco)}</td>
                <td>{servico.duracao} min</td>
                <td>
                  <div className={styles.acoesLinha}>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                      onClick={() => onEditar(servico)}
                      aria-label={`Editar serviço ${servico.nome}`}
                    >
                      <Pencil size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                      onClick={() => onExcluir(servico)}
                      disabled={excluindoId === servico.id}
                      aria-label={`Excluir serviço ${servico.nome}`}
                    >
                      <Trash2 size={16} />
                      <span>
                        {excluindoId === servico.id
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
