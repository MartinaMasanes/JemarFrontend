import { useState, useRef } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { initialErrors } from "./UserRegister.data.js";
import { API_URL } from "../../api/config";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import CustomCard from "../card/CustomCard";
import CustomAlert from "../alert/CustomAlert";

import "../style/Styles.css";

const UserRegister = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(initialErrors);
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  // Paso del flujo: "form" (datos del registro) o "verify" (código de email).
  const [step, setStep] = useState("form");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState(false);

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const codeRef = useRef(null);

  const navigate = useNavigate();

  const handleFirstNameChange = (event) => {
    setFirstName(event.target.value);
    setErrors((prev) => ({ ...prev, firstName: false }));
  };

  const handleLastNameChange = (event) => {
    setLastName(event.target.value);
    setErrors((prev) => ({ ...prev, lastName: false }));
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setErrors((prev) => ({ ...prev, email: false }));
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setErrors((prev) => ({ ...prev, password: false }));
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateName = (name) =>
    /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(name.trim());
  const validatePassword = (password) =>
    /^[A-Za-z\d]{8,}$/.test(password.trim());

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!firstName.trim()) {
      setErrors((prev) => ({ ...prev, firstName: "empty" }));
      firstNameRef.current.focus();
      return;
    }

    if (!validateName(firstName)) {
      setErrors((prev) => ({ ...prev, firstName: "invalid" }));
      firstNameRef.current.focus();
      return;
    }

    if (!lastName.trim()) {
      setErrors((prev) => ({ ...prev, lastName: "empty" }));
      lastNameRef.current.focus();
      return;
    }

    if (!validateName(lastName)) {
      setErrors((prev) => ({ ...prev, lastName: "invalid" }));
      lastNameRef.current.focus();
      return;
    }

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

    const user = { firstName, lastName, email, password };

    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.message || "Error en el registro",
          type: "error",
        });
        return;
      }

      // Registro OK: el backend envió un código de verificación al email.
      // Pasamos al paso de verificación (mantenemos el email, lo necesitamos).
      setStep("verify");
      setCode("");
      setCodeError(false);
      setAlertData({
        show: true,
        message: "Te enviamos un código de verificación a tu correo.",
        type: "info",
      });
    } catch (error) {
      console.error("Error registrando usuario:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al registrarse.",
        type: "error",
      });
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();

    if (!code.trim()) {
      setCodeError(true);
      codeRef.current.focus();
      return;
    }

    setCodeError(false);

    try {
      const response = await fetch(`${API_URL}/api/auth/verify-2fa`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code: code.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error || data.message || "Código incorrecto o expirado.",
          type: "error",
        });
        return;
      }

      setAlertData({
        show: true,
        message: "¡Email verificado! Ya podés iniciar sesión.",
        type: "success",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setCode("");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      console.error("Error verificando email:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al verificar el código.",
        type: "error",
      });
    }
  };

  return (
    <>
      <Background image="/images/ImageRegister.png">
        <BackArrow />
        <div className="screen d-flex justify-content-start">
          <CustomAlert
            show={alertData.show}
            message={alertData.message}
            type={alertData.type}
            onClose={() => setAlertData({ ...alertData, show: false })}
          />
          {step === "form" ? (
            <Form noValidate onSubmit={handleSubmit}>
              <CustomCard
                title="REGISTRATE"
                buttonText="Continuar"
                buttonType="submit"
              >
                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Nombre: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    ref={firstNameRef}
                    className={`custom-input ${
                      errors.firstName ? "is-invalid" : ""
                    }`}
                    type="text"
                    placeholder="Ingrese su Nombre"
                    value={firstName}
                    onChange={handleFirstNameChange}
                    autoComplete="given-name"
                  />
                  {errors.firstName === "empty" && (
                    <p className="text-danger mt-1">Debe ingresar un nombre</p>
                  )}
                  {errors.firstName === "invalid" && (
                    <p className="text-danger mt-1">
                      Debe ingresar un nombre válido (Solo letras, al menos 3)
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Apellido: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    ref={lastNameRef}
                    className={`custom-input ${
                      errors.lastName ? "is-invalid" : ""
                    }`}
                    type="text"
                    placeholder="Ingrese su Apellido"
                    value={lastName}
                    onChange={handleLastNameChange}
                    autoComplete="family-name"
                  />
                  {errors.lastName === "empty" && (
                    <p className="text-danger mt-1">Debe ingresar un apellido</p>
                  )}
                  {errors.lastName === "invalid" && (
                    <p className="text-danger mt-1">
                      Debe ingresar un apellido válido (Solo letras, al menos 3)
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Correo Electrónico: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    ref={emailRef}
                    className={`custom-input ${
                      errors.email ? "is-invalid" : ""
                    }`}
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
                  <Form.Label>
                    Contraseña: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    ref={passwordRef}
                    className={`custom-input ${
                      errors.password ? "is-invalid" : ""
                    }`}
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
              </CustomCard>
            </Form>
          ) : (
            <Form noValidate onSubmit={handleVerify}>
              <CustomCard
                title="VERIFICÁ TU EMAIL"
                buttonText="Verificar"
                buttonType="submit"
              >
                <p className="text-center mb-3">
                  Ingresá el código que enviamos a <strong>{email}</strong>.
                </p>
                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Código de verificación: <span className="text-danger">*</span>
                  </Form.Label>
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
              </CustomCard>
            </Form>
          )}
        </div>
      </Background>
    </>
  );
};

export default UserRegister;
