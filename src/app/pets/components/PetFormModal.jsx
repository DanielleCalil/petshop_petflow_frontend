import { X } from "lucide-react";

export default function PetFormModal({
  styles,
  modalAberto,
  petEmEdicao,
  fecharModal,
  salvarPet,
  erroModal,
  formulario,
  atualizarCampo,
  carregandoClientes,
  clientes,
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
          <h2>{petEmEdicao ? "Editar Pet" : "Novo Pet"}</h2>
          <button
            type="button"
            className={styles.botaoFechar}
            onClick={fecharModal}
            aria-label="Fechar modal"
          >
            <X size={24} />
          </button>
        </div>

        <form className={styles.formulario} onSubmit={salvarPet}>
          {erroModal && <p className={styles.mensagemErroModal}>{erroModal}</p>}

          <label htmlFor="nome" className={styles.campo}>
            Nome
            <input
              id="nome"
              name="nome"
              type="text"
              value={formulario?.nome ?? ""}
              onChange={atualizarCampo}
              required
              autoFocus
            />
          </label>

          <label htmlFor="tipo" className={styles.campo}>
            Tipo
            <input
              id="tipo"
              name="tipo"
              type="text"
              placeholder="Cachorro, Gato..."
              value={formulario?.tipo ?? ""}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="raca" className={styles.campo}>
            Raça
            <input
              id="raca"
              name="raca"
              type="text"
              placeholder="Labrador, Siamês..."
              value={formulario?.raca ?? ""}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="peso" className={styles.campo}>
            Peso (kg)
            <input
              id="peso"
              name="peso"
              type="number"
              min="0"
              step="0.1"
              placeholder="Ex.: 12.5"
              value={formulario?.peso ?? ""}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="idade" className={styles.campo}>
            Idade
            <input
              id="idade"
              name="idade"
              type="number"
              min="0"
              step="1"
              placeholder="Ex.: 3"
              value={formulario?.idade ?? ""}
              onChange={atualizarCampo}
              required
            />
          </label>

          <label htmlFor="clienteId" className={styles.campo}>
            Cliente
            <select
              id="clienteId"
              name="clienteId"
              value={formulario?.clienteId ?? ""}
              onChange={atualizarCampo}
              required
              disabled={carregandoClientes}
            >
              <option value="">
                {carregandoClientes
                  ? "Carregando clientes..."
                  : "Selecione o dono"}
              </option>
              {clientes.map((cliente) => (
                <option key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </option>
              ))}
            </select>
          </label>

          <button
            type="submit"
            className={styles.botaoSalvar}
            disabled={salvando}
          >
            {salvando
              ? petEmEdicao
                ? "Atualizando..."
                : "Salvando..."
              : petEmEdicao
                ? "Atualizar"
                : "Salvar"}
          </button>
        </form>
      </section>
    </div>
  );
}
