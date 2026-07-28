import { Modal, Button } from "react-bootstrap";

const CustomModal = ({
  show,
  onHide,
  title,
  body,
  onContinue,
  continueText = "Continuar",
}) => {
  return (
    <Modal className="container-modal" show={show} onHide={onHide} centered>
      <Modal.Header closeButton className="titulo">
        <Modal.Title className="titulo">{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body className="sub-titulo">{body}</Modal.Body>

      <Modal.Footer>
        <Button onClick={onContinue || onHide} className="custom-button">
          {continueText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CustomModal;


