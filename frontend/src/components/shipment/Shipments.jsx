import { useState, useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

import { AuthContext } from "../authContext/AuthContext";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import CreateShipment from "./create/CreateShipment";
import CancelShipment from "./cancel/CancelShipment";
import TrackShipment from "./track/TrackShipment";

const buttonsByRole = {
  Client: ["create", "cancel", "track"],
  Employee: ["create", "track"],
  SuperAdmin: ["create", "track"],
};

const Shipments = () => {
  const { role, token } = useContext(AuthContext);
  const [activeComponent, setActiveComponent] = useState("");

  const allowedButtons = token ? buttonsByRole[role] || [] : [];

  const buttons = [
    { key: "create", label: "Crear envío" },
    { key: "cancel", label: "Cancelar envío" },
    { key: "track", label: "Consultar envío" },
  ];

  const visibleButtons = buttons.filter((btn) =>
    allowedButtons.includes(btn.key)
  );

  return (
    <>
      <Background image="/images/ImageShipment.webp">
        <BackArrow />
        <Container className="d-flex align-items-center min-vh-100 flex-column">

          <div className="screen d-flex justify-content-start w-100">
            <Row>
              <Col>
                {activeComponent === "create" &&
                  allowedButtons.includes("create") && <CreateShipment />}
                {activeComponent === "cancel" &&
                  allowedButtons.includes("cancel") && <CancelShipment />}
                {activeComponent === "track" &&
                  allowedButtons.includes("track") && <TrackShipment />}
              </Col>
            </Row>
          </div>

          <Row className="button-bar mt-auto mb-3">
            {visibleButtons.map((btn) => (
              <Col xs={6} sm="auto" key={btn.key}>
                <Button
                  className={`border-0 fs-4 mx-4 Button-acction ${
                    activeComponent === btn.key ? "active" : ""
                  }`}
                  onClick={() => setActiveComponent(btn.key)}
                >
                  {btn.label}
                </Button>
              </Col>
            ))}
          </Row>
        </Container>
      </Background>
    </>
  );
};

export default Shipments;
