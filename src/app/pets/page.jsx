"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
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
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregandoPets, setCarregandoPets] = useState(true);
  const [carregandoClientes, setCarregandoClientes] = useState(true);
  const [salvando, setSalvando] = useState(false);
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
      const mensagemErro =
        error.response?.data?.mensagem ?? "Nao foi possivel carregar os pets.";

      setErroPets(mensagemErro);
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
      const mensagemErro =
        error.response?.data?.mensagem ?? "Nao foi possivel carregar os clientes.";

      setErroModal(mensagemErro);
    } finally {
      setCarregandoClientes(false);
    }
  }

  function abrirModal() {
    setErroModal("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
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

    try {
      setSalvando(true);
      setErroModal("");

      const response = await api.post(PETS_ENDPOINT, novoPet);
      const petCriado = extrairItemCriado(
        response.data,
        {
          ...novoPet,
          dono: clienteSelecionado?.nome ?? "",
        },
        normalizarPet,
      );

      setPets((estadoAnterior) => [...estadoAnterior, petCriado]);
      fecharModal();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.mensagem ?? "Nao foi possivel cadastrar o pet.";

      setErroModal(mensagemErro);
    } finally {
      setSalvando(false);
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
                </tr>
              </thead>

              <tbody>
                {carregandoPets ? (
                  <tr>
                    <td colSpan="3" className={styles.estadoTabela}>
                      Carregando pets...
                    </td>
                  </tr>
                ) : pets.length === 0 ? (
                  <tr>
                    <td colSpan="3" className={styles.estadoTabela}>
                      Nenhum pet encontrado.
                    </td>
                  </tr>
                ) : (
                  pets.map((pet) => (
                    <tr key={pet.id ?? `${pet.nome}-${pet.clienteId}`}>
                      <td>{pet.nome}</td>
                      <td>{pet.tipo}</td>
                      <td>{pet.dono}</td>
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
              <h2>Novo Pet</h2>
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
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}