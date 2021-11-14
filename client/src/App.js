import "./App.css";
import Header from "./components/header";
import { Router, Route, Routes } from "react-router-dom";
import history from "./components/history";
import Footer from "./components/footer";

const App = () => {
  return (
    <div className="ui container">
      <Router history={history}>
        <div>
          <Header />
          <Routes>{/* <Route path="/" exact component={} />  */}</Routes>
          <Footer />
        </div>
      </Router>
    </div>
  );
};

export default App;
