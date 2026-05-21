import { useEffect, useState } from "react";

import {
  CLIENTES_ENDPOINT,
  ESTADO_INICIAL_FORMULARIO,
  PRODUTOS_ENDPOINT,
  VENDAS_ENDPOINT,
} from "../constants/vendas";
import {
  atualizarVenda,
  criarVenda,
  obterLista,
  obterVendaDetalhes,
  removerVenda,
} from "../services/vendas";
import {
  calcularSubtotalProduto,
  calcularTotalVenda,
  construirEndpointVenda,
  desformatarMoeda,
  extrairListaClientes,
  extrairListaProdutos,
  extrairListaVendas,
  extrairVendaCriada,
  formatarMoeda,
  mapearProdutosEdicao,
  normalizarVenda,
  criarNovoProdutoFormulario,
} from "../utils/vendas";

export function useVendasPage() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [vendaEmEdicao, setVendaEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL_FORMULARIO);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [vendaParaExcluir, setVendaParaExcluir] = useState(null);

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [resVendas, resClientes, resProdutos] = await Promise.all([
        obterLista(VENDAS_ENDPOINT).catch(() => ({ data: [] })),
        obterLista(CLIENTES_ENDPOINT).catch(() => ({ data: [] })),
        obterLista(PRODUTOS_ENDPOINT).catch(() => ({ data: [] })),
      ]);

      setVendas(extrairListaVendas(resVendas.data).map(normalizarVenda));
      setClientes(extrairListaClientes(resClientes.data));
      setProdutos(extrairListaProdutos(resProdutos.data));
    } catch (error) {
      console.log("Erro ao buscar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setVendaEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
    setErro("");
    setModalAberto(true);
  }

  async function abrirModalEdicao(venda) {
    try {
      setErro("");
      const response = await obterVendaDetalhes(
        construirEndpointVenda(venda.id),
      );
      const vendaDetalhes = response.data;

      setVendaEmEdicao(vendaDetalhes);
      setFormulario({
        cliente: vendaDetalhes.cliente ?? venda.cliente ?? "",
        produtos: mapearProdutosEdicao(vendaDetalhes.produtos),
        totalVenda: vendaDetalhes.totalVenda ?? venda.totalVenda ?? 0,
      });

      setModalAberto(true);
    } catch (error) {
      console.error("Erro ao carregar venda:", error);
      setErro("Não foi possível carregar os detalhes da venda.");
    }
  }

  function fecharModal() {
    setModalAberto(false);
    setVendaEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
    setErro("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  function atualizarCampoProduto(idTemporario, campo, valor) {
    setFormulario((estadoAnterior) => {
      const novosProdutos = estadoAnterior.produtos.map((p) => {
        if (p.idTemporario !== idTemporario) {
          return p;
        }

        const itemAtualizado = { ...p, [campo]: valor };
        itemAtualizado.subtotal = calcularSubtotalProduto(
          itemAtualizado.produto,
          itemAtualizado.quantidade,
          produtos,
        );

        return itemAtualizado;
      });

      return {
        ...estadoAnterior,
        produtos: novosProdutos,
        totalVenda: calcularTotalVenda(novosProdutos),
      };
    });
  }

  function adicionarProduto() {
    setFormulario((prev) => ({
      ...prev,
      produtos: [...prev.produtos, criarNovoProdutoFormulario()],
    }));
  }

  function removerProduto(idTemporario) {
    setFormulario((prev) => {
      const novosProdutos = prev.produtos.filter(
        (p) => p.idTemporario !== idTemporario,
      );
      const produtosAtualizados = novosProdutos.length
        ? novosProdutos
        : [criarNovoProdutoFormulario()];

      return {
        ...prev,
        produtos: produtosAtualizados,
        totalVenda: calcularTotalVenda(produtosAtualizados),
      };
    });
  }

  async function salvarVenda(evento) {
    evento.preventDefault();

    const novaVenda = {
      cliente: formulario.cliente.trim(),
      produtos: formulario.produtos.map((p) => ({
        produto: p.produto.trim(),
        quantidade: String(p.quantidade).trim(),
        subtotal: desformatarMoeda(p.subtotal),
      })),
      totalVenda: formulario.totalVenda,
    };

    try {
      setSalvando(true);
      setErro("");

      if (vendaEmEdicao) {
        const idVenda = vendaEmEdicao.id;

        if (!idVenda) {
          setErro("Nao foi possivel identificar a venda para edicao.");
          return;
        }

        const response = await atualizarVenda(
          construirEndpointVenda(idVenda),
          novaVenda,
        );
        const vendaAtualizada = normalizarVenda(
          response.data?.dados ??
            response.data?.data ??
            response.data ??
            novaVenda,
        );

        setVendas((estadoAnterior) =>
          estadoAnterior.map((vendaAtual) => {
            if (vendaAtual.id !== idVenda) {
              return vendaAtual;
            }

            return {
              ...vendaAtual,
              ...vendaAtualizada,
              id: vendaAtualizada.id ?? idVenda,
            };
          }),
        );
      } else {
        const response = await criarVenda(VENDAS_ENDPOINT, novaVenda);
        const vendaCriada = extrairVendaCriada(response.data, novaVenda);

        setVendas((estadoAnterior) => [...estadoAnterior, vendaCriada]);
      }

      await buscarDados();

      fecharModal();
      buscarDados();
    } catch (error) {
      console.log("Erro ao salvar venda:", error);
      setErro("Nao foi possivel salvar a venda.");
    } finally {
      setSalvando(false);
    }
  }

  function excluirVenda(venda) {
    if (!venda?.id) {
      setErro("Nao foi possivel identificar a venda para exclusao.");
      return;
    }

    setVendaParaExcluir(venda);
    setModalConfirmacaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!vendaParaExcluir?.id) {
      setErro("Nao foi possivel identificar a venda para exclusao.");
      return;
    }

    try {
      setExcluindoId(vendaParaExcluir.id);
      setErro("");

      await removerVenda(construirEndpointVenda(vendaParaExcluir.id));
      setVendas((estadoAnterior) =>
        estadoAnterior.filter(
          (vendaAtual) => vendaAtual.id !== vendaParaExcluir.id,
        ),
      );

      setModalConfirmacaoAberto(false);
      setVendaParaExcluir(null);
    } catch (error) {
      console.log("Erro ao excluir venda:", error);
      setErro("Nao foi possivel excluir a venda.");
    } finally {
      setExcluindoId(null);
    }
  }

  function cancelarExclusao() {
    setModalConfirmacaoAberto(false);
    setVendaParaExcluir(null);
  }

  return {
    vendas,
    clientes,
    produtos,
    modalAberto,
    vendaEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    vendaParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    atualizarCampoProduto,
    adicionarProduto,
    removerProduto,
    salvarVenda,
    excluirVenda,
    confirmarExclusao,
    cancelarExclusao,
  };
}
