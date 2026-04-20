"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { IoEye, IoEyeOff } from "react-icons/io5";
import Image from "next/image";

import api from "../../services/api";
import styles from "./page.module.css";

export default function Login() {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const valDefault = styles.formControl;
  const valSucesso = styles.formControl + " " + styles.success;
  const valErro = styles.formControl + " " + styles.error;

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  function handleSubmit(event) {
    event.preventDefault();
    const validLogin = validaLogin();
    const validSenha = validaSenha();

    if (validLogin || validSenha) {
      logar();
    }
  }

  async function logar() {
    try {
      const dados = {
        email: login,
        senha: senha,
      };

      const response = await api.post("/usuariosLogar", dados);

      if (response.data.sucesso === true) {
        const usuario = response.data.dados;

        const objLogado = {
          cod: usuario.id,
          nome: usuario.nome,
        };

        localStorage.clear();
        localStorage.setItem("user", JSON.stringify(objLogado));

        router.push("/");
      } else {
        alert("Erro: " + response.data.mensagem + "\n" + response.data.dados);
      }
    } catch (error) {
      if (error.response) {
        alert(
          error.response.data.dados == null
            ? error.response.data.mensagem
            : error.response.data.mensagem + "\n" + error.response.data.dados,
        );
      } else {
        alert("Erro no front-end" + "\n" + error);
      }
    }
  }

  // validação
  const [valida, setValida] = useState({
    login: {
      validado: valDefault,
      mensagem: [],
    },
    senha: {
      validado: valDefault,
      mensagem: [],
    },
  });

  function validaLogin() {
    let objTemp = {
      validado: valSucesso,
      mensagem: [],
    };

    if (login === "") {
      objTemp.validado = valErro;
      objTemp.mensagem.push("Preencha o campo com o E-mail");
    } else if (login.length < 6) {
      objTemp.validado = valErro;
      objTemp.mensagem.push("E-mail inválido");
    }

    setValida((prevState) => ({
      ...prevState,
      login: objTemp,
    }));

    return objTemp.mensagem.length === 0;
  }

  function validaSenha() {
    let objTemp = {
      validado: valSucesso,
      mensagem: [],
    };

    if (senha === "") {
      objTemp.validado = valErro;
      objTemp.mensagem.push("Preencha o campo da senha");
    } else if (senha.length < 6) {
      objTemp.validado = valErro;
      objTemp.mensagem.push("Número de caracteres inválido");
    }

    setValida((prevState) => ({
      ...prevState,
      senha: objTemp,
    }));

    return objTemp.mensagem.length === 0;
  }

  return (
    <div className="containerGlobal">
      <div className={styles.background}>
        <div className={styles.transparencia}>
          <div className={styles.container}>
            <div className={styles.card}>
              <div className={styles.leftPanel}>
                <Image
                  src="/logo_login.png"
                  alt="Logo PetFlow"
                  width={180}
                  height={160}
                  className={styles.logo}
                />
              </div>
              <form
                id="form"
                className={styles.conteudo}
                onSubmit={handleSubmit}
              >
                <h1 className={styles.login}>Login</h1>
                <input
                  type="text"
                  placeholder="E-mail"
                  className={`${styles.inputField} ${valida.login.validado}`}
                  onChange={(v) => setLogin(v.target.value)} //v: evento de mudança
                  value={login}
                />
                {valida.login.mensagem.length > 0 && (
                  <span className={styles.errorMessage}>
                    {valida.login.mensagem[0]}
                  </span>
                )}
                <div className={styles.passwordContainer}>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Senha"
                    className={`${styles.inputField} ${valida.senha.validado}`}
                    onChange={(v) => setSenha(v.target.value)}
                    value={senha}
                  />
                  <span
                    onClick={togglePasswordVisibility}
                    className={styles.eyeIcon}
                  >
                    {showPassword ? <IoEyeOff /> : <IoEye />}
                  </span>
                </div>
                {valida.senha.mensagem.length > 0 && (
                  <span className={styles.errorMessage}>
                    {valida.senha.mensagem[0]}
                  </span>
                )}
                <button type="submit" className={styles.loginButton}>
                  Fazer login
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}