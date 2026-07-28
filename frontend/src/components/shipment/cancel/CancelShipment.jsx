import { useState, useEffect, useContext } from "react";
import { Form } from "react-bootstrap";
import CustomAlert from "../../alert/CustomAlert";
import CustomCard from "../../card/CustomCard";
import CustomModal from "../../modal/CustomModal";
import { AuthContext } from "../../authContext/AuthContext";
import { API_URL } from "../../../api/config";

// El backend devuelve los nombres de enum en inglés; los mostramos en español.
const typeLabels = { Express: "Expreso", Standard: "Estándar" };
const sizeLabels = { Small: "Pequeño", Medium: "Mediano", Large: "Grande" };

// Cancelado = 4 en Jemar.Domain.Enums.ShipmentStatusEnum. El backend valida
// igual quién puede cancelar qué; acá solo filtramos para no hacer buscar a
// ciegas envíos que de entrada no se van a poder cancelar.
const CANCELLED_STATUS_ID = 4;

function CancelShipment() {
  const { token, role } = useContext(AuthContext);
  const isStaff = role === "Employee" || role === "SuperAdmin";

  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);
  const [target, setTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

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

  // Un cliente solo puede cancelar envíos propios y Pendientes; al staff
  // además se le muestran los En tránsito (el backend igual valida todo esto).
  const cancellable = shipments.filter(
    (s) =>
      s.shipmentStatus === "Pending" ||
      (isStaff && s.shipmentStatus === "InTransit")
  );

  const openConfirm = (shipment) => {
    setTarget(shipment);
    setShowModal(true);
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

    const matches = cancellable.filter((s) => s.id.toLowerCase().includes(q));

    if (matches.length === 0) {
      setAlertData({
        show: true,
        message: "No se encontró un envío cancelable con ese número.",
        type: "error",
      });
    } else if (matches.length === 1) {
      openConfirm(matches[0]);
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
  // evita que un doble clic dispare dos cancelaciones del mismo envío.
  const confirmCancel = async () => {
    if (!target || cancelling) return;

    try {
      setCancelling(true);
      const response = await fetch(
        `${API_URL}/api/shipment/${target.id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ shipmentStatusId: CANCELLED_STATUS_ID }),
        }
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo cancelar el envío.");
      }

      setShowModal(false);
      setTarget(null);
      setSearch("");
      setAlertData({
        show: true,
        message: "¡Envío cancelado con éxito!",
        type: "success",
      });
      loadShipments();
    } catch (error) {
      console.error("Error cancelando envío:", error);
      setShowModal(false);
      setAlertData({
        show: true,
        message: error.message,
        type: "error",
      });
    } finally {
      setCancelling(false);
    }
  };

  const cancelConfirmModal = () => {
    setShowModal(false);
    setTarget(null);
  };

  if (!token) {
    return (
      <div className="text-center mt-5">
        <CustomAlert
          show={true}
          message="Debes iniciar sesión para cancelar envíos."
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
              title="CANCELAR ENVÍO"
              buttonText="Cancelar"
              buttonType="submit"
            >
              <Form.Group className="inputs-group mb-3 fw-bold">
                <Form.Label>Número de envío:</Form.Label>
                <Form.Control
                  className="custom-input"
                  type="text"
                  placeholder="Buscá por número"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  autoComplete="off"
                />
              </Form.Group>
              <p className="text-center mt-2 mb-0">
                <span
                  className="custom-link"
                  style={{ cursor: "pointer" }}
                  onClick={() => setShowTable((prev) => !prev)}
                >
                  {showTable
                    ? "Ocultar envíos cancelables"
                    : "Ver envíos cancelables"}
                </span>
              </p>
            </CustomCard>
          </Form>
        </div>

        {showTable && (
          <div className="track-table">
            <div className="back-table ocultar-scroll text-center p-3">
              <h2 className="title-card mb-3">Envíos cancelables</h2>

              {loading ? (
                <p className="titulo fw-bold">Cargando envíos...</p>
              ) : cancellable.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="table-container">
                    <thead>
                      <tr>
                        <th>N°</th>
                        {isStaff && <th>Cliente</th>}
                        <th>Estado</th>
                        <th>Destino</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cancellable.map((s) => (
                        <tr key={s.id} onClick={() => openConfirm(s)}>
                          <td>{s.id}</td>
                          {isStaff && <td>{s.clientName}</td>}
                          <td>
                            {s.shipmentStatus === "InTransit"
                              ? "En tránsito"
                              : "Pendiente"}
                          </td>
                          <td>{s.destination}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <h2 className="title-card">
                  {isStaff
                    ? "No hay envíos cancelables."
                    : "No tenés envíos pendientes para cancelar."}
                </h2>
              )}
            </div>
          </div>
        )}
      </div>

      {target && (
        <CustomModal
          show={showModal}
          onHide={cancelConfirmModal}
          onContinue={confirmCancel}
          continueText={cancelling ? "Cancelando..." : "Confirmar cancelación"}
          title="¿Confirmar la cancelación del envío?"
          body={
            <div>
              {[
                { label: "Envío N°: ", value: target.id },
                {
                  label: "Tipo de envío: ",
                  value: typeLabels[target.shipmentType] || target.shipmentType,
                },
                {
                  label: "Tamaño del paquete: ",
                  value: sizeLabels[target.packageSize] || target.packageSize,
                },
                ...(isStaff
                  ? [{ label: "Cliente: ", value: target.clientName }]
                  : []),
                { label: "Origen: ", value: target.origin },
                { label: "Destino: ", value: target.destination },
                {
                  label: "Precio: ",
                  value: `$${target.price.toLocaleString("es-AR")}`,
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

export default CancelShipment;
