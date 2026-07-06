import { Container, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import Background from "../../background/Background";
import "../../style/Styles.css";

const ErrorNotAllowed = () => {
  const navigate = useNavigate();

  const goBack = () => {
    navigate("/");
  };

  return (
    <Background image="/images/ImageErrorNotFound.png">
      <Container className="d-flex flex-column justify-content-end align-items-start min-vh-100">
        <div className="text-start mb-5">
          <h1 className="titulo fw-bold mb-1 text-start text-danger">
           ¡ACCESO DENEGADO!
          </h1>
          <p className="fs-4 text-light mb-4">
            No tenés permisos para acceder a esta sección.
          </p>
          <div className="d-flex justify-content-center w-100">
            <Button
              className="custom-button-nf mx-auto w-25 d-flex align-items-center justify-content-center gap-2"
              onClick={goBack}
            >Inicio
            </Button>
          </div>
        </div>
      </Container>
    </Background>
  );
};

export default ErrorNotAllowed;
