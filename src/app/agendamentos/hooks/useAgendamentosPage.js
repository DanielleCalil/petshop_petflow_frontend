import { useEffect, useState } from "react";

import {
  AGENDAMENTOS_ENDPOINT,
  CLIENTES_ENDPOINT,
  ESTADO_INICIAL_FORMULARIO,
  PETS_ENDPOINT,
  SERVICOS_ENDPOINT,
} from "../constants/agendamentos";
import {
  construirEndpointAgendamento,
  extrairAgendamentoCriado,
  extrairLista,
  normalizarAgendamento,
  normalizarCliente,
  normalizarPet,
  normalizarServico,
} from "../utils/agendamentos";
import {
  atualizarAgendamento,
  criarAgendamento,
  obterLista,
  removerAgendamento,
} from "../services/agendamentos";

export function useAgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [pets, setPets] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [agendamentoEmEdicao, setAgendamentoEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL_FORMULARIO);
  const [carregando, setCarregando] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [carregandoPets, setCarregandoPets] = useState(true);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [agendamentoParaExcluir, setAgendamentoParaExcluir] = useState(null);

  useEffect(() => {
    buscarAgendamentos();
    buscarClientes();
    buscarPets();
    buscarServicos();
  }, []);

  async function buscarAgendamentos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await obterLista(AGENDAMENTOS_ENDPOINT);
      const lista = extrairLista(response.data, "agendamentos").map(
        normalizarAgendamento,
      );

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
      const response = await obterLista(CLIENTES_ENDPOINT);
      const lista = extrairLista(response.data, "clientes").map(
        normalizarCliente,
      );
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
      const response = await obterLista(PETS_ENDPOINT);
      const lista = extrairLista(response.data, "pets").map(normalizarPet);
      setPets(lista);
    } catch (error) {
      console.log("Erro ao buscar pets:", error);
    } finally {
      setCarregandoPets(false);
    }
  }

  async function buscarServicos() {
    try {
      setCarregandoServicos(true);
      const response = await obterLista(SERVICOS_ENDPOINT);
      const lista = extrairLista(response.data, "servicos").map(
        normalizarServico,
      );
      setServicos(lista);
    } catch (error) {
      console.log("Erro ao buscar serviços:", error);
    } finally {
      setCarregandoServicos(false);
    }
  }

  function abrirModal() {
    setAgendamentoEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
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
    setFormulario(ESTADO_INICIAL_FORMULARIO);
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

    const clienteSelecionado = clientes.find(
      (c) => String(c.id) === String(formulario.clienteId),
    );
    const petSelecionado = pets.find(
      (p) => String(p.id) === String(formulario.petId),
    );

    try {
      setSalvando(true);
      setErro("");

      if (agendamentoEmEdicao) {
        const idAgendamento = agendamentoEmEdicao.id;

        if (!idAgendamento) {
          setErro("Nao foi possivel identificar o agendamento para edicao.");
          return;
        }

        const response = await atualizarAgendamento(
          construirEndpointAgendamento(idAgendamento, AGENDAMENTOS_ENDPOINT),
          novoAgendamento,
        );

        const dadosResposta =
          response.data?.dados ??
          response.data?.data ??
          response.data ??
          novoAgendamento;
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
        const response = await criarAgendamento(
          AGENDAMENTOS_ENDPOINT,
          novoAgendamento,
        );

        const dadosResposta =
          response.data?.dados ??
          response.data?.data ??
          response.data?.agendamento ??
          response.data ??
          novoAgendamento;
        const agendamentoCriado = extrairAgendamentoCriado(
          {
            ...dadosResposta,
            cliente: clienteSelecionado?.nome ?? dadosResposta.cliente ?? "",
            pet: petSelecionado?.nome ?? dadosResposta.pet ?? "",
          },
          novoAgendamento,
        );

        setAgendamentos((estadoAnterior) => [
          ...estadoAnterior,
          agendamentoCriado,
        ]);
      }

      await buscarAgendamentos();

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar agendamento:", error);
      setErro("Nao foi possivel salvar o agendamento.");
    } finally {
      setSalvando(false);
    }
  }

  function excluirAgendamento(agendamento) {
    if (!agendamento?.id) {
      setErro("Nao foi possivel identificar o agendamento para exclusao.");
      return;
    }

    setAgendamentoParaExcluir(agendamento);
    setModalConfirmacaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!agendamentoParaExcluir?.id) {
      setErro("Nao foi possivel identificar o agendamento para exclusao.");
      return;
    }

    try {
      setExcluindoId(agendamentoParaExcluir.id);
      setErro("");

      await removerAgendamento(
        construirEndpointAgendamento(
          agendamentoParaExcluir.id,
          AGENDAMENTOS_ENDPOINT,
        ),
      );
      setAgendamentos((estadoAnterior) =>
        estadoAnterior.filter(
          (agendamentoAtual) =>
            agendamentoAtual.id !== agendamentoParaExcluir.id,
        ),
      );

      setModalConfirmacaoAberto(false);
      setAgendamentoParaExcluir(null);
    } catch (error) {
      console.log("Erro ao excluir agendamento:", error);
      setErro("Nao foi possivel excluir o agendamento.");
    } finally {
      setExcluindoId(null);
    }
  }

  function cancelarExclusao() {
    setModalConfirmacaoAberto(false);
    setAgendamentoParaExcluir(null);
  }

  return {
    agendamentos,
    clientes,
    pets,
    servicos,
    modalAberto,
    agendamentoEmEdicao,
    formulario,
    carregando,
    carregandoClientes,
    carregandoPets,
    carregandoServicos,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    agendamentoParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarAgendamento,
    excluirAgendamento,
    confirmarExclusao,
    cancelarExclusao,
  };
}
