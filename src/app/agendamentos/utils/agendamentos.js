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
    clienteId:
      pet?.clienteId ?? pet?.cliente_id ?? pet?.cli_id ?? pet?.donoId ?? "",
  };
}

export function normalizarServico(servico) {
  return {
    id: servico?.id ?? servico?.ser_id ?? servico?.codigo ?? servico?.cod ?? "",
    nome: servico?.nome ?? servico?.ser_nome ?? servico?.nomeServico ?? "",
  };
}

export function normalizarAgendamento(agendamento) {
  return {
    id:
      agendamento?.id ??
      agendamento?.cli_id ??
      agendamento?.codigo ??
      agendamento?.cod,
    clienteId: agendamento?.clienteId ?? agendamento?.cliente_id ?? "",
    cliente:
      agendamento?.cliente?.nome ??
      agendamento?.cliente ??
      agendamento?.cli_cliente ??
      agendamento?.clienteAgendamento ??
      "",
    petId: agendamento?.petId ?? agendamento?.pet_id ?? "",
    pet:
      agendamento?.pet?.nome ?? agendamento?.pet ?? agendamento?.cli_pet ?? "",
    servico:
      agendamento?.servico?.nome ??
      agendamento?.servico ??
      agendamento?.cli_servico ??
      agendamento?.servicoAgendamento ??
      "",
    data: agendamento?.data ?? agendamento?.age_data ?? "",
    hora: agendamento?.hora ?? agendamento?.age_hora ?? "",
    status: agendamento?.status ?? agendamento?.age_status ?? "Agendado",
  };
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

  if (Array.isArray(payload?.data?.[chaveLista])) {
    return payload.data[chaveLista];
  }

  if (Array.isArray(payload?.[chaveLista])) {
    return payload[chaveLista];
  }

  if (Array.isArray(payload?.dados?.[chaveLista])) {
    return payload.dados[chaveLista];
  }

  if (Array.isArray(payload?.dados?.data?.[chaveLista])) {
    return payload.dados.data[chaveLista];
  }

  if (Array.isArray(payload?.data?.dados?.[chaveLista])) {
    return payload.data.dados[chaveLista];
  }

  return [];
}

export function extrairAgendamentoCriado(payload, fallback) {
  const agendamentoCriado =
    payload?.dados ?? payload?.data ?? payload?.agendamento ?? payload;

  if (
    agendamentoCriado &&
    typeof agendamentoCriado === "object" &&
    !Array.isArray(agendamentoCriado)
  ) {
    return normalizarAgendamento(agendamentoCriado);
  }

  return {
    ...normalizarAgendamento(fallback),
    id: Date.now(),
  };
}

export function construirEndpointAgendamento(idAgendamento, endpointBase) {
  return `${endpointBase}/${idAgendamento}`;
}

export function formatarDataParaBR(data) {
  if (!data) {
    return "";
  }

  const partes = String(data).split("T")[0].split("-");

  if (partes.length === 3 && partes[0].length === 4) {
    const [ano, mes, dia] = partes;
    return `${dia}/${mes}/${ano}`;
  }

  return data;
}
