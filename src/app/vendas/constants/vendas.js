export const VENDAS_ENDPOINT = "/vendas";
export const CLIENTES_ENDPOINT = "/clientes";
export const PRODUTOS_ENDPOINT = "/produtos";

export const NOVO_ITEM_PRODUTO = {
  produto: "",
  quantidade: "1",
  subtotal: "",
};

export const ESTADO_INICIAL_FORMULARIO = {
  cliente: "",
  produtos: [{ idTemporario: 1, ...NOVO_ITEM_PRODUTO }],
  totalVenda: 0,
};
