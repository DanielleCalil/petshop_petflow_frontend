import { useState } from "react";
import { useRouter } from "next/navigation";

import { autenticarUsuario } from "../services/loginService";
import {
  criarEstadoValidacao,
  validarLogin,
  validarSenha,
} from "../utils/loginValidation";

export function useLoginForm(styles) {
  const router = useRouter();

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const valDefault = styles.formControl;
  const valSucesso = `${styles.formControl} ${styles.success}`;
  const valErro = `${styles.formControl} ${styles.error}`;

  const [valida, setValida] = useState(criarEstadoValidacao(valDefault));

  const togglePasswordVisibility = () => {
    setShowPassword((prevState) => !prevState);
  };

  function validaCampoLogin() {
    const objTemp = validarLogin(login, valSucesso, valErro);

    setValida((prevState) => ({
      ...prevState,
      login: objTemp,
    }));

    return objTemp.mensagem.length === 0;
  }

  function validaCampoSenha() {
    const objTemp = validarSenha(senha, valSucesso, valErro);

    setValida((prevState) => ({
      ...prevState,
      senha: objTemp,
    }));

    return objTemp.mensagem.length === 0;
  }

  async function logar() {
    try {
      const response = await autenticarUsuario(login, senha);

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

  function handleSubmit(event) {
    event.preventDefault();
    const validLogin = validaCampoLogin();
    const validSenha = validaCampoSenha();

    if (validLogin || validSenha) {
      logar();
    }
  }

  return {
    login,
    senha,
    showPassword,
    valida,
    setLogin,
    setSenha,
    togglePasswordVisibility,
    handleSubmit,
  };
}
