import { useState, useContext, useRef } from "react";
import { Form } from "react-bootstrap";

import { initialErrors } from "./ModifyRole.data";
import { AuthContext } from "../../authContext/AuthContext";
import { apiFetch } from "../../../api/httpClient";

import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";
import CustomModal from "../../modal/CustomModal";
import { validateEmail } from "../../../utils/validators";
import { roleLabels, roleMap } from "../../../utils/roleLabels";

const ModifyRole = () => {
  const { role, token } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [errors, setErrors] = useState(initialErrors);

  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const emailRef = useRef(null);

  if (role !== "SuperAdmin") {
    return (
      <h3 className="text-center mt-5">
        No tenés permiso para acceder a esta sección.
      </h3>
    );
  }

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

    if (!newRole) {
      setErrors((prev) => ({ ...prev, newRole: "empty" }));
      return;
    }

    try {
      const response = await apiFetch("/api/user/role", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, roleId: roleMap[newRole] }),
      });

      if (!response.ok) {
        let message = "No se pudo modificar el rol.";
        try {
          const data = await response.json();
          message = data.error || message;
        } catch {
        }
        setAlertData({
          show: true,
          message,
          type: "error",
        });
        return;
      }

      setModalData({
        email,
        role: roleLabels[newRole],
      });
      setShowModal(true);
      setEmail("");
      setNewRole("");
      setErrors(initialErrors);
    } catch (error) {
      console.error("Error modificando rol:", error);
      setAlertData({
        show: true,
        message: "Error de conexión con el servidor.",
        type: "error",
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      {alertData.show && (
        <CustomAlert
          show={alertData.show}
          message={alertData.message}
          type={alertData.type}
          onClose={() => setAlertData({
            show: false,
            message: "",
            type: "info"
          })
        }
        />
      )}

      <form noValidate onSubmit={handleSubmit} className="w-100">
        <CustomCard
        title="MODIFICAR ROL"
        buttonText="Modificar"
        buttonType="submit">
          <Form.Group className="inputs-group mb-3 fw-bold">
            <Form.Label>
              Email del usuario: <span className="text-danger">*</span>
            </Form.Label>
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

          <Form.Group className="inputs-group mb-3 fw-bold">
            <Form.Label>
              Nuevo Rol: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Select
              className={`custom-input ${errors.newRole ? "is-invalid" : ""}`}
              value={newRole}
              onChange={(e) => {
                setNewRole(e.target.value);
                setErrors((prev) => ({ ...prev, newRole: false }));
              }}
            >
              <option value="" disabled hidden>
                Seleccione un Rol
              </option>
              <option value="Client">Usuario</option>
              <option value="Employee">Empleado</option>
              <option value="SuperAdmin">Super Admin</option>
            </Form.Select>
            {errors.newRole === "empty" && (
              <p className="text-danger mt-1">Debe seleccionar un rol</p>
            )}
          </Form.Group>
        </CustomCard>
      </form>

      {showModal && modalData && (
        <CustomModal
          show={showModal}
          onHide={() => {
              setShowModal(false);
              setAlertData({
                show: true,
                message: "¡Rol modificado con éxito!",
                type: "success",
              });
            }}
          title="Confirmación de cambio de rol"
          body={
            <div>
              <p><strong>Email:</strong> {modalData.email}</p>
              <p><strong>Nuevo Rol:</strong> {modalData.role}</p>
            </div>
          }
        />
      )}
    </div>
  );
};

export default ModifyRole;
