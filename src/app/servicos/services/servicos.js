import api from "../../../services/api";

export function obterServicos(endpoint) {
  return api.get(endpoint);
}

export function criarServico(endpoint, payload) {
  return api.post(endpoint, payload);
}

export function atualizarServico(endpoint, payload) {
  return api.put(endpoint, payload);
}

export function removerServico(endpoint) {
  return api.delete(endpoint);
}
