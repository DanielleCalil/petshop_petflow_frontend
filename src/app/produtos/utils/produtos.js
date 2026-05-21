import { PRODUTOS_ENDPOINT } from "../constants/produtos";

export function normalizarProduto(produto) {
  return {
    id: produto?.id ?? produto?.pro_id ?? produto?.codigo ?? produto?.cod ?? "",
    nome: produto?.nome ?? produto?.pro_nome ?? produto?.nomeProduto ?? "",
    categoria: produto?.categoria ?? produto?.pro_categoria ?? "",
    preco: produto?.preco ?? produto?.pro_preco ?? produto?.valor ?? "",
    estoque:
      produto?.estoque ?? produto?.pro_estoque ?? produto?.quantidade ?? "",
  };
}

export function extrairListaProdutos(payload) {
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

export function extrairProdutoCriado(payload, fallback) {
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

export function construirEndpointProduto(idProduto) {
  return `${PRODUTOS_ENDPOINT}/${idProduto}`;
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

export function aplicarMascaraMoeda(valor) {
  const apenasNumeros = String(valor ?? "").replace(/\D/g, "");

  if (!apenasNumeros) {
    return "";
  }

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(apenasNumeros) / 100);
}
