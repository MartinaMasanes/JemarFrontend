import { BrowserRouter, Route, Routes, Outlet } from "react-router-dom";

import ContactForm from "./components/contact/ContactForm";
import ErrorNotFound from "./components/error/errorNotFound/ErrorNotFound";
import ErrorNotAllowed from "./components/error/errorNotAllowed/errorNotAllowed";
import Header from "./components/header/Header";
import HomePage from "./components/home/HomePage";
import Login from "./components/login/Login";
import ForgotPassword from "./components/forgotPassword/ForgotPassword";
import UserRegister from "./components/register/UserRegister";
import Shipments from "./components/shipment/Shipments";
import Consults from "./components/consult/Consults";
import Profile from "./components/profile/Profile";
import Modify from "./components/modify/Modify";
import Dashboard from "./components/dashboard/Dashboard";
import ErrorNotLogged from "./components/error/errorNotLogged/errorNotLogged";
import PaymentResult from "./components/payment/PaymentResult";

import Protected from "./components/protected/Protected";
import RoleProtected from "./components/protected/RoleProtected";

import "./components/style/Styles.css";

const MainLayout = () => (
  <>
    <Header />
    <Outlet />
  </>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/register" element={<UserRegister />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route
            path="/payment/success"
            element={<PaymentResult variant="success" />}
          />
          <Route
            path="/payment/pending"
            element={<PaymentResult variant="pending" />}
          />
          <Route
            path="/payment/failure"
            element={<PaymentResult variant="failure" />}
          />

          <Route element={<Protected />}>
            <Route path="/shipment" element={<Shipments />} />
            <Route path="/consults" element={<Consults />} />
            <Route path="/profile" element={<Profile />} />

            <Route
              element={<RoleProtected allowedRoles={["Employee", "SuperAdmin"]} />}
            >
              <Route path="/modify" element={<Modify />} />
            </Route>

            <Route
              element={
                <RoleProtected allowedRoles={["Employee", "SuperAdmin"]} />
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
          </Route>
        </Route>

        <Route path="/notAllowed" element={<ErrorNotAllowed />} />
        <Route path="/notLogged" element={<ErrorNotLogged />} />
        <Route path="*" element={<ErrorNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

