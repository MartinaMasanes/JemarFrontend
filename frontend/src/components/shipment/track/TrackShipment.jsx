import { useState, useRef, useContext } from "react";
import { Form } from "react-bootstrap";
import CustomAlert from "../../alert/CustomAlert";
import CustomCard from "../../card/CustomCard";
import CustomModal from "../../modal/CustomModal";
import { AuthContext } from "../../authContext/AuthContext";

function ShippingTrack() {
  const { token } = useContext(AuthContext);

  const [trackingNumber, setTrackingNumber] = useState("");
  const [errors, setErrors] = useState({ trackingNumber: false });
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const trackingNumberRef = useRef(null);

  const validateIdShipment = (idShipment) => /^[1-9]\d*$/.test(idShipment);

  const handleTrackingNumberChange = (event) => {
    const idShipment = event.target.value;
    setTrackingNumber(idShipment);

    if (!idShipment.trim()) {
      setErrors({ trackingNumber: "empty" });
    } else if (!validateIdShipment(idShipment)) {
      setErrors({ trackingNumber: "invalid" });
    } else {
      setErrors({ trackingNumber: false });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!trackingNumber.trim()) {
      setErrors({ trackingNumber: "empty" });
      trackingNumberRef.current.focus();
      return;
    }

    if (!validateIdShipment(trackingNumber)) {
      setErrors({ trackingNumber: "invalid" });
      trackingNumberRef.current.focus();
      return;
    }

    if (!token) {
      setAlertData({
        show: true,
        message: "Debes iniciar sesión para consultar un envío.",
        type: "error",
      });
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3000/api/shipment/${trackingNumber}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error || "No se encontró el envío.",
          type: "error",
        });
        return;
      }

      setModalData(data);
      setShowModal(true);
      setTrackingNumber("");
    } catch (error) {
      console.error("Error consultando envío:", error);
      setAlertData({
        show: true,
        message: error.message || "Ocurrió un error al consultar el envío.",
        type: "error",
      });
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
            title="CONSULTAR ESTADO"
            buttonText="Consultar"
            buttonType="submit"
          >
            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>
                Número de envío: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                ref={trackingNumberRef}
                className={`custom-input ${
                  errors.trackingNumber ? "is-invalid" : ""
                }`}
                type="text"
                placeholder="Ej: 1"
                value={trackingNumber}
                onChange={handleTrackingNumberChange}
              />
              {errors.trackingNumber === "empty" && (
                <p className="text-danger mt-1">
                  Debe ingresar el número de envío
                </p>
              )}
              {errors.trackingNumber === "invalid" && (
                <p className="text-danger mt-1">
                  Debe ingresar un número válido (mayor a 0)
                </p>
              )}
            </Form.Group>
          </CustomCard>
        </Form>

        {modalData && (
          <CustomModal
            show={showModal}
            onHide={() => setShowModal(false)}
            title="Seguimiento de envío"
            body={
              <div>
                {[
                  { label: "Envío N°: ", value: modalData.id },
                  { label: "Estado: ", value: modalData.status },
                  { label: "Tipo: ", value: modalData.type },
                  { label: "Origen: ", value: modalData.origin },
                  { label: "Destino: ", value: modalData.destination },
                  {
                    label: "Precio: ",
                    value: `$${modalData.price.toLocaleString("es-AR")}`,
                  },
                ].map((item, index) => (
                  <div key={index}>
                    {item.label} {item.value}
                  </div>
                ))}
              </div>
            }
          />
        )}
      </div>
    </>
  );
}

export default ShippingTrack;
