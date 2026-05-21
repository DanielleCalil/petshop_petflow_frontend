import { useEffect, useState } from "react";

import {
  AGENDAMENTOS_ENDPOINT,
  CLIENTES_ENDPOINT,
  ESTADO_INICIAL_FORMULARIO,
  PETS_ENDPOINT,
  PRODUTOS_ENDPOINT,
  SERVICOS_ENDPOINT,
  VENDAS_ENDPOINT,
} from "../constants/clientes";
import {
  construirEndpointCliente,
  cpfValido,
  emailValido,
  extrairClienteCriado,
  extrairLista,
  extrairListaClientes,
  formatarCpf,
  formatarTelefone,
  itemPossuiVinculoComCliente,
  normalizarCliente,
  obterChaveCliente,
  telefoneValido,
} from "../utils/clientes";
import {
  atualizarCliente,
  criarCliente,
  obterLista,
  removerCliente,
} from "../services/clientes";

export function useClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [clientesComVinculo, setClientesComVinculo] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL_FORMULARIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [clienteParaExcluir, setClienteParaExcluir] = useState(null);

  useEffect(() => {
    buscarClientes();
  }, []);

  function clienteEstaVinculado(cliente) {
    return Boolean(clientesComVinculo[obterChaveCliente(cliente)]);
  }

  async function buscarClientesComVinculo(listaClientes) {
    const endpointsRelacionados = [
      { endpoint: PETS_ENDPOINT, chaveLista: "pets" },
      { endpoint: PRODUTOS_ENDPOINT, chaveLista: "produtos" },
      { endpoint: AGENDAMENTOS_ENDPOINT, chaveLista: "agendamentos" },
      { endpoint: VENDAS_ENDPOINT, chaveLista: "vendas" },
      { endpoint: SERVICOS_ENDPOINT, chaveLista: "servicos" },
    ];

    const respostas = await Promise.allSettled(
      endpointsRelacionados.map(({ endpoint }) => obterLista(endpoint)),
    );

    const listasRelacionadas = respostas.map((resultado, indice) => {
      if (resultado.status !== "fulfilled") {
        return [];
      }

      const { chaveLista } = endpointsRelacionados[indice];
      return extrairLista(resultado.value?.data, chaveLista);
    });

    const mapaVinculos = {};

    listaClientes.forEach((cliente) => {
      const possuiVinculo = listasRelacionadas.some((lista) =>
        lista.some((item) => itemPossuiVinculoComCliente(item, cliente)),
      );

      mapaVinculos[obterChaveCliente(cliente)] = possuiVinculo;
    });

    setClientesComVinculo(mapaVinculos);
  }

  async function buscarClientes() {
    try {
      setCarregando(true);
      setErro("");

      const response = await obterLista(CLIENTES_ENDPOINT);
      const lista = extrairListaClientes(response.data).map(normalizarCliente);

      setClientes(lista);
      await buscarClientesComVinculo(lista);
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setClienteEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
    setErro("");
    setModalAberto(true);
  }

  function abrirModalEdicao(cliente) {
    setClienteEmEdicao(cliente);
    setFormulario({
      nome: cliente.nome ?? "",
      cpf: cliente.cpf ?? "",
      telefone: cliente.telefone ?? "",
      email: cliente.email ?? "",
    });
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setClienteEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
    setErro("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    let valorTratado = value;

    if (name === "cpf") {
      valorTratado = formatarCpf(value);
    }

    if (name === "telefone") {
      valorTratado = formatarTelefone(value);
    }

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: valorTratado,
    }));

    if ((name === "cpf" || name === "telefone" || name === "email") && erro) {
      setErro("");
    }
  }

  async function salvarCliente(evento) {
    evento.preventDefault();

    if (!cpfValido(formulario.cpf)) {
      setErro("CPF invalido. Verifique e tente novamente.");
      return;
    }

    if (!telefoneValido(formulario.telefone)) {
      setErro("Telefone invalido. Informe DDD + numero com 10 ou 11 digitos.");
      return;
    }

    if (!emailValido(formulario.email)) {
      setErro("Email invalido. Verifique e tente novamente.");
      return;
    }

    const novoCliente = {
      nome: formulario.nome.trim(),
      cpf: formatarCpf(formulario.cpf),
      telefone: formatarTelefone(formulario.telefone),
      email: formulario.email.trim().toLowerCase(),
    };

    try {
      setSalvando(true);
      setErro("");

      if (clienteEmEdicao) {
        const idCliente = clienteEmEdicao.id;

        if (!idCliente) {
          setErro("Nao foi possivel identificar o cliente para edicao.");
          return;
        }

        const response = await atualizarCliente(
          construirEndpointCliente(idCliente, CLIENTES_ENDPOINT),
          novoCliente,
        );
        const clienteAtualizado = normalizarCliente(
          response.data?.dados ??
            response.data?.data ??
            response.data ??
            novoCliente,
        );

        setClientes((estadoAnterior) =>
          estadoAnterior.map((clienteAtual) => {
            if (clienteAtual.id !== idCliente) {
              return clienteAtual;
            }

            return {
              ...clienteAtual,
              ...clienteAtualizado,
              id: clienteAtualizado.id ?? idCliente,
            };
          }),
        );
      } else {
        const response = await criarCliente(CLIENTES_ENDPOINT, novoCliente);
        const clienteCriado = extrairClienteCriado(response.data, novoCliente);

        setClientes((estadoAnterior) => [...estadoAnterior, clienteCriado]);
      }

      await buscarClientes();

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar cliente:", error);
      setErro("Nao foi possivel salvar o cliente.");
    } finally {
      setSalvando(false);
    }
  }

  function excluirCliente(cliente) {
    if (!cliente?.id) {
      setErro("Nao foi possivel identificar o cliente para exclusao.");
      return;
    }

    if (clienteEstaVinculado(cliente)) {
      setErro(
        "Cliente vinculado a pet/produto/agendamento/venda/servico nao pode ser excluido.",
      );
      return;
    }

    setClienteParaExcluir(cliente);
    setModalConfirmacaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!clienteParaExcluir?.id) {
      setErro("Nao foi possivel identificar o cliente para exclusao.");
      return;
    }

    try {
      setExcluindoId(clienteParaExcluir.id);
      setErro("");

      await removerCliente(
        construirEndpointCliente(clienteParaExcluir.id, CLIENTES_ENDPOINT),
      );
      setClientes((estadoAnterior) =>
        estadoAnterior.filter(
          (clienteAtual) => clienteAtual.id !== clienteParaExcluir.id,
        ),
      );

      setModalConfirmacaoAberto(false);
      setClienteParaExcluir(null);
    } catch (error) {
      console.log("Erro ao excluir cliente:", error);
      setErro("Nao foi possivel excluir o cliente.");
    } finally {
      setExcluindoId(null);
    }
  }

  function cancelarExclusao() {
    setModalConfirmacaoAberto(false);
    setClienteParaExcluir(null);
  }

  return {
    clientes,
    modalAberto,
    clienteEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    clienteParaExcluir,
    clienteEstaVinculado,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarCliente,
    excluirCliente,
    confirmarExclusao,
    cancelarExclusao,
  };
}
