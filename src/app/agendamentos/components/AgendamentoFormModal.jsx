import { X } from "lucide-react";

export default function AgendamentoFormModal({
  styles,
  modalAberto,
  fecharModal,
  agendamentoEmEdicao,
  salvarAgendamento,
  erro,
  formulario,
  atualizarCampo,
  carregandoClientes,
  clientes,
  carregandoPets,
  pets,
  carregandoServicos,
  servicos,
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
          <h2>
            {agendamentoEmEdicao ? "Editar Agendamento" : "Novo Agendamento"}
          </h2>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <form className={styles.formulario} onSubmit={salvarAgendamento}>
          {erro && <p className={styles.mensagemErroModal}>{erro}</p>}

          <label htmlFor="clienteId" className={styles.campo}>
            Cliente
            <select
              id="clienteId"
              name="clienteId"
              value={formulario.clienteId}
              onChange={atualizarCampo}
              required
              disabled={carregandoClientes}
              autoFocus
            >
              <option value="">
                {carregandoClientes
                  ? "Carregando clientes..."
                  : "Selecione o cliente"}
              </option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="petId" className={styles.campo}>
            Pet
            <select
              id="petId"
              name="petId"
              value={formulario.petId}
              onChange={atualizarCampo}
              required
              disabled={carregandoPets || !formulario.clienteId}
            >
              <option value="">
                {!formulario.clienteId
                  ? "Selecione um cliente primeiro"
                  : carregandoPets
                    ? "Carregando pets..."
                    : "Selecione o pet"}
              </option>
              {pets
                .filter(
                  (pet) =>
                    String(pet.clienteId) === String(formulario.clienteId),
                )
                .map((pet) => (
                  <option key={pet.id} value={pet.id}>
                    {pet.nome}
                  </option>
                ))}
            </select>
          </label>

          <label htmlFor="servico" className={styles.campo}>
            Serviço
            <select
              id="servico"
              name="servico"
              value={formulario.servico}
              onChange={atualizarCampo}
              required
              disabled={carregandoServicos}
            >
              <option value="">
                {carregandoServicos
                  ? "Carregando serviços..."
                  : "Selecione o serviço"}
              </option>
              {servicos.map((servico) => (
                <option key={servico.id || servico.nome} value={servico.nome}>
                  {servico.nome}
                </option>
              ))}
            </select>
          </label>

          <label htmlFor="data" className={styles.campo}>
            Data
            <input
              id="data"
              name="data"
              type="date"
              value={formulario.data}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="hora" className={styles.campo}>
            Hora
            <input
              id="hora"
              name="hora"
              type="time"
              value={formulario.hora}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="status" className={styles.campo}>
            Status
            <select
              id="status"
              name="status"
              value={formulario.status}
              onChange={atualizarCampo}
              required
            >
              <option value="Agendado">Agendado</option>
              <option value="Concluído">Concluído</option>
              <option value="Cancelado">Cancelado</option>
            </select>
          </label>

          <button
            type="submit"
            className={styles.botaoSalvar}
            disabled={salvando}
          >
            {salvando
              ? "Salvando..."
              : agendamentoEmEdicao
                ? "Atualizar"
                : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
