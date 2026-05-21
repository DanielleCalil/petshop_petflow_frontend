import api from "../../../services/api";

export function obterLista(endpoint) {
  return api.get(endpoint);
}

export function criarPet(endpoint, payload) {
  return api.post(endpoint, payload);
}

export function atualizarPet(endpoint, payload) {
  return api.put(endpoint, payload);
}

export function removerPet(endpoint) {
  return api.delete(endpoint);
}
