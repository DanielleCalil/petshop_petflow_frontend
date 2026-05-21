"use client";

import { Plus } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import PetFormModal from "./components/PetFormModal";
import PetsTable from "./components/PetsTable";
import { usePetsPage } from "./hooks/usePetsPage";
import styles from "./page.module.css";
export default function PetsPage() {
  const {
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
  } = usePetsPage();

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Pets" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Pets</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo Pet</span>
            </button>
          </div>

          {erroPets && <p className={styles.mensagemErro}>{erroPets}</p>}

          <PetsTable
            styles={styles}
            carregandoPets={carregandoPets}
            pets={pets}
            processandoAcaoId={processandoAcaoId}
            petEstaVinculado={petEstaVinculado}
            onEditar={abrirModalEdicao}
            onExcluir={excluirPet}
          />
        </main>
      </div>

      <PetFormModal
        styles={styles}
        modalAberto={modalAberto}
        petEmEdicao={petEmEdicao}
        fecharModal={fecharModal}
        salvarPet={salvarPet}
        erroModal={erroModal}
        formulario={formulario}
        atualizarCampo={atualizarCampo}
        carregandoClientes={carregandoClientes}
        clientes={clientes}
        salvando={salvando}
      />

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


