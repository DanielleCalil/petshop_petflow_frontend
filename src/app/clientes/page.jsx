"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import api from "../../services/api";
import styles from "./page.module.css";

const CLIENTES_ENDPOINT = "/clientes";
const PETS_ENDPOINT = "/pets";
const PRODUTOS_ENDPOINT = "/produtos";
const AGENDAMENTOS_ENDPOINT = "/agendamentos";
const VENDAS_ENDPOINT = "/vendas";
const SERVICOS_ENDPOINT = "/servicos";

const estadoInicialFormulario = {
  nome: "",
  cpf: "",
  telefone: "",
  email: "",
};

function apenasDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

function formatarCpf(valor) {
  const cpf = apenasDigitos(valor).slice(0, 11);

  if (cpf.length <= 3) {
    return cpf;
  }

  if (cpf.length <= 6) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  }

  if (cpf.length <= 9) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

function cpfValido(cpfInformado) {
  const cpf = apenasDigitos(cpfInformado);

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let somaPrimeiroDigito = 0;

  for (let indice = 0; indice < 9; indice += 1) {
    somaPrimeiroDigito += Number(cpf[indice]) * (10 - indice);
  }

  const restoPrimeiroDigito = (somaPrimeiroDigito * 10) % 11;
  const primeiroDigitoCalculado = restoPrimeiroDigito === 10 ? 0 : restoPrimeiroDigito;

  if (primeiroDigitoCalculado !== Number(cpf[9])) {
    return false;
  }

  let somaSegundoDigito = 0;

  for (let indice = 0; indice < 10; indice += 1) {
    somaSegundoDigito += Number(cpf[indice]) * (11 - indice);
  }

  const restoSegundoDigito = (somaSegundoDigito * 10) % 11;
  const segundoDigitoCalculado = restoSegundoDigito === 10 ? 0 : restoSegundoDigito;

  return segundoDigitoCalculado === Number(cpf[10]);
}

function formatarTelefone(valor) {
  const telefone = apenasDigitos(valor).slice(0, 11);

  if (telefone.length <= 2) {
    return telefone;
  }

  if (telefone.length <= 6) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
  }

  if (telefone.length <= 10) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
  }

  return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
}

function telefoneValido(telefoneInformado) {
  const telefone = apenasDigitos(telefoneInformado);
  return telefone.length === 10 || telefone.length === 11;
}

function emailValido(emailInformado) {
  const email = String(emailInformado ?? "").trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? cliente?.cli_id ?? cliente?.codigo ?? cliente?.cod,
    nome: cliente?.nome ?? cliente?.cli_nome ?? cliente?.nomeCliente ?? "",
    cpf: cliente?.cpf ?? cliente?.cli_cpf ?? cliente?.cpfCliente ?? "",
    email: cliente?.email ?? cliente?.cli_email ?? cliente?.emailCliente ?? "",
    telefone: cliente?.telefone ?? cliente?.cli_telefone ?? cliente?.fone ?? "",
  };
}

function extrairListaClientes(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.clientes)) {
    return payload.clientes;
  }

  if (Array.isArray(payload?.dados?.clientes)) {
    return payload.dados.clientes;
  }

  return [];
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

function normalizarTexto(valor) {
  return String(valor ?? "").trim().toLowerCase();
}

function compararIds(idA, idB) {
  if (idA === undefined || idA === null || idB === undefined || idB === null) {
    return false;
  }

  return String(idA).trim() === String(idB).trim();
}

function existeVinculoPorId(item, idCliente) {
  const idsRelacionados = [
    item?.clienteId,
    item?.cliente_id,
    item?.idCliente,
    item?.donoId,
    item?.dono_id,
    item?.cli_id,
    item?.cliente?.id,
    item?.cliente?.cli_id,
    item?.dono?.id,
    item?.dono?.cli_id,
  ];

  return idsRelacionados.some((idRelacionado) => compararIds(idRelacionado, idCliente));
}

