import { useState, useRef, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Row, Col, Container } from "react-bootstrap";

import { initialErrors } from "./Login.data";
import { AuthContext } from "../authContext/AuthContext";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import CustomAlert from "../alert/CustomAlert";
import CustomCard from "../card/CustomCard";

const Login = () => {
  const navigate = useNavigate();

  const { onLogin } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(initialErrors);
  
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

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

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^[A-Za-z\d]{8,}$/.test(password);

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

    try {
      const response = await fetch("http://localhost:3000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.message || "Error al iniciar sesión",
          type: "error",
        });
        return;
      }

      const payload = JSON.parse(atob(data.token.split(".")[1]));
      const role = payload.role;

      onLogin(data.token, role);

      setAlertData({
        show: true,
        message: "¡Inicio de sesión exitoso!",
        type: "success",
      });

      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/shipment");
      }, 1500);
    } catch (error) {
      console.error("Login error:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al iniciar sesión.",
        type: "error",
      });
    }
  };

  return (
    <>
      <Background image="/images/ImageLogin.png">
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
            <Form noValidate onSubmit={handleSubmit}>
              <CustomCard
            title="INICIAR SESIÓN"
            buttonText="Iniciar"
            buttonType="submit">
                  <Form.Group className="inputs-group mb-3 fw-bold">
                    <Form.Label>Correo Electrónico: <span className="text-danger">*</span></Form.Label>
                    <Form.Control
                      ref={emailRef}
                      className={`custom-input ${errors.email}`}
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
                      className={`custom-input ${errors.password}`}
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

                  <div className="inputs-group mt-3 text-center">
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
            </Col>
          </Row>
          </div>
        </Container>
      </Background>
    </>
  );
};

export default Login;