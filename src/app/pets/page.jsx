"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import api from "../../services/api";
import styles from "./page.module.css";

const PETS_ENDPOINT = "/pets";
const CLIENTES_ENDPOINT = "/clientes";

const estadoInicialFormulario = {
  nome: "",
  tipo: "",
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

export default function PetsPage() {
  const [pets, setPets] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [petEmEdicao, setPetEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregandoPets, setCarregandoPets] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [processandoAcaoId, setProcessandoAcaoId] = useState(null);
  const [erroPets, setErroPets] = useState("");
  const [erroModal, setErroModal] = useState("");

  useEffect(() => {
    buscarPets();
    buscarClientes();
  }, []);

  async function buscarPets() {
    try {
      setCarregandoPets(true);
      setErroPets("");

      const response = await api.get(PETS_ENDPOINT);
      const lista = extrairLista(response.data, "pets").map(normalizarPet);

      setPets(lista);
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
      ...estadoAnterior,
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

    const confirmou = window.confirm(
      `Deseja realmente excluir o pet ${pet.nome || "selecionado"}?`,
    );

    if (!confirmou) {
      return;
    }

    try {
      setProcessandoAcaoId(String(pet.id));
      setErroPets("");

      await api.delete(`${PETS_ENDPOINT}/${pet.id}`);
      setPets((estadoAnterior) =>
        estadoAnterior.filter((item) => String(item.id) !== String(pet.id)),
      );
    } catch (error) {
      console.log("Erro ao excluir pet:", error);
      const mensagemErro =
        error.response?.data?.mensagem ?? "Nao foi possivel excluir o pet.";

      setErroPets(mensagemErro);
    } finally {
      setProcessandoAcaoId(null);
    }
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
                  <th>Dono</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregandoPets ? (
                  <tr>
                    <td colSpan="4" className={styles.estadoTabela}>
                      Carregando pets...
                    </td>
                  </tr>
                ) : pets.length === 0 ? (
                  <tr>
                    <td colSpan="4" className={styles.estadoTabela}>
                      Nenhum pet encontrado.
                    </td>
                  </tr>
                ) : (
                  pets.map((pet) => (
                    <tr key={pet.id ?? `${pet.nome}-${pet.clienteId}`}>
                      <td>{pet.nome}</td>
                      <td>{pet.tipo}</td>
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
                            disabled={processandoAcaoId === String(pet.id)}
                            aria-label={`Excluir pet ${pet.nome}`}
                          >
                            <Trash2 size={16} />
                            <span>
                              {processandoAcaoId === String(pet.id)
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
                  value={formulario.nome}
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
                  value={formulario.tipo}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="clienteId" className={styles.campo}>
                Cliente
                <select
                  id="clienteId"
                  name="clienteId"
                  value={formulario.clienteId}
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
    </div>
  );
}