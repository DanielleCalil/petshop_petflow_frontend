import { useEffect, useState } from "react";

import {
  ESTADO_INICIAL_FORMULARIO,
  PRODUTOS_ENDPOINT,
} from "../constants/produtos";
import {
  atualizarProduto,
  criarProduto,
  obterProdutos,
  removerProduto,
} from "../services/produtos";
import {
  aplicarMascaraMoeda,
  construirEndpointProduto,
  desformatarMoeda,
  extrairListaProdutos,
  extrairProdutoCriado,
  formatarMoeda,
  normalizarProduto,
} from "../utils/produtos";

export function useProdutosPage() {
  const [produtos, setProdutos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [produtoEmEdicao, setProdutoEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL_FORMULARIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [produtoParaExcluir, setProdutoParaExcluir] = useState(null);

  useEffect(() => {
    buscarProdutos();
  }, []);

  async function buscarProdutos() {
    try {
      setCarregando(true);
      setErro("");

      const response = await obterProdutos(PRODUTOS_ENDPOINT);
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
    setFormulario(ESTADO_INICIAL_FORMULARIO);
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

        const response = await atualizarProduto(
          construirEndpointProduto(idProduto),
          novoProduto,
        );
        const produtoAtualizado = normalizarProduto(
          response.data?.dados ??
            response.data?.data ??
            response.data ??
            novoProduto,
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
        const response = await criarProduto(PRODUTOS_ENDPOINT, novoProduto);
        const produtoCriado = extrairProdutoCriado(response.data, novoProduto);

        setProdutos((estadoAnterior) => [...estadoAnterior, produtoCriado]);
      }

      await buscarProdutos();

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar produto:", error);
      setErro("Nao foi possivel salvar o produto.");
    } finally {
      setSalvando(false);
    }
  }

  function excluirProduto(produto) {
    if (!produto?.id) {
      setErro("Nao foi possivel identificar o produto para exclusao.");
      return;
    }

    setProdutoParaExcluir(produto);
    setModalConfirmacaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!produtoParaExcluir?.id) {
      setErro("Nao foi possivel identificar o produto para exclusao.");
      return;
    }

    try {
      setExcluindoId(produtoParaExcluir.id);
      setErro("");

      await removerProduto(construirEndpointProduto(produtoParaExcluir.id));
      setProdutos((estadoAnterior) =>
        estadoAnterior.filter(
          (produtoAtual) => produtoAtual.id !== produtoParaExcluir.id,
        ),
      );

      setModalConfirmacaoAberto(false);
      setProdutoParaExcluir(null);
    } catch (error) {
      console.log("Erro ao excluir produto:", error);
      setErro("Nao foi possivel excluir o produto.");
    } finally {
      setExcluindoId(null);
    }
  }

  function cancelarExclusao() {
    setModalConfirmacaoAberto(false);
    setProdutoParaExcluir(null);
  }

  return {
    produtos,
    modalAberto,
    produtoEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    produtoParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarProduto,
    excluirProduto,
    confirmarExclusao,
    cancelarExclusao,
  };
}
