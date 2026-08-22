import { useState, useEffect, useRef } from "react";
import { Container, Form } from "react-bootstrap";
import { apiFetch } from "../../../api/httpClient";
import CustomModal from "../../modal/CustomModal";
import { translateRole, roleLabels, roleMap } from "../../../utils/roleLabels";
import { validateEmail, validateName, validatePassword } from "../../../utils/validators";

const shipmentCountLabel = (role) =>
  role === "Client" ? "Envíos realizados" : "Envíos gestionados a nombre de clientes";

const initialNewUser = { firstName: "", lastName: "", email: "", password: "", role: "" };
const initialNewUserErrors = { firstName: false, lastName: false, email: false, password: false, role: false };

const UsersTable = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertData, setAlertData] = useState({ show: false, message: "", type: "" });
  const [filterStatus, setFilterStatus] = useState("");
  const [search, setSearch] = useState("");
  const [updatingEmail, setUpdatingEmail] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState(initialNewUser);
  const [newUserErrors, setNewUserErrors] = useState(initialNewUserErrors);
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const firstNameRef = useRef(null);
  const lastNameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setAlertData({ show: true, message: "Debes iniciar sesión para ver los usuarios.", type: "error" });
      return;
    }

    try {
      setLoading(true);
      const response = await apiFetch("/api/user");

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

  const toggleStatus = async (user) => {
    try {
      setUpdatingEmail(user.email);
      const response = await apiFetch("/api/user/status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, isActive: !user.isActive }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo actualizar el estado.");
      }

      setUsers((prev) =>
        prev.map((u) =>
          u.email === user.email ? { ...u, isActive: !u.isActive } : u
        )
      );
    } catch (error) {
      console.error("Error:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setUpdatingEmail(null);
    }
  };

  const openDetail = async (user) => {
    setShowModal(true);
    setModalLoading(true);
    setModalData(null);

    try {
      const response = await apiFetch(`/api/user/${encodeURIComponent(user.email)}`);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Error al obtener el usuario.");

      setModalData(data);
    } catch (error) {
      console.error("Error:", error);
      setShowModal(false);
      setAlertData({ show: true, message: error.message || "No se pudo cargar el usuario.", type: "error" });
    } finally {
      setModalLoading(false);
    }
  };

  const openCreateModal = () => {
    setNewUser(initialNewUser);
    setNewUserErrors(initialNewUserErrors);
    setShowPassword(false);
    setShowCreateModal(true);
  };

  const handleCreateUser = async () => {
    if (!newUser.firstName.trim()) {
      setNewUserErrors((prev) => ({ ...prev, firstName: "empty" }));
      firstNameRef.current?.focus();
      return;
    }

    if (!validateName(newUser.firstName)) {
      setNewUserErrors((prev) => ({ ...prev, firstName: "invalid" }));
      firstNameRef.current?.focus();
      return;
    }

    if (!newUser.lastName.trim()) {
      setNewUserErrors((prev) => ({ ...prev, lastName: "empty" }));
      lastNameRef.current?.focus();
      return;
    }

    if (!validateName(newUser.lastName)) {
      setNewUserErrors((prev) => ({ ...prev, lastName: "invalid" }));
      lastNameRef.current?.focus();
      return;
    }

    if (!newUser.email.trim()) {
      setNewUserErrors((prev) => ({ ...prev, email: "empty" }));
      emailRef.current?.focus();
      return;
    }

    if (!validateEmail(newUser.email)) {
      setNewUserErrors((prev) => ({ ...prev, email: "invalid" }));
      emailRef.current?.focus();
      return;
    }

    if (!newUser.password.trim()) {
      setNewUserErrors((prev) => ({ ...prev, password: "empty" }));
      passwordRef.current?.focus();
      return;
    }

    if (!validatePassword(newUser.password)) {
      setNewUserErrors((prev) => ({ ...prev, password: "invalid" }));
      passwordRef.current?.focus();
      return;
    }

    if (!newUser.role) {
      setNewUserErrors((prev) => ({ ...prev, role: "empty" }));
      return;
    }

    try {
      setCreating(true);
      const response = await apiFetch("/api/user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newUser.firstName.trim(),
          lastName: newUser.lastName.trim(),
          email: newUser.email.trim(),
          password: newUser.password,
          role: roleMap[newUser.role],
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || "No se pudo crear el usuario.");

      setShowCreateModal(false);
      setAlertData({ show: true, message: "¡Usuario creado con éxito!", type: "success" });
      fetchUsers();
    } catch (error) {
      console.error("Error:", error);
      setAlertData({ show: true, message: error.message, type: "error" });
    } finally {
      setCreating(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(q) ||
      user.email.toLowerCase().includes(q);
    const matchesStatus =
      !filterStatus || (filterStatus === "habilitado" ? user.isActive : !user.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <h1 className="title-card text-center">Lista de Usuarios</h1>

      {alertData.show && (
        <div className={`alert alert-${alertData.type}`} role="alert">
          {alertData.message}
        </div>
      )}

      {!loading && (
        <Container className="back-table ocultar-scroll text-center p-3">

          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
        <button type="button" className="custom-link fw-bold border-0 bg-transparent" onClick={openCreateModal}>
          + Crear Usuario
        </button>
        <Form
          className="d-flex align-items-center flex-wrap gap-3"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="d-flex align-items-center">
            <i className="bi bi-search me-2"></i>
            <Form.Control
              type="text"
              className="custom-input"
              placeholder="Buscar por nombre o correo"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        <div>
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
        </Form>
      </div>

          {filteredUsers.length === 0 ? (
            <h2 className="text-center mt-3">No hay usuarios disponibles.</h2>
          ) : (
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
                <tr key={user.id} onClick={() => openDetail(user)}>
                  <td>{user.id}</td>
                  <td>{user.firstName}</td>
                  <td>{user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{translateRole(user.role)}</td>
                  <td>
                    <button
                      type="button"
                      className={`status-toggle ${user.isActive ? "habilitado" : "deshabilitado"}`}
                      disabled={updatingEmail === user.email || user.role === "SuperAdmin"}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStatus(user);
                      }}
                    >
                      {user.isActive ? "Habilitado" : "Deshabilitado"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          )}
        </Container>
      )}

      <CustomModal
        show={showModal}
        onHide={() => setShowModal(false)}
        title="Detalle del usuario"
        continueText="Cerrar"
        body={
          modalLoading || !modalData ? (
            "Cargando..."
          ) : (
            <>
              <p><strong>Nombre:</strong> {modalData.firstName} {modalData.lastName}</p>
              <p><strong>Correo:</strong> {modalData.email}</p>
              <p><strong>Rol:</strong> {translateRole(modalData.role)}</p>
              <p><strong>Estado:</strong> {modalData.isActive ? "Habilitado" : "Deshabilitado"}</p>
              <p><strong>{shipmentCountLabel(modalData.role)}:</strong> {modalData.shipmentCount}</p>
            </>
          )
        }
      />

      <CustomModal
        show={showCreateModal}
        onHide={() => setShowCreateModal(false)}
        onContinue={handleCreateUser}
        continueText={creating ? "Creando..." : "Crear"}
        continueDisabled={creating}
        title="Crear Usuario"
        body={
          <Form noValidate onSubmit={(e) => { e.preventDefault(); handleCreateUser(); }}>
            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>Nombre: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                ref={firstNameRef}
                className={`custom-input ${newUserErrors.firstName ? "is-invalid" : ""}`}
                type="text"
                value={newUser.firstName}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, firstName: e.target.value }));
                  setNewUserErrors((prev) => ({ ...prev, firstName: false }));
                }}
              />
              {newUserErrors.firstName === "empty" && (
                <p className="text-danger mt-1">Debe ingresar un nombre</p>
              )}
              {newUserErrors.firstName === "invalid" && (
                <p className="text-danger mt-1">Debe ingresar un nombre válido (Solo letras, al menos 3)</p>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>Apellido: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                ref={lastNameRef}
                className={`custom-input ${newUserErrors.lastName ? "is-invalid" : ""}`}
                type="text"
                value={newUser.lastName}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, lastName: e.target.value }));
                  setNewUserErrors((prev) => ({ ...prev, lastName: false }));
                }}
              />
              {newUserErrors.lastName === "empty" && (
                <p className="text-danger mt-1">Debe ingresar un apellido</p>
              )}
              {newUserErrors.lastName === "invalid" && (
                <p className="text-danger mt-1">Debe ingresar un apellido válido (Solo letras, al menos 3)</p>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>Correo Electrónico: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                ref={emailRef}
                className={`custom-input ${newUserErrors.email ? "is-invalid" : ""}`}
                type="email"
                placeholder="usuario@ejemplo.com"
                value={newUser.email}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, email: e.target.value }));
                  setNewUserErrors((prev) => ({ ...prev, email: false }));
                }}
              />
              {newUserErrors.email === "empty" && (
                <p className="text-danger mt-1">Debe ingresar un correo electrónico</p>
              )}
              {newUserErrors.email === "invalid" && (
                <p className="text-danger mt-1">Debe ingresar un email válido, ejemplo: juan@jemar.com</p>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold position-relative">
              <Form.Label>Contraseña: <span className="text-danger">*</span></Form.Label>
              <Form.Control
                ref={passwordRef}
                className={`custom-input ${newUserErrors.password ? "is-invalid" : ""}`}
                type={showPassword ? "text" : "password"}
                value={newUser.password}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, password: e.target.value }));
                  setNewUserErrors((prev) => ({ ...prev, password: false }));
                }}
              />
              <span
                className="password-toggle-icon"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <i className="bi bi-eye-slash-fill" />
                ) : (
                  <i className="bi bi-eye-fill" />
                )}
              </span>
              {newUserErrors.password === "empty" && (
                <p className="text-danger mt-1">Debe ingresar una contraseña</p>
              )}
              {newUserErrors.password === "invalid" && (
                <p className="text-danger mt-1">Debe ingresar al menos 8 caracteres, 1 número y 1 letra</p>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>Rol: <span className="text-danger">*</span></Form.Label>
              <Form.Select
                className={`custom-input ${newUserErrors.role ? "is-invalid" : ""}`}
                value={newUser.role}
                onChange={(e) => {
                  setNewUser((prev) => ({ ...prev, role: e.target.value }));
                  setNewUserErrors((prev) => ({ ...prev, role: false }));
                }}
              >
                <option value="" disabled hidden>Seleccione un Rol</option>
                {Object.entries(roleLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Form.Select>
              {newUserErrors.role === "empty" && (
                <p className="text-danger mt-1">Debe seleccionar un rol</p>
              )}
            </Form.Group>
          </Form>
        }
      />
    </>
  );
};

export default UsersTable;
