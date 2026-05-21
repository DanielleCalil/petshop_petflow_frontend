import { Pencil, Trash2 } from "lucide-react";

export default function ClientesTable({
  styles,
  carregando,
  clientes,
  excluindoId,
  clienteEstaVinculado,
  onEditar,
  onExcluir,
}) {
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Telefone</th>
            <th>Email</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {carregando ? (
            <tr>
              <td colSpan="5" className={styles.estadoTabela}>
                Carregando clientes...
              </td>
            </tr>
          ) : clientes.length === 0 ? (
            <tr>
              <td colSpan="5" className={styles.estadoTabela}>
                Nenhum cliente encontrado.
              </td>
            </tr>
          ) : (
            clientes.map((cliente) => (
              <tr key={cliente.id ?? `${cliente.nome}-${cliente.email}`}>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.email}</td>
                <td>
                  <div className={styles.acoesLinha}>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                      onClick={() => onEditar(cliente)}
                      aria-label={`Editar cliente ${cliente.nome}`}
                    >
                      <Pencil size={16} />
                      <span>Editar</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                      onClick={() => onExcluir(cliente)}
                      disabled={
                        excluindoId === cliente.id ||
                        clienteEstaVinculado(cliente)
                      }
                      aria-label={`Excluir cliente ${cliente.nome}`}
                      title={
                        clienteEstaVinculado(cliente)
                          ? "Cliente possui vinculo e nao pode ser excluido"
                          : ""
                      }
                    >
                      <Trash2 size={16} />
                      <span>
                        {clienteEstaVinculado(cliente)
                          ? "Vinculado"
                          : excluindoId === cliente.id
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
