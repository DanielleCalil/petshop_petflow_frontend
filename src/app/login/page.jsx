"use client";
import LoginCard from "./components/LoginCard";
import { useLoginForm } from "./hooks/useLoginForm";
import styles from "./page.module.css";

export default function Login() {
  const {
    login,
    senha,
    showPassword,
    valida,
    setLogin,
    setSenha,
    togglePasswordVisibility,
    handleSubmit,
  } = useLoginForm(styles);

  return (
    <div className={styles.containerGlobal}>
      <div className={styles.background}>
        <div className={styles.transparencia}>
          <div className={styles.container}>
            <LoginCard
              styles={styles}
              login={login}
              senha={senha}
              showPassword={showPassword}
              valida={valida}
              onChangeLogin={setLogin}
              onChangeSenha={setSenha}
              onTogglePasswordVisibility={togglePasswordVisibility}
              onSubmit={handleSubmit}
            />
          </div>
        </div>
      </div>
    </div>
  );
}


