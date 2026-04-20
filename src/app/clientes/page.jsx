"use client";

import { useEffect, useState } from "react";
import { Plus, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import api from "../../services/api";
import styles from "./page.module.css";

const CLIENTES_ENDPOINT = "/clientes";

const estadoInicialFormulario = {
  nome: "",
  telefone: "",
  email: "",
};

function normalizarCliente(cliente) {
  return {
    id: cliente?.id ?? cliente?.cli_id ?? cliente?.codigo ?? cliente?.cod,
    nome: cliente?.nome ?? cliente?.cli_nome ?? cliente?.nomeCliente ?? "",
    telefone: cliente?.telefone ?? cliente?.cli_telefone ?? cliente?.fone ?? "",
    email: cliente?.email ?? cliente?.cli_email ?? cliente?.emailCliente ?? "",
  };
}

function extrairListaClientes(payload) {
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

function extrairClienteCriado(payload, fallback) {
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

export default function ClientesPage() {
  const [clientes, setClientes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarClientes();
  }, []);

  async function buscarClientes() {
    try {
      setCarregando(true);
      setErro("");

      const response = await api.get(CLIENTES_ENDPOINT);
      const lista = extrairListaClientes(response.data).map(normalizarCliente);

      setClientes(lista);
    } catch {
      // erro silenciado
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setFormulario(estadoInicialFormulario);
    setErro("");
  }

  function atualizarCampo(evento) {
    const { name, value } = evento.target;
    setFormulario((estadoAnterior) => ({
      ...estadoAnterior,
      [name]: value,
    }));
  }

  async function salvarCliente(evento) {
    evento.preventDefault();

    const novoCliente = {
      nome: formulario.nome.trim(),
      telefone: formulario.telefone.trim(),
      email: formulario.email.trim(),
    };

    try {
      setSalvando(true);
      setErro("");

      const response = await api.post(CLIENTES_ENDPOINT, novoCliente);
      const clienteCriado = extrairClienteCriado(response.data, novoCliente);

      setClientes((estadoAnterior) => [...estadoAnterior, clienteCriado]);
      fecharModal();
    } catch {
      // erro silenciado
    } finally {
      setSalvando(false);
    }
  }

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Clientes" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Clientes</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo Cliente</span>
            </button>
          </div>

          {erro && !modalAberto && (
            <p className={styles.mensagemErro}>{erro}</p>
          )}

          <div className={styles.tabelaContainer}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan="3" className={styles.estadoTabela}>
                      Carregando clientes...
                    </td>
                  </tr>
                ) : clientes.length === 0 ? (
                  <tr>
                    <td colSpan="3" className={styles.estadoTabela}>
                      Nenhum cliente encontrado.
                    </td>
                  </tr>
                ) : (
                  clientes.map((cliente) => (
                    <tr key={cliente.id ?? `${cliente.nome}-${cliente.email}`}>
                      <td>{cliente.nome}</td>
                      <td>{cliente.telefone}</td>
                      <td>{cliente.email}</td>
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
              <h2>Novo Cliente</h2>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={fecharModal}
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <form className={styles.formulario} onSubmit={salvarCliente}>
              {erro && <p className={styles.mensagemErroModal}>{erro}</p>}

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

              <label htmlFor="telefone" className={styles.campo}>
                Telefone
                <input
                  id="telefone"
                  name="telefone"
                  type="text"
                  value={formulario.telefone}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <label htmlFor="email" className={styles.campo}>
                Email
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formulario.email}
                  onChange={atualizarCampo}
                  required
                />
              </label>

              <button
                type="submit"
                className={styles.botaoSalvar}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Salvar"}
              </button>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
