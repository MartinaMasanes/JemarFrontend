import { useState, useRef } from "react";
import { Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

import { initialErrors, initialResetErrors } from "./ForgotPassword.data.js";
import { API_URL } from "../../api/config";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import CustomCard from "../card/CustomCard";
import CustomAlert from "../alert/CustomAlert";
import CustomModal from "../modal/CustomModal";

const ForgotPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState(initialErrors);

  // Paso del flujo: "request" (pedir el código) o "reset" (código + nueva contraseña).
  const [step, setStep] = useState("request");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetErrors, setResetErrors] = useState(initialResetErrors);

  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const emailRef = useRef(null);
  const codeRef = useRef(null);
  const newPasswordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) => /^[A-Za-z\d]{8,}$/.test(password.trim());

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setErrors((prev) => ({ ...prev, email: false }));
  };

  const requestCode = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.status === 429) {
        setAlertData({
          show: true,
          message: "Demasiados intentos. Esperá un minuto y volvé a intentar.",
          type: "error",
        });
        return false;
      }

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error || data.message || "Ocurrió un error al solicitar el código.",
          type: "error",
        });
        return false;
      }

      setAlertData({
        show: true,
        message: data.message || "Si el email está registrado, te enviamos un código.",
        type: "info",
      });
      return true;
    } catch (error) {
      console.error("Error solicitando código de recuperación:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al solicitar el código.",
        type: "error",
      });
      return false;
    } finally {
      setLoading(false);
    }
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

    setErrors(initialErrors);

    const sent = await requestCode();
    if (sent) {
      setCode("");
      setNewPassword("");
      setConfirmPassword("");
      setResetErrors(initialResetErrors);
      setStep("reset");
    }
  };

  const handleResendCode = async () => {
    if (loading) return;
    await requestCode();
  };

  const handleReset = async (event) => {
    event.preventDefault();
    if (loading) return;

    if (!code.trim()) {
      setResetErrors((prev) => ({ ...prev, code: "empty" }));
      codeRef.current.focus();
      return;
    }

    if (!newPassword.trim()) {
      setResetErrors((prev) => ({ ...prev, newPassword: "empty" }));
      newPasswordRef.current.focus();
      return;
    }

    if (!validatePassword(newPassword)) {
      setResetErrors((prev) => ({ ...prev, newPassword: "invalid" }));
      newPasswordRef.current.focus();
      return;
    }

    if (confirmPassword.trim() !== newPassword.trim()) {
      setResetErrors((prev) => ({ ...prev, confirmPassword: "mismatch" }));
      confirmPasswordRef.current.focus();
      return;
    }

    setResetErrors(initialResetErrors);
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          code: code.trim(),
          newPassword: newPassword.trim(),
        }),
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
          message: data.error || data.message || "Código inválido o expirado.",
          type: "error",
        });
        return;
      }

      setAlertData({
        show: true,
        message: data.message || "Tu contraseña fue actualizada correctamente.",
        type: "success",
      });

      setStep("request");
      setEmail("");
      setCode("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (error) {
      console.error("Error restableciendo contraseña:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error al restablecer la contraseña.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Background image="/images/ImageLogin.webp">
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
              title="RECUPERAR CONTRASEÑA"
              buttonText="Enviar código"
              buttonType="submit"
              loading={loading}
              loadingText="Enviando..."
            >
              <p className="text-center mb-3 text-white">
                Ingresá tu correo y te enviaremos un código para restablecer tu contraseña.
              </p>
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
                  <p className="text-danger mt-1">Debe ingresar un correo electrónico</p>
                )}
                {errors.email === "invalid" && (
                  <p className="text-danger mt-1">
                    Debe ingresar un email válido, ejemplo: juan@jemar.com
                  </p>
                )}
              </Form.Group>
            </CustomCard>
          </Form>

          <CustomModal
            show={step === "reset"}
            onHide={() => setStep("request")}
            onContinue={handleReset}
            continueText={loading ? "Restableciendo..." : "Restablecer contraseña"}
            continueDisabled={loading}
            title="RESTABLECÉ TU CONTRASEÑA"
            body={
              <Form noValidate onSubmit={handleReset}>
                <p className="text-center mb-3">
                  Ingresá el código que enviamos a <strong>{email}</strong> y tu nueva contraseña.
                </p>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Código de verificación: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    ref={codeRef}
                    className={`custom-input ${resetErrors.code ? "is-invalid" : ""}`}
                    type="text"
                    inputMode="numeric"
                    placeholder="Ej: 123456"
                    value={code}
                    onChange={(e) => {
                      setCode(e.target.value);
                      setResetErrors((prev) => ({ ...prev, code: false }));
                    }}
                    autoComplete="one-time-code"
                  />
                  {resetErrors.code === "empty" && (
                    <p className="text-danger mt-1">Debe ingresar el código de verificación</p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold position-relative">
                  <Form.Label>
                    Nueva contraseña: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    ref={newPasswordRef}
                    className={`custom-input ${resetErrors.newPassword ? "is-invalid" : ""}`}
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setResetErrors((prev) => ({ ...prev, newPassword: false }));
                    }}
                    autoComplete="new-password"
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
                  {resetErrors.newPassword === "empty" && (
                    <p className="text-danger mt-1">Debe ingresar una contraseña</p>
                  )}
                  {resetErrors.newPassword === "invalid" && (
                    <p className="text-danger mt-1">
                      Debe ingresar al menos 8 caracteres, 1 número y 1 letra
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Confirmar contraseña: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    ref={confirmPasswordRef}
                    className={`custom-input ${resetErrors.confirmPassword ? "is-invalid" : ""}`}
                    type={showPassword ? "text" : "password"}
                    placeholder="********"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setResetErrors((prev) => ({ ...prev, confirmPassword: false }));
                    }}
                    autoComplete="new-password"
                  />
                  {resetErrors.confirmPassword === "mismatch" && (
                    <p className="text-danger mt-1">Las contraseñas no coinciden</p>
                  )}
                </Form.Group>

                <div className="inputs-group mt-3 text-center">
                  <Form.Label>
                    <span
                      className="text-decoration-none custom-link"
                      style={{ cursor: "pointer" }}
                      onClick={handleResendCode}
                    >
                      Reenviar código
                    </span>
                  </Form.Label>
                </div>
              </Form>
            }
          />
        </div>
      </Background>
    </>
  );
};

export default ForgotPassword;
