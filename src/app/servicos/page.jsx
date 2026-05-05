"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import api from "../../services/api";
import styles from "./page.module.css";

const SERVICOS_ENDPOINT = "/servicos";

const estadoInicialFormulario = {
  nome: "",
  preco: "",
  duracao: "",
};

function normalizarServico(servico) {
  return {
    id: servico?.id ?? servico?.ser_id ?? servico?.codigo ?? servico?.cod,
    nome: servico?.nome ?? servico?.ser_nome ?? servico?.nomeServico ?? "",
    preco: servico?.preco ?? servico?.ser_preco ?? servico?.valor ?? "",
    duracao: servico?.duracao ?? servico?.ser_duracao ?? servico?.tempo ?? "",
  };
}

function extrairListaServicos(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.servicos)) {
    return payload.servicos;
  }

  if (Array.isArray(payload?.dados?.servicos)) {
    return payload.dados.servicos;
  }

  return [];
}

function extrairServicoCriado(payload, fallback) {
  const servicoCriado =
    payload?.dados ?? payload?.data ?? payload?.servico ?? payload;

  if (
    servicoCriado &&
    typeof servicoCriado === "object" &&
    !Array.isArray(servicoCriado)
  ) {
    return normalizarServico(servicoCriado);
  }

  return {
    ...normalizarServico(fallback),
    id: Date.now(),
  };
}

function construirEndpointServico(idServico) {
  return `${SERVICOS_ENDPOINT}/${idServico}`;
}

function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  const numero = Number(valor);
  if (isNaN(numero)) return valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

function desformatarMoeda(valor) {
  if (!valor) return "";
  const stringValor = String(valor);
  if (!stringValor.includes(",") && !isNaN(Number(stringValor))) {
    return stringValor.trim();
  }
  return stringValor.replace(/[^\d,]/g, "").replace(",", ".");
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [servicoEmEdicao, setServicoEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarServicos();
  }, []);

  async function buscarServicos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(SERVICOS_ENDPOINT);
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
    setFormulario(estadoInicialFormulario);
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
    setFormulario(estadoInicialFormulario);
    setErro("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    let novoValor = value;

    if (name === "preco") {
      const apenasNumeros = value.replace(/\D/g, "");
      if (apenasNumeros) {
        novoValor = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(apenasNumeros) / 100);
      } else {
        novoValor = "";
      }
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
          setErro("Não foi possivel identificar o serviço para edição.");
          return;
        }

        const response = await api.put(
          construirEndpointServico(idServico),
          novoServico,
        );
        const servicoAtualizado = normalizarServico(
          response.data?.dados ?? response.data?.data ?? response.data ?? novoServico,
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
        const response = await api.post(SERVICOS_ENDPOINT, novoServico);
        const servicoCriado = extrairServicoCriado(response.data, novoServico);

        setServicos((estadoAnterior) => [...estadoAnterior, servicoCriado]);
      }

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar serviço:", error);
      setErro("Não foi possivel salvar o serviço.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirServico(servico) {
    if (!servico?.id) {
      setErro("Não foi possivel identificar o serviço para exclusão.");
      return;
    }

    const confirmarExclusao = window.confirm(
      `Deseja realmente excluir o serviço ${servico.nome}?`,
    );

    if (!confirmarExclusao) {
      return;
    }

    try {
      setExcluindoId(servico.id);
      setErro("");

      await api.delete(construirEndpointServico(servico.id));
      setServicos((estadoAnterior) =>
        estadoAnterior.filter((servicoAtual) => servicoAtual.id !== servico.id),
      );
    } catch (error) {
      console.log("Erro ao excluir serviço:", error);
      setErro("Não foi possivel excluir o serviço.");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Serviços" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Serviços</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo Serviço</span>
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
                  <th>Preço</th>
                  <th>Duração</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan="4" className={styles.estadoTabela}>
                      Carregando serviços...
                    </td>
                  </tr>
                ) : servicos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={styles.estadoTabela}>
                      Nenhum serviço encontrado.
                    </td>
                  </tr>
                ) : (
                  servicos.map((servico) => (
                    <tr key={servico.id ?? `${servico.nome}`}>
                      <td>{servico.nome}</td>
                      <td>{formatarMoeda(servico.preco)}</td>
                      <td>{servico.duracao} min</td>
                      <td>
                        <div className={styles.acoesLinha}>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                            onClick={() => abrirModalEdicao(servico)}
                            aria-label={`Editar serviço ${servico.nome}`}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                            onClick={() => excluirServico(servico)}
                            disabled={excluindoId === servico.id}
                            aria-label={`Excluir serviço ${servico.nome}`}
                          >
                            <Trash2 size={16} />
                            <span>
                              {excluindoId === servico.id
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
              <h2>{servicoEmEdicao ? "Editar Serviço" : "Novo Serviço"}</h2>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={fecharModal}
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <form className={styles.formulario} onSubmit={salvarServico}>
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

              <label htmlFor="preco" className={styles.campo}>
                Preço
                <input
                  id="preco"
                  name="preco"
                  type="text"
                  value={formulario.preco}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="duracao" className={styles.campo}>
                Duração
                <input
                  id="duracao"
                  name="duracao"
                  type="number"
                  value={formulario.duracao}
                  onChange={atualizarCampo}
                  min="1"
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
                  : servicoEmEdicao
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
