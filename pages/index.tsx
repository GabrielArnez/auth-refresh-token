import { FormEvent, useContext, useState } from "react";
import styles from "../styles/Home.module.css";

import { AuthContext } from "../context/AuthContext";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const data = {
      email,
      password,
    };
    await signIn(data);
  }

  return (
    <form className={styles.container} onSubmit={(e) => handleSubmit(e)}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      ></input>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      ></input>
      <button type="submit">Entrar</button>
    </form>
  );
}
