import { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import CreateShipment from "./create/CreateShipment";
import CancelShipment from "./cancel/CancelShipment";
import TrackShipment from "./track/TrackShipment";

const Shipments = () => {
  const [activeComponent, setActiveComponent] = useState("");

  const buttons = [
    { key: "create", label: "Crear envío" },
    { key: "cancel", label: "Cancelar envío" },
    { key: "track", label: "Consultar envío" },
  ];

  return (
    <>
      <Background image="/images/ImageShipment.png">
        <BackArrow />
        <Container className="d-flex align-items-center min-vh-100 flex-column">

          <div className="screen d-flex justify-content-start w-100">
            <Row>
              <Col>
                {activeComponent === "create" && <CreateShipment />}
                {activeComponent === "cancel" && <CancelShipment />}
                {activeComponent === "track" && <TrackShipment />}
              </Col>
            </Row>
          </div>

          <Row className="button-bar mt-auto mb-3">
            {buttons.map((btn) => (
              <Col xs="auto" key={btn.key}>
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
