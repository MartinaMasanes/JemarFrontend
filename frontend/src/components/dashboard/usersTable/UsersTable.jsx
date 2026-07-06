import { useState, useEffect } from "react";
import { Container } from "react-bootstrap";

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({ show: false, message: "", type: "" });
  const [filterStatus, setFilterStatus] = useState(""); // <-- estado del filtro

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAlertData({ show: true, message: "Debes iniciar sesión para ver los usuarios.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:3000/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al obtener usuarios.");

      setUsers(data);
      setAlertData({ show: false, message: "", type: "" });
    } catch (error) {
      console.error("Error:", error);
      setAlertData({ show: true, message: error.message || "Error al consultar los usuarios.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filtrar usuarios según el estado
  const filteredUsers = filterStatus
    ? users.filter(user => (filterStatus === "habilitado" ? user.isActive : !user.isActive))
    : users;

  return (
    <>
      <h1 className="title-card text-center">Lista de Usuarios</h1>

      {alertData.show && (
        <div className={`alert alert-${alertData.type}`} role="alert">
          {alertData.message}
        </div>
      )}

      {!loading && filteredUsers.length > 0 && (
        <Container className="back-table ocultar-scroll text-center p-3">
          
          <div className="text-end">
        <label htmlFor="statusFilter" className="inputs-group me-3 fw-bold">Filtrar Usuarios por estado:</label>
        <select
        className="filter-select"
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos</option>
          <option value="habilitado">Habilitado</option>
          <option value="deshabilitado">Deshabilitado</option>
        </select>
      </div>
          
          <table className="table-container">
            <thead>
              <tr>
                <th style={{ width: "8%" }}>ID Usuario</th>
                <th style={{ width: "15%" }}>Nombre</th>
                <th style={{ width: "15%" }}>Apellido</th>
                <th style={{ width: "25%" }}>Correo Electrónico</th>
                <th style={{ width: "10%" }}>Rol</th>
                <th style={{ width: "10%" }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td className={user.isActive ? "habilitado" : "deshabilitado"}>
                    {user.isActive ? "Habilitado" : "Deshabilitado"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Container>
      )}

      {!loading && filteredUsers.length === 0 && (
        <h2 className="text-center">No hay usuarios disponibles.</h2>
      )}
    </>
  );
};

export default UsersTable;
