import { useState, useEffect, useContext } from "react";
import { Form } from "react-bootstrap";

import { AuthContext } from "../../authContext/AuthContext";
import { apiFetch } from "../../../api/httpClient";

import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";
import CustomModal from "../../modal/CustomModal";

const typeLabels = { Express: "Expreso", Standard: "Estándar" };
const sizeLabels = { Small: "Pequeño", Medium: "Mediano", Large: "Grande" };
const statusLabels = {
  Pending: "Pendiente",
  InTransit: "En tránsito",
  Delivered: "Entregado",
  Cancelled: "Cancelado",
};

const nextStatusOptions = {
  Pending: [
    { id: 2, label: "En tránsito" },
    { id: 4, label: "Cancelado" },
  ],
  InTransit: [
    { id: 3, label: "Entregado" },
    { id: 4, label: "Cancelado" },
  ],
  Delivered: [],
  Cancelled: [],
};

function ModifyState() {
  const { token } = useContext(AuthContext);

  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [searchError, setSearchError] = useState(false);

  const [selected, setSelected] = useState(null);
  const [newStatusId, setNewStatusId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultData, setResultData] = useState(null);

  const loadShipments = () => {
    if (!token) return;
    apiFetch("/api/shipment")
      .then((res) => res.json())
      .then((data) => setShipments(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error cargando envíos:", err);
        setAlertData({
          show: true,
          message: "No se pudieron cargar los envíos.",
          type: "error",
        });
      });
  };

  useEffect(loadShipments, [token]);

  const modifiable = shipments.filter(
    (s) => (nextStatusOptions[s.shipmentStatus] || []).length > 0
  );

  const openSelect = (shipment) => {
    setSelected(shipment);
    setNewStatusId("");
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setSearchError(false);
    setSelected(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const q = search.trim().toLowerCase();

    if (!q) {
      setSearchError(true);
      return;
    }

    const matches = modifiable.filter((s) => s.id.toLowerCase().includes(q));

    if (matches.length === 0) {
      setAlertData({
        show: true,
        message: "No se encontró un envío modificable con ese número.",
        type: "error",
      });
    } else if (matches.length === 1) {
      openSelect(matches[0]);
    } else {
      setAlertData({
        show: true,
        message:
          "Hay varios envíos que coinciden. Ingresá el número completo.",
        type: "info",
      });
    }
  };

  const confirmChange = async () => {
    if (!selected || !newStatusId || submitting) return;

    try {
      setSubmitting(true);
      const response = await apiFetch(
        `/api/shipment/${selected.id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ shipmentStatusId: Number(newStatusId) }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo modificar el estado.");
      }

      const getResponse = await apiFetch(`/api/shipment/${selected.id}`);
      const updated = await getResponse.json();

      setSelected(null);
      setNewStatusId("");
      setSearch("");
      setResultData(updated);
      setShowResultModal(true);
      loadShipments();
    } catch (error) {
      console.error("Error modificando estado:", error);
      setAlertData({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center mt-5">
        <CustomAlert
          show={true}
          message="Debes iniciar sesión para modificar envíos."
          type="error"
        />
      </div>
    );
  }

  return (
    <>
      <CustomAlert
        show={alertData.show}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, show: false })}
      />

      <div className="d-flex flex-column align-items-center track-card">
        <Form noValidate onSubmit={handleSearch}>
          <CustomCard
            title="MODIFICAR ESTADO"
            buttonText="Buscar envío"
            buttonType="submit"
          >
            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>
                Número de envío: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                className={`custom-input ${searchError ? "is-invalid" : ""}`}
                type="text"
                placeholder="Buscá por número"
                value={search}
                onChange={handleSearchChange}
                autoComplete="off"
              />
              {searchError && (
                <p className="text-danger mt-1">Ingresá un número de envío</p>
              )}
            </Form.Group>
          </CustomCard>
        </Form>
      </div>

      {selected && (
        <CustomModal
          show={!!selected}
          onHide={() => {
            setSelected(null);
            setNewStatusId("");
          }}
          onContinue={confirmChange}
          continueText={submitting ? "Modificando..." : "Confirmar cambio de estado"}
          continueDisabled={!newStatusId || submitting}
          title="¿Confirmar el cambio de estado?"
          body={
            <div>
              {[
                { label: "Envío N°: ", value: selected.id },
                {
                  label: "Estado actual: ",
                  value:
                    statusLabels[selected.shipmentStatus] ||
                    selected.shipmentStatus,
                },
                {
                  label: "Tipo de envío: ",
                  value: typeLabels[selected.shipmentType] || selected.shipmentType,
                },
                { label: "Cliente: ", value: selected.clientName },
                { label: "Origen: ", value: selected.origin },
                { label: "Destino: ", value: selected.destination },
              ].map((item, i) => (
                <div key={i}>
                  <strong>{item.label}</strong>
                  {item.value}
                </div>
              ))}

              <Form.Group className="inputs-group mt-3 fw-bold">
                <Form.Label>
                  Nuevo estado: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Select
                  className="custom-input"
                  value={newStatusId}
                  onChange={(e) => setNewStatusId(e.target.value)}
                >
                  <option value="" disabled hidden>
                    Seleccione un estado
                  </option>
                  {(nextStatusOptions[selected.shipmentStatus] || []).map(
                    (opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    )
                  )}
                </Form.Select>
              </Form.Group>
            </div>
          }
        />
      )}

      {showResultModal && resultData && (
        <CustomModal
          show={showResultModal}
          onHide={() => setShowResultModal(false)}
          onContinue={() => setShowResultModal(false)}
          continueText="Cerrar"
          title="¡Estado modificado con éxito!"
          body={
            <div>
              {[
                { label: "Envío N°: ", value: resultData.id },
                {
                  label: "Estado: ",
                  value:
                    statusLabels[resultData.shipmentStatus] ||
                    resultData.shipmentStatus,
                },
                {
                  label: "Tipo: ",
                  value: typeLabels[resultData.shipmentType] || resultData.shipmentType,
                },
                {
                  label: "Tamaño: ",
                  value: sizeLabels[resultData.packageSize] || resultData.packageSize,
                },
                { label: "Origen: ", value: resultData.origin },
                { label: "Destino: ", value: resultData.destination },
                {
                  label: "Precio: ",
                  value: `$${resultData.price.toLocaleString("es-AR")}`,
                },
              ].map((item, i) => (
                <div key={i}>
                  <strong>{item.label}</strong>
                  {item.value}
                </div>
              ))}
            </div>
          }
        />
      )}
    </>
  );
}

export default ModifyState;
