import { Form } from "react-bootstrap";
import { useRef, useState } from "react";

import { initialErrors } from "./Consult.data";

import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";

const Consult = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [consult, setConsult] = useState("");
  const [errors, setErrors] = useState(initialErrors);
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const consultRef = useRef(null);

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

  const handleConsultChange = (event) => {
    setConsult(event.target.value);
    setErrors((prev) => ({ ...prev, consult: false }));
  };

  const validateName = (name) => /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/.test(name.trim());
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateConsult = (msg) => msg.trim() !== "";

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

    if (!validateConsult(consult)) {
      setErrors((prev) => ({ ...prev, consult: "Debe ingresar una consulta" }));
      consultRef.current.focus();
      return;
    }

    const consultData = { firstName, lastName, email, consult };

    try {
      const response = await fetch("http://localhost:3000/api/consult", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(consultData),
      });

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.message || "Error cargando la consulta",
          type: "error",
        });
        return;
      }

      setAlertData({
        show: true,
        message: "Consulta registrada con éxito",
        type: "success",
      });

      setFirstName("");
      setLastName("");
      setEmail("");
      setConsult("");
      setErrors(initialErrors);
    } catch (error) {
      console.error("Error cargando consulta:", error);
      setAlertData({
        show: true,
        message: "Ocurrió un error cargando su consulta",
        type: "error",
      });
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center flex-column">
      <CustomAlert
        show={alertData.show}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ show: false, message: "", type: "info" })}
      />
      <Form noValidate onSubmit={handleSubmit}>
        <CustomCard
          title="HACE TU CONSULTA"
          buttonText="Enviar"
          buttonType="submit"
        >
          <Form.Group className="inputs-group mb-3 fw-bold">
            <Form.Label>
              Nombre: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              ref={firstNameRef}
              className={`custom-input ${errors.firstName ? "is-invalid" : ""}`}
              type="text"
              placeholder="Ingrese su nombre"
              value={firstName}
              onChange={handleFirstNameChange}
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
              className={`custom-input ${errors.lastName ? "is-invalid" : ""}`}
              type="text"
              placeholder="Ingrese su apellido"
              value={lastName}
              onChange={handleLastNameChange}
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

          <Form.Group className="inputs-group mb-3 fw-bold">
            <Form.Label>
              Consulta: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              ref={consultRef}
              className={`custom-input ${errors.consult ? "is-invalid" : ""}`}
              as="textarea"
              rows={2}
              placeholder="Escribe tu consulta aquí..."
              value={consult}
              onChange={handleConsultChange}
            />
            {errors.consult && (
              <p className="text-danger mt-1 text-center">{errors.consult}</p>
            )}
          </Form.Group>
        </CustomCard>
      </Form>
    </div>
  );
};

export default Consult;
