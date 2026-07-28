import { useState, useEffect, useContext } from "react";
import { Form } from "react-bootstrap";

import { AuthContext } from "../../authContext/AuthContext";
import { API_URL } from "../../../api/config";

import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";
import CustomModal from "../../modal/CustomModal";

// El backend devuelve los nombres de enum en inglés; los mostramos en español.
const typeLabels = { Express: "Expreso", Standard: "Estándar" };
const sizeLabels = { Small: "Pequeño", Medium: "Mediano", Large: "Grande" };
const statusLabels = {
  Pending: "Pendiente",
  InTransit: "En tránsito",
  Delivered: "Entregado",
  Cancelled: "Cancelado",
};

// Transiciones válidas según la máquina de estados del backend (los IDs son
// los de Jemar.Domain.Enums.ShipmentStatusEnum). El backend valida igual; acá
// solo evitamos ofrecer opciones que de entrada van a ser rechazadas.
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
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);

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
    setLoading(true);
    fetch(`${API_URL}/api/shipment`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setShipments(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error cargando envíos:", err);
        setAlertData({
          show: true,
          message: "No se pudieron cargar los envíos.",
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  useEffect(loadShipments, [token]);

  // Solo tiene sentido ofrecer los envíos que todavía admiten alguna transición.
  const modifiable = shipments.filter(
    (s) => (nextStatusOptions[s.shipmentStatus] || []).length > 0
  );

  const openSelect = (shipment) => {
    setSelected(shipment);
    setNewStatusId("");
  };

  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setSelected(null);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const q = search.trim().toLowerCase();

    if (!q) {
      setAlertData({
        show: true,
        message: "Ingresá un número de envío.",
        type: "error",
      });
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

  // Nota: hasta que el modal soporte estado de carga con spinner, este chequeo
  // evita que un doble clic dispare dos modificaciones del mismo envío.
  const confirmChange = async () => {
    if (!selected || !newStatusId || submitting) return;

    try {
      setSubmitting(true);
      const response = await fetch(
        `${API_URL}/api/shipment/${selected.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shipmentStatusId: Number(newStatusId) }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo modificar el estado.");
      }

      const getResponse = await fetch(`${API_URL}/api/shipment/${selected.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
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

      <div
        className="track-layout"
        style={showTable ? { width: "min(1050px, 88vw)" } : undefined}
      >
        <div className="d-flex flex-column align-items-center track-card">
          <Form noValidate onSubmit={handleSearch}>
            <CustomCard
              title="MODIFICAR ESTADO"
              buttonText="Buscar envío"
              buttonType="submit"
            >
              <Form.Group className="inputs-group mb-3 fw-bold">
                <Form.Label>Número de envío:</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  placeholder="Buscá por número"
                  value={search}
                  onChange={handleSearchChange}
                  autoComplete="off"
                />
              </Form.Group>

              <p className="text-center mt-2 mb-0">
                <span
                  className="custom-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowTable((prev) => !prev)}
                >
                  {showTable ? "Ocultar envíos" : "Ver envíos modificables"}
                </span>
              </p>
            </CustomCard>
          </Form>
        </div>

        {showTable && (
          <div className="track-table">
            <div className="back-table ocultar-scroll text-center p-3">
              <h2 className="title-card mb-3">Envíos modificables</h2>

              {loading ? (
                <p className="titulo fw-bold">Cargando envíos...</p>
              ) : modifiable.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="table-container">
                    <thead>
                      <tr>
                        <th>N°</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                        <th>Destino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {modifiable.map((s) => (
                        <tr key={s.id} onClick={() => openSelect(s)}>
                          <td>{s.id}</td>
                          <td>{s.clientName}</td>
                          <td>{statusLabels[s.shipmentStatus] || s.shipmentStatus}</td>
                          <td>{s.destination}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <h2 className="title-card">No hay envíos modificables.</h2>
              )}
            </div>
          </div>
        )}
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
                <Form.Label>Nuevo estado:</Form.Label>
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
