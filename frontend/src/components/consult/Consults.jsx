import { Container, Row, Col } from "react-bootstrap";

import Background from "../background/Background";
import BackArrow from "../back/BackArrow";
import TrackConsult from "./track/TrackConsult";

const Consults = () => {
  return (
    <Background image="/images/ImageContact.webp">
      <BackArrow />
      <Container className="d-flex align-items-center min-vh-100 flex-column">
        <div className="screen d-flex justify-content-start w-100">
          <Row>
            <Col>
              <TrackConsult />
            </Col>
          </Row>
        </div>
      </Container>
    </Background>
  );
};

export default Consults;
