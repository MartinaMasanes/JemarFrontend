import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";
import { apiFetch } from "../../../api/httpClient";

const ConsultsTable = () => {
  const [consults, setConsults] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchConsults = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Debes iniciar sesión para ver las consultas.");
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/api/inquiry");

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al obtener las consultas.");
        return;
      }

      setConsults(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Error al consultar las consultas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConsults();
  }, []);

  return (
    <>
      <h1 className="title-card text-center">Lista de Consultas</h1>

      {!loading && (
        <Container className="back-table ocultar-scroll text-center p-3">
          {consults.length > 0 ? (
            <table className="table-container">
              <thead>
                <tr>
                  <th style={{ width: "15%" }}>Fecha</th>
                  <th style={{ width: "15%" }}>Número de consulta</th>
                  <th style={{ width: "15%" }}>Nombre</th>
                  <th style={{ width: "15%" }}>Apellido</th>
                  <th style={{ width: "25%" }}>Correo Electrónico</th>
                  <th style={{ width: "30%" }}>Consulta</th>
                </tr>
              </thead>
              <tbody>
                {consults.map((consult) => (
                  <tr key={consult.id}>
                    <td>
                      {new Date(consult.createdAt).toLocaleString("es-AR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </td>

                    <td>{consult.id}</td>
                    <td>{consult.firstName}</td>
                    <td>{consult.lastName}</td>
                    <td>{consult.email}</td>
                    <td>{consult.message}</td>
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
    </>
  );
};

export default ConsultsTable;