import { Pencil, Trash2 } from "lucide-react";
import { formatarDataParaBR } from "../utils/agendamentos";

function obterClasseStatus(status, styles) {
  switch (status) {
    case "Concluído":
      return styles.statusConcluido;
    case "Agendado":
      return styles.statusAgendado;
    case "Cancelado":
      return styles.statusCancelado;
    default:
      return "";
  }
}

export default function AgendamentosTable({
  styles,
  carregando,
  agendamentos,
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
            <th>Pet</th>
            <th>Serviço</th>
            <th>Data</th>
            <th>Hora</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {carregando ? (
            <tr>
              <td colSpan="7" className={styles.estadoTabela}>
                Carregando agendamentos...
              </td>
            </tr>
          ) : agendamentos.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.estadoTabela}>
                Nenhum agendamento encontrado.
              </td>
            </tr>
          ) : (
            agendamentos.map((agendamento) => (
              <tr
                key={
                  agendamento.id ??
                  `${agendamento.cliente}-${agendamento.servico}`
                }
              >
                <td>{agendamento.cliente}</td>
                <td>{agendamento.pet}</td>
                <td>{agendamento.servico}</td>
                <td>{formatarDataParaBR(agendamento.data)}</td>
                <td>{agendamento.hora}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${obterClasseStatus(agendamento.status, styles)}`}
                  >
                    {agendamento.status}
                  </span>
                </td>
                <td>
                  <div className={styles.acoesLinha}>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                      onClick={() => onEditar(agendamento)}
                      aria-label={`Editar agendamento ${agendamento.cliente}`}
                    >
                      <Pencil size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                      onClick={() => onExcluir(agendamento)}
                      disabled={excluindoId === agendamento.id}
                      aria-label={`Excluir agendamento ${agendamento.cliente}`}
                    >
                      <Trash2 size={16} />
                      <span>
                        {excluindoId === agendamento.id
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
