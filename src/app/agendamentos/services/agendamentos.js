import api from "../../../services/api";

export function obterLista(endpoint) {
  return api.get(endpoint);
}

export function criarAgendamento(endpoint, payload) {
  return api.post(endpoint, payload);
}

export function atualizarAgendamento(endpoint, payload) {
  return api.put(endpoint, payload);
}

export function removerAgendamento(endpoint) {
  return api.delete(endpoint);
}
