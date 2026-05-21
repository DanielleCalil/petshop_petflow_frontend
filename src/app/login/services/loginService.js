import api from "../../../services/api";
import { LOGIN_ENDPOINT } from "../constants/login";

export function autenticarUsuario(email, senha) {
  return api.post(LOGIN_ENDPOINT, { email, senha });
}
