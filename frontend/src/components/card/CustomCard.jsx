import { Container, Button, Spinner } from "react-bootstrap";

const CustomCard = ({
  title,
  children,
  buttonText,
  buttonAction,
  buttonType = "button",
  loading = false,
  loadingText = "Procesando...",
}) => {
  return (
    <Container className="d-flex justify-content-center">
      <div
        className="small-container d-flex flex-column"
   
      >
        <div className="p-2">
          <h2 className="titulo fw-bold text-center mb-0">{title}</h2>
        </div>

        <div className="ocultar-scroll flex-grow-1 overflow-auto m-0 p-3">
          {children}
        </div>

        {buttonText && (
          <div className="p-3 text-center">
            <Button
              className="custom-button w-50"
              type={buttonType}
              onClick={buttonAction}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                    className="me-2"
                  />
                  {loadingText}
                </>
              ) : (
                buttonText
              )}
            </Button>
          </div>
        )}
      </div>
    </Container>
  );
};

export default CustomCard;
