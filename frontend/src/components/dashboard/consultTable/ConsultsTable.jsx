import { useState, useEffect } from "react";
import { Container, Form, Button } from "react-bootstrap";
import CustomAlert from "../../alert/CustomAlert";
import CustomModal from "../../modal/CustomModal";
import { apiFetch } from "../../../api/httpClient";

const statusLabels = {
  New: "Nueva",
  InProgress: "En progreso",
  Answered: "Respondida",
  Closed: "Cerrada",
};
const statusClass = { Answered: "entregado", Closed: "cancelado" };

const ConsultsTable = () => {
  const [consults, setConsults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [closing, setClosing] = useState(false);

  const fetchConsults = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAlertData({
        show: true,
        message: "Debes iniciar sesión para ver las consultas.",
        type: "error",
      });
      return [];
    }

    try {
      setLoading(true);
      const response = await apiFetch("/api/inquiry");
      const data = await response.json();

      if (!response.ok) {
        setAlertData({
          show: true,
          message: data.error || "Error al obtener las consultas.",
          type: "error",
        });
        return [];
      }

      const list = Array.isArray(data) ? data : [];
      setConsults(list);
      return list;
    } catch (error) {
      console.error("Error:", error);
      setAlertData({
        show: true,
        message: "Error al consultar las consultas.",
        type: "error",
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsults();
  }, []);

  const filteredConsults = consults.filter((c) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.id.toLowerCase().includes(q) ||
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q);
    const matchesStatus = !statusFilter || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const openDetail = (consult) => {
    setModalData(consult);
    setShowModal(true);
    setReplyText("");
    setReplyError(false);
  };

  const closeDetail = () => {
    setShowModal(false);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      setReplyError(true);
      return;
    }

    try {
      setSendingReply(true);
      const response = await apiFetch(`/api/inquiry/${modalData.id}/respond`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response: replyText.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo enviar la respuesta.");
      }

      const updated = await fetchConsults();
      const fresh = updated.find((c) => c.id === modalData.id);
      if (fresh) setModalData(fresh);
      setReplyText("");
      setAlertData({
        show: true,
        message: "Respuesta enviada.",
        type: "success",
      });
    } catch (error) {
      console.error("Error enviando respuesta:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setSendingReply(false);
    }
  };

  const handleClose = async () => {
    try {
      setClosing(true);
      const response = await apiFetch(`/api/inquiry/${modalData.id}/close`, {
        method: "PUT",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo cerrar la consulta.");
      }

      closeDetail();
      await fetchConsults();
      setAlertData({
        show: true,
        message: "Consulta cerrada.",
        type: "success",
      });
    } catch (error) {
      console.error("Error cerrando consulta:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setClosing(false);
    }
  };

  return (
    <>
      <CustomAlert
        show={alertData.show}
        message={alertData.message}
        type={alertData.type}
        onClose={() => setAlertData({ ...alertData, show: false })}
      />

      <h1 className="title-card text-center">Lista de Consultas</h1>

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

          {filteredConsults.length > 0 ? (
            <table className="table-container">
              <thead>
                <tr>
                  <th style={{ width: "10%" }}>Fecha</th>
                  <th style={{ width: "14%" }}>N°</th>
                  <th style={{ width: "11%" }}>Nombre</th>
                  <th style={{ width: "11%" }}>Apellido</th>
                  <th style={{ width: "19%" }}>Correo Electrónico</th>
                  <th style={{ width: "23%" }}>Consulta</th>
                  <th style={{ width: "12%" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsults.map((consult) => (
                  <tr key={consult.id} onClick={() => openDetail(consult)}>
                    <td>
                      {new Date(consult.createdAt).toLocaleDateString(
                        "es-AR"
                      )}
                    </td>
                    <td style={{ wordBreak: "break-all" }}>{consult.id}</td>
                    <td>{consult.firstName}</td>
                    <td>{consult.lastName}</td>
                    <td style={{ wordBreak: "break-word" }}>
                      {consult.email}
                    </td>
                    <td>{consult.message}</td>
                    <td className={statusClass[consult.status] || ""}>
                      {statusLabels[consult.status] || consult.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <h2 className="table-container text-center">
              No hay consultas disponibles.
            </h2>
          )}
        </Container>
      )}

      {modalData && (
        <CustomModal
          show={showModal}
          onHide={closeDetail}
          title="Detalle de la consulta"
          body={
            <div>
              {[
                { label: "Consulta N°: ", value: modalData.id },
                {
                  label: "Fecha de creación: ",
                  value: new Date(modalData.createdAt).toLocaleString(
                    "es-AR"
                  ),
                },
                {
                  label: "Cliente: ",
                  value: `${modalData.firstName} ${modalData.lastName}`,
                },
                { label: "Correo: ", value: modalData.email },
                {
                  label: "Estado: ",
                  value: statusLabels[modalData.status] || modalData.status,
                },
                { label: "Mensaje: ", value: modalData.message },
                {
                  label: "Respuesta: ",
                  value: modalData.response || "Todavía no fue respondida.",
                },
                ...(modalData.clientReply
                  ? [
                      {
                        label: "Respuesta del cliente: ",
                        value: modalData.clientReply,
                      },
                    ]
                  : []),
              ].map((item, i) => (
                <div key={i}>
                  <strong>{item.label}</strong>
                  {item.value}
                </div>
              ))}

              {modalData.status !== "Closed" && (
                <Form.Group className="inputs-group mt-3 fw-bold">
                  <Form.Label>Responder:</Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      replyError ? "is-invalid" : ""
                    }`}
                    as="textarea"
                    rows={2}
                    placeholder="Escribí una respuesta..."
                    value={replyText}
                    onChange={(e) => {
                      setReplyText(e.target.value);
                      setReplyError(false);
                    }}
                  />
                  {replyError && (
                    <p className="text-danger mt-1">
                      Escribí una respuesta antes de enviar.
                    </p>
                  )}
                  <div className="text-center mt-2">
                    <Button
                      className="custom-button w-50"
                      onClick={handleSendReply}
                      disabled={sendingReply}
                    >
                      {sendingReply ? "Enviando..." : "Enviar respuesta"}
                    </Button>
                  </div>
                </Form.Group>
              )}

              {(modalData.status === "Answered" ||
                modalData.status === "InProgress") && (
                <div className="text-center mt-3">
                  <span
                    className="custom-link"
                    style={{ cursor: "pointer" }}
                    onClick={handleClose}
                  >
                    {closing ? "Cerrando..." : "Cerrar consulta"}
                  </span>
                </div>
              )}
            </div>
          }
        />
      )}
    </>
  );
};

export default ConsultsTable;
