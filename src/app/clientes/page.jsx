"use client";

import { Plus } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import ClienteFormModal from "./components/ClienteFormModal";
import ClientesTable from "./components/ClientesTable";
import { useClientesPage } from "./hooks/useClientesPage";
import styles from "./page.module.css";
export default function ClientesPage() {
  const {
    clientes,
    modalAberto,
    clienteEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    clienteParaExcluir,
    clienteEstaVinculado,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarCliente,
    excluirCliente,
    confirmarExclusao,
    cancelarExclusao,
  } = useClientesPage();

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

          <ClientesTable
            styles={styles}
            carregando={carregando}
            clientes={clientes}
            excluindoId={excluindoId}
            clienteEstaVinculado={clienteEstaVinculado}
            onEditar={abrirModalEdicao}
            onExcluir={excluirCliente}
          />
        </main>
      </div>

      <ClienteFormModal
        styles={styles}
        modalAberto={modalAberto}
        fecharModal={fecharModal}
        clienteEmEdicao={clienteEmEdicao}
        salvarCliente={salvarCliente}
        erro={erro}
        formulario={formulario}
        atualizarCampo={atualizarCampo}
        salvando={salvando}
      />

      <ConfirmationModal
        isOpen={modalConfirmacaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={`Deseja realmente excluir o cliente ${clienteParaExcluir?.nome}?`}
        textoBotaoOk="Excluir"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindoId !== null}
      />
    </div>
  );
}


