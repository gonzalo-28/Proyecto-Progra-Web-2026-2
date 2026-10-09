// src/pages/LoginPage/LoginPage.jsx

import { useState } from 'react';
import { Link } from 'react-router-dom';

import { useAuth } from '../../context/AuthContext'; // AJUSTAR a la ruta real de tu hook
import SplitAuthLayout from '../../components/layout/SplitAuthLayout/SplitAuthLayout';
import ImagePlaceholder from '../../components/ui/ImagePlaceholder/ImagePlaceholder';
import Alert from '../../components/ui/Alert/Alert';
import Button from '../../components/ui/Button/Button';
import TextField from '../../components/ui/TextField/Textfield';
import PasswordField from '../../components/ui/PasswordField/Passwordfield';

import styles from './LoginPage.module.css';

const DEFAULT_ERROR = 'No pudimos iniciar sesión. Inténtalo de nuevo.';
const PASSWORD_ERROR = 'Verifica tu contraseña.';

/** Normaliza lo que lance el servicio: Error, string u objeto desconocido. */
function getErrorMessage(error) {
  if (typeof error === 'string' && error) return error;
  return error?.message || DEFAULT_ERROR;
}

export default function LoginPage() {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Al editar cualquier campo se limpia el error, para no dejar un mensaje viejo.
  const handleChange = (setter) => (event) => {
    setter(event.target.value);
    if (errorMessage) setErrorMessage('');
  };

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setErrorMessage('');
    setIsSubmitting(true);

    try {
      // Si es exitoso, el AuthContext redirige solo al dashboard del rol.
      // `remember` va como tercer argumento; si tu login aún no lo recibe, se ignora.
      await login(email.trim(), password, remember);
    } catch (error) {
      setErrorMessage(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  const aside = (
    <div className={styles.aside}>
      <div className={styles.asideImage}>
        <ImagePlaceholder />
      </div>

      <figure className={styles.testimonial}>
        <blockquote className={styles.quote}>
          «Reservamos la sala E-201 todos los martes para el trabajo del curso.»
        </blockquote>
        <figcaption className={styles.author}>
          Camila Rojas · Ingeniería de Sistemas
        </figcaption>
      </figure>
    </div>
  );

  return (
    <SplitAuthLayout screen="login" aside={aside}>
      <section className={styles.content} aria-labelledby="login-title">
        <header className={styles.header}>
          <h1 id="login-title" className={styles.title}>
            Iniciar sesión
          </h1>
          <p className={styles.subtitle}>
            Usa tu correo institucional @ulima.edu.pe
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}

          <TextField
            label="Correo institucional"
            type="email"
            value={email}
            onChange={handleChange(setEmail)}
            autoComplete="username"
            required
          />

          <PasswordField
            label="Contraseña"
            showToggle
            value={password}
            onChange={handleChange(setPassword)}
            errorMsg={errorMessage ? PASSWORD_ERROR : undefined}
            required
          />

          <div className={styles.options}>
            <label className={styles.remember}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={remember}
                onChange={(event) => setRemember(event.target.checked)}
              />
              Recuérdame
            </label>

            <Link to="/recuperar" className={styles.link}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting}
            loadingText="Verificando…"
          >
            Ingresar
          </Button>
        </form>

        <p className={styles.signup}>
          ¿No tienes cuenta?{' '}
          <Link to="/registro" className={styles.link}>
            Regístrate
          </Link>
        </p>
      </section>
    </SplitAuthLayout>
  );
}
