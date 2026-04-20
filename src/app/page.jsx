"use client";
import { useState, useEffect } from 'react';
import Image from "next/image";
import styles from "./page.module.css";
import Link from 'next/link';
import { IoLogOutOutline, IoPersonOutline, IoCheckmarkCircleOutline, IoAlertCircleOutline, IoPencilSharp } from "react-icons/io5";
import { useRouter } from 'next/navigation';

import ModalEdtTarefa from '../componentes/modalEdtTarefa/page';
import api from '../services/api';

export default function Tarefas() {
  const situacaoOptions = [
    { value: 'pendente', label: 'Pendentes' },
    { value: 'concluida', label: 'Concluídas' }
  ];

  const [isSaving, setIsSaving] = useState(false);
  const [filtroSituacao, setFiltroSituacao] = useState('');
  const [tarefasFiltradas, setTarefasFiltradas] = useState([]);
  const [tarefas, setTarefas] = useState([]);
  const [novaTarefa, setNovaTarefa] = useState({ titulo: '', descricao: '' });
  const [tarefaSelecionada, setTarefaSelecionada] = useState(null);

  const handleEdtTarefa = (tarefas) => {
    setTarefaSelecionada(tarefas);
    openModalEdtTarefa();
  };

  const handleCloseModal = () => {
    setTarefaSelecionada(null);
    closeModalEdtTarefa(false);
  };

  const [showModalEdtTarefa, setShowModalEdtTarefa] = useState(false);
  const openModalEdtTarefa = () => setShowModalEdtTarefa(true);
  const closeModalEdtTarefa = () => setShowModalEdtTarefa(false);
  const handleTarefa = () => {
    setShowModalEdtTarefa(false);
  };

  const handleInputChangeTitulo = (e) => {
    const { value } = e.target;
    setTarefas((prevState) => ({
      ...prevState,
      titulo: value,
    }));
  };

  const handleInputChangeDescricao = (e) => {
    const { value } = e.target;
    setTarefas((prevState) => ({
      ...prevState,
      descricao: value,
    }));
  };


  const router = useRouter();

  function logOff() {
    localStorage.clear();
    router.push('/login');
  }

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      router.push('/login');
    }
  }, []);

  const valDefault = styles.formControl;
  const valSucesso = styles.formControl + ' ' + styles.success;
  const valErro = styles.formControl + ' ' + styles.error;

  useEffect(() => {
    const carregarTarefas = async () => {
      let payload;

      try {
        const storedUser = localStorage.getItem('user');
        const user = parseUser(storedUser);
        if (!user) {
          router.push('/login');
          return;
        }

        payload = { userId: user.cod };

        if (!payload.userId) {
          console.error("Payload não contém um userId válido.", payload);
          return;
        }
        const apiUrl = '/tarefas';
        const response = await api.post(apiUrl, payload);

        if (response.status === 200) {
          const tarefasData = response.data.dados;

          if (Array.isArray(tarefasData)) {
            if (tarefasData.length === 0) {
              setTarefas([]);
            } else {
              setTarefas(tarefasData);
            }
          } else {
            console.warn("Formato inesperado em response.data.dados:", tarefasData);
            setTarefas([]);
          }
        } else {
          console.warn("Resposta inesperada do servidor:", response.status);
          setTarefas([]);
        }
      } catch (apiError) {
        console.error(
          "Erro ao fazer a requisição para /tarefas",
          apiError.response?.data || apiError.message,
          apiError.stack || "Sem stack disponível",
          "Payload enviado:", payload
        );
        setTarefas([]);
      }
    };

    const parseUser = (storedUser) => {
      try {
        const user = storedUser ? JSON.parse(storedUser) : null;
        if (!user || typeof user.cod === 'undefined' || user.cod === null) {
          return null;
        }
        return user;
      } catch (e) {
        console.error("Erro ao analisar o usuário do localStorage:", e.message);
        return null;
      }
    };

    carregarTarefas();
  }, []);

  useEffect(() => {
    if (filtroSituacao) {
      const tarefasFiltradas = tarefas.filter(tarefa => tarefa.status === filtroSituacao);
      setTarefasFiltradas(tarefasFiltradas);
    } else {
      setTarefasFiltradas([]);
    }
  }, [filtroSituacao]);

  async function deletaTarefas(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    try {

      if (!id || !user.cod) {
        console.error('ID ou userId não fornecidos');
        alert('ID ou userId não fornecidos');
        return;
      }

      const response = await api.delete(`/tarefasDeletar/${id}`, {
        data: {
          userId: user.cod,
        }
      });

      if (response.data && response.data.sucesso) {
        setTarefas((prevTarefas) => {
          const tarefasAtualizadas = Array.isArray(prevTarefas) ? prevTarefas : [];
          return tarefasAtualizadas.filter((tarefa) => tarefa.id !== id);
        });
      } else {
        console.error('Erro ao excluir a tarefa:', response.data.mensagem);
        alert(response.data.mensagem);
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data.mensagem + '\n' + error.response.data.dados);
      } else {
        alert('Erro no front-end: ' + error.message);
      }
    }
  }

  async function confirmarTarefa(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.cod) {
      console.error('User ou user.cod não fornecidos');
      alert('User ou user.cod não encontrados');
      return;
    }

    try {
      const response = await api.patch(`/tarefasConfirmar/${id}`, {
        userId: user.cod
      });

      if (response.status === 200 && response.data.sucesso) {
        setTarefas((prevTarefas) => {
          const tarefasAtualizadas = Array.isArray(prevTarefas) ? prevTarefas : [];
          return tarefasAtualizadas.filter((tarefa) => tarefa.id !== id);
        });
      } else {
        console.error('Erro ao concluir a tarefa:', response.data.mensagem);
        alert(response.data.mensagem);
      }
    } catch (error) {
      if (error.response) {
        console.error('Erro da resposta:', error.response.data);
        alert(error.response.data.mensagem + '\n' + error.response.data.dados);
      } else if (error.request) {
        console.error('Erro de requisição:', error.request);
        alert('Erro ao fazer a requisição. Tente novamente mais tarde.');
      } else {
        alert('Erro no front-end: ' + error.message);
      }
    }
  }

  const [valida, setValida] = useState({
    titulo: {
      validado: valDefault,
      mensagem: []
    },
    descricao: {
      validado: valDefault,
      mensagem: []
    },
  });

  function validaTitulo() {

    let objTemp = {
      validado: valSucesso,
      mensagem: []
    };

    if (!tarefas?.titulo || tarefas.titulo.length < 5) {
      objTemp.validado = valErro;
      objTemp.mensagem.push('Insira o nome completo da tarefa');
    }


    setValida(prevState => ({
      ...prevState,
      titulo: objTemp
    }));

    const testeResult = objTemp.mensagem.length === 0 ? 1 : 0;
    return testeResult;
  }

  function validaDescricao() {

    let objTemp = {
      validado: valSucesso,
      mensagem: []
    };

    if (!tarefas?.descricao || tarefas.descricao.length < 5) {
      objTemp.validado = valErro;
      objTemp.mensagem.push('A descrição da tarefa é obrigatória');
    }

    setValida(prevState => ({
      ...prevState,
      descricao: objTemp
    }));

    const testeResult = objTemp.mensagem.length === 0 ? 1 : 0;
    return testeResult;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    let itensValidados = 0;

    itensValidados += validaTitulo();
    itensValidados += validaDescricao();

    if (itensValidados === 2) {
      const user = JSON.parse(localStorage.getItem('user'));

      if (!user || !user.cod) {
        alert('ID do usuário não encontrado. Por favor, faça login.');
        return;
      }

      const tarefaComId = {
        userId: user.cod,
        titulo: tarefas.titulo,
        descricao: tarefas.descricao,
        status: 'pendente',
      };

      try {
        const response = await api.post('/tarefasCadastrar', tarefaComId);

        if (response.data.sucesso) {
          alert('Tarefa cadastrada com sucesso!');
          const novaTarefaComId = {
            id: response.data.id,
            ...tarefaComId,
          };
          setTarefas((prevTarefas) => {
            const tarefasAtualizadas = Array.isArray(prevTarefas) ? prevTarefas : [];
            return [...tarefasAtualizadas, novaTarefaComId];
          });
          setNovaTarefa({ titulo: '', descricao: '' });
        }
      } catch (error) {
        if (error.response) {
          alert(error.response.data.mensagem + '\n' + error.response.data.dados);
        } else {
          alert('Erro no front-end' + '\n' + error);
        }
      }
    }
  }

  return (
    <div className="containerGlobal">
      <div className={styles.background}>
        <div className={styles.editarb}>
          <button
            className={styles.sairMenuGrande}
            onClick={() => logOff()}>
            <IoLogOutOutline className={styles.tpiconSair} />
            Sair
          </button>
        </div>
        <div className={styles.transparencia}>
          <div className={styles.conteudo}>
            <div className={styles.card}>
              <div className={styles.header}>

                <Link href="/" className={styles.titulo}>
                  <h1>Tarefas</h1>
                </Link>

                <div className={styles.editarEdi}>
                  <button
                    className={styles.perfilButton}
                    onClick={() => router.push("/perfil")}>
                    <IoPersonOutline className={styles.tpicon} />
                    Perfil
                  </button>
                </div>

              </div>

              <form id="form" onSubmit={handleSubmit}>
                <div className={styles.inputContainer}>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputFlex}>
                      <div className={styles.inputMargin}>
                        <span className={styles.titleSuperior}>Título da tarefa:</span>
                        <div className={valida.titulo.validado + ' ' + styles.valTitulo} id="valTitulo">
                          <div className={styles.divInput}>
                            <input
                              type="text"
                              name="titulo"
                              value={tarefas.titulo || ''}
                              onChange={handleInputChangeTitulo}
                              className={`${styles.inputField} ${styles.nomeInput}`}
                              aria-label="Titulo da tarefa"
                            />
                            <IoCheckmarkCircleOutline className={styles.sucesso} />
                            <IoAlertCircleOutline className={styles.erro} />
                          </div>
                          {
                            valida.titulo.mensagem.map(mens => <small key={mens} id="titulo" className={styles.small}>{mens}</small>)
                          }
                        </div>
                      </div>
                      <div className={styles.editar}>
                        <button
                          type="submit"
                          className={styles.saveButton}
                        >
                          {isSaving ? 'Salvando...' : 'Salvar'}
                        </button>
                      </div>
                    </div>
                    <div className={styles.inputMargin}>
                      <span className={styles.titleSuperior}>Descrição da tarefa:</span>
                      <div className={valida.descricao.validado + ' ' + styles.validaDescricao} id="valDescricao">
                        <div className={styles.divInput}>
                          <input
                            type="text"
                            name="descricao"
                            value={tarefas.descricao || ''}
                            onChange={handleInputChangeDescricao}
                            className={`${styles.inputField} ${styles.nomeInput}`}
                            aria-label="Descrição da tarefa"
                          />
                          <IoCheckmarkCircleOutline className={styles.sucesso} />
                          <IoAlertCircleOutline className={styles.erro} />
                        </div>
                        {
                          valida.descricao.mensagem.map(mens => <small key={mens} id="descricao" className={styles.small}>{mens}</small>)
                        }
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div className={styles.situacaoButtons}>
                {situacaoOptions.map(status => (
                  <div
                    key={status.value}
                    className={`${styles.situacao} ${filtroSituacao === status.value ? styles.active : ''}`}
                    onClick={() => setFiltroSituacao(status.value)}
                  >
                    <Image
                      src={`/${status.value.replace(/\s+/g, '_')}.png`}
                      alt={status.label}
                      width={512}
                      height={512}
                      className={styles.icon}
                    />
                    <p className={styles.textIcon}>{status.label}</p>
                  </div>
                ))}
              </div>
              <div className={styles.container}>
                <div className={styles.alinhamento}>
                  {Array.isArray(tarefas) && tarefas.filter(tarefa => !filtroSituacao || tarefa.status === filtroSituacao).length === 0 ? (
                    <h1>Nenhuma tarefa encontrada. Selecione um filtro.</h1>
                  ) : (
                    Array.isArray(tarefas) && tarefas
                      .filter(tarefa => !filtroSituacao || tarefa.status === filtroSituacao)
                      .map(tarefa => (
                        <div className={styles.Item} key={tarefa.id}> {/* 'key' adicionada aqui */}
                          <div className={styles.Info}>
                            <div className={styles.buttons}>
                              <button onClick={() => deletaTarefas(tarefa.id, tarefa.userId)} className={styles.excluirTarefa}>X</button>
                              <button type='button' onClick={() => handleEdtTarefa(tarefa)} className={styles.editarTarefa}>
                                <IoPencilSharp size={18} color='#FFF' />
                              </button>
                              <ModalEdtTarefa
                                show={showModalEdtTarefa}
                                onClose={closeModalEdtTarefa}
                                onConfirm={handleTarefa}
                                inform={tarefaSelecionada}
                              />
                            </div>
                            <h2 className={styles.Title}>{tarefa.titulo}</h2>
                            <p className={styles.Description}>{tarefa.descricao}</p>
                            {tarefa.status !== 'concluida' && (
                              <button onClick={() => confirmarTarefa(tarefa.id)} className={styles.confirmarTarefa}>Concluir</button>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}