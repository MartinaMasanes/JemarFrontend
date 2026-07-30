import { useEffect, useState, useRef, useContext } from "react";
import { Form } from "react-bootstrap";

import { initialErrors } from "./CreateShipment.data";
import { AuthContext } from "../../authContext/AuthContext";
import { apiFetch } from "../../../api/httpClient";

import CustomModal from "../../modal/CustomModal";
import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";

const shipmentTypeLabels = {
  Express: "Expreso",
  Standard: "Estándar",
};

const packageSizeLabels = {
  Small: "Pequeño",
  Medium: "Mediano",
  Large: "Grande",
};

const roleLabels = {
  Employee: "un empleado",
  SuperAdmin: "un superadministrador",
  Client: "un cliente",
};

const ShippingQuote = () => {
  const { token, role } = useContext(AuthContext);
  const isStaff = role === "Employee" || role === "SuperAdmin";

  const [shipmentTypes, setShipmentTypes] = useState([]);
  const [shipmentTypeId, setShipmentTypeId] = useState("");
  const [packageSizes, setPackageSizes] = useState([]);
  const [packageSizeId, setPackageSizeId] = useState("");
  const [clients, setClients] = useState([]);
  const [clientId, setClientId] = useState("");
  const [clientQuery, setClientQuery] = useState("");
  const [clientSuggestions, setClientSuggestions] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [newClient, setNewClient] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [newClientErrors, setNewClientErrors] = useState({
    firstName: false,
    lastName: false,
    email: false,
    password: false,
  });
  const [clientCreateError, setClientCreateError] = useState("");
  const [creatingClient, setCreatingClient] = useState(false);
  const [emailStatus, setEmailStatus] = useState("idle");
  const [emailTakenRole, setEmailTakenRole] = useState(null);
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [errors, setErrors] = useState(initialErrors);
  const [submitting, setSubmitting] = useState(false);

  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [quote, setQuote] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const debounceRef = useRef(null);
  const emailCheckRef = useRef(null);

  useEffect(() => {
    if (!token) return;

    apiFetch("/api/shipment/types")
      .then((res) => res.json())
      .then((data) => setShipmentTypes(data))
      .catch((err) => console.error("Error cargando tipos de envío:", err));

    apiFetch("/api/shipment/package-sizes")
      .then((res) => res.json())
      .then((data) => setPackageSizes(data))
      .catch((err) =>
        console.error("Error cargando tamaños de paquete:", err)
      );

    if (isStaff) {
      apiFetch("/api/shipment/clients")
        .then((res) => res.json())
        .then((data) => setClients(data))
        .catch((err) => console.error("Error cargando clientes:", err));
    }
  }, [token, isStaff]);

  const fetchAddresses = (query, type) => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!query.trim()) {
        if (type === "origin") {
          setOriginSuggestions([]);
        } else {
          setDestinationSuggestions([]);
        }
        return;
      }

      apiFetch(
        `/api/shipment/address-search?q=${encodeURIComponent(query)}`
      )
        .then((res) => res.json())
        .then((data) => {
          const suggestions = (data || []).map((item, index) => ({
            id: `${item.displayName}-${index}`,
            displayName: item.displayName,
          }));
          if (type === "origin") {
            setOriginSuggestions(suggestions);
          } else {
            setDestinationSuggestions(suggestions);
          }
        })
        .catch((err) => console.error("Error obteniendo direcciones:", err));
    }, 500);
  };

  const handleShipmentType = (event) => {
    setShipmentTypeId(event.target.value);
    setErrors((prev) => ({ ...prev, shipmentType: false }));
  };

  const handlePackageSize = (event) => {
    setPackageSizeId(event.target.value);
    setErrors((prev) => ({ ...prev, packageSize: false }));
  };

  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const checkEmailAvailability = (email) => {
    clearTimeout(emailCheckRef.current);
    if (!isValidEmail(email)) {
      setEmailStatus("idle");
      return;
    }
    setEmailStatus("checking");
    emailCheckRef.current = setTimeout(() => {
      apiFetch(
        `/api/shipment/clients/email-exists?email=${encodeURIComponent(
          email
        )}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.exists) {
            setEmailStatus("taken");
            setEmailTakenRole(data.role);
          } else {
            setEmailStatus("available");
            setEmailTakenRole(null);
          }
        })
        .catch((err) => {
          console.error("Error verificando el correo:", err);
          setEmailStatus("idle");
          setEmailTakenRole(null);
        });
    }, 500);
  };

  const handleClientQueryChange = (event) => {
    const value = event.target.value;
    setClientQuery(value);
    setClientId("");
    setEmailStatus("idle");
    setEmailTakenRole(null);
    setErrors((prev) => ({ ...prev, client: false }));

    const q = value.trim().toLowerCase();
    if (!q) {
      setClientSuggestions([]);
      clearTimeout(emailCheckRef.current);
      return;
    }
    const matches = clients.filter(
      (c) =>
        c.email.toLowerCase().includes(q) ||
        `${c.firstName} ${c.lastName}`.toLowerCase().includes(q)
    );
    setClientSuggestions(matches);

    if (matches.length === 0) {
      checkEmailAvailability(value.trim());
    } else {
      clearTimeout(emailCheckRef.current);
    }
  };

  const handleClientSelect = (client) => {
    setClientId(client.id);
    setClientQuery(client.email);
    setClientSuggestions([]);
    setEmailStatus("idle");
    setEmailTakenRole(null);
    setErrors((prev) => ({ ...prev, client: false }));
  };

  const openClientModal = () => {
    setNewClient({
      firstName: "",
      lastName: "",
      email: clientQuery.trim(),
      password: "",
    });
    setNewClientErrors({
      firstName: false,
      lastName: false,
      email: false,
      password: false,
    });
    setClientCreateError("");
    setClientSuggestions([]);
    setShowClientModal(true);
  };

  const handleNewClientChange = (field) => (event) => {
    setNewClient((prev) => ({ ...prev, [field]: event.target.value }));
    setNewClientErrors((prev) => ({ ...prev, [field]: false }));
    setClientCreateError("");
  };

  const handleCreateClient = async () => {
    const firstName = newClient.firstName.trim();
    const lastName = newClient.lastName.trim();
    const email = newClient.email.trim();
    const password = newClient.password;

    const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
    const errs = {
      firstName: false,
      lastName: false,
      email: false,
      password: false,
    };

    if (!firstName) errs.firstName = "empty";
    else if (firstName.length <= 3 || !nameRegex.test(firstName))
      errs.firstName = "invalid";

    if (!lastName) errs.lastName = "empty";
    else if (lastName.length <= 3 || !nameRegex.test(lastName))
      errs.lastName = "invalid";

    if (!email) errs.email = "empty";
    else if (!isValidEmail(email)) errs.email = "invalid";

    const letters = (password.match(/[a-zA-Z]/g) || []).length;
    const digits = (password.match(/[0-9]/g) || []).length;
    if (!password) errs.password = "empty";
    else if (letters < 3 || digits < 1) errs.password = "invalid";

    if (errs.firstName || errs.lastName || errs.email || errs.password) {
      setNewClientErrors(errs);
      return;
    }

    try {
      setCreatingClient(true);
      setClientCreateError("");
      const response = await apiFetch("/api/shipment/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, email, password }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudo registrar el cliente.");

      setClients((prev) => [...prev, data]);
      setClientId(data.id);
      setClientQuery(data.email);
      setShowClientModal(false);
      setNewClient({ firstName: "", lastName: "", email: "", password: "" });
      setAlertData({
        show: true,
        message: `Cliente ${data.email} creado correctamente.`,
        type: "success",
      });
    } catch (error) {
      console.error("Error registrando cliente:", error);
      setClientCreateError(error.message);
    } finally {
      setCreatingClient(false);
    }
  };

  const handleOriginChange = (event) => {
    const value = event.target.value;
    setOrigin(value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, origin: false }));
    }
    fetchAddresses(value, "origin");
  };

  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, destination: false }));
    }
    fetchAddresses(value, "destination");
  };

  const handleSuggestionSelect = (suggestion, type) => {
    if (type === "origin") {
      setOrigin(suggestion.displayName);
      setOriginSuggestions([]);
    } else {
      setDestination(suggestion.displayName);
      setDestinationSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!shipmentTypeId) {
      setErrors((prev) => ({ ...prev, shipmentType: true }));
      return;
    }

    if (!packageSizeId) {
      setErrors((prev) => ({ ...prev, packageSize: true }));
      return;
    }

    if (isStaff && !clientId) {
      setErrors((prev) => ({ ...prev, client: true }));
      return;
    }

    if (!origin.trim()) {
      setErrors((prev) => ({ ...prev, origin: true }));
      originRef.current.focus();
      return;
    }

    if (!destination.trim()) {
      setErrors((prev) => ({ ...prev, destination: true }));
      destinationRef.current.focus();
      return;
    }

    try {
      setSubmitting(true);
      const response = await apiFetch("/api/shipment/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shipmentTypeId: Number(shipmentTypeId),
          packageSizeId: Number(packageSizeId),
          origin,
          destination,
          ...(isStaff ? { onBehalfOfClientId: clientId } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudo cotizar el envío.");

      setQuote(data);
      setShowConfirmModal(true);
    } catch (error) {
      console.error("Error cotizando envío:", error);
      setAlertData({
        show: true,
        message: "No se pudo generar la cotización.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetShipmentForm = () => {
    setShipmentTypeId("");
    setPackageSizeId("");
    setClientId("");
    setClientQuery("");
    setClientSuggestions([]);
    setEmailStatus("idle");
    setEmailTakenRole(null);
    setShowClientModal(false);
    setOrigin("");
    setDestination("");
  };

  const confirmCreateShipment = async () => {
    try {
      setSubmitting(true);
      const response = await apiFetch("/api/shipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: quote?.id,
          shipmentTypeId: Number(shipmentTypeId),
          packageSizeId: Number(packageSizeId),
          origin,
          destination,
          ...(isStaff ? { onBehalfOfClientId: clientId } : {}),
        }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "No se pudo crear el envío.");

      setShowConfirmModal(false);
      setQuote(null);
      setAlertData({
        show: true,
        message: `¡Envío creado con éxito!`,
        type: "success",
      });
      resetShipmentForm();
    } catch (error) {
      console.error("Error creando envío:", error);
      setShowConfirmModal(false);
      setQuote(null);
      setAlertData({
        show: true,
        message: "No se pudo crear el envío.",
        type: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const cancelCreateShipment = () => {
    setShowConfirmModal(false);
    setQuote(null);
    setAlertData({
      show: true,
      message: "Envío no creado.",
      type: "error",
    });
  };

  if (!token) {
    return (
      <div className="text-center mt-5">
        <CustomAlert
          show={true}
          message="Debes iniciar sesión para acceder a esta sección."
          type="error"
        />
      </div>
    );
  }

  return (
    <>
      <div className="d-flex justify-content-center align-items-center flex-column">
        <CustomAlert
          show={alertData.show}
          message={alertData.message}
          type={alertData.type}
          onClose={() => setAlertData({ ...alertData, show: false })}
        />
        <Form onSubmit={handleSubmit}>
          <CustomCard
            title="CREAR ENVÍO"
            buttonText="Crear"
            buttonType="submit"
            loading={submitting}
            loadingText="Cotizando..."
          >
            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>
                Tipo de envío: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                className={`custom-input ${
                  errors.shipmentType ? "is-invalid" : ""
                }`}
                value={shipmentTypeId}
                onChange={handleShipmentType}
              >
                <option value="" disabled hidden>
                  Seleccione un tipo
                </option>
                {shipmentTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {shipmentTypeLabels[type.name] || type.name}
                  </option>
                ))}
              </Form.Select>
              {errors.shipmentType && (
                <p className="text-danger mt-1">
                  Debe seleccionar un tipo de envío
                </p>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold">
              <Form.Label>
                Tamaño del paquete: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select
                className={`custom-input ${
                  errors.packageSize ? "is-invalid" : ""
                }`}
                value={packageSizeId}
                onChange={handlePackageSize}
              >
                <option value="" disabled hidden>
                  Seleccione un tamaño
                </option>
                {packageSizes.map((size) => (
                  <option key={size.id} value={size.id}>
                    {packageSizeLabels[size.name] || size.name}
                  </option>
                ))}
              </Form.Select>
              {errors.packageSize && (
                <p className="text-danger mt-1">
                  Debe seleccionar un tamaño de paquete
                </p>
              )}
            </Form.Group>

            {isStaff && (
              <Form.Group className="inputs-group mb-3 fw-bold position-relative">
                <Form.Label>
                  Cliente: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  className={`custom-input ${
                    errors.client ? "is-invalid" : ""
                  }`}
                  type="text"
                  placeholder="Escriba el correo del cliente"
                  value={clientQuery}
                  onChange={handleClientQueryChange}
                  onKeyDown={(e) => e.key === "Enter" && e.preventDefault()}
                  autoComplete="off"
                />
                {errors.client && (
                  <p className="text-danger mt-1">
                    Debe seleccionar o registrar un cliente
                  </p>
                )}

                {clientSuggestions.length > 0 && !clientId && (
                  <div className="w-100">
                    <ul className="overflow-auto ocultar-scroll">
                      {clientSuggestions.map((client) => (
                        <li
                          key={client.id}
                          onClick={() => handleClientSelect(client)}
                        >
                          {client.firstName} {client.lastName} ({client.email})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {clientQuery.trim() &&
                  !clientId &&
                  clientSuggestions.length === 0 && (
                    <div className="mt-2">
                      {emailStatus === "checking" && (
                        <p className="titulo mt-1">Verificando correo...</p>
                      )}
                      {emailStatus === "taken" && (
                        <p className="text-danger mt-1">
                          Ese correo es de {roleLabels[emailTakenRole] || "otro usuario"}.
                          No se pueden crear envíos con ese correo.
                        </p>
                      )}
                      {emailStatus === "available" && (
                        <>
                          <p className="text-danger mt-1">
                            No hay clientes con ese correo.
                          </p>
                          <button
                            type="button"
                            className="custom-button w-100"
                            onClick={openClientModal}
                          >
                            Registrar nuevo cliente
                          </button>
                        </>
                      )}
                    </div>
                  )}
              </Form.Group>
            )}

            <Form.Group className="inputs-group mb-3 fw-bold position-relative">
              <Form.Label>
                Origen: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                ref={originRef}
                className={`custom-input ${errors.origin ? "is-invalid" : ""}`}
                type="text"
                placeholder="Ej: Rosario"
                value={origin}
                onChange={handleOriginChange}
                autoComplete="off"
              />
              {errors.origin && (
                <p className="text-danger mt-1">Debe ingresar el origen</p>
              )}

              {originSuggestions.length > 0 && (
                <div className="w-100">
                  <ul className="overflow-auto ocultar-scroll">
                    {originSuggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        onClick={() =>
                          handleSuggestionSelect(suggestion, "origin")
                        }
                      >
                        {suggestion.displayName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold position-relative">
              <Form.Label>
                Destino: <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                ref={destinationRef}
                className={`custom-input ${
                  errors.destination ? "is-invalid" : ""
                }`}
                type="text"
                placeholder="Ej: Buenos Aires"
                value={destination}
                onChange={handleDestinationChange}
                autoComplete="off"
              />
              {errors.destination && (
                <p className="text-danger mt-1">Debe ingresar el destino</p>
              )}
              {destinationSuggestions.length > 0 && (
                <div className="w-100">
                  <ul className="overflow-auto ocultar-scroll">
                    {destinationSuggestions.map((suggestion) => (
                      <li
                        key={suggestion.id}
                        onClick={() =>
                          handleSuggestionSelect(suggestion, "destination")
                        }
                      >
                        {suggestion.displayName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>
          </CustomCard>
        </Form>

        <CustomModal
          show={showConfirmModal}
          onHide={cancelCreateShipment}
          onContinue={confirmCreateShipment}
          continueText="Confirmar envío"
          title={
            <span>
              Envío N°:
              <span className="modal-envio-id">{quote?.id}</span>
            </span>
          }
          body={
            <div>
              {[
                {
                  label: "Tipo de envío: ",
                  value:
                    shipmentTypeLabels[
                      shipmentTypes.find(
                        (t) => t.id === Number(shipmentTypeId)
                      )?.name
                    ] || "",
                },
                {
                  label: "Tamaño del paquete: ",
                  value:
                    packageSizeLabels[
                      packageSizes.find(
                        (s) => s.id === Number(packageSizeId)
                      )?.name
                    ] || "",
                },
                ...(isStaff ? [{ label: "Cliente: ", value: clientQuery }] : []),
                { label: "Origen: ", value: origin },
                { label: "Destino: ", value: destination },
              ].map((item, index) => (
                <div key={index}>
                  <strong>{item.label}</strong>
                  {item.value}
                </div>
              ))}

              {quote != null && (
                <div className="precio-destacado text-center">
                  <span className="precio-label">Precio</span>
                  <span className="precio-monto">
                    ${quote.price.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>
          }
        />

        <CustomModal
          show={showClientModal}
          onHide={() => setShowClientModal(false)}
          onContinue={handleCreateClient}
          title="Registrar nuevo cliente"
          body={
            <div>
              <Form.Group className="inputs-group mb-3 fw-bold">
                <Form.Label>
                  Nombre: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  className={`custom-input ${
                    newClientErrors.firstName ? "is-invalid" : ""
                  }`}
                  type="text"
                  placeholder="Ingrese el nombre"
                  value={newClient.firstName}
                  onChange={handleNewClientChange("firstName")}
                  autoComplete="off"
                />
                {newClientErrors.firstName === "empty" && (
                  <p className="text-danger mt-1">Debe ingresar un nombre</p>
                )}
                {newClientErrors.firstName === "invalid" && (
                  <p className="text-danger mt-1">
                    Debe ingresar un nombre válido (Solo letras, al menos 3)
                  </p>
                )}
              </Form.Group>

              <Form.Group className="inputs-group mb-3 fw-bold">
                <Form.Label>
                  Apellido: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  className={`custom-input ${
                    newClientErrors.lastName ? "is-invalid" : ""
                  }`}
                  type="text"
                  placeholder="Ingrese el apellido"
                  value={newClient.lastName}
                  onChange={handleNewClientChange("lastName")}
                  autoComplete="off"
                />
                {newClientErrors.lastName === "empty" && (
                  <p className="text-danger mt-1">Debe ingresar un apellido</p>
                )}
                {newClientErrors.lastName === "invalid" && (
                  <p className="text-danger mt-1">
                    Debe ingresar un apellido válido (Solo letras, al menos 3)
                  </p>
                )}
              </Form.Group>

              <Form.Group className="inputs-group mb-3 fw-bold">
                <Form.Label>
                  Correo Electrónico: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  className={`custom-input ${
                    newClientErrors.email ? "is-invalid" : ""
                  }`}
                  type="email"
                  placeholder="usuario@ejemplo.com"
                  value={newClient.email}
                  onChange={handleNewClientChange("email")}
                  autoComplete="off"
                />
                {newClientErrors.email === "empty" && (
                  <p className="text-danger mt-1">
                    Debe ingresar un correo electrónico
                  </p>
                )}
                {newClientErrors.email === "invalid" && (
                  <p className="text-danger mt-1">
                    Debe ingresar un email válido, ejemplo: juan@jemar.com
                  </p>
                )}
              </Form.Group>

              <Form.Group className="inputs-group mb-3 fw-bold">
                <Form.Label>
                  Contraseña: <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  className={`custom-input ${
                    newClientErrors.password ? "is-invalid" : ""
                  }`}
                  type="password"
                  placeholder="Ingrese la contraseña"
                  value={newClient.password}
                  onChange={handleNewClientChange("password")}
                  autoComplete="new-password"
                />
                {newClientErrors.password === "empty" && (
                  <p className="text-danger mt-1">Debe ingresar una contraseña</p>
                )}
                {newClientErrors.password === "invalid" && (
                  <p className="text-danger mt-1">
                    La contraseña debe tener al menos 3 letras y 1 número
                  </p>
                )}
              </Form.Group>

              {clientCreateError && (
                <p className="text-danger mt-1">{clientCreateError}</p>
              )}
              {creatingClient && (
                <p className="titulo mt-1 mb-0">Registrando cliente...</p>
              )}
            </div>
          }
        />
      </div>
    </>
  );
};

export default ShippingQuote;
