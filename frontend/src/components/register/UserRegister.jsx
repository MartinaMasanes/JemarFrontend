import { useState, useRef } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { initialErrors } from "./UserRegister.data.js";

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

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

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
      const response = await fetch("http://localhost:3000/api/auth/register", {
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

      setAlertData({
        show: true,
        message: "Registro exitoso",
        type: "success",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (error) {
      console.error("Error registrando usuario:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al registrarse.",
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
        </div>
      </Background>
    </>
  );
};

export default UserRegister;
