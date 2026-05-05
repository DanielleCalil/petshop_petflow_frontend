"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import api from "../../services/api";
import styles from "./page.module.css";

const PRODUTOS_ENDPOINT = "/produtos";

const estadoInicialFormulario = {
  nome: "",
  categoria: "",
  preco: "",
  estoque: "",
};

function normalizarProduto(produto) {
  return {
    id: produto?.id ?? produto?.pro_id ?? produto?.codigo ?? produto?.cod ?? "",
    nome: produto?.nome ?? produto?.pro_nome ?? produto?.nomeProduto ?? "",
    categoria: produto?.categoria ?? produto?.pro_categoria ?? "",
    preco: produto?.preco ?? produto?.pro_preco ?? produto?.valor ?? "",
    estoque: produto?.estoque ?? produto?.pro_estoque ?? produto?.quantidade ?? "",
  };
}

function extrairListaProdutos(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.produtos)) {
    return payload.produtos;
  }

  if (Array.isArray(payload?.dados?.produtos)) {
    return payload.dados.produtos;
  }

  return [];
}

function extrairProdutoCriado(payload, fallback) {
  const produtoCriado =
    payload?.dados ?? payload?.data ?? payload?.produto ?? payload;

  if (
    produtoCriado &&
    typeof produtoCriado === "object" &&
    !Array.isArray(produtoCriado)
  ) {
    return normalizarProduto(produtoCriado);
  }

  return {
    ...normalizarProduto(fallback),
    id: Date.now(),
  };
}

function construirEndpointProduto(idProduto) {
  return `${PRODUTOS_ENDPOINT}/${idProduto}`;
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

export default function ProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(PRODUTOS_ENDPOINT);
      const lista = extrairListaProdutos(response.data).map(normalizarProduto);

      setProdutos(lista);
    } catch (error) {
      console.log("Erro ao buscar produtos:", error);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setProdutoEmEdicao(null);
    setFormulario(estadoInicialFormulario);
    setErro("");
    setModalAberto(true);
  }

  function abrirModalEdicao(produto) {
    setProdutoEmEdicao(produto);
    setFormulario({
      nome: produto.nome ?? "",
      categoria: produto.categoria ?? "",
      preco: produto.preco ? formatarMoeda(produto.preco) : "",
      estoque: produto.estoque ?? "",
    });
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setProdutoEmEdicao(null);
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

  async function salvarProduto(evento) {
    evento.preventDefault();

    const novoProduto = {
      nome: formulario.nome.trim(),
      categoria: formulario.categoria.trim(),
      preco: desformatarMoeda(formulario.preco),
      estoque: String(formulario.estoque).trim(),
    };

    try {
      setSalvando(true);
      setErro("");

      if (produtoEmEdicao) {
        const idProduto = produtoEmEdicao.id;

        if (!idProduto) {
          setErro("Nao foi possivel identificar o produto para edicao.");
          return;
        }

        const response = await api.put(
          construirEndpointProduto(idProduto),
          novoProduto,
        );
        const produtoAtualizado = normalizarProduto(
          response.data?.dados ?? response.data?.data ?? response.data ?? novoProduto,
        );

        setProdutos((estadoAnterior) =>
          estadoAnterior.map((produtoAtual) => {
            if (produtoAtual.id !== idProduto) {
              return produtoAtual;
            }

            return {
              ...produtoAtual,
              ...produtoAtualizado,
              id: produtoAtualizado.id ?? idProduto,
            };
          }),
        );
      } else {
        const response = await api.post(PRODUTOS_ENDPOINT, novoProduto);
        const produtoCriado = extrairProdutoCriado(response.data, novoProduto);

        setProdutos((estadoAnterior) => [...estadoAnterior, produtoCriado]);
      }

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar produto:", error);
      setErro("Nao foi possivel salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirProduto(produto) {
    if (!produto?.id) {
      setErro("Nao foi possivel identificar o produto para exclusao.");
      return;
    }

    const confirmarExclusao = window.confirm(
      `Deseja realmente excluir o produto ${produto.nome}?`,
    );

    if (!confirmarExclusao) {
      return;
    }

    try {
      setExcluindoId(produto.id);
      setErro("");

      await api.delete(construirEndpointProduto(produto.id));
      setProdutos((estadoAnterior) =>
        estadoAnterior.filter((produtoAtual) => produtoAtual.id !== produto.id),
      );
    } catch (error) {
      console.log("Erro ao excluir produto:", error);
      setErro("Nao foi possivel excluir o produto.");
    } finally {
      setExcluindoId(null);
    }
  }

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Produtos" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Produtos</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo Produto</span>
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
                  <th>Categoria</th>
                  <th>Preço</th>
                  <th>Estoque</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan="5" className={styles.estadoTabela}>
                      Carregando produtos...
                    </td>
                  </tr>
                ) : produtos.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.estadoTabela}>
                      Nenhum produto encontrado.
                    </td>
                  </tr>
                ) : (
                  produtos.map((produto) => (
                    <tr key={produto.id ?? `${produto.nome}-${produto.preco}`}>
                      <td>{produto.nome}</td>
                      <td>{produto.categoria}</td>
                      <td>{formatarMoeda(produto.preco)}</td>
                      <td>{produto.estoque}</td>
                      <td>
                        <div className={styles.acoesLinha}>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                            onClick={() => abrirModalEdicao(produto)}
                            aria-label={`Editar produto ${produto.nome}`}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                            onClick={() => excluirProduto(produto)}
                            disabled={excluindoId === produto.id}
                            aria-label={`Excluir produto ${produto.nome}`}
                          >
                            <Trash2 size={16} />
                            <span>
                              {excluindoId === produto.id
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
              <h2>{produtoEmEdicao ? "Editar Produto" : "Novo Produto"}</h2>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={fecharModal}
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <form className={styles.formulario} onSubmit={salvarProduto}>
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

              <label htmlFor="categoria" className={styles.campo}>
                Categoria
                <input
                  id="categoria"
                  name="categoria"
                  type="text"
                  value={formulario.categoria}
                  onChange={atualizarCampo}
                  required
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

              <label htmlFor="estoque" className={styles.campo}>
                Estoque
                <input
                  id="estoque"
                  name="estoque"
                  type="number"
                  value={formulario.estoque}
                  onChange={atualizarCampo}
                  min="0"
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
                  : produtoEmEdicao
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
