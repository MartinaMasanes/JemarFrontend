import { useState, useContext, useRef } from "react";
import { Form } from "react-bootstrap";

import { initialErrors } from "./LowUser.data";
import { AuthContext } from "../../authContext/AuthContext";

import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";
import CustomModal from "../../modal/CustomModal";

const LowUser = () => {
  const { token, role } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState(initialErrors);

  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);

  const emailRef = useRef(null);

  if (role !== "SuperAdmin") {
    return (
      <h3 className="text-center mt-5">
        No tenés permiso para acceder a esta sección.
      </h3>
    );
  }

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);

    if (!value.trim()) {
      setErrors((prev) => ({ ...prev, email: "empty" }));
    } else if (!validateEmail(value)) {
      setErrors((prev) => ({ ...prev, email: "invalid" }));
    } else {
      setErrors((prev) => ({ ...prev, email: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "empty", newRole: errors.newRole });
      emailRef.current.focus();
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: "invalid", newRole: errors.newRole });
      emailRef.current.focus();
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/user/verify/${email}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error,
          type: "error",
        });
        return;
      }

      setShowModal(true);
    } catch (error) {
      setAlertData({
        show: true,
        message: "Error al verificar el usuario.",
        type: "error",
      });
    }
  };

  const Delete = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error,
          type: "error",
        });
      } else {
        setAlertData({
          show: true,
          message: data.message,
          type: "success",
        });
        setEmail("");
      }

      setShowModal(false);
    } catch (error) {
      setAlertData({
        show: true,
        message: "Error de conexión con el servidor.",
        type: "error",
      });
      setShowModal(false);
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      {alertData.show && (
        <CustomAlert
          show={alertData.show}
          message={alertData.message}
          type={alertData.type}
          onClose={() =>
            setAlertData({
              show: false,
              message: "",
              type: "info",
            })
          }
        />
      )}
      <form noValidate onSubmit={handleSubmit}>
        <CustomCard
          title="ELIMINAR USUARIO"
          buttonText="Eliminar"
          buttonType="submit">
          <Form.Group className="inputs-group mb-3 fw-bold">
            <Form.Label>Email del usuario:</Form.Label>
            <Form.Control
              ref={emailRef}
              className={`custom-input ${errors.email ? "is-invalid" : ""}`}
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="usuario@ejemplo.com"
            />
            {errors.email === "empty" && (
              <p className="text-danger mt-1">Debe ingresar un email</p>
            )}
            {errors.email === "invalid" && (
              <p className="text-danger mt-1">Debe ingresar un email válido, ejemplo: juan@jemar.com</p>
            )}
          </Form.Group>
        </CustomCard>
      </form>

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Confirmar baja"
        body={`¿Estás seguro que deseas eliminar al usuario con email ${email}?`}
        onContinue={Delete}
        confirmText="Confirmar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default LowUser;
