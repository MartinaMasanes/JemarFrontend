import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import CustomCard from "../card/CustomCard";
import { apiFetch } from "../../api/httpClient";

const variantTitles = {
  success: "Procesando pago",
  pending: "Pago pendiente",
  failure: "Pago rechazado",
};

const statusMessages = {
  Approved: "¡Tu pago fue aprobado! Ya podés ver el envío como pagado.",
  Pending: "Tu pago está en proceso. Te avisaremos cuando se confirme.",
  Rejected: "El pago fue rechazado. Podés intentarlo nuevamente desde el envío.",
  Cancelled: "El pago fue cancelado.",
};

const PaymentResult = ({ variant }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const paymentId = searchParams.get("payment_id");

    if (!paymentId) {
      setMessage(
        "No encontramos información de este pago. Si ya pagaste, revisá el estado desde el detalle del envío."
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
          (data && statusMessages[data.status]) ||
            "No pudimos confirmar el estado del pago. Revisalo desde el detalle del envío."
        );
      })
      .catch(() => {
        setMessage(
          "No pudimos confirmar el estado del pago. Revisalo desde el detalle del envío."
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
