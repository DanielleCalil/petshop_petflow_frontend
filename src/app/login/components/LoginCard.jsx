import { IoEye, IoEyeOff } from "react-icons/io5";
import Image from "next/image";

export default function LoginCard({
  styles,
  login,
  senha,
  showPassword,
  valida,
  onChangeLogin,
  onChangeSenha,
  onTogglePasswordVisibility,
  onSubmit,
}) {
  return (
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
      <form id="form" className={styles.conteudo} onSubmit={onSubmit}>
        <h1 className={styles.login}>Login</h1>
        <input
          type="text"
          placeholder="E-mail"
          className={`${styles.inputField} ${valida.login.validado}`}
          onChange={(event) => onChangeLogin(event.target.value)}
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
            onChange={(event) => onChangeSenha(event.target.value)}
            value={senha}
          />
          <span onClick={onTogglePasswordVisibility} className={styles.eyeIcon}>
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
  );
}
