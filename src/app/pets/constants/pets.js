export const PETS_ENDPOINT = "/pets";
export const CLIENTES_ENDPOINT = "/clientes";
export const PRODUTOS_ENDPOINT = "/produtos";
export const AGENDAMENTOS_ENDPOINT = "/agendamentos";
export const VENDAS_ENDPOINT = "/vendas";
export const SERVICOS_ENDPOINT = "/servicos";

export const ESTADO_INICIAL_FORMULARIO = {
  nome: "",
  tipo: "",
  raca: "",
  peso: "",
  idade: "",
  clienteId: "",
};

export const ENDPOINTS_RELACIONADOS_PET = [
  {
    endpoint: CLIENTES_ENDPOINT,
    chaveLista: "clientes",
    tipoLista: "clientes",
  },
  {
    endpoint: PRODUTOS_ENDPOINT,
    chaveLista: "produtos",
    tipoLista: "produtos",
  },
  {
    endpoint: AGENDAMENTOS_ENDPOINT,
    chaveLista: "agendamentos",
    tipoLista: "agendamentos",
  },
  { endpoint: VENDAS_ENDPOINT, chaveLista: "vendas", tipoLista: "vendas" },
  {
    endpoint: SERVICOS_ENDPOINT,
    chaveLista: "servicos",
    tipoLista: "servicos",
  },
];
