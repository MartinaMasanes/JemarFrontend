import { Navbar, Container, Nav, Button } from "react-bootstrap";
import { useNavigate, Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../authContext/AuthContext";

import "../style/Styles.css";

const Header = () => {
  const navigate = useNavigate();
  const { token, onLogout } = useContext(AuthContext);
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    setIsLoggedIn(!!token);
  }, [token]);

  const handleLogout = () => {
    onLogout();
    navigate("/");
  };

  return (
    <>
      <Navbar expand="lg" fixed="top" className="navbar-custom">
        <Container
          fluid
          className="header d-flex justify-content-center position-fixed top-0 start-50 translate-middle-x"
        >
          <img
            src="./public/images/Icon.svg"
            alt="Icono"
            height={40}
            className="me-2"
          />
          <span className="brand-text fs-2">Envíos JeMar</span>

          <Nav className="ms-auto">
            <div className="mt-1 text-center">
              <Link
                to="/"
                className="text-decoration-none custom-link fs-3 me-4"
              >
                Inicio
              </Link>

              <Link
                to="/contact"
                className="text-decoration-none custom-link fs-3 me-4"
              >
                Contacto
              </Link>

              {isLoggedIn ? (
                <Link
                  onClick={handleLogout}
                  className="text-decoration-none fs-3 me-4"

                >
                  <i className="custom-link-outlog bi bi-box-arrow-right"></i>{" "}
                  <span className="custom-link-outlog fs-3">Cerrar sesión</span>
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="text-decoration-none custom-link fs-3 me-2"
                >
                  <i className="custom-link bi bi-person-circle"></i>{" "}
                  <span className="custom-link fs-3">Ingresar</span>
                </Link>
              )}
            </div>
          </Nav>
        </Container>
      </Navbar>
    </>
  );
};

export default Header;
