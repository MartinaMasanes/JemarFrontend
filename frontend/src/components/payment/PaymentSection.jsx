import { useState, useEffect } from "react";
import { apiFetch } from "../../api/httpClient";

const PaymentSection = ({ shipment }) => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!shipment?.id) return;
    setLoading(true);
    apiFetch(`/api/payment/shipment/${shipment.id}/status`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setStatus(data))
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [shipment?.id]);

  const handlePay = async () => {
    setError("");
    setPaying(true);
    try {
      const response = await apiFetch(
        `/api/payment/shipment/${shipment.id}/preference`,
        { method: "POST" }
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "No se pudo iniciar el pago.");
        return;
      }

      window.location.href = data.initPoint;
    } catch {
      setError("No se pudo iniciar el pago.");
    } finally {
      setPaying(false);
    }
  };

  if (shipment?.shipmentStatus === "Cancelled") return null;
  if (loading) return null;

  return (
    <div className="mt-3">
      <strong>Pago:</strong>{" "}
      {status?.status === "Approved" ? (
        <span>Pagado ✓</span>
      ) : status?.status === "Pending" ? (
        <span>Pago en proceso...</span>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-sm custom-button"
            onClick={handlePay}
            disabled={paying}
          >
            {paying
              ? "Redirigiendo..."
              : `Pagar $${shipment.price?.toLocaleString("es-AR")}`}
          </button>
          {error && <p className="text-danger mt-1 mb-0">{error}</p>}
        </>
      )}
    </div>
  );
};

export default PaymentSection;
