"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import MenuLateral from "../../componentes/MenuLateral";
import BarraSuperior from "../../componentes/BarraSuperior";
import api from "../../services/api";
import styles from "./page.module.css";

const VENDAS_ENDPOINT = "/vendas";
const CLIENTES_ENDPOINT = "/clientes";
const PRODUTOS_ENDPOINT = "/produtos";

const estadoInicialFormulario = {
  cliente: "",
  produtos: [{ idTemporario: 1, produto: "", quantidade: "1", subtotal: "" }],
  totalVenda: 0,
};

function normalizarVenda(venda) {
  return {
    id: venda?.id ?? venda?.ven_id ?? venda?.codigo ?? venda?.cod ?? "",
    cliente: venda?.cliente ?? venda?.ven_cliente ?? venda?.nomeCliente ?? "",
    produtos: Array.isArray(venda?.produtos)
      ? venda.produtos
      : venda?.produto
        ? [
            {
              produto: venda.produto,
              quantidade: venda.quantidade,
              subtotal: venda.subtotal,
            },
          ]
        : [],
    totalVenda:
      venda?.totalVenda ??
      venda?.total ??
      venda?.ven_total ??
      venda?.subtotal ??
      0,
    data: venda?.data ?? venda?.ven_data ?? venda?.criadoEm ?? venda?.createdAt ?? "",
  };
}

function extrairListaVendas(payload) {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (Array.isArray(payload?.dados)) {
    return payload.dados;
  }

  if (Array.isArray(payload?.data)) {
    return payload.data;
  }

  if (Array.isArray(payload?.vendas)) {
    return payload.vendas;
  }

  if (Array.isArray(payload?.dados?.vendas)) {
    return payload.dados.vendas;
  }

  return [];
}

function extrairVendaCriada(payload, fallback) {
  const vendaCriada =
    payload?.dados ?? payload?.data ?? payload?.venda ?? payload;

  if (
    vendaCriada &&
    typeof vendaCriada === "object" &&
    !Array.isArray(vendaCriada)
  ) {
    return normalizarVenda(vendaCriada);
  }

  return {
    ...normalizarVenda(fallback),
    id: Date.now(),
  };
}

function construirEndpointVenda(idVenda) {
  return `${VENDAS_ENDPOINT}/${idVenda}`;
}

function formatarMoeda(valor) {
  if (valor === null || valor === undefined || valor === "") return "";
  const numero = Number(valor);
  if (isNaN(numero)) return valor;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(numero);
}

function desformatarMoeda(valor) {
  if (!valor) return "";
  const stringValor = String(valor);
  if (!stringValor.includes(",") && !isNaN(Number(stringValor))) {
    return stringValor.trim();
  }
  return stringValor.replace(/[^\d,]/g, "").replace(",", ".");
}

function formatarData(dataStr) {
  if (!dataStr) return "-";
  const data = new Date(dataStr);
  if (isNaN(data.getTime())) return dataStr;
  return new Intl.DateTimeFormat("pt-BR").format(data);
}

