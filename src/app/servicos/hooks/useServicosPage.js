import { useEffect, useState } from "react";

import {
  ESTADO_INICIAL_FORMULARIO,
  SERVICOS_ENDPOINT,
} from "../constants/servicos";
import {
  atualizarServico,
  criarServico,
  obterServicos,
  removerServico,
} from "../services/servicos";
import {
  aplicarMascaraMoeda,
  construirEndpointServico,
  desformatarMoeda,
  extrairListaServicos,
  extrairServicoCriado,
  formatarMoeda,
  normalizarServico,
} from "../utils/servicos";

export function useServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL_FORMULARIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [servicoParaExcluir, setServicoParaExcluir] = useState(null);

  useEffect(() => {
    buscarServicos();
  }, []);

  async function buscarServicos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await obterServicos(SERVICOS_ENDPOINT);
      const lista = extrairListaServicos(response.data).map(normalizarServico);

      setServicos(lista);
    } catch (error) {
      console.log("Erro ao buscar serviços:", error);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setServicoEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
    setErro("");
    setModalAberto(true);
  }

  function abrirModalEdicao(servico) {
    setServicoEmEdicao(servico);
    setFormulario({
      nome: servico.nome ?? "",
      preco: servico.preco ? formatarMoeda(servico.preco) : "",
      duracao: servico.duracao ?? "",
    });
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setServicoEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
    setErro("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    let novoValor = value;

    if (name === "preco") {
      novoValor = aplicarMascaraMoeda(value);
    }

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: novoValor,
    }));
  }

  async function salvarServico(evento) {
    evento.preventDefault();

    const novoServico = {
      nome: formulario.nome.trim(),
      preco: desformatarMoeda(formulario.preco),
      duracao: String(formulario.duracao).trim(),
    };

    try {
      setSalvando(true);
      setErro("");

      if (servicoEmEdicao) {
        const idServico = servicoEmEdicao.id;

        if (!idServico) {
          setErro("Não foi possível identificar o serviço para edição.");
          return;
        }

        const response = await atualizarServico(
          construirEndpointServico(idServico),
          novoServico,
        );
        const servicoAtualizado = normalizarServico(
          response.data?.dados ??
            response.data?.data ??
            response.data ??
            novoServico,
        );

        setServicos((estadoAnterior) =>
          estadoAnterior.map((servicoAtual) => {
            if (servicoAtual.id !== idServico) {
              return servicoAtual;
            }

            return {
              ...servicoAtual,
              ...servicoAtualizado,
              id: servicoAtualizado.id ?? idServico,
            };
          }),
        );
      } else {
        const response = await criarServico(SERVICOS_ENDPOINT, novoServico);
        const servicoCriado = extrairServicoCriado(response.data, novoServico);

        setServicos((estadoAnterior) => [...estadoAnterior, servicoCriado]);
      }

      await buscarServicos();

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar serviço:", error);
      setErro("Não foi possível salvar o serviço.");
    } finally {
      setSalvando(false);
    }
  }

  function excluirServico(servico) {
    if (!servico?.id) {
      setErro("Não foi possível identificar o serviço para exclusão.");
      return;
    }

    setServicoParaExcluir(servico);
    setModalConfirmacaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!servicoParaExcluir?.id) {
      setErro("Não foi possível identificar o serviço para exclusão.");
      return;
    }

    try {
      setExcluindoId(servicoParaExcluir.id);
      setErro("");

      await removerServico(construirEndpointServico(servicoParaExcluir.id));
      setServicos((estadoAnterior) =>
        estadoAnterior.filter(
          (servicoAtual) => servicoAtual.id !== servicoParaExcluir.id,
        ),
      );

      setModalConfirmacaoAberto(false);
      setServicoParaExcluir(null);
    } catch (error) {
      console.log("Erro ao excluir serviço:", error);
      setErro("Não foi possível excluir o serviço.");
    } finally {
      setExcluindoId(null);
    }
  }

  function cancelarExclusao() {
    setModalConfirmacaoAberto(false);
    setServicoParaExcluir(null);
  }

  return {
    servicos,
    modalAberto,
    servicoEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    servicoParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarServico,
    excluirServico,
    confirmarExclusao,
    cancelarExclusao,
  };
}
