"use client";

import { Plus } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import AgendamentoFormModal from "./components/AgendamentoFormModal";
import AgendamentosTable from "./components/AgendamentosTable";
import { useAgendamentosPage } from "./hooks/useAgendamentosPage";
import styles from "./page.module.css";
export default function AgendamentosPage() {
  const {
    agendamentos,
    clientes,
    pets,
    servicos,
    modalAberto,
    agendamentoEmEdicao,
    formulario,
    carregando,
    carregandoClientes,
    carregandoPets,
    carregandoServicos,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    agendamentoParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarAgendamento,
    excluirAgendamento,
    confirmarExclusao,
    cancelarExclusao,
  } = useAgendamentosPage();

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Agendamentos" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Agendamentos</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo agendamento</span>
            </button>
          </div>

          {erro && !modalAberto && (
            <p className={styles.mensagemErro}>{erro}</p>
          )}

          <AgendamentosTable
            styles={styles}
            carregando={carregando}
            agendamentos={agendamentos}
            excluindoId={excluindoId}
            onEditar={abrirModalEdicao}
            onExcluir={excluirAgendamento}
          />
        </main>
      </div>

      <AgendamentoFormModal
        styles={styles}
        modalAberto={modalAberto}
        fecharModal={fecharModal}
        agendamentoEmEdicao={agendamentoEmEdicao}
        salvarAgendamento={salvarAgendamento}
        erro={erro}
        formulario={formulario}
        atualizarCampo={atualizarCampo}
        carregandoClientes={carregandoClientes}
        clientes={clientes}
        carregandoPets={carregandoPets}
        pets={pets}
        carregandoServicos={carregandoServicos}
        servicos={servicos}
        salvando={salvando}
      />

      <ConfirmationModal
        isOpen={modalConfirmacaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={`Deseja realmente excluir o agendamento ${agendamentoParaExcluir?.cliente}?`}
        textoBotaoOk="Excluir"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindoId !== null}
      />
    </div>
  );
}


