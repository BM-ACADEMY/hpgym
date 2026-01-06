import { Routes, Route, Navigate } from "react-router-dom";
import Homeroutes from "./Homeroutes";

const Mainroutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Homeroutes />} />
    </Routes>
  );
};

export default Mainroutes;