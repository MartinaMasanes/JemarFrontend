import { useState, useContext, useEffect } from "react";
import { Container, Row, Col, Form } from "react-bootstrap";

import { AuthContext } from "../authContext/AuthContext";
import { apiFetch } from "../../api/httpClient";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import CustomCard from "../card/CustomCard";
import CustomAlert from "../alert/CustomAlert";
import { validateEmail, validateName, validatePassword } from "../../utils/validators";

const Profile = () => {
  const { user, token, refreshUser } = useContext(AuthContext);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
    }
  }, [user]);

  const handleProfileSubmit = async (event) => {
    event.preventDefault();
    const errs = {};
    if (!firstName.trim() || !validateName(firstName)) errs.firstName = true;
    if (!lastName.trim() || !validateName(lastName)) errs.lastName = true;
    if (!email.trim() || !validateEmail(email)) errs.email = true;

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      return;
    }
    setProfileErrors({});

    try {
      setSavingProfile(true);
      const response = await apiFetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok)
        throw new Error(data.error || "No se pudieron guardar los cambios.");

      await refreshUser();
      setAlertData({
        show: true,
        message: "Datos actualizados con éxito.",
        type: "success",
      });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();
    const errs = {};
    if (!currentPassword.trim()) errs.currentPassword = true;
    if (!validatePassword(newPassword)) errs.newPassword = true;
    if (newPassword !== confirmPassword) errs.confirmPassword = true;

    if (Object.keys(errs).length > 0) {
      setPasswordErrors(errs);
      return;
    }
    setPasswordErrors({});

    try {
      setSavingPassword(true);
      const response = await apiFetch("/api/auth/me/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo cambiar la contraseña.");
      }

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setAlertData({
        show: true,
        message: "Contraseña actualizada con éxito.",
        type: "success",
      });
    } catch (error) {
      console.error("Error cambiando contraseña:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setSavingPassword(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center mt-5">
        <CustomAlert
          show={true}
          message="Debes iniciar sesión para ver tu perfil."
          type="error"
        />
      </div>
    );
  }

  return (
      <Background image="/images/ImageLogin.webp">
      <BackArrow />
      <div className="screen d-flex justify-content-start w-100">
      <Container className="d-flex align-items-center min-vh-100 flex-column py-5">
        <CustomAlert
          show={alertData.show}
          message={alertData.message}
          type={alertData.type}
          onClose={() => setAlertData({ ...alertData, show: false })}
        />
        <Row className="justify-content-center">
          <Col xs="auto">
            <Form noValidate onSubmit={handleProfileSubmit}>
              <CustomCard
                title="MIS DATOS"
                buttonText="Guardar cambios"
                buttonType="submit"
                loading={savingProfile}
                loadingText="Guardando..."
              >
                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Nombre: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      profileErrors.firstName ? "is-invalid" : ""
                    }`}
                    type="text"
                    value={firstName}
                    onChange={(e) => {
                      setFirstName(e.target.value);
                      setProfileErrors((p) => ({ ...p, firstName: false }));
                    }}
                  />
                  {profileErrors.firstName && (
                    <p className="text-danger mt-1">
                      Nombre inválido (solo letras, al menos 3)
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Apellido: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      profileErrors.lastName ? "is-invalid" : ""
                    }`}
                    type="text"
                    value={lastName}
                    onChange={(e) => {
                      setLastName(e.target.value);
                      setProfileErrors((p) => ({ ...p, lastName: false }));
                    }}
                  />
                  {profileErrors.lastName && (
                    <p className="text-danger mt-1">
                      Apellido inválido (solo letras, al menos 3)
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Correo electrónico: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      profileErrors.email ? "is-invalid" : ""
                    }`}
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setProfileErrors((p) => ({ ...p, email: false }));
                    }}
                  />
                  {profileErrors.email && (
                    <p className="text-danger mt-1">Email inválido</p>
                  )}
                </Form.Group>
              </CustomCard>
            </Form>
          </Col>

          <Col xs="auto">
            <Form noValidate onSubmit={handlePasswordSubmit}>
              <CustomCard
                title="CAMBIAR CONTRASEÑA"
                buttonText="Actualizar contraseña"
                buttonType="submit"
                loading={savingPassword}
                loadingText="Actualizando..."
              >
                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Contraseña actual: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      passwordErrors.currentPassword ? "is-invalid" : ""
                    }`}
                    type="password"
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setPasswordErrors((p) => ({
                        ...p,
                        currentPassword: false,
                      }));
                    }}
                    autoComplete="current-password"
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-danger mt-1">
                      Ingresá tu contraseña actual
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Nueva contraseña: <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      passwordErrors.newPassword ? "is-invalid" : ""
                    }`}
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setPasswordErrors((p) => ({ ...p, newPassword: false }));
                    }}
                    autoComplete="new-password"
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-danger mt-1">
                      Debe tener al menos 8 caracteres, 1 número y 1 letra
                    </p>
                  )}
                </Form.Group>

                <Form.Group className="inputs-group mb-3 fw-bold">
                  <Form.Label>
                    Confirmar nueva contraseña:{" "}
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      passwordErrors.confirmPassword ? "is-invalid" : ""
                    }`}
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setPasswordErrors((p) => ({
                        ...p,
                        confirmPassword: false,
                      }));
                    }}
                    autoComplete="new-password"
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-danger mt-1">
                      Las contraseñas no coinciden
                    </p>
                  )}
                </Form.Group>
              </CustomCard>
            </Form>
          </Col>
        </Row>
      </Container>
      </div>
    </Background>
  );
};

export default Profile;
