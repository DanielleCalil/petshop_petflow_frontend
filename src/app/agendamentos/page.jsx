"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import api from "../../services/api";
import styles from "./page.module.css";

const AGENDAMENTOS_ENDPOINT = "/agendamentos";
const CLIENTES_ENDPOINT = "/clientes";
const PETS_ENDPOINT = "/pets";

const estadoInicialFormulario = {
  clienteId: "",
  petId: "",
  servico: "",
  data: "",
  hora: "",
  status: "Agendado",
};

function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? cliente?.cli_id ?? cliente?.codigo ?? cliente?.cod ?? "",
    nome: cliente?.nome ?? cliente?.cli_nome ?? cliente?.nomeCliente ?? "",
  };
}

function normalizarPet(pet) {
  return {
    id: pet?.id ?? pet?.pet_id ?? pet?.codigo ?? pet?.cod ?? "",
    nome: pet?.nome ?? pet?.pet_nome ?? pet?.nomePet ?? "",
    clienteId: pet?.clienteId ?? pet?.cliente_id ?? pet?.cli_id ?? pet?.donoId ?? "",
  };
}

function normalizarAgendamento(agendamento) {
  return {
    id: agendamento?.id ?? agendamento?.cli_id ?? agendamento?.codigo ?? agendamento?.cod,
    clienteId: agendamento?.clienteId ?? agendamento?.cliente_id ?? "",
    cliente: agendamento?.cliente?.nome ?? agendamento?.cliente ?? agendamento?.cli_cliente ?? agendamento?.clienteAgendamento ?? "",
    petId: agendamento?.petId ?? agendamento?.pet_id ?? "",
    pet: agendamento?.pet?.nome ?? agendamento?.pet ?? agendamento?.cli_pet ?? "",
    servico: agendamento?.servico?.nome ?? agendamento?.servico ?? agendamento?.cli_servico ?? agendamento?.servicoAgendamento ?? "",
    data: agendamento?.data ?? agendamento?.age_data ?? "",
    hora: agendamento?.hora ?? agendamento?.age_hora ?? "",
    status: agendamento?.status ?? agendamento?.age_status ?? "Agendado",
  };
}

function extrairLista(payload, chaveLista) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.[chaveLista])) {
    return payload[chaveLista];
  }

  if (Array.isArray(payload?.dados?.[chaveLista])) {
    return payload.dados[chaveLista];
  }

  return [];
}

function extrairAgendamentoCriado(payload, fallback) {
  const agendamentoCriado =
    payload?.dados ?? payload?.data ?? payload?.agendamento ?? payload;

  if (
    agendamentoCriado &&
    typeof agendamentoCriado === "object" &&
    !Array.isArray(agendamentoCriado)
  ) {
    return normalizarAgendamento(agendamentoCriado);
  }

  return {
    ...normalizarAgendamento(fallback),
    id: Date.now(),
  };
}

