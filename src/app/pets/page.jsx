"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import api from "../../services/api";
import styles from "./page.module.css";

const PETS_ENDPOINT = "/pets";
const CLIENTES_ENDPOINT = "/clientes";
const PRODUTOS_ENDPOINT = "/produtos";
const AGENDAMENTOS_ENDPOINT = "/agendamentos";
const VENDAS_ENDPOINT = "/vendas";
const SERVICOS_ENDPOINT = "/servicos";

const estadoInicialFormulario = {
  nome: "",
  tipo: "",
  raca: "",
  peso: "",
  idade: "",
  clienteId: "",
};

function extrairLista(payload, chaveLista) {
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

function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? cliente?.cli_id ?? cliente?.codigo ?? cliente?.cod ?? "",
    nome: cliente?.nome ?? cliente?.cli_nome ?? cliente?.nomeCliente ?? "",
  };
}

function normalizarPet(pet) {
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

function extrairItemCriado(payload, fallback, normalizador) {
  const itemCriado = payload?.dados ?? payload?.data ?? payload?.pet ?? payload;

  if (itemCriado && typeof itemCriado === "object" && !Array.isArray(itemCriado)) {
    return normalizador(itemCriado);
  }

  return {
    ...normalizador(fallback),
    id: Date.now(),
  };
}

function normalizarTexto(valor) {
  return String(valor ?? "").trim().toLowerCase();
}

function compararIds(idA, idB) {
  if (idA === undefined || idA === null || idB === undefined || idB === null) {
    return false;
  }

  return String(idA).trim() === String(idB).trim();
}

function obterChavePet(pet) {
  if (pet?.id !== undefined && pet?.id !== null && pet?.id !== "") {
    return `id:${String(pet.id).trim()}`;
  }

  return `nome:${normalizarTexto(pet?.nome)}`;
}

function existeVinculoPetPorId(item, idPet) {
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

  return idsRelacionados.some((idRelacionado) => compararIds(idRelacionado, idPet));
}

function existeVinculoPetPorNome(item, nomePet) {
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

function existeVinculoPetComCliente(item, pet) {
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
    (nomeRelacionado) => normalizarTexto(nomeRelacionado) === normalizarTexto(nomeDonoPet),
  );
}

function itemPossuiVinculoComPet(item, pet, tipoLista) {
  if (tipoLista === "clientes") {
    return existeVinculoPetComCliente(item, pet);
  }

  return existeVinculoPetPorId(item, pet?.id) || existeVinculoPetPorNome(item, pet?.nome);
}

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [petsComVinculo, setPetsComVinculo] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [petEmEdicao, setPetEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregandoPets, setCarregandoPets] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processandoAcaoId, setProcessandoAcaoId] = useState(null);
  const [erroPets, setErroPets] = useState("");
  const [erroModal, setErroModal] = useState("");
  const [modalConfirmacaoAberto, setModalConfirmacaoAberto] = useState(false);
  const [petParaExcluir, setPetParaExcluir] = useState(null);

  useEffect(() => {
    buscarPets();
    buscarClientes();
  }, []);

  function petEstaVinculado(pet) {
    return Boolean(petsComVinculo[obterChavePet(pet)]);
  }

  async function buscarPetsComVinculo(listaPets) {
    const endpointsRelacionados = [
      { endpoint: CLIENTES_ENDPOINT, chaveLista: "clientes", tipoLista: "clientes" },
      { endpoint: PRODUTOS_ENDPOINT, chaveLista: "produtos", tipoLista: "produtos" },
      {
        endpoint: AGENDAMENTOS_ENDPOINT,
        chaveLista: "agendamentos",
        tipoLista: "agendamentos",
      },
      { endpoint: VENDAS_ENDPOINT, chaveLista: "vendas", tipoLista: "vendas" },
      { endpoint: SERVICOS_ENDPOINT, chaveLista: "servicos", tipoLista: "servicos" },
    ];

    const respostas = await Promise.allSettled(
      endpointsRelacionados.map(({ endpoint }) => api.get(endpoint)),
    );

    const listasRelacionadas = respostas.map((resultado, indice) => {
      if (resultado.status !== "fulfilled") {
        return { tipoLista: endpointsRelacionados[indice].tipoLista, itens: [] };
      }

      const { chaveLista, tipoLista } = endpointsRelacionados[indice];
      return {
        tipoLista,
        itens: extrairLista(resultado.value?.data, chaveLista),
      };
    });

    const mapaVinculos = {};

    listaPets.forEach((pet) => {
      const possuiVinculo = listasRelacionadas.some(({ tipoLista, itens }) =>
        itens.some((item) => itemPossuiVinculoComPet(item, pet, tipoLista)),
      );

      mapaVinculos[obterChavePet(pet)] = possuiVinculo;
    });

    setPetsComVinculo(mapaVinculos);
  }

  async function buscarPets() {
    try {
      setCarregandoPets(true);
      setErroPets("");

      const response = await api.get(PETS_ENDPOINT);
      const lista = extrairLista(response.data, "pets").map(normalizarPet);

      setPets(lista);
      await buscarPetsComVinculo(lista);
    } catch (error) {
      console.log("Erro ao buscar pets:", error);
    } finally {
      setCarregandoPets(false);
    }
  }

  async function buscarClientes() {
    try {
      setCarregandoClientes(true);

      const response = await api.get(CLIENTES_ENDPOINT);
      const lista = extrairLista(response.data, "clientes").map(normalizarCliente);

      setClientes(lista);
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setCarregandoClientes(false);
    }
  }

  function abrirModal() {
    setPetEmEdicao(null);
    setFormulario(estadoInicialFormulario);
    setErroModal("");
    setModalAberto(true);
  }

  function abrirModalEdicao(pet) {
    setPetEmEdicao(pet);
    setFormulario({
      nome: pet.nome ?? "",
      tipo: pet.tipo ?? "",
      raca: pet.raca ?? "",
      peso: pet.peso ? String(pet.peso) : "",
      idade: pet.idade ? String(pet.idade) : "",
      clienteId: pet.clienteId ? String(pet.clienteId) : "",
    });
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setPetEmEdicao(null);
    setFormulario(estadoInicialFormulario);
    setErroModal("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((estadoAnterior) => ({
      ...(estadoAnterior ?? estadoInicialFormulario),
      [name]: value,
    }));
  }

  async function salvarPet(evento) {
    evento.preventDefault();

    const clienteSelecionado = clientes.find(
      (cliente) => String(cliente.id) === formulario.clienteId,
    );

    const novoPet = {
      nome: formulario.nome.trim(),
      tipo: formulario.tipo.trim(),
      raca: formulario.raca.trim(),
      peso: formulario.peso,
      idade: formulario.idade,
      clienteId: formulario.clienteId,
    };

    const endpoint = petEmEdicao?.id
      ? `${PETS_ENDPOINT}/${petEmEdicao.id}`
      : PETS_ENDPOINT;

    try {
      setSalvando(true);
      setErroModal("");

      const response = petEmEdicao?.id
        ? await api.put(endpoint, novoPet)
        : await api.post(endpoint, novoPet);

      if (petEmEdicao?.id) {
        const petAtualizado = extrairItemCriado(
          response.data,
          {
            ...petEmEdicao,
            ...novoPet,
            dono: clienteSelecionado?.nome ?? "",
          },
          normalizarPet,
        );

        setPets((estadoAnterior) =>
          estadoAnterior.map((petAtual) =>
            String(petAtual.id) === String(petEmEdicao.id) ? petAtualizado : petAtual,
          ),
        );
      } else {
        const petCriado = extrairItemCriado(
          response.data,
          {
            ...novoPet,
            dono: clienteSelecionado?.nome ?? "",
          },
          normalizarPet,
        );

        setPets((estadoAnterior) => [...estadoAnterior, petCriado]);
      }

      await buscarPets();

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar pet:", error);
      const mensagemErro =
        error.response?.data?.mensagem ??
        (petEmEdicao
          ? "Nao foi possivel atualizar o pet."
          : "Nao foi possivel cadastrar o pet.");

      setErroModal(mensagemErro);
    } finally {
      setSalvando(false);
    }
  }

  async function excluirPet(pet) {
    if (!pet?.id) {
      setErroPets("Nao foi possivel excluir: pet sem identificador.");
      return;
    }

    if (petEstaVinculado(pet)) {
      setErroPets(
        "Pet vinculado a cliente/produto/agendamento/venda/servico nao pode ser excluido.",
      );
      return;
    }

    setPetParaExcluir(pet);
    setModalConfirmacaoAberto(true);
  }

  async function confirmarExclusao() {
    if (!petParaExcluir?.id) {
      setErroPets("Nao foi possivel excluir: pet sem identificador.");
      return;
    }

    try {
      setProcessandoAcaoId(String(petParaExcluir.id));
      setErroPets("");

      await api.delete(`${PETS_ENDPOINT}/${petParaExcluir.id}`);
      setPets((estadoAnterior) =>
        estadoAnterior.filter((item) => String(item.id) !== String(petParaExcluir.id)),
      );

      setModalConfirmacaoAberto(false);
      setPetParaExcluir(null);
    } catch (error) {
      console.log("Erro ao excluir pet:", error);
      const mensagemErro =
        error.response?.data?.mensagem ?? "Nao foi possivel excluir o pet.";

      setErroPets(mensagemErro);
    } finally {
      setProcessandoAcaoId(null);
    }
  }

  function cancelarExclusao() {
    setModalConfirmacaoAberto(false);
    setPetParaExcluir(null);
  }

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Pets" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Pets</h1>

            <button type="button" className={styles.botaoNovo} onClick={abrirModal}>
              <Plus size={20} />
              <span>Novo Pet</span>
            </button>
          </div>

          {erroPets && <p className={styles.mensagemErro}>{erroPets}</p>}

          <div className={styles.tabelaContainer}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Tipo</th>
                  <th>Raca</th>
                  <th>Peso (kg)</th>
                  <th>Idade</th>
                  <th>Dono</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregandoPets ? (
                  <tr>
                    <td colSpan="7" className={styles.estadoTabela}>
                      Carregando pets...
                    </td>
                  </tr>
                ) : pets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className={styles.estadoTabela}>
                      Nenhum pet encontrado.
                    </td>
                  </tr>
                ) : (
                  pets.map((pet) => (
                    <tr key={pet.id ?? `${pet.nome}-${pet.clienteId}`}>
                      <td>{pet.nome}</td>
                      <td>{pet.tipo}</td>
                      <td>{pet.raca}</td>
                      <td>{pet.peso}</td>
                      <td>{pet.idade}</td>
                      <td>{pet.dono}</td>
                      <td>
                        <div className={styles.acoesTabela}>
                          <button
                            type="button"
                            className={styles.botaoAcaoEditar}
                            onClick={() => abrirModalEdicao(pet)}
                            disabled={processandoAcaoId === String(pet.id)}
                            aria-label={`Editar pet ${pet.nome}`}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>

                          <button
                            type="button"
                            className={styles.botaoAcaoExcluir}
                            onClick={() => excluirPet(pet)}
                            disabled={
                              processandoAcaoId === String(pet.id) ||
                              petEstaVinculado(pet)
                            }
                            aria-label={`Excluir pet ${pet.nome}`}
                            title={
                              petEstaVinculado(pet)
                                ? "Pet possui vinculo e nao pode ser excluido"
                                : ""
                            }
                          >
                            <Trash2 size={16} />
                            <span>
                              {petEstaVinculado(pet)
                                ? "Vinculado"
                                : processandoAcaoId === String(pet.id)
                                ? "Excluindo..."
                                : "Excluir"}
                            </span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {modalAberto && (
        <div className={styles.modalOverlay} onClick={fecharModal}>
          <section
            className={styles.modal}
            onClick={(evento) => evento.stopPropagation()}
            aria-modal="true"
            role="dialog"
          >
            <div className={styles.modalHeader}>
              <h2>{petEmEdicao ? "Editar Pet" : "Novo Pet"}</h2>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={fecharModal}
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <form className={styles.formulario} onSubmit={salvarPet}>
              {erroModal && <p className={styles.mensagemErroModal}>{erroModal}</p>}

              <label htmlFor="nome" className={styles.campo}>
                Nome
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  value={formulario?.nome ?? ""}
                  onChange={atualizarCampo}
                  required
                  autoFocus
                />
              </label>

              <label htmlFor="tipo" className={styles.campo}>
                Tipo
                <input
                  id="tipo"
                  name="tipo"
                  type="text"
                  placeholder="Cachorro, Gato..."
                  value={formulario?.tipo ?? ""}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="raca" className={styles.campo}>
                Raça
                <input
                  id="raca"
                  name="raca"
                  type="text"
                  placeholder="Labrador, Siamês..."
                  value={formulario?.raca ?? ""}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="peso" className={styles.campo}>
                Peso (kg)
                <input
                  id="peso"
                  name="peso"
                  type="number"
                  min="0"
                  step="0.1"
                  placeholder="Ex.: 12.5"
                  value={formulario?.peso ?? ""}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="idade" className={styles.campo}>
                Idade
                <input
                  id="idade"
                  name="idade"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Ex.: 3"
                  value={formulario?.idade ?? ""}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="clienteId" className={styles.campo}>
                Cliente
                <select
                  id="clienteId"
                  name="clienteId"
                  value={formulario?.clienteId ?? ""}
                  onChange={atualizarCampo}
                  required
                  disabled={carregandoClientes}
                >
                  <option value="">
                    {carregandoClientes ? "Carregando clientes..." : "Selecione o dono"}
                  </option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nome}
                    </option>
                  ))}
                </select>
              </label>

              <button type="submit" className={styles.botaoSalvar} disabled={salvando}>
                {salvando
                  ? petEmEdicao
                    ? "Atualizando..."
                    : "Salvando..."
                  : petEmEdicao
                    ? "Atualizar"
                    : "Salvar"}
              </button>
            </form>
          </section>
        </div>
      )}

      <ConfirmationModal
        isOpen={modalConfirmacaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={`Deseja realmente excluir o pet ${petParaExcluir?.nome || "selecionado"}?`}
        textoBotaoOk="Excluir"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={processandoAcaoId !== null}
      />
    </div>
  );
}