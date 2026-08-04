import { useState, useEffect, useContext } from "react";
import { Form, Button } from "react-bootstrap";
import CustomAlert from "../../alert/CustomAlert";
import CustomCard from "../../card/CustomCard";
import CustomModal from "../../modal/CustomModal";
import { AuthContext } from "../../authContext/AuthContext";
import { apiFetch } from "../../../api/httpClient";

const statusLabels = {
  New: "Nueva",
  InProgress: "En progreso",
  Answered: "Respondida",
  Closed: "Cerrada",
};
const statusClass = { Answered: "entregado", Closed: "cancelado" };

function TrackConsult() {
  const { token } = useContext(AuthContext);

  const [consults, setConsults] = useState([]);
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

  const [replyText, setReplyText] = useState("");
  const [replyError, setReplyError] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);

  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadConsults = () => {
    if (!token) return;
    setLoading(true);
    return apiFetch("/api/inquiry")
      .then((res) => res.json())
      .then((data) => {
        setConsults(Array.isArray(data) ? data : []);
        return Array.isArray(data) ? data : [];
      })
      .catch((err) => {
        console.error("Error cargando consultas:", err);
        setAlertData({
          show: true,
          message: "No se pudieron cargar tus consultas.",
          type: "error",
        });
        return [];
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConsults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const openDetail = (consult) => {
    setModalData(consult);
    setShowModal(true);
    setReplyText("");
    setReplyError(false);
    setConfirmingDelete(false);
  };

  const closeDetail = () => {
    setShowModal(false);
    setConfirmingDelete(false);
  };

  const handleSearch = (event) => {
    event.preventDefault();
    const q = search.trim().toLowerCase();

    if (!q) {
      setAlertData({
        show: true,
        message: "Ingresá un número de consulta.",
        type: "error",
      });
      return;
    }

    const matches = consults.filter((c) => c.id.toLowerCase().includes(q));

    if (matches.length === 0) {
      setAlertData({
        show: true,
        message: "No se encontró una consulta con ese número.",
        type: "error",
      });
    } else if (matches.length === 1) {
      openDetail(matches[0]);
    } else {
      setAlertData({
        show: true,
        message:
          "Hay varias consultas que coinciden. Ingresá el número completo o usá 'Ver todas mis consultas'.",
        type: "info",
      });
    }
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
        throw new Error(data.error || "No se pudo enviar tu respuesta.");
      }

      const updated = await loadConsults();
      const fresh = updated.find((c) => c.id === modalData.id);
      if (fresh) setModalData(fresh);
      setReplyText("");
      setAlertData({
        show: true,
        message: "Tu respuesta fue enviada.",
        type: "success",
      });
    } catch (error) {
      console.error("Error enviando respuesta:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setSendingReply(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      const response = await apiFetch(`/api/inquiry/${modalData.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo eliminar la consulta.");
      }

      closeDetail();
      await loadConsults();
      setAlertData({
        show: true,
        message: "Consulta eliminada con éxito.",
        type: "success",
      });
    } catch (error) {
      console.error("Error eliminando consulta:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setDeleting(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center mt-5">
        <CustomAlert
          show={true}
          message="Debes iniciar sesión para consultar tus consultas."
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
              title="CONSULTAR ESTADO"
              buttonText="Consultar"
              buttonType="submit"
            >
              <Form.Group className="inputs-group mb-3 fw-bold">
                <Form.Label>Número de consulta:</Form.Label>
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
                  {showTable ? "Ocultar consultas" : "Ver todas mis consultas"}
                </span>
              </p>
            </CustomCard>
          </Form>
        </div>

        {showTable && (
          <div className="track-table">
            <div className="back-table ocultar-scroll text-center p-3">
              <h2 className="title-card mb-3">Mis consultas</h2>

              {loading ? (
                <p className="titulo fw-bold">Cargando consultas...</p>
              ) : consults.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table className="table-container">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th>N°</th>
                        <th>Estado</th>
                        <th>Consulta</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consults.map((c) => (
                        <tr key={c.id} onClick={() => openDetail(c)}>
                          <td>
                            {new Date(c.createdAt).toLocaleDateString(
                              "es-AR"
                            )}
                          </td>
                          <td>{c.id}</td>
                          <td className={statusClass[c.status] || ""}>
                            {statusLabels[c.status] || c.status}
                          </td>
                          <td>{c.message}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <h2 className="title-card">No tenés consultas.</h2>
              )}
            </div>
          </div>
        )}
      </div>

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
                  label: "Estado: ",
                  value: statusLabels[modalData.status] || modalData.status,
                },
                { label: "Mensaje: ", value: modalData.message },
                {
                  label: "Respuesta: ",
                  value: modalData.response || "Todavía no fue respondida.",
                },
                ...(modalData.clientReply
                  ? [{ label: "Tu respuesta: ", value: modalData.clientReply }]
                  : []),
              ].map((item, i) => (
                <div key={i}>
                  <strong>{item.label}</strong>
                  {item.value}
                </div>
              ))}

              {modalData.status === "Answered" && (
                <Form.Group className="inputs-group mt-3 fw-bold">
                  <Form.Label>Responder:</Form.Label>
                  <Form.Control
                    className={`custom-input ${
                      replyError ? "is-invalid" : ""
                    }`}
                    as="textarea"
                    rows={2}
                    placeholder="Escribí tu respuesta..."
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

              {modalData.status === "New" && (
                <div className="text-center mt-3">
                  {confirmingDelete ? (
                    <>
                      <p className="fw-bold mb-2">
                        ¿Eliminar esta consulta?
                      </p>
                      <Button
                        className="custom-button w-50 mb-2"
                        onClick={handleDelete}
                        disabled={deleting}
                      >
                        {deleting ? "Eliminando..." : "Confirmar eliminación"}
                      </Button>
                      <br />
                      <span
                        className="custom-link"
                        style={{ cursor: "pointer" }}
                        onClick={() => setConfirmingDelete(false)}
                      >
                        Cancelar
                      </span>
                    </>
                  ) : (
                    <span
                      className="custom-link"
                      style={{ cursor: "pointer" }}
                      onClick={() => setConfirmingDelete(true)}
                    >
                      Eliminar consulta
                    </span>
                  )}
                </div>
              )}
            </div>
          }
        />
      )}
    </>
  );
}

export default TrackConsult;
