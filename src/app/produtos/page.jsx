"use client";

import { Plus } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import ConfirmationModal from "../../componentes/Modal/ConfirmationModal";
import ProdutoFormModal from "./components/ProdutoFormModal";
import ProdutosTable from "./components/ProdutosTable";
import { useProdutosPage } from "./hooks/useProdutosPage";
import styles from "./page.module.css";
export default function ProdutosPage() {
  const {
    produtos,
    modalAberto,
    produtoEmEdicao,
    formulario,
    carregando,
    salvando,
    excluindoId,
    erro,
    modalConfirmacaoAberto,
    produtoParaExcluir,
    abrirModal,
    abrirModalEdicao,
    fecharModal,
    atualizarCampo,
    salvarProduto,
    excluirProduto,
    confirmarExclusao,
    cancelarExclusao,
  } = useProdutosPage();

  return (
    <div className={styles.pageLayout}>
      <MenuLateral active="Produtos" />

      <div className={styles.contentArea}>
        <BarraSuperior />

        <main className={styles.main}>
          <div className={styles.topoPagina}>
            <h1 className={styles.titulo}>Produtos</h1>

            <button
              type="button"
              className={styles.botaoNovo}
              onClick={abrirModal}
            >
              <Plus size={20} />
              <span>Novo Produto</span>
            </button>
          </div>

          {erro && !modalAberto && (
            <p className={styles.mensagemErro}>{erro}</p>
          )}

          <ProdutosTable
            styles={styles}
            carregando={carregando}
            produtos={produtos}
            excluindoId={excluindoId}
            onEditar={abrirModalEdicao}
            onExcluir={excluirProduto}
          />
        </main>
      </div>

      <ProdutoFormModal
        styles={styles}
        modalAberto={modalAberto}
        fecharModal={fecharModal}
        produtoEmEdicao={produtoEmEdicao}
        salvarProduto={salvarProduto}
        erro={erro}
        formulario={formulario}
        atualizarCampo={atualizarCampo}
        salvando={salvando}
      />

      <ConfirmationModal
        isOpen={modalConfirmacaoAberto}
        titulo="Confirmar Exclusão"
        mensagem={`Deseja realmente excluir o produto ${produtoParaExcluir?.nome}?`}
        textoBotaoOk="Excluir"
        textoBotaoCancelar="Cancelar"
        onConfirmar={confirmarExclusao}
        onCancelar={cancelarExclusao}
        carregando={excluindoId !== null}
      />
    </div>
  );
}


