import { NOVO_ITEM_PRODUTO, VENDAS_ENDPOINT } from "../constants/vendas";

export function normalizarVenda(venda) {
  return {
    id: venda?.id ?? venda?.ven_id ?? venda?.codigo ?? venda?.cod ?? "",
    cliente: venda?.cliente ?? venda?.ven_cliente ?? venda?.nomeCliente ?? "",
    qtd_itens: parseInt(venda?.qtd_itens) || 0,
    produtos: Array.isArray(venda?.produtos)
      ? venda.produtos
      : venda?.produto
        ? [
            {
              produto: venda.produto,
              quantidade: venda.quantidade,
              subtotal: venda.subtotal,
            },
          ]
        : [],
    totalVenda:
      venda?.totalVenda ??
      venda?.total ??
      venda?.ven_total ??
      venda?.subtotal ??
      0,
    data:
      venda?.data ??
      venda?.ven_data ??
      venda?.criadoEm ??
      venda?.createdAt ??
      "",
  };
}

export function extrairListaVendas(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.vendas)) {
    return payload.vendas;
  }

  if (Array.isArray(payload?.dados?.vendas)) {
    return payload.dados.vendas;
  }

  return [];
}

export function extrairListaClientes(payload) {
  const lista = payload?.dados ?? payload ?? [];

  if (!Array.isArray(lista)) {
    return [];
  }

  return lista.map((c) => ({
    id: c.id ?? c.cli_id ?? "",
    nome: c.nome ?? c.cli_nome ?? "",
  }));
}

export function extrairListaProdutos(payload) {
  const lista = payload?.dados ?? payload ?? [];

  if (!Array.isArray(lista)) {
    return [];
  }

  return lista.map((p) => ({
    id: p.id ?? p.pro_id ?? "",
    nome: p.nome ?? p.pro_nome ?? "",
    preco: p.preco ?? p.pro_preco ?? 0,
  }));
}

export function extrairVendaCriada(payload, fallback) {
  const vendaCriada =
    payload?.dados ?? payload?.data ?? payload?.venda ?? payload;

  if (
    vendaCriada &&
    typeof vendaCriada === "object" &&
    !Array.isArray(vendaCriada)
  ) {
    return normalizarVenda(vendaCriada);
  }

  return {
    ...normalizarVenda(fallback),
    id: Date.now(),
  };
}

export function construirEndpointVenda(idVenda) {
  return `${VENDAS_ENDPOINT}/${idVenda}`;
}

export function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  const numero = Number(valor);
  if (isNaN(numero)) return valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

export function desformatarMoeda(valor) {
  if (!valor) return "";
  const stringValor = String(valor);
  if (!stringValor.includes(",") && !isNaN(Number(stringValor))) {
    return stringValor.trim();
  }
  return stringValor.replace(/[^\d,]/g, "").replace(",", ".");
}

export function formatarData(dataStr) {
  if (!dataStr) return "-";
  let dataSegura = String(dataStr);
  if (dataSegura.length === 10 && dataSegura.includes("-")) {
    dataSegura = `${dataSegura}T12:00:00`;
  }
  const data = new Date(dataSegura);
  if (isNaN(data.getTime())) return dataStr;
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export function criarNovoProdutoFormulario() {
  return {
    idTemporario: Date.now(),
    ...NOVO_ITEM_PRODUTO,
    subtotal: "R$ 0,00",
  };
}

export function mapearProdutosEdicao(produtos) {
  if (!Array.isArray(produtos) || produtos.length === 0) {
    return [criarNovoProdutoFormulario()];
  }

  return produtos.map((p, i) => ({
    idTemporario: Date.now() + i,
    produto: p.produto ?? "",
    quantidade: String(p.quantidade ?? "1"),
    subtotal: p.subtotal ? formatarMoeda(p.subtotal) : "R$ 0,00",
  }));
}

export function calcularSubtotalProduto(
  nomeProduto,
  quantidade,
  produtosCatalogo,
) {
  const produtoCatalogo = produtosCatalogo.find(
    (prod) => prod.nome === nomeProduto,
  );
  const precoUnitario = produtoCatalogo ? parseFloat(produtoCatalogo.preco) : 0;
  const qtd = parseInt(quantidade) || 0;

  return formatarMoeda(precoUnitario * qtd);
}

export function calcularTotalVenda(listaProdutos) {
  return listaProdutos.reduce((acc, p) => {
    const val = Number(desformatarMoeda(p.subtotal));
    return acc + (isNaN(val) ? 0 : val);
  }, 0);
}
