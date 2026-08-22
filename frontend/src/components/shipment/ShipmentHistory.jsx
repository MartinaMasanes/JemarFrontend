import { useState, useEffect } from "react";
import { apiFetch } from "../../api/httpClient";

const statusLabels = {
  Pending: "Pendiente",
  InTransit: "En tránsito",
  Delivered: "Entregado",
  Cancelled: "Cancelado",
};

const ShipmentHistory = ({ shipmentId }) => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!shipmentId) return;
    setLoading(true);
    apiFetch(`/api/shipment/${shipmentId}/history`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, [shipmentId]);

  if (loading) return <p className="mt-3 mb-0">Cargando historial...</p>;
  if (history.length === 0) return null;

  return (
    <div className="mt-3">
      <strong>Historial de estados:</strong>
      <ul className="mb-0 ps-3">
        {history.map((h, i) => (
          <li key={i}>
            {statusLabels[h.status] || h.status} — {h.changedByName} (
            {new Date(h.changedAt).toLocaleString("es-AR")})
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ShipmentHistory;
