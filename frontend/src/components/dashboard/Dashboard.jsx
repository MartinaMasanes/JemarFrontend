import { useState, useContext } from "react";

import { Button, Container, Row, Col } from "react-bootstrap";
import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import UsersTable from "./usersTable/UsersTable";
import ConsultsTable from "./consultTable/ConsultsTable";
import ShipmentsTable from "./shipmentTable/ShipmentsTable";
import { AuthContext } from "../authContext/AuthContext";

const buttonsByRole = {
  SuperAdmin: [
    { key: "users", label: "Lista de usuarios" },
    { key: "shipments", label: "Lista de envíos" },
    { key: "consults", label: "Lista de consultas" },
  ],
  Employee: [
    { key: "shipments", label: "Lista de envíos" },
    { key: "consults", label: "Lista de consultas" },
  ],
};

function Dashboard() {
  const { role } = useContext(AuthContext);
  const [activeComponent, setActiveComponent] = useState("");

  const buttons = buttonsByRole[role] || [];


  return (
    <Background image="/images/ImageContact.webp">
      <BackArrow />
      <Container className="d-flex align-items-center min-vh-100 flex-column">

        <div className="d-flex flex-grow-1 justify-content-center align-items-center">
          <Row className="w-100">
            <Col>
              {activeComponent === "users" && <UsersTable />}
              {activeComponent === "shipments" && <ShipmentsTable />}
              {activeComponent === "consults" && <ConsultsTable />}
            </Col>
          </Row>
        </div>

        <Row className="button-bar mt-auto mb-3">
          {buttons.map((btn) => (
            <Col xs={6} sm="auto" key={btn.key}>
              <Button
                className={`border-0 fs-5 mx-4 Button-acction ${activeComponent === btn.key ? "active" : ""
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
  );
}

export default Dashboard;
