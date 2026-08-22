import { useState, useRef, useContext } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Form, Row, Col, Container } from "react-bootstrap";

import { initialErrors } from "./Login.data";
import { AuthContext } from "../authContext/AuthContext";
import { IsTokenValid } from "../protected/Protected.helpers";
import { API_URL } from "../../api/config";
import { validateEmail, validatePassword } from "../../utils/validators";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import CustomAlert from "../alert/CustomAlert";
import CustomCard from "../card/CustomCard";

const Login = () => {
  const navigate = useNavigate();

  const { token, onLogin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(initialErrors);

  const [step, setStep] = useState("credentials");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  const [loading, setLoading] = useState(false);

  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const codeRef = useRef(null);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      email: false,
    }));
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      password: false,
    }));
  };

  const completeLogin = (token) => {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const role = payload.role;

    onLogin(token, role);

    setAlertData({
      show: true,
      message: "¡Inicio de sesión exitoso!",
      type: "success",
    });

    setEmail("");
    setPassword("");
    setCode("");
    setStep("credentials");

    setTimeout(() => {
      navigate("/shipment");
    }, 800);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      setErrors((prev) => ({ ...prev, email: "empty" }));
      emailRef.current.focus();
      return;
    }

    if (!validateEmail(email)) {
      setErrors((prev) => ({ ...prev, email: "invalid" }));
      emailRef.current.focus();
      return;
    }

    if (!password.trim()) {
      setErrors((prev) => ({ ...prev, password: "empty" }));
      passwordRef.current.focus();
      return;
    }

    if (!validatePassword(password)) {
      setErrors((prev) => ({ ...prev, password: "invalid" }));
      passwordRef.current.focus();
      return;
    }

    setErrors(initialErrors);
    setLoading(true);

    try {
      const deviceToken = localStorage.getItem("deviceToken");

      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, deviceToken }),
      });

      if (response.status === 429) {
        setAlertData({
          show: true,
          message: "Demasiados intentos. Esperá un minuto y volvé a intentar.",
          type: "error",
        });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error || data.message || "Error al iniciar sesión",
          type: "error",
        });
        return;
      }

      if (data.requiresTwoFactor || data.requiresEmailVerification) {
        setStep("twofactor");
        setCode("");
        setCodeError(false);
        setAlertData({
          show: true,
          message: "Te enviamos un código de verificación a tu correo.",
          type: "info",
        });
        return;
      }

      completeLogin(data.token);
    } catch (error) {
      console.error("Login error:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al iniciar sesión.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyTwoFactor = async (event) => {
    event.preventDefault();

    if (!code.trim()) {
      setCodeError(true);
      codeRef.current.focus();
      return;
    }

    setCodeError(false);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, code: code.trim() }),
      });

      if (response.status === 429) {
        setAlertData({
          show: true,
          message: "Demasiados intentos. Esperá un minuto y volvé a intentar.",
          type: "error",
        });
        return;
      }

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error || data.message || "Código incorrecto o expirado.",
          type: "error",
        });
        return;
      }

      if (data.deviceToken) {
        localStorage.setItem("deviceToken", data.deviceToken);
      }

      completeLogin(data.token);
    } catch (error) {
      console.error("2FA verify error:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al verificar el código.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToCredentials = () => {
    setStep("credentials");
    setCode("");
    setCodeError(false);
    setPassword("");
    setAlertData({ show: false, message: "", type: "info" });
  };

  if (IsTokenValid(token)) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Background image="/images/ImageLogin.webp">
        <BackArrow />
        <Container className="d-flex align-items-center min-vh-100 flex-column pt-3">
          <div className="screen d-flex justify-content-center w-100">
          <CustomAlert
            show={alertData.show}
            message={alertData.message}
            type={alertData.type}
            onClose={() => setAlertData({ ...alertData, show: false })}
          />
          <Row>
            <Col>
            {step === "credentials" ? (
            <Form noValidate onSubmit={handleSubmit}>
              <CustomCard
            title="INICIAR SESIÓN"
            buttonText="Iniciar"
            buttonType="submit"
            loading={loading}
            loadingText="Ingresando...">
                  <Form.Group className="inputs-group mb-3 fw-bold">
                    <Form.Label>Correo Electrónico: <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      ref={emailRef}
                      className={`custom-input ${errors.email ? "is-invalid" : ""}`}
                      type="email"
                      placeholder="usuario@ejemplo.com"
                      value={email}
                      onChange={handleEmailChange}
                      autoComplete="email"
                    />
                    {errors.email === "empty" && (
                  <p className="text-danger mt-1">
                    Debe ingresar un correo electrónico
                  </p>
                )}
                {errors.email === "invalid" && (
                  <p className="text-danger mt-1">
                    Debe ingresar un email válido, ejemplo: juan@jemar.com
                  </p>
                )}
                  </Form.Group>

                  <Form.Group className="inputs-group mb-3 fw-bold position-relative">
                    <Form.Label>Contraseña: <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      ref={passwordRef}
                      className={`custom-input ${errors.password ? "is-invalid" : ""}`}
                      type={showPassword ? "text" : "password"}
                      placeholder="********"
                      value={password}
                      onChange={handlePasswordChange}
                      autoComplete="current-password"
                    />
                    <span
                      className="password-toggle-icon"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <i className="bi bi-eye-slash-fill" />
                      ) : (
                        <i className="bi bi-eye-fill" />
                      )}
                    </span>
                    {errors.password === "empty" && (
                  <p className="text-danger mt-1">
                    Debe ingresar una contraseña
                  </p>
                )}
                {errors.password === "invalid" && (
                  <p className="text-danger mt-1">
                    Debe ingresar al menos 8 caracteres, 1 número y 1 letra
                  </p>
                )}
                  </Form.Group>

                  <div className="inputs-group text-center">
                    <Form.Label>
                      <Link
                        to="/forgot-password"
                        className="text-decoration-none custom-link"
                      >
                        ¿Olvidaste tu contraseña?
                      </Link>
                    </Form.Label>
                  </div>

                  <div className="inputs-group mt-1 text-center">
                    <Form.Label>
                      No tengo cuenta -{" "}
                      <Link
                        to="/register"
                        className="text-decoration-none custom-link"
                      >
                        Registrarme
                      </Link>
                    </Form.Label>
                  </div>

              </CustomCard>
              </Form>
            ) : (
            <Form noValidate onSubmit={handleVerifyTwoFactor}>
              <CustomCard
            title="VERIFICACIÓN"
            buttonText="Verificar"
            buttonType="submit"
            loading={loading}
            loadingText="Verificando...">
                  <p className="text-center text-white mb-3">
                    Ingresá el código que enviamos a <strong>{email}</strong>.
                  </p>
                  <Form.Group className="inputs-group mb-3 fw-bold">
                    <Form.Label>Código de verificación: <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      ref={codeRef}
                      className={`custom-input ${codeError ? "is-invalid" : ""}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="Ej: 123456"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        setCodeError(false);
                      }}
                      autoComplete="one-time-code"
                    />
                    {codeError && (
                      <p className="text-danger mt-1">
                        Debe ingresar el código de verificación
                      </p>
                    )}
                  </Form.Group>

                  <div className="inputs-group mt-3 text-center">
                    <Form.Label>
                      <span
                        className="text-decoration-none custom-link"
                        style={{ cursor: "pointer" }}
                        onClick={handleBackToCredentials}
                      >
                        Volver
                      </span>
                    </Form.Label>
                  </div>

              </CustomCard>
              </Form>
            )}
            </Col>
          </Row>
          </div>
        </Container>
      </Background>
    </>
  );
};

export default Login;
