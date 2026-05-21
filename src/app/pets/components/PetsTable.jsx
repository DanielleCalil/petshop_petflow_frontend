import { Pencil, Trash2 } from "lucide-react";

export default function PetsTable({
  styles,
  carregandoPets,
  pets,
  processandoAcaoId,
  petEstaVinculado,
  onEditar,
  onExcluir,
}) {
  return (
    <div className={styles.tabelaContainer}>
      <table className={styles.tabela}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Raca</th>
            <th>Peso (kg)</th>
            <th>Idade</th>
            <th>Dono</th>
            <th>Ações</th>
          </tr>
        </thead>

        <tbody>
          {carregandoPets ? (
            <tr>
              <td colSpan="7" className={styles.estadoTabela}>
                Carregando pets...
              </td>
            </tr>
          ) : pets.length === 0 ? (
            <tr>
              <td colSpan="7" className={styles.estadoTabela}>
                Nenhum pet encontrado.
              </td>
            </tr>
          ) : (
            pets.map((pet) => (
              <tr key={pet.id ?? `${pet.nome}-${pet.clienteId}`}>
                <td>{pet.nome}</td>
                <td>{pet.tipo}</td>
                <td>{pet.raca}</td>
                <td>{pet.peso}</td>
                <td>{pet.idade}</td>
                <td>{pet.dono}</td>
                <td>
                  <div className={styles.acoesTabela}>
                    <button
                      type="button"
                      className={styles.botaoAcaoEditar}
                      onClick={() => onEditar(pet)}
                      disabled={processandoAcaoId === String(pet.id)}
                      aria-label={`Editar pet ${pet.nome}`}
                    >
                      <Pencil size={16} />
                      <span>Editar</span>
                    </button>

                    <button
                      type="button"
                      className={styles.botaoAcaoExcluir}
                      onClick={() => onExcluir(pet)}
                      disabled={
                        processandoAcaoId === String(pet.id) ||
                        petEstaVinculado(pet)
                      }
                      aria-label={`Excluir pet ${pet.nome}`}
                      title={
                        petEstaVinculado(pet)
                          ? "Pet possui vinculo e nao pode ser excluido"
                          : ""
                      }
                    >
                      <Trash2 size={16} />
                      <span>
                        {petEstaVinculado(pet)
                          ? "Vinculado"
                          : processandoAcaoId === String(pet.id)
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
