import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CustomCard from "../card/CustomCard";
import { apiFetch } from "../../api/httpClient";

const variantTitles = {
  success: "Procesando pago",
  pending: "Pago pendiente",
  failure: "Pago rechazado",
};

const statusMessages = (data) => ({
  Approved: `¡Tu pago fue aprobado y tu envío fue creado! N° ${data?.shipmentId ?? ""}`,
  Pending:
    "Tu pago está en proceso. En cuanto se confirme, tu envío se va a crear automáticamente.",
  Rejected:
    "El pago fue rechazado, así que el envío no se creó. Podés intentarlo de nuevo desde 'Crear envío'.",
  Cancelled: "El pago fue cancelado. El envío no se creó.",
});

const PaymentResult = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      setMessage(
        "No encontramos información de este pago. Si ya pagaste y no ves tu envío, escribinos por consultas."
      );
      setLoading(false);
      return;
    }

    apiFetch(`/api/payment/sync?mercadoPagoPaymentId=${paymentId}`, {
      method: "POST",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setMessage(
          (data && statusMessages(data)[data.status]) ||
            "No pudimos confirmar el estado del pago. Si ya pagaste y no ves tu envío, escribinos por consultas."
        );
      })
      .catch(() => {
        setMessage(
          "No pudimos confirmar el estado del pago. Si ya pagaste y no ves tu envío, escribinos por consultas."
        );
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <CustomCard
      title={variantTitles[variant] || "Resultado del pago"}
      buttonText={loading ? undefined : "Volver a mis envíos"}
      buttonAction={() => navigate("/shipment")}
    >
      {loading ? <p className="mb-0">Confirmando el pago...</p> : <p className="mb-0">{message}</p>}
    </CustomCard>
  );
};

export default PaymentResult;