function construirEndpointAgendamento(idAgendamento) {
  return `${AGENDAMENTOS_ENDPOINT}/${idAgendamento}`;
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregando, setCarregando] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [carregandoPets, setCarregandoPets] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarAgendamentos();
    buscarClientes();
    buscarPets();
  }, []);

  async function buscarAgendamentos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(AGENDAMENTOS_ENDPOINT);
      const lista = extrairLista(response.data, "agendamentos").map(normalizarAgendamento);

      setAgendamentos(lista);
    } catch (error) {
      console.log("Erro ao buscar agendamentos:", error);
    } finally {
      setCarregando(false);
    }
  }

  async function buscarClientes() {
    try {
      setCarregandoClientes(true);
      const response = await api.get(CLIENTES_ENDPOINT);
      const lista = extrairLista(response.data, "clientes").map(normalizarCliente);
      setClientes(lista);
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setCarregandoClientes(false);
    }
  }

  async function buscarPets() {
    try {
      setCarregandoPets(true);
      const response = await api.get(PETS_ENDPOINT);
      const lista = extrairLista(response.data, "pets").map(normalizarPet);
      setPets(lista);
    } catch (error) {
      console.log("Erro ao buscar pets:", error);
    } finally {
      setCarregandoPets(false);
    }
  }

  function abrirModal() {
    setAgendamentoEmEdicao(null);
    setFormulario(estadoInicialFormulario);
    setErro("");
    setModalAberto(true);
  }

  function abrirModalEdicao(agendamento) {
    setAgendamentoEmEdicao(agendamento);
    setFormulario({
      clienteId: agendamento.clienteId ? String(agendamento.clienteId) : "",
      petId: agendamento.petId ? String(agendamento.petId) : "",
      servico: agendamento.servico ?? "",
      data: agendamento.data ?? "",
      hora: agendamento.hora ?? "",
      status: agendamento.status ?? "Agendado",
    });
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setAgendamentoEmEdicao(null);
    setFormulario(estadoInicialFormulario);
    setErro("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((estadoAnterior) => {
      const novoEstado = { ...estadoAnterior, [name]: value };
      
      if (name === "clienteId") {
        novoEstado.petId = "";
      }

      return novoEstado;
    });
  }

  async function salvarAgendamento(evento) {
    evento.preventDefault();

    const novoAgendamento = {
      clienteId: formulario.clienteId,
      petId: formulario.petId,
      servico: formulario.servico.trim(),
      data: formulario.data,
      hora: formulario.hora,
      status: formulario.status,
    };

    const clienteSelecionado = clientes.find((c) => String(c.id) === String(formulario.clienteId));
    const petSelecionado = pets.find((p) => String(p.id) === String(formulario.petId));

    try {
      setSalvando(true);
      setErro("");

      if (agendamentoEmEdicao) {
        const idAgendamento = agendamentoEmEdicao.id;

        if (!idAgendamento) {
          setErro("Nao foi possivel identificar o agendamento para edicao.");
          return;
        }

        const response = await api.put(
          construirEndpointAgendamento(idAgendamento),
          novoAgendamento,
        );

        const dadosResposta = response.data?.dados ?? response.data?.data ?? response.data ?? novoAgendamento;
        const agendamentoAtualizado = normalizarAgendamento({
          ...dadosResposta,
          cliente: clienteSelecionado?.nome ?? dadosResposta.cliente ?? "",
          pet: petSelecionado?.nome ?? dadosResposta.pet ?? "",
        });

        setAgendamentos((estadoAnterior) =>
          estadoAnterior.map((agendamentoAtual) => {
            if (agendamentoAtual.id !== idAgendamento) {
              return agendamentoAtual;
            }

            return {
              ...agendamentoAtual,
              ...agendamentoAtualizado,
              id: agendamentoAtualizado.id ?? idAgendamento,
            };
          }),
        );
      } else {
        const response = await api.post(AGENDAMENTOS_ENDPOINT, novoAgendamento);
        
        const dadosResposta = response.data?.dados ?? response.data?.data ?? response.data?.agendamento ?? response.data ?? novoAgendamento;
        const agendamentoCriado = extrairAgendamentoCriado({
          ...dadosResposta,
          cliente: clienteSelecionado?.nome ?? dadosResposta.cliente ?? "",
          pet: petSelecionado?.nome ?? dadosResposta.pet ?? "",
        }, novoAgendamento);

        setAgendamentos((estadoAnterior) => [...estadoAnterior, agendamentoCriado]);
      }

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar agendamento:", error);
      setErro("Nao foi possivel salvar o agendamento.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirAgendamento(agendamento) {
    if (!agendamento?.id) {
      setErro("Nao foi possivel identificar o agendamento para exclusao.");
      return;
    }

    const confirmarExclusao = window.confirm(
      `Deseja realmente excluir o agendamento ${agendamento.cliente}?`,
    );

    if (!confirmarExclusao) {
      return;
    }

    try {
      setExcluindoId(agendamento.id);
      setErro("");

      await api.delete(construirEndpointAgendamento(agendamento.id));
      setAgendamentos((estadoAnterior) =>
        estadoAnterior.filter((agendamentoAtual) => agendamentoAtual.id !== agendamento.id),
      );
    } catch (error) {
      console.log("Erro ao excluir agendamento:", error);
      setErro("Nao foi possivel excluir o agendamento.");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Agendamentos" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Agendamentos</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo agendamento</span>
            </button>
          </div>

          {erro && !modalAberto && (
            <p className={styles.mensagemErro}>{erro}</p>
          )}

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
                    <tr key={agendamento.id ?? `${agendamento.cliente}-${agendamento.servico}`}>
                      <td>{agendamento.cliente}</td>
                      <td>{agendamento.pet}</td>
                      <td>{agendamento.servico}</td>
                      <td>{agendamento.data}</td>
                      <td>{agendamento.hora}</td>
                      <td>{agendamento.status}</td>
                      <td>
                        <div className={styles.acoesLinha}>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                            onClick={() => abrirModalEdicao(agendamento)}
                            aria-label={`Editar agendamento ${agendamento.cliente}`}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                            onClick={() => excluirAgendamento(agendamento)}
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
        </main>
      </div>

      {modalAberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <section
            className={styles.modal}
            onClick={(evento) => evento.stopPropagation()}
            aria-modal="true"
            role="dialog"
          >
            <div className={styles.modalHeader}>
              <h2>{agendamentoEmEdicao ? "Editar Agendamento" : "Novo Agendamento"}</h2>
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
                    {carregandoClientes ? "Carregando clientes..." : "Selecione o cliente"}
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
                    {!formulario.clienteId ? "Selecione um cliente primeiro" : carregandoPets ? "Carregando pets..." : "Selecione o pet"}
                  </option>
                  {pets
                    .filter((pet) => String(pet.clienteId) === String(formulario.clienteId))
                    .map((pet) => (
                      <option key={pet.id} value={pet.id}>
                        {pet.nome}
                      </option>
                    ))}
                </select>
              </label>

              <label htmlFor="servico" className={styles.campo}>
                Serviço
                <input
                  id="servico"
                  name="servico"
                  type="text"
                  value={formulario.servico}
                  onChange={atualizarCampo}
                  required
                />
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
      )}
    </div>
  );
}
