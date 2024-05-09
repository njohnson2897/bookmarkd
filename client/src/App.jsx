import Footer from "./components/Footer.jsx";
import { Outlet } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";

function App() {
  return (
  <>
  <Navbar />
  <Outlet />
  <Footer />
  </>
  );
}

export default App;
