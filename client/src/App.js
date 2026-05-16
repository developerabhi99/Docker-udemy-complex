import React from "react";
import "./App.css";
import { BrowserRouter as Router, Route, NavLink } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

function App() {
  return (
    <Router>
      <div className="app-shell">
        <header className="topbar">
          <div>
            <p className="eyebrow">Docker compose demo</p>
            <h1>Fibonacci Lab</h1>
          </div>
          <nav className="nav-links" aria-label="Primary navigation">
            <NavLink exact to="/" activeClassName="active">
              Calculator
            </NavLink>
            <NavLink to="/otherpage" activeClassName="active">
              Status
            </NavLink>
          </nav>
        </header>

        <main className="app-main">
          <Route exact path="/" component={Fib} />
          <Route path="/otherpage" component={OtherPage} />
        </main>
      </div>
    </Router>
  );
}

export default App;
