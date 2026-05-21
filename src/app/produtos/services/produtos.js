import api from "../../../services/api";

export function obterProdutos(endpoint) {
  return api.get(endpoint);
}

export function criarProduto(endpoint, payload) {
  return api.post(endpoint, payload);
}

export function atualizarProduto(endpoint, payload) {
  return api.put(endpoint, payload);
}

export function removerProduto(endpoint) {
  return api.delete(endpoint);
}
