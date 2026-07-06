import { useState, useContext } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";

import { AuthContext } from "../authContext/AuthContext";

import Backgrpund from "../background/Background";
import BackArrow from "../back/BackArrow";
import ModifyState from "./state/ModifyState";
import ModifyRole from "./role/ModifyRole";
import LowUser from "./low/LowUser";


const Modify = () => {
  const { role, token } = useContext(AuthContext);
  const [activeComponent, setActiveComponent] = useState("");

  const buttonsByRole = {
    SuperAdmin: ["status", "roles", "low"],
    Empleado: ["status"],
  };

    const allowedButtons = token ? buttonsByRole[role] || [] : [];
  
  const buttons = [
    { key: "status", label: "Modificar Estado" },
    { key: "roles", label: "Modificar Rol" },
    { key: "low", label: "Elimiar Usuario" },
  ];

const visibleButtons = buttons.filter((btn) =>
    allowedButtons.includes(btn.key)
  );

  return (
    <>
      <Backgrpund image="/images/ImageModify.png">
        <BackArrow />
        <Container className="d-flex align-items-center min-vh-100 flex-column">

          <div className="screen d-flex justify-content-start w-100">
            <Row>
              <Col>
                {activeComponent === "status" && allowedButtons.includes("status") && <ModifyState />}
                {activeComponent === "roles" && allowedButtons.includes("roles") && <ModifyRole />}
                {activeComponent === "low" && allowedButtons.includes("low") && <LowUser />}
              </Col>
            </Row>
          </div>
          <Row className="button-bar mt-auto mb-3">
            {visibleButtons.map((btn) => (
              <Col xs="auto" key={btn.key}>
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
      </Backgrpund>
    </>
  );
};

export default Modify;
