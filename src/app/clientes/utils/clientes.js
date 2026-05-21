function apenasDigitos(valor) {
  return String(valor ?? "").replace(/\D/g, "");
}

export function formatarCpf(valor) {
  const cpf = apenasDigitos(valor).slice(0, 11);

  if (cpf.length <= 3) {
    return cpf;
  }

  if (cpf.length <= 6) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3)}`;
  }

  if (cpf.length <= 9) {
    return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6)}`;
  }

  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`;
}

export function cpfValido(cpfInformado) {
  const cpf = apenasDigitos(cpfInformado);

  if (cpf.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let somaPrimeiroDigito = 0;

  for (let indice = 0; indice < 9; indice += 1) {
    somaPrimeiroDigito += Number(cpf[indice]) * (10 - indice);
  }

  const restoPrimeiroDigito = (somaPrimeiroDigito * 10) % 11;
  const primeiroDigitoCalculado =
    restoPrimeiroDigito === 10 ? 0 : restoPrimeiroDigito;

  if (primeiroDigitoCalculado !== Number(cpf[9])) {
    return false;
  }

  let somaSegundoDigito = 0;

  for (let indice = 0; indice < 10; indice += 1) {
    somaSegundoDigito += Number(cpf[indice]) * (11 - indice);
  }

  const restoSegundoDigito = (somaSegundoDigito * 10) % 11;
  const segundoDigitoCalculado =
    restoSegundoDigito === 10 ? 0 : restoSegundoDigito;

  return segundoDigitoCalculado === Number(cpf[10]);
}

export function formatarTelefone(valor) {
  const telefone = apenasDigitos(valor).slice(0, 11);

  if (telefone.length <= 2) {
    return telefone;
  }

  if (telefone.length <= 6) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2)}`;
  }

  if (telefone.length <= 10) {
    return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 6)}-${telefone.slice(6)}`;
  }

  return `(${telefone.slice(0, 2)}) ${telefone.slice(2, 7)}-${telefone.slice(7)}`;
}

export function telefoneValido(telefoneInformado) {
  const telefone = apenasDigitos(telefoneInformado);
  return telefone.length === 10 || telefone.length === 11;
}

export function emailValido(emailInformado) {
  const email = String(emailInformado ?? "").trim();
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

export function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? cliente?.cli_id ?? cliente?.codigo ?? cliente?.cod,
    nome: cliente?.nome ?? cliente?.cli_nome ?? cliente?.nomeCliente ?? "",
    cpf: cliente?.cpf ?? cliente?.cli_cpf ?? cliente?.cpfCliente ?? "",
    email: cliente?.email ?? cliente?.cli_email ?? cliente?.emailCliente ?? "",
    telefone: cliente?.telefone ?? cliente?.cli_telefone ?? cliente?.fone ?? "",
  };
}

export function extrairListaClientes(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.clientes)) {
    return payload.clientes;
  }

  if (Array.isArray(payload?.dados?.clientes)) {
    return payload.dados.clientes;
  }

  return [];
}

export function extrairLista(payload, chaveLista) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.[chaveLista])) {
    return payload[chaveLista];
  }

  if (Array.isArray(payload?.dados?.[chaveLista])) {
    return payload.dados[chaveLista];
  }

  return [];
}

function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase();
}

function compararIds(idA, idB) {
  if (idA === undefined || idA === null || idB === undefined || idB === null) {
    return false;
  }

  return String(idA).trim() === String(idB).trim();
}

function existeVinculoPorId(item, idCliente) {
  const idsRelacionados = [
    item?.clienteId,
    item?.cliente_id,
    item?.idCliente,
    item?.donoId,
    item?.dono_id,
    item?.cli_id,
    item?.cliente?.id,
    item?.cliente?.cli_id,
    item?.dono?.id,
    item?.dono?.cli_id,
  ];

  return idsRelacionados.some((idRelacionado) =>
    compararIds(idRelacionado, idCliente),
  );
}

function existeVinculoPorNome(item, nomeCliente) {
  const nomeNormalizado = normalizarTexto(nomeCliente);

  if (!nomeNormalizado) {
    return false;
  }

  const nomesRelacionados = [
    item?.cliente,
    item?.clienteNome,
    item?.nomeCliente,
    item?.cli_cliente,
    item?.clienteAgendamento,
    item?.dono,
    item?.donoNome,
    item?.cliente?.nome,
    item?.dono?.nome,
  ];

  return nomesRelacionados.some(
    (nomeRelacionado) => normalizarTexto(nomeRelacionado) === nomeNormalizado,
  );
}

export function itemPossuiVinculoComCliente(item, cliente) {
  return (
    existeVinculoPorId(item, cliente?.id) ||
    existeVinculoPorNome(item, cliente?.nome)
  );
}

export function obterChaveCliente(cliente) {
  if (cliente?.id !== undefined && cliente?.id !== null && cliente?.id !== "") {
    return `id:${String(cliente.id).trim()}`;
  }

  return `nome:${normalizarTexto(cliente?.nome)}`;
}

export function extrairClienteCriado(payload, fallback) {
  const clienteCriado =
    payload?.dados ?? payload?.data ?? payload?.cliente ?? payload;

  if (
    clienteCriado &&
    typeof clienteCriado === "object" &&
    !Array.isArray(clienteCriado)
  ) {
    return normalizarCliente(clienteCriado);
  }

  return {
    ...normalizarCliente(fallback),
    id: Date.now(),
  };
}

export function construirEndpointCliente(idCliente, endpointBase) {
  return `${endpointBase}/${idCliente}`;
}
