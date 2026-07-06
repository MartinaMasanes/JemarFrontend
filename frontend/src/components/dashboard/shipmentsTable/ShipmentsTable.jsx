import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";

const ShipmentsTable = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState("");

  const fetchShipments = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para ver los envíos.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/shipment", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al obtener los envíos.");
        return;
      }

      setShipments(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al consultar los envíos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShipments();
  }, []);

  const filteredShipments = filterStatus
    ? shipments.filter((envio) => envio.status === filterStatus)
    : shipments;

  return (
    <>
      <h1 className="title-card text-center">Lista de Envíos</h1>

      <Container className="back-table ocultar-scroll text-center p-3">
        <div className="text-end">
          <label className="inputs-group me-3 fw-bold">
            Filtrar envíos por Estado:{" "}
          </label>
          <select
            className="filter-select"
            id="statusFilter"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Pendiente">Pendiente</option>
            <option value="En camino">En caminoo</option>
            <option value="Entregado">Entregado</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>

        {filteredShipments.length > 0 ? (
          <table className="table-container">
            <thead>
              <tr>
                <th style={{ width: "25%" }}>Usuario</th>
                <th style={{ width: "15%" }}>Número de envío</th>
                <th style={{ width: "10%" }}>Estado</th>
                <th style={{ width: "8%" }}>Tipo</th>
                <th style={{ width: "30%" }}>Origen</th>
                <th style={{ width: "30%" }}>Destino</th>
                <th style={{ width: "8%" }}>Precio</th>
              </tr>
            </thead>
            <tbody>
              {filteredShipments.map((envio) => (
                <tr key={envio.id}>
                  <td>{envio.User?.email}</td>
                  <td>{envio.id}</td>
                  <td
                    className={
                      envio.status === "Cancelado"
                        ? "cancelado"
                        : envio.status === "Entregado"
                        ? "entregado"
                        : ""
                    }
                  >
                    {envio.status}
                  </td>
                  <td>{envio.ShipmentType?.name}</td>
                  <td>{envio.origin}</td>
                  <td>{envio.destination}</td>
                  <td>${envio.price.toLocaleString("es-AR")}</td>
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
    </>
  );
};

export default ShipmentsTable;
