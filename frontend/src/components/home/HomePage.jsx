import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Row, Col, Button } from "react-bootstrap";

import Footer from "../footer/Footer";
import Background from "../background/Background";
import CardOne from "./cards/CardOne";
import CardTwo from "./cards/CardTwo";
import CardThree from "./cards/CardThree";
import CardFour from "./cards/CardFour";
import CardFive from "./cards/CardFive";
import CardSix from "./cards/CardSix";

import { AuthContext } from "../authContext/AuthContext";
import { IsTokenValid } from "../protected/Protected.helpers";

const HomePage = () => {
  const [activeButton, setActiveButton] = useState(null);
  const navigate = useNavigate();
  const { role, token, user } = useContext(AuthContext);

  const buttonsByRole = {
    SuperAdmin: ["shipment", "modify", "dashboard"],
    Empleado: ["shipment", "modify"],
    Usuario: ["shipment"],
  };

  const allowedButtons = token ? buttonsByRole[role] || [] : [];

  const buttons = [
    { key: "shipment", label: "Envíos" },
    { key: "modify", label: "Modificar" },
    { key: "dashboard", label: "Panel" },
  ];

  const routes = {
    shipment: "/shipment",
    modify: "/modify",
    dashboard: "/dashboard",
  };

  const handleButtonClick = (buttonKey) => {
    setActiveButton(buttonKey);
    const route = routes[buttonKey];
    if (route) navigate(route);
  };
  console.log("TOKEN:", token);
  console.log("VALIDO:", IsTokenValid(token));
  console.log("ROLE:", role);
  return (
    <>
      <Background image="/images/ImageHome.png">
        <Container className="d-flex justify-content-center align-items-center min-vh-100 flex-column">
          {IsTokenValid(token) ? (
            <>
              <h2 className="text-light mb-4">
                Bienvenido, {user?.name || "Usuario"}
              </h2>
              <Container className="button-bar mt-auto mb-3">
                <Row className="justify-content-center">
                  {buttons
                    .filter((btn) =>
                      allowedButtons.includes(btn.key.toLowerCase())
                    )
                    .map((btn) => (
                      <Col xs="auto" key={btn.key}>
                        <Button
                          className={`border-0 fs-4 mx-4 Button-acction ${activeButton === btn.key ? "active" : ""
                            }`}
                          onClick={() => handleButtonClick(btn.key)}
                        >
                          {btn.label}
                        </Button>
                      </Col>
                    ))}
                </Row>
              </Container>
            </>
          ) : (
            <h2 className="text-light mb-4"></h2>
          )}
        </Container>
      </Background>

      <div className="blackLine"></div>

      <Background image="/images/ImageHome1.png">
        <div className="color-bacground d-flex justify-content-center align-items-center min-vh-100 flex-column">
          <h2 className="title-card mt-5" style={{ fontSize: "2.5rem" }}>
            Recomendaciones para embalar tu paquete
          </h2>
          <Row className="mb-5 mt-5">
            <Col><CardOne /></Col>
            <Col><CardTwo /></Col>
            <Col><CardThree /></Col>
          </Row>
          <Row>
            <Col><CardFour /></Col>
            <Col><CardFive /></Col>
            <Col><CardSix /></Col>
          </Row>
        </div>
        <Footer />
      </Background>
    </>
  );
};

export default HomePage;