function existeVinculoPorNome(item, nomeCliente) {
  const nomeNormalizado = normalizarTexto(nomeCliente);

  if (!nomeNormalizado) {
    return false;
  }

  const nomesRelacionados = [
    item?.cliente,
    item?.clienteNome,
    item?.nomeCliente,
    item?.cli_cliente,
    item?.clienteAgendamento,
    item?.dono,
    item?.donoNome,
    item?.cliente?.nome,
    item?.dono?.nome,
  ];

  return nomesRelacionados.some(
    (nomeRelacionado) => normalizarTexto(nomeRelacionado) === nomeNormalizado,
  );
}

function itemPossuiVinculoComCliente(item, cliente) {
  return (
    existeVinculoPorId(item, cliente?.id) ||
    existeVinculoPorNome(item, cliente?.nome)
  );
}

function obterChaveCliente(cliente) {
  if (cliente?.id !== undefined && cliente?.id !== null && cliente?.id !== "") {
    return `id:${String(cliente.id).trim()}`;
  }

  return `nome:${normalizarTexto(cliente?.nome)}`;
}

function extrairClienteCriado(payload, fallback) {
  const clienteCriado =
    payload?.dados ?? payload?.data ?? payload?.cliente ?? payload;

  if (
    clienteCriado &&
    typeof clienteCriado === "object" &&
    !Array.isArray(clienteCriado)
  ) {
    return normalizarCliente(clienteCriado);
  }

  return {
    ...normalizarCliente(fallback),
    id: Date.now(),
  };
}

function construirEndpointCliente(idCliente) {
  return `${CLIENTES_ENDPOINT}/${idCliente}`;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [clientesComVinculo, setClientesComVinculo] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [clienteEmEdicao, setClienteEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
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
      endpointsRelacionados.map(({ endpoint }) => api.get(endpoint)),
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

      const response = await api.get(CLIENTES_ENDPOINT);
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
    setFormulario(estadoInicialFormulario);
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
    setFormulario(estadoInicialFormulario);
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

        const response = await api.put(
          construirEndpointCliente(idCliente),
          novoCliente,
        );
        const clienteAtualizado = normalizarCliente(
          response.data?.dados ?? response.data?.data ?? response.data ?? novoCliente,
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
        const response = await api.post(CLIENTES_ENDPOINT, novoCliente);
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

  async function excluirCliente(cliente) {
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

      await api.delete(construirEndpointCliente(clienteParaExcluir.id));
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

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Clientes" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Clientes</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo Cliente</span>
            </button>
          </div>

          {erro && !modalAberto && (
            <p className={styles.mensagemErro}>{erro}</p>
          )}

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
                            onClick={() => abrirModalEdicao(cliente)}
                            aria-label={`Editar cliente ${cliente.nome}`}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                            onClick={() => excluirCliente(cliente)}
                            disabled={
                              excluindoId === cliente.id || clienteEstaVinculado(cliente)
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
              <h2>{clienteEmEdicao ? "Editar Cliente" : "Novo Cliente"}</h2>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={fecharModal}
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <form className={styles.formulario} onSubmit={salvarCliente}>
              {erro && <p className={styles.mensagemErroModal}>{erro}</p>}

              <label htmlFor="nome" className={styles.campo}>
                Nome
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formulario.nome}
                  onChange={atualizarCampo}
                  required
                  autoFocus
                />
              </label>

              <label htmlFor="cpf" className={styles.campo}>
                CPF
                <input
                  id="cpf"
                  name="cpf"
                  type="text"
                  inputMode="numeric"
                  maxLength={14}
                  placeholder="000.000.000-00"
                  value={formulario.cpf}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="telefone" className={styles.campo}>
                Telefone
                <input
                  id="telefone"
                  name="telefone"
                  type="text"
                  inputMode="tel"
                  maxLength={15}
                  placeholder="(00) 00000-0000"
                  value={formulario.telefone}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="email" className={styles.campo}>
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formulario.email}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <button
                type="submit"
                className={styles.botaoSalvar}
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : clienteEmEdicao
                    ? "Atualizar"
                    : "Salvar"}
              </button>
            </form>
          </section>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalConfirmacaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={`Deseja realmente excluir o cliente ${clienteParaExcluir?.nome}?`}
        textoBotaoOk="Excluir"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindoId !== null}
      />
    </div>
  );
}
