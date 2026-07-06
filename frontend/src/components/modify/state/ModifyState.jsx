import { useState, useContext, useRef } from "react";
import { Form } from "react-bootstrap";

import { initialErrors } from "./ModifyState.data";
import { AuthContext } from "../../authContext/AuthContext";

import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";
import CustomModal from "../../modal/CustomModal";

const ModifyState = () => {
  const { role, token } = useContext(AuthContext);
  const [shipmentId, setShipmentId] = useState("");
  const [status, setStatus] = useState("");
  const [errors, setErrors] = useState(initialErrors);
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  const shipmentIdRef = useRef(null);
  const validateIdShipment = (idShipment) => /^[1-9]\d*$/.test(idShipment);

  const handleModifyState = (event) => {
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

    const cleanId = shipmentId.replace(":", "").trim();

    if (!cleanId) {
      setErrors({ shipmentId: "empty" });
      shipmentIdRef.current.focus();
      return;
    }

    if (!validateIdShipment(cleanId)) {
      setErrors({ shipmentId: "invalid" });
      shipmentIdRef.current.focus();
      return;
    }

    if (!status) {
      setErrors((prev) => ({ ...prev, status: "empty" }));
      return;
    } else {
      setErrors((prev) => ({ ...prev, status: false }));
    }

    if (role !== "Empleado" && role !== "SuperAdmin") {
      setAlertData({
        show: true,
        message: "No tienes permisos para modificar este envío.",
        type: "error",
      });
      return;
    }

    await updateShipment();
  };

  const updateShipment = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/shipment/${shipmentId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await response.json();

      if (!response.ok)
        throw new Error(data.error || "Error al actualizar estado");

      const getResponse = await fetch(
        `http://localhost:3000/api/shipment/${shipmentId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const updatedData = await getResponse.json();

      if (!getResponse.ok)
        throw new Error(
          updatedData.error || "Error al obtener datos actualizados"
        );

      setModalData(updatedData);
      setShowModal(true);

      setShipmentId("");
      setStatus("");
      setErrors(initialErrors);
    } catch (error) {
      console.error("Error actualizando envío:", error);
      setAlertData({
        show: true,
        message: error.message || "Error desconocido al actualizar el envío.",
        type: "error",
      });
    }
  };

  const modalButtons = [
    {
      label: "Cerrar",
      onClick: () => setShowModal(false),
      className: "btn-secondary",
    },
  ];

  return (
    <>
      <div className="color-bacground d-flex justify-content-center align-items-center flex-column">
        <CustomAlert
          show={alertData.show}
          message={alertData.message}
          type={alertData.type}
          onClose={() => setAlertData({ ...alertData, show: false })}
        />

        <form onSubmit={handleSubmit} className="w-100">
          <CustomCard
            title="MODIFICAR ESTADO"
            buttonText="Modificar"
            buttonType="submit"
          >
            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>
                Número envío: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                ref={shipmentIdRef}
                className={`custom-input ${
                  errors.shipmentId ? "is-invalid" : ""
                }`}
                type="text"
                placeholder="Ej: 1"
                value={shipmentId}
                onChange={handleModifyState}
              />
              {errors.shipmentId === "empty" && (
                <p className="text-danger mt-1">Debe ingresar el id de envío</p>
              )}
              {errors.shipmentId === "invalid" && (
                <p className="text-danger mt-1">
                  Debe ingresar un id válido (mayor a 0)
                </p>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>
                Nuevo Estado: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                className={`custom-input ${errors.status ? "is-invalid" : ""}`}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  setErrors((prev) => ({ ...prev, status: false }));
                }}
              >
                <option value="" disabled hidden>
                  Seleccione un Estado
                </option>
                <option value="Pendiente">Pendiente</option>
                <option value="En camino">En camino</option>
                <option value="Entregado">Entregado</option>
                <option value="Cancelado">Cancelado</option>
              </Form.Select>
              {errors.status === "empty" && (
                <p className="text-danger mt-1">Debe seleccionar un estado</p>
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
                message: "¡Estado modificado con éxito!",
                type: "success",
              });
            }}
            title="¡Confirmar cambio de estado!"
            body={
              <div>
                {[
                  { label: "Envío N°: ", value: modalData?.id },
                  { label: "Estado: ", value: modalData?.status },
                  { label: "Tipo: ", value: modalData?.type },
                  { label: "Origen: ", value: modalData?.origin },
                  { label: "Destino: ", value: modalData?.destination },
                  {
                    label: "Precio: ",
                    value: modalData?.price
                      ? `$${modalData.price.toLocaleString("es-AR")}`
                      : "",
                  },
                ].map((item, index) => (
                  <div key={index}>
                    {item.label} {item.value}
                  </div>
                ))}
              </div>
            }
            buttons={modalButtons}
          />
        )}
      </div>
    </>
  );
};

export default ModifyState;
