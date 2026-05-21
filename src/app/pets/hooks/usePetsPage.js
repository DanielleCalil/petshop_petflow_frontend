import { useEffect, useState } from "react";

import {
  CLIENTES_ENDPOINT,
  ENDPOINTS_RELACIONADOS_PET,
  ESTADO_INICIAL_FORMULARIO,
  PETS_ENDPOINT,
} from "../constants/pets";
import {
  atualizarPet,
  criarPet,
  obterLista,
  removerPet,
} from "../services/pets";
import {
  compararIds,
  extrairItemCriado,
  extrairLista,
  itemPossuiVinculoComPet,
  normalizarCliente,
  normalizarPet,
  obterChavePet,
} from "../utils/pets";

export function usePetsPage() {
  const [pets, setPets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [petsComVinculo, setPetsComVinculo] = useState({});
  const [modalAberto, setModalAberto] = useState(false);
  const [petEmEdicao, setPetEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(ESTADO_INICIAL_FORMULARIO);
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
    const respostas = await Promise.allSettled(
      ENDPOINTS_RELACIONADOS_PET.map(({ endpoint }) => obterLista(endpoint)),
    );

    const listasRelacionadas = respostas.map((resultado, indice) => {
      if (resultado.status !== "fulfilled") {
        return {
          tipoLista: ENDPOINTS_RELACIONADOS_PET[indice].tipoLista,
          itens: [],
        };
      }

      const { chaveLista, tipoLista } = ENDPOINTS_RELACIONADOS_PET[indice];
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

      const response = await obterLista(PETS_ENDPOINT);
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

      const response = await obterLista(CLIENTES_ENDPOINT);
      const lista = extrairLista(response.data, "clientes").map(
        normalizarCliente,
      );

      setClientes(lista);
    } catch (error) {
      console.log("Erro ao buscar clientes:", error);
    } finally {
      setCarregandoClientes(false);
    }
  }

  function abrirModal() {
    setPetEmEdicao(null);
    setFormulario(ESTADO_INICIAL_FORMULARIO);
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
    setFormulario(ESTADO_INICIAL_FORMULARIO);
    setErroModal("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((estadoAnterior) => ({
      ...(estadoAnterior ?? ESTADO_INICIAL_FORMULARIO),
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
        ? await atualizarPet(endpoint, novoPet)
        : await criarPet(endpoint, novoPet);

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
            compararIds(petAtual.id, petEmEdicao.id) ? petAtualizado : petAtual,
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

  function excluirPet(pet) {
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

      await removerPet(`${PETS_ENDPOINT}/${petParaExcluir.id}`);
      setPets((estadoAnterior) =>
        estadoAnterior.filter(
          (item) => !compararIds(item.id, petParaExcluir.id),
        ),
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

  return {
    pets,
    clientes,
    modalAberto,
    petEmEdicao,
    formulario,
    carregandoPets,
    carregandoClientes,
    salvando,
    processandoAcaoId,
    erroPets,
    erroModal,
    modalConfirmacaoAberto,
    petParaExcluir,
    petEstaVinculado,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarPet,
    excluirPet,
    confirmarExclusao,
    cancelarExclusao,
  };
}
