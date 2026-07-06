import { useState, useContext, useRef } from "react";
import { Form } from "react-bootstrap";
import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";
import CustomModal from "../../modal/CustomModal";
import { AuthContext } from "../../authContext/AuthContext";

const DeleteShipping = () => {
  const { token } = useContext(AuthContext);
  const [shipmentId, setShipmentId] = useState("");
  const [errors, setErrors] = useState({ shipmentId: false });
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);

  const shipmentRef = useRef(null);

  const validateIdShipment = (idShipment) => /^[1-9]\d*$/.test(idShipment);

  const handleCancelNumber = (event) => {
    const idShipment = event.target.value;
    setShipmentId(idShipment);

    if (!idShipment.trim()) {
      setErrors({ shipmentId: "empty" });
    } else if (!validateIdShipment(idShipment)) {
      setErrors({ shipmentId: "invalid" });
    } else {
      setErrors({ shipmentId: false });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shipmentId.trim()) {
      setErrors({ shipmentId: "empty" });
      shipmentRef.current.focus();
      return;
    }

    if (!validateIdShipment(shipmentId)) {
      setErrors({ shipmentId: "invalid" });
      shipmentRef.current.focus();
      return;
    }

    if (!token) {
      setAlertData({
        show: true,
        message: "Debes ingresar para cancelar envíos.",
        type: "error",
      });
      return;
    }
    try {
      const response = await fetch(
        `http://localhost:3000/api/shipment/${shipmentId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        let message = data.error;
        if (data.error === "No tenés permiso para ver este envío") {
          message = "No tenés permiso para cancelar este envío";
        }
        setAlertData({
          show: true,
          message,
          type: "error",
        });
        return;
      }
      setShowModal(true);
    } catch (error) {
      setAlertData({
        show: true,
        message: "Error al verificar el envío.",
        type: "error",
      });
    }
  };

  const cancelShipment = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/shipment/${shipmentId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: "Cancelado",
          }),
        }
      );

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
        setShipmentId("");
      }

      setShowModal(false);
    } catch (error) {
      console.error("Error al cancelar el envío:", error);
      setAlertData({
        show: true,
        message: error.message,
        type: "error",
      });
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="color-bacground d-flex justify-content-center align-items-center flex-column">
        <CustomAlert
          show={alertData.show}
          message={alertData.message}
          type={alertData.type}
          onClose={() => setAlertData({ ...alertData, show: false })}
        />

        <Form noValidate onSubmit={handleSubmit}>
          <CustomCard
            title="CANCELAR ENVÍO"
            buttonText="Cancelar"
            buttonType="submit"
          >
            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>
                Número de envío: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                ref={shipmentRef}
                className={`custom-input ${
                  errors.shipmentId ? "is-invalid" : ""
                }`}
                type="text"
                placeholder="Ej: 1"
                value={shipmentId}
                onChange={handleCancelNumber}
              />
              {errors.shipmentId === "empty" && (
                <p className="text-danger mt-1">
                  Debe ingresar el número de envío
                </p>
              )}
              {errors.shipmentId === "invalid" && (
                <p className="text-danger mt-1">
                  Debe ingresar un número válido (mayor a 0)
                </p>
              )}
            </Form.Group>
          </CustomCard>
        </Form>
        <CustomModal
          show={showModal}
          onHide={() => {
            setShowModal(false);
            setAlertData({
              show: true,
              message: "¡Envío cancelado con éxito!",
              type: "success",
            });
          }}
          title="Confirmar cancelación"
          body={`¿Estás seguro que deseas cancelar el envío número ${shipmentId}?`}
          onContinue={cancelShipment}
          confirmText="Confirmar"
          cancelText="Cancelar"
        />
      </div>
    </>
  );
};

export default DeleteShipping;
