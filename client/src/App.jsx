import React from "react";
import Mainroutes from "./router/Mainroute";
import { BrowserRouter as Router } from "react-router-dom";

const App = () => {
  return (
    <Router>
      <Mainroutes />
    </Router>
  );
};

export default App;
