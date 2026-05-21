import {
  MIN_LOGIN_LENGTH,
  MIN_PASSWORD_LENGTH,
  VALIDATION_MESSAGES,
} from "../constants/login";

export function criarEstadoValidacao(valorPadrao) {
  return {
    login: {
      validado: valorPadrao,
      mensagem: [],
    },
    senha: {
      validado: valorPadrao,
      mensagem: [],
    },
  };
}

export function validarLogin(login, valSucesso, valErro) {
  const objTemp = {
    validado: valSucesso,
    mensagem: [],
  };

  if (login === "") {
    objTemp.validado = valErro;
    objTemp.mensagem.push(VALIDATION_MESSAGES.loginRequired);
  } else if (login.length < MIN_LOGIN_LENGTH) {
    objTemp.validado = valErro;
    objTemp.mensagem.push(VALIDATION_MESSAGES.loginInvalid);
  }

  return objTemp;
}

export function validarSenha(senha, valSucesso, valErro) {
  const objTemp = {
    validado: valSucesso,
    mensagem: [],
  };

  if (senha === "") {
    objTemp.validado = valErro;
    objTemp.mensagem.push(VALIDATION_MESSAGES.passwordRequired);
  } else if (senha.length < MIN_PASSWORD_LENGTH) {
    objTemp.validado = valErro;
    objTemp.mensagem.push(VALIDATION_MESSAGES.passwordInvalid);
  }

  return objTemp;
}
