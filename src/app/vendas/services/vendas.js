import api from "../../../services/api";

export function obterLista(endpoint) {
  return api.get(endpoint);
}

export function obterVendaDetalhes(endpoint) {
  return api.get(endpoint);
}

export function criarVenda(endpoint, payload) {
  return api.post(endpoint, payload);
}

export function atualizarVenda(endpoint, payload) {
  return api.put(endpoint, payload);
}

export function removerVenda(endpoint) {
  return api.delete(endpoint);
}
