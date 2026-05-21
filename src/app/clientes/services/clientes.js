import api from "../../../services/api";

export function obterLista(endpoint) {
  return api.get(endpoint);
}

export function criarCliente(endpoint, payload) {
  return api.post(endpoint, payload);
}

export function atualizarCliente(endpoint, payload) {
  return api.put(endpoint, payload);
}

export function removerCliente(endpoint) {
  return api.delete(endpoint);
}
