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

export function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? cliente?.cli_id ?? cliente?.codigo ?? cliente?.cod ?? "",
    nome: cliente?.nome ?? cliente?.cli_nome ?? cliente?.nomeCliente ?? "",
  };
}

export function normalizarPet(pet) {
  return {
    id: pet?.id ?? pet?.pet_id ?? pet?.codigo ?? pet?.cod ?? "",
    nome: pet?.nome ?? pet?.pet_nome ?? pet?.nomePet ?? "",
    tipo: pet?.tipo ?? pet?.pet_tipo ?? pet?.especie ?? "",
    raca: pet?.raca ?? pet?.pet_raca ?? "",
    peso: pet?.peso ?? pet?.pet_peso ?? "",
    idade: pet?.idade ?? pet?.pet_idade ?? "",
    clienteId:
      pet?.clienteId ?? pet?.cliente_id ?? pet?.cli_id ?? pet?.donoId ?? "",
    dono:
      pet?.dono ??
      pet?.clienteNome ??
      pet?.nomeCliente ??
      pet?.cliente?.nome ??
      pet?.dono?.nome ??
      "",
  };
}

export function extrairItemCriado(payload, fallback, normalizador) {
  const itemCriado = payload?.dados ?? payload?.data ?? payload?.pet ?? payload;

  if (
    itemCriado &&
    typeof itemCriado === "object" &&
    !Array.isArray(itemCriado)
  ) {
    return normalizador(itemCriado);
  }

  return {
    ...normalizador(fallback),
    id: Date.now(),
  };
}

export function normalizarTexto(valor) {
  return String(valor ?? "")
    .trim()
    .toLowerCase();
}

export function compararIds(idA, idB) {
  if (idA === undefined || idA === null || idB === undefined || idB === null) {
    return false;
  }

  return String(idA).trim() === String(idB).trim();
}

export function obterChavePet(pet) {
  if (pet?.id !== undefined && pet?.id !== null && pet?.id !== "") {
    return `id:${String(pet.id).trim()}`;
  }

  return `nome:${normalizarTexto(pet?.nome)}`;
}

export function existeVinculoPetPorId(item, idPet) {
  const idsRelacionados = [
    item?.petId,
    item?.pet_id,
    item?.idPet,
    item?.pet?.id,
    item?.pet?.pet_id,
    item?.produto?.petId,
    item?.produto?.pet_id,
    item?.servico?.petId,
    item?.servico?.pet_id,
  ];

  return idsRelacionados.some((idRelacionado) =>
    compararIds(idRelacionado, idPet),
  );
}

export function existeVinculoPetPorNome(item, nomePet) {
  const nomeNormalizado = normalizarTexto(nomePet);

  if (!nomeNormalizado) {
    return false;
  }

  const nomesRelacionados = [
    item?.pet,
    item?.petNome,
    item?.nomePet,
    item?.cli_pet,
    item?.produto?.pet,
    item?.servico?.pet,
    item?.pet?.nome,
  ];

  return nomesRelacionados.some(
    (nomeRelacionado) => normalizarTexto(nomeRelacionado) === nomeNormalizado,
  );
}

export function existeVinculoPetComCliente(item, pet) {
  const idClientePet = pet?.clienteId;
  const nomeDonoPet = pet?.dono;
  const idsRelacionados = [
    item?.id,
    item?.cli_id,
    item?.clienteId,
    item?.cliente_id,
    item?.idCliente,
  ];
  const nomesRelacionados = [item?.nome, item?.cli_nome, item?.nomeCliente];

  const vinculoPorIdCliente = idsRelacionados.some((idRelacionado) =>
    compararIds(idRelacionado, idClientePet),
  );

  if (vinculoPorIdCliente) {
    return true;
  }

  return nomesRelacionados.some(
    (nomeRelacionado) =>
      normalizarTexto(nomeRelacionado) === normalizarTexto(nomeDonoPet),
  );
}

export function itemPossuiVinculoComPet(item, pet, tipoLista) {
  if (tipoLista === "clientes") {
    return existeVinculoPetComCliente(item, pet);
  }

  return (
    existeVinculoPetPorId(item, pet?.id) ||
    existeVinculoPetPorNome(item, pet?.nome)
  );
}
