"use client";

import { Plus } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import VendaFormModal from "./components/VendaFormModal";
import VendasTable from "./components/VendasTable";
import { useVendasPage } from "./hooks/useVendasPage";
import styles from "./page.module.css";
export default function VendasPage() {
  const {
    vendas,
    clientes,
    produtos,
    modalAberto,
    vendaEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    vendaParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    atualizarCampoProduto,
    adicionarProduto,
    removerProduto,
    salvarVenda,
    excluirVenda,
    confirmarExclusao,
    cancelarExclusao,
  } = useVendasPage();

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Vendas" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Vendas</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Nova Venda</span>
            </button>
          </div>

          {erro && !modalAberto && (
            <p className={styles.mensagemErro}>{erro}</p>
          )}

          <VendasTable
            styles={styles}
            carregando={carregando}
            vendas={vendas}
            excluindoId={excluindoId}
            onEditar={abrirModalEdicao}
            onExcluir={excluirVenda}
          />
        </main>
      </div>

      <VendaFormModal
        styles={styles}
        modalAberto={modalAberto}
        fecharModal={fecharModal}
        vendaEmEdicao={vendaEmEdicao}
        salvarVenda={salvarVenda}
        erro={erro}
        formulario={formulario}
        atualizarCampo={atualizarCampo}
        clientes={clientes}
        produtos={produtos}
        atualizarCampoProduto={atualizarCampoProduto}
        removerProduto={removerProduto}
        adicionarProduto={adicionarProduto}
        salvando={salvando}
      />

      <ConfirmationModal
        isOpen={modalConfirmacaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={`Deseja realmente excluir a venda do cliente ${vendaParaExcluir?.cliente}?`}
        textoBotaoOk="Excluir"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindoId !== null}
      />
    </div>
  );
}


