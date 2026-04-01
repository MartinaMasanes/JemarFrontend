import { useEffect, useState, useRef, useContext } from "react";
import { Form } from "react-bootstrap";

import { initialErrors } from "./CreateShipment.data";
import { AuthContext } from "../../authContext/AuthContext";

import CustomModal from "../../modal/CustomModal";
import CustomCard from "../../card/CustomCard";
import CustomAlert from "../../alert/CustomAlert";

const ShippingQuote = () => {
  const { token } = useContext(AuthContext);

  const [shipmentTypes, setShipmentTypes] = useState([]);
  const [shipmentTypeId, setShipmentTypeId] = useState("");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [errors, setErrors] = useState(initialErrors);

  const [alertData, setAlertData] = useState({
    show: false,
    message: "",
    type: "info",
  });

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState(null);
  const [originSuggestions, setOriginSuggestions] = useState([]);
  const [destinationSuggestions, setDestinationSuggestions] = useState([]);

  const originRef = useRef(null);
  const destinationRef = useRef(null);

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

  useEffect(() => {
    fetch("http://localhost:3000/api/shipment_type")
      .then((res) => res.json())
      .then((data) => {
        console.log("Tipos cargados:", data);
        setShipmentTypes(data);
      })
      .catch((err) => console.error("Error cargando tipos de envío:", err));
  }, []);

  let debounceTimeout;
  const fetchLocalities = (query, type) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      if (!query.trim()) {
        if (type === "origin") {
          setOriginSuggestions([]);
        } else {
          setDestinationSuggestions([]);
        }
        return;
      }

      fetch(`https://apis.datos.gob.ar/georef/api/localidades?nombre=${query}`)
        .then((res) => res.json())
        .then((data) => {
          const localities = data.localidades || [];

          const uniqueLocalities = Array.from(
      new Map(localities.map((loc) => [`${loc.nombre}-${loc.provincia.nombre}`, loc])).values()
    );

          const formattedLocalities = uniqueLocalities.map((loc, index) => ({
            id: loc.id || `${loc.nombre}-${loc.provincia.nombre}-${index}`,
            nombre: loc.nombre,
            provincia: loc.provincia.nombre,
          }));
          if (type === "origin") {
            setOriginSuggestions(formattedLocalities);
          } else {
            setDestinationSuggestions(formattedLocalities);
          }
        })
        .catch((err) => console.error("Error obteniendo localidades:", err));
    }, 500);
  };

  const handleShipmentType = (event) => {
    const value = event.target.value;
    setShipmentTypeId(value);
    setErrors((prev) => ({ ...prev, shipmentType: false }));
  };

  const handleOriginChange = (event) => {
    const value = event.target.value;
    setOrigin(value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, origin: false }));
    }
    fetchLocalities(value, "origin");
  };

  const handleDestinationChange = (event) => {
    const value = event.target.value;
    setDestination(value);
    if (value.trim()) {
      setErrors((prev) => ({ ...prev, destination: false }));
    }
    fetchLocalities(value, "destination");
  };

  const handleSuggestionSelect = (suggestion, type) => {
    const fullName = `${suggestion.nombre}, ${suggestion.provincia}, Argentina`;
    if (type === "origin") {
      setOrigin(fullName);
      setOriginSuggestions([]);
    } else {
      setDestination(fullName);
      setDestinationSuggestions([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    if (!shipmentTypeId) {
      setErrors((prev) => ({ ...prev, shipmentType: true }));
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

    if (!token) {
      setAlertData({
        show: true,
        message: "Debes iniciar sesión para cotizar un envío.",
        type: "error",
      });
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/shipment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipmentTypeId, origin, destination }),
      });

      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Error al generar la cotización");

      setModalData(data.shipment);
      setShowModal(true);

      setShipmentTypeId("");
      setOrigin("");
      setDestination("");
    } catch (error) {
      console.error("Error creando envío:", error);
      setAlertData({
        show: true,
        message: "No se pudo generar la cotización.",
        type: "error",
      });
    }
  };

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
                    {type.name}
                  </option>
                ))}
              </Form.Select>
              {errors.shipmentType && (
                <p className="text-danger mt-1">
                  Debe seleccionar un tipo de envío
                </p>
              )}
              {shipmentTypeId && (
              <div className="titulo fw-bold mt-2">
                {
                  {
                    Estandar: "El precio del envío estándar es de $25.000",
                    Express: "El precio del envío express es de $40.000",
                    Fragil: "El precio del envío frágil es de $60.000",
                  }[shipmentTypes.find((t) => t.id === Number(shipmentTypeId))?.name]
                }
              </div>
            )}
            </Form.Group>

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
                        {suggestion.nombre}, {suggestion.provincia}, Argentina
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>

            <Form.Group className="inputs-group mb-3 fw-bold">
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
                        {suggestion.nombre}, {suggestion.provincia}, Argentina
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Form.Group>
          </CustomCard>
        </Form>

        {modalData && (
          <CustomModal
            show={showModal}
            onHide={() => {
              setShowModal(false);
              setAlertData({
                show: true,
                message: "¡Envío realizado con éxito!",
                type: "success",
              });
            }}
            title="¡Guarde su número de envío!"
            body={
              <div>
                {[
                  { label: "Envío N°: ", value: modalData.id },
                  {
                    label: "Precio: ",
                    value: `$${modalData.price.toLocaleString("es-AR")}`,
                  },
                ].map((item, index) => (
                  <div key={index}>
                    {item.label} {item.value}
                  </div>
                ))}
              </div>
            }
          />
        )}
      </div>
    </>
  );
};

export default ShippingQuote;
