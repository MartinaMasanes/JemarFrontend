import { Container, Row, Col } from "react-bootstrap";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import Consult from "./consult/Consult";
import Information from "./information/Information";

const ContactForm = () => {

  return (
    <>
      <Background image="/images/ImageShipment.png">
        <BackArrow />
        <Container className="d-flex align-items-center min-vh-100 flex-column pt-3">
          <div className="screen d-flex justify-content-center w-100">
          <Row>
            <Col className="me-5">
              <Consult />
            </Col>
            <Col>
              <Information />
            </Col>
          </Row>
          </div>
        </Container>
      </Background>
    </>
  );
};

export default ContactForm;

