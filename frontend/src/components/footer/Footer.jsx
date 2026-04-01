import { Container } from 'react-bootstrap';

import '../style/Styles.css';

const Footer = () => {
  return (
    <>
      <Container fluid className="footer d-flex justify-content-center mt-5">
        <span className="footer-text">© 2025 Envíos JeMar - Todos los derechos reservados</span>
      </Container>
    </>
  );
};

export default Footer;
