import { SERVICOS_ENDPOINT } from "../constants/servicos";

export function normalizarServico(servico) {
  return {
    id: servico?.id ?? servico?.ser_id ?? servico?.codigo ?? servico?.cod,
    nome: servico?.nome ?? servico?.ser_nome ?? servico?.nomeServico ?? "",
    preco: servico?.preco ?? servico?.ser_preco ?? servico?.valor ?? "",
    duracao: servico?.duracao ?? servico?.ser_duracao ?? servico?.tempo ?? "",
  };
}

export function extrairListaServicos(payload) {
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

export function extrairServicoCriado(payload, fallback) {
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

export function construirEndpointServico(idServico) {
  return `${SERVICOS_ENDPOINT}/${idServico}`;
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
