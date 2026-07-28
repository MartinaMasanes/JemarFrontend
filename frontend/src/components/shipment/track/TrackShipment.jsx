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
const statusLabels = {
  Pending: "Pendiente",
  InTransit: "En tránsito",
  Delivered: "Entregado",
  Cancelled: "Cancelado",
};
// Colores de estado ya definidos en el CSS de la app.
const statusClass = { Delivered: "entregado", Cancelled: "cancelado" };

function ShippingTrack() {
  const { token, role } = useContext(AuthContext);
  const isStaff = role === "Employee" || role === "SuperAdmin";

  const [shipments, setShipments] = useState([]);
  const [search, setSearch] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    // El backend ya filtra por rol: un cliente recibe sus envíos, el personal
    // (empleado/superadmin) recibe los de todos los clientes.
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
  }, [token]);

  const openDetail = (shipment) => {
    setModalData(shipment);
    setShowModal(true);
  };

  // Buscar por número: abre el modal con el detalle del envío encontrado.
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

    const matches = shipments.filter((s) => s.id.toLowerCase().includes(q));

    if (matches.length === 0) {
      setAlertData({
        show: true,
        message: "No se encontró un envío con ese número.",
        type: "error",
      });
    } else if (matches.length === 1) {
      openDetail(matches[0]);
    } else {
      setAlertData({
        show: true,
        message:
          "Hay varios envíos que coinciden. Ingresá el número completo o usá 'Ver todos los envíos'.",
        type: "info",
      });
    }
  };

  if (!token) {
    return (
      <div className="text-center mt-5">
        <CustomAlert
          show={true}
          message="Debes iniciar sesión para consultar tus envíos."
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
              title="CONSULTAR ENVÍO"
              buttonText="Consultar"
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
                  {showTable ? "Ocultar envíos" : "Ver todos los envíos"}
                </span>
              </p>
            </CustomCard>
          </Form>
        </div>

        {showTable && (
          <div className="track-table">
            <div className="back-table ocultar-scroll text-center p-3">
              <h2 className="title-card mb-3">
                {isStaff ? "Todos los envíos" : "Mis envíos"}
              </h2>

              {loading ? (
                <p className="titulo fw-bold">Cargando envíos...</p>
              ) : shipments.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="table-container">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>N°</th>
                        <th>Cliente</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {shipments.map((s) => (
                        <tr key={s.id} onClick={() => openDetail(s)}>
                          <td>
                            {new Date(s.createdDateTime).toLocaleDateString(
                              "es-AR"
                            )}
                          </td>
                          <td>{s.id}</td>
                          <td>{s.clientName}</td>
                          <td className={statusClass[s.shipmentStatus] || ""}>
                            {statusLabels[s.shipmentStatus] || s.shipmentStatus}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <h2 className="title-card">No tenés envíos.</h2>
              )}
            </div>
          </div>
        )}
      </div>

      {modalData && (
        <CustomModal
          show={showModal}
          onHide={() => setShowModal(false)}
          title="Detalle del envío"
          body={
            <div>
              {[
                { label: "Envío N°: ", value: modalData.id },
                {
                  label: "Fecha de creación: ",
                  value: new Date(modalData.createdDateTime).toLocaleString(
                    "es-AR"
                  ),
                },
                { label: "Cliente: ", value: modalData.clientName },
                { label: "Correo: ", value: modalData.clientEmail },
                {
                  label: "Estado: ",
                  value:
                    statusLabels[modalData.shipmentStatus] ||
                    modalData.shipmentStatus,
                },
                {
                  label: "Tipo: ",
                  value:
                    typeLabels[modalData.shipmentType] || modalData.shipmentType,
                },
                {
                  label: "Tamaño: ",
                  value:
                    sizeLabels[modalData.packageSize] || modalData.packageSize,
                },
                { label: "Origen: ", value: modalData.origin },
                { label: "Destino: ", value: modalData.destination },
                { label: "Distancia: ", value: `${modalData.distanceKm} km` },
                {
                  label: "Precio: ",
                  value: `$${modalData.price.toLocaleString("es-AR")}`,
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

export default ShippingTrack;
