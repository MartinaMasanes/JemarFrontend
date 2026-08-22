import { forwardRef } from "react";
import { Form } from "react-bootstrap";
import CustomModal from "./CustomModal";

const VerificationCodeModal = forwardRef(function VerificationCodeModal(
  {
    show,
    onHide,
    email,
    code,
    onCodeChange,
    codeError,
    codeErrorMessage = "Debe ingresar el código de verificación",
    onSubmit,
    loading = false,
    title = "VERIFICACIÓN",
    continueText = "Verificar",
    loadingText = "Verificando...",
    description,
    footerLink,
    children,
  },
  codeRef
) {
  return (
    <CustomModal
      show={show}
      onHide={onHide}
      onContinue={onSubmit}
      continueText={loading ? loadingText : continueText}
      continueDisabled={loading}
      title={title}
      body={
        <Form noValidate onSubmit={onSubmit}>
          <p className="text-center text-white mb-3">
            {description || (
              <>
                Ingresá el código que enviamos a <strong>{email}</strong>.
              </>
            )}
          </p>
          <Form.Group className="inputs-group mb-3 fw-bold">
            <Form.Label>
              Código de verificación: <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              ref={codeRef}
              className={`custom-input ${codeError ? "is-invalid" : ""}`}
              type="text"
              inputMode="numeric"
              placeholder="Ej: 123456"
              value={code}
              onChange={onCodeChange}
              autoComplete="one-time-code"
              autoFocus
            />
            {codeError && <p className="text-danger mt-1">{codeErrorMessage}</p>}
          </Form.Group>

          {children}

          {footerLink && (
            <div className="inputs-group mt-3 text-center">
              <Form.Label>
                <span
                  className="text-decoration-none custom-link"
                  style={{ cursor: "pointer" }}
                  onClick={footerLink.onClick}
                >
                  {footerLink.text}
                </span>
              </Form.Label>
            </div>
          )}
        </Form>
      }
    />
  );
});

export default VerificationCodeModal;
