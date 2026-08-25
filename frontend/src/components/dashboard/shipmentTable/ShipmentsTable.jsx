import { useState, useEffect } from "react";
import { Container, Form } from "react-bootstrap";
import CustomModal from "../../modal/CustomModal";
import CustomAlert from "../../alert/CustomAlert";
import { apiFetch } from "../../../api/httpClient";
import ShipmentHistory from "../../shipment/ShipmentHistory";

const typeLabels = { Express: "Expreso", Standard: "Estándar" };
const sizeLabels = { Small: "Pequeño", Medium: "Mediano", Large: "Grande" };
const statusLabels = {
  Pending: "Pendiente",
  InTransit: "En tránsito",
  Delivered: "Entregado",
  Cancelled: "Cancelado",
};
const statusClass = { Delivered: "entregado", Cancelled: "cancelado" };

const ShipmentsTable = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const openDetail = (shipment) => {
    setModalData(shipment);
    setShowModal(true);
  };

  const fetchShipments = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAlertData({
        show: true,
        message: "Debes iniciar sesión para ver los envíos.",
        type: "error",
      });
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/api/shipment");

      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error || "Error al obtener los envíos.",
          type: "error",
        });
        return;
      }

      setShipments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error:", error);
      setAlertData({
        show: true,
        message: "Error al consultar los envíos.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = shipments.filter((s) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.id.toLowerCase().includes(q) ||
      (s.clientName || "").toLowerCase().includes(q);
    const matchesStatus = !statusFilter || s.shipmentStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <CustomAlert
        show={alertData.show}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, show: false })}
      />

      <h1 className="title-card text-center">Lista de Envíos</h1>

      {!loading && (
        <Container
          className="back-table ocultar-scroll text-center p-3"
          style={{ minHeight: "62vh", width: "min(1050px, 92vw)" }}
        >
          <Form
            className="d-flex justify-content-end align-items-center gap-3 mb-3 flex-wrap"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="d-flex align-items-center">
              <i className="bi bi-search me-2"></i>
              <Form.Control
                type="text"
                className="custom-input"
                placeholder="Buscar por N° o cliente"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="filter-select"
              style={{
                width: "auto",
                height: "38px",
                borderRadius: "0.375rem",
                padding: "0.375rem 2rem 0.375rem 0.75rem",
              }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">Todos los estados</option>
              {Object.entries(statusLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Form>

          {filteredShipments.length > 0 ? (
            <table className="table-container">
              <thead>
                <tr>
                  <th style={{ width: "9%" }}>Fecha</th>
                  <th style={{ width: "13%" }}>N°</th>
                  <th style={{ width: "12%" }}>Cliente</th>
                  <th style={{ width: "18%" }}>Correo Electrónico</th>
                  <th style={{ width: "12%" }}>Origen</th>
                  <th style={{ width: "12%" }}>Destino</th>
                  <th style={{ width: "10%" }}>Precio</th>
                  <th style={{ width: "14%" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => (
                  <tr key={s.id} onClick={() => openDetail(s)}>
                    <td>
                      {new Date(s.createdDateTime).toLocaleDateString(
                        "es-AR"
                      )}
                    </td>
                    <td style={{ wordBreak: "break-all" }}>{s.id}</td>
                    <td>{s.clientName}</td>
                    <td style={{ wordBreak: "break-word" }}>
                      {s.clientEmail}
                    </td>
                    <td>{s.origin}</td>
                    <td>{s.destination}</td>
                    <td>${s.price?.toLocaleString("es-AR")}</td>
                    <td className={statusClass[s.shipmentStatus] || ""}>
                      {statusLabels[s.shipmentStatus] || s.shipmentStatus}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <h2 className="table-container text-center">
              No hay envíos disponibles.
            </h2>
          )}
        </Container>
      )}

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
              <ShipmentHistory shipmentId={modalData.id} />
            </div>
          }
        />
      )}
    </>
  );
};

export default ShipmentsTable;
