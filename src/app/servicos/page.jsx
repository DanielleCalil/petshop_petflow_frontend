"use client";

import { Plus } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import ServicoFormModal from "./components/ServicoFormModal";
import ServicosTable from "./components/ServicosTable";
import { useServicosPage } from "./hooks/useServicosPage";
import styles from "./page.module.css";
export default function ServicosPage() {
  const {
    servicos,
    modalAberto,
    servicoEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    servicoParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarServico,
    excluirServico,
    confirmarExclusao,
    cancelarExclusao,
  } = useServicosPage();

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Serviços" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Serviços</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo Serviço</span>
            </button>
          </div>

          {erro && !modalAberto && (
            <p className={styles.mensagemErro}>{erro}</p>
          )}

          <ServicosTable
            styles={styles}
            carregando={carregando}
            servicos={servicos}
            excluindoId={excluindoId}
            onEditar={abrirModalEdicao}
            onExcluir={excluirServico}
          />
        </main>
      </div>

      <ServicoFormModal
        styles={styles}
        modalAberto={modalAberto}
        fecharModal={fecharModal}
        servicoEmEdicao={servicoEmEdicao}
        salvarServico={salvarServico}
        erro={erro}
        formulario={formulario}
        atualizarCampo={atualizarCampo}
        salvando={salvando}
      />

      <ConfirmationModal
        isOpen={modalConfirmacaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={`Deseja realmente excluir o serviço ${servicoParaExcluir?.nome}?`}
        textoBotaoOk="Excluir"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindoId !== null}
      />
    </div>
  );
}