export default function VendasPage() {
  const [vendas, setVendas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [vendaEmEdicao, setVendaEmEdicao] = useState(null);
  const [formulario, setFormulario] = useState(estadoInicialFormulario);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState("");

  useEffect(() => {
    buscarDados();
  }, []);

  async function buscarDados() {
    try {
      setCarregando(true);
      setErro("");

      const [resVendas, resClientes, resProdutos] = await Promise.all([
        api.get(VENDAS_ENDPOINT).catch(() => ({ data: [] })),
        api.get(CLIENTES_ENDPOINT).catch(() => ({ data: [] })),
        api.get(PRODUTOS_ENDPOINT).catch(() => ({ data: [] })),
      ]);

      setVendas(extrairListaVendas(resVendas.data).map(normalizarVenda));

      const listaClientes = (
        resClientes.data?.dados ??
        resClientes.data ??
        []
      ).map((c) => ({
        id: c.id ?? c.cli_id ?? "",
        nome: c.nome ?? c.cli_nome ?? "",
      }));
      setClientes(listaClientes);

      const listaProdutos = (
        resProdutos.data?.dados ??
        resProdutos.data ??
        []
      ).map((p) => ({
        id: p.id ?? p.pro_id ?? "",
        nome: p.nome ?? p.pro_nome ?? "",
        preco: p.preco ?? p.pro_preco ?? 0,
      }));
      setProdutos(listaProdutos);
    } catch (error) {
      console.log("Erro ao buscar dados:", error);
    } finally {
      setCarregando(false);
    }
  }

  function abrirModal() {
    setVendaEmEdicao(null);
    setFormulario(estadoInicialFormulario);
    setErro("");
    setModalAberto(true);
  }

  function abrirModalEdicao(venda) {
    setVendaEmEdicao(venda);
    const prods =
      venda.produtos?.length > 0
        ? venda.produtos
        : [
            {
              idTemporario: Date.now(),
              produto: "",
              quantidade: "1",
              subtotal: "",
            },
          ];

    setFormulario({
      cliente: venda.cliente ?? "",
      produtos: prods.map((p, i) => ({
        idTemporario: Date.now() + i,
        produto: p.produto ?? "",
        quantidade: p.quantidade ?? "1",
        subtotal: p.subtotal ? formatarMoeda(p.subtotal) : "",
      })),
      totalVenda: venda.totalVenda ?? 0,
    });
    setErro("");
    setModalAberto(true);
  }

  function fecharModal() {
    setModalAberto(false);
    setVendaEmEdicao(null);
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

  function atualizarCampoProduto(idTemporario, campo, valor) {
    let novoValor = valor;

    if (campo === "subtotal") {
      const apenasNumeros = valor.replace(/\D/g, "");
      if (apenasNumeros) {
        novoValor = new Intl.NumberFormat("pt-BR", {
          style: "currency",
          currency: "BRL",
        }).format(Number(apenasNumeros) / 100);
      } else {
        novoValor = "";
      }
    }

    setFormulario((estadoAnterior) => {
      const novosProdutos = estadoAnterior.produtos.map((p) => {
        if (p.idTemporario === idTemporario) {
          return { ...p, [campo]: novoValor };
        }
        return p;
      });

      const total = novosProdutos.reduce((acc, p) => {
        const val = Number(desformatarMoeda(p.subtotal));
        return acc + (isNaN(val) ? 0 : val);
      }, 0);

      return {
        ...estadoAnterior,
        produtos: novosProdutos,
        totalVenda: total,
      };
    });
  }

  function adicionarProduto() {
    setFormulario((prev) => ({
      ...prev,
      produtos: [
        ...prev.produtos,
        {
          idTemporario: Date.now(),
          produto: "",
          quantidade: "1",
          subtotal: "",
        },
      ],
    }));
  }

  function removerProduto(idTemporario) {
    setFormulario((prev) => {
      const novosProdutos = prev.produtos.filter(
        (p) => p.idTemporario !== idTemporario,
      );
      const total = novosProdutos.reduce((acc, p) => {
        const val = Number(desformatarMoeda(p.subtotal));
        return acc + (isNaN(val) ? 0 : val);
      }, 0);
      return {
        ...prev,
        produtos: novosProdutos.length
          ? novosProdutos
          : [
              {
                idTemporario: Date.now(),
                produto: "",
                quantidade: "1",
                subtotal: "",
              },
            ],
        totalVenda: total,
      };
    });
  }

  async function salvarVenda(evento) {
    evento.preventDefault();

    const novaVenda = {
      cliente: formulario.cliente.trim(),
      produtos: formulario.produtos.map((p) => ({
        produto: p.produto.trim(),
        quantidade: String(p.quantidade).trim(),
        subtotal: desformatarMoeda(p.subtotal),
      })),
      totalVenda: formulario.totalVenda,
    };

    try {
      setSalvando(true);
      setErro("");

      if (vendaEmEdicao) {
        const idVenda = vendaEmEdicao.id;

        if (!idVenda) {
          setErro("Nao foi possivel identificar a venda para edicao.");
          return;
        }

        const response = await api.put(
          construirEndpointVenda(idVenda),
          novaVenda,
        );
        const vendaAtualizada = normalizarVenda(
          response.data?.dados ??
            response.data?.data ??
            response.data ??
            novaVenda,
        );

        setVendas((estadoAnterior) =>
          estadoAnterior.map((vendaAtual) => {
            if (vendaAtual.id !== idVenda) {
              return vendaAtual;
            }

            return {
              ...vendaAtual,
              ...vendaAtualizada,
              id: vendaAtualizada.id ?? idVenda,
            };
          }),
        );
      } else {
        const response = await api.post(VENDAS_ENDPOINT, novaVenda);
        const vendaCriada = extrairVendaCriada(response.data, novaVenda);

        setVendas((estadoAnterior) => [...estadoAnterior, vendaCriada]);
      }

      fecharModal();
    } catch (error) {
      console.log("Erro ao salvar venda:", error);
      setErro("Nao foi possivel salvar a venda.");
    } finally {
      setSalvando(false);
    }
  }

  async function excluirVenda(venda) {
    if (!venda?.id) {
      setErro("Nao foi possivel identificar a venda para exclusao.");
      return;
    }

    const confirmarExclusao = window.confirm(
      `Deseja realmente excluir a venda do cliente ${venda.cliente}?`,
    );

    if (!confirmarExclusao) {
      return;
    }

    try {
      setExcluindoId(venda.id);
      setErro("");

      await api.delete(construirEndpointVenda(venda.id));
      setVendas((estadoAnterior) =>
        estadoAnterior.filter((vendaAtual) => vendaAtual.id !== venda.id),
      );
    } catch (error) {
      console.log("Erro ao excluir venda:", error);
      setErro("Nao foi possivel excluir a venda.");
    } finally {
      setExcluindoId(null);
    }
  }

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

          <div className={styles.tabelaContainer}>
            <table className={styles.tabela}>
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Data</th>
                  <th>Itens</th>
                  <th>Valor Total</th>
                  <th>Ações</th>
                </tr>
              </thead>

              <tbody>
                {carregando ? (
                  <tr>
                    <td colSpan="5" className={styles.estadoTabela}>
                      Carregando vendas...
                    </td>
                  </tr>
                ) : vendas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className={styles.estadoTabela}>
                      Nenhuma venda encontrada.
                    </td>
                  </tr>
                ) : (
                  vendas.map((venda) => (
                    <tr
                      key={venda.id ?? `${venda.cliente}-${venda.totalVenda}`}
                    >
                      <td>{venda.cliente}</td>
                      <td>{formatarData(venda.data)}</td>
                      <td>
                        {Array.isArray(venda.produtos)
                          ? venda.produtos.length
                          : 1}
                      </td>
                      <td>{formatarMoeda(venda.totalVenda)}</td>
                      <td>
                        <div className={styles.acoesLinha}>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoEditar}`}
                            onClick={() => abrirModalEdicao(venda)}
                            aria-label={`Editar venda de ${venda.cliente}`}
                          >
                            <Pencil size={16} />
                            <span>Editar</span>
                          </button>
                          <button
                            type="button"
                            className={`${styles.botaoAcao} ${styles.botaoExcluir}`}
                            onClick={() => excluirVenda(venda)}
                            disabled={excluindoId === venda.id}
                            aria-label={`Excluir venda de ${venda.cliente}`}
                          >
                            <Trash2 size={16} />
                            <span>
                              {excluindoId === venda.id
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
              <h2>{vendaEmEdicao ? "Editar Venda" : "Nova Venda"}</h2>
              <button
                type="button"
                className={styles.botaoFechar}
                onClick={fecharModal}
                aria-label="Fechar modal"
              >
                <X size={24} />
              </button>
            </div>

            <form className={styles.formulario} onSubmit={salvarVenda}>
              {erro && <p className={styles.mensagemErroModal}>{erro}</p>}
              <label
                htmlFor="cliente"
                className={`${styles.campo} ${styles.campoSemMargem}`}
              >
                Cliente
                <select
                  id="cliente"
                  name="cliente"
                  value={formulario.cliente}
                  onChange={atualizarCampo}
                  required
                  autoFocus
                  className={styles.inputPersonalizado}
                >
                  <option value="">Selecione um cliente</option>
                  {clientes.map((c) => (
                    <option key={c.id || c.nome} value={c.nome}>
                      {c.nome}
                    </option>
                  ))}
                </select>
              </label>

              <div className={styles.listaProdutos}>
                {formulario.produtos.map((p, index) => (
                  <div key={p.idTemporario} className={styles.linhaProduto}>
                    <label className={`${styles.campo} ${styles.campoFlex3}`}>
                      {index === 0 && (
                        <span className={styles.labelInterna}>Produto</span>
                      )}
                      <select
                        value={p.produto}
                        onChange={(e) =>
                          atualizarCampoProduto(
                            p.idTemporario,
                            "produto",
                            e.target.value,
                          )
                        }
                        required
                        className={styles.inputPersonalizado}
                      >
                        <option value="">Selecione</option>
                        {produtos.map((prod) => (
                          <option key={prod.id || prod.nome} value={prod.nome}>
                            {prod.nome}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={`${styles.campo} ${styles.campoFlex1}`}>
                      {index === 0 && (
                        <span className={styles.labelInterna}>Qtd</span>
                      )}
                      <input
                        type="number"
                        min="1"
                        value={p.quantidade}
                        onChange={(e) =>
                          atualizarCampoProduto(
                            p.idTemporario,
                            "quantidade",
                            e.target.value,
                          )
                        }
                        required
                        className={styles.inputPersonalizado}
                      />
                    </label>

                    <label className={`${styles.campo} ${styles.campoFlex15}`}>
                      {index === 0 && (
                        <span className={styles.labelInterna}>Subtotal</span>
                      )}
                      <input
                        type="text"
                        value={p.subtotal}
                        onChange={(e) =>
                          atualizarCampoProduto(
                            p.idTemporario,
                            "subtotal",
                            e.target.value,
                          )
                        }
                        required
                        className={styles.inputPersonalizado}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => removerProduto(p.idTemporario)}
                      className={styles.botaoRemoverLinha}
                      aria-label="Remover produto"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={adicionarProduto}
                  className={styles.botaoAdicionarProduto}
                >
                  <Plus size={20} />
                  Adicionar Produto
                </button>
              </div>

              <div className={styles.bannerTotal}>
                <span className={styles.textoTotalLabel}>Total da Venda</span>
                <span className={styles.textoTotalValor}>
                  {formatarMoeda(formulario.totalVenda)}
                </span>
              </div>

              <button
                type="submit"
                className={`${styles.botaoSalvar} ${styles.botaoSalvarArredondado}`}
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : vendaEmEdicao
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
