import React from "react";
import { Link } from "react-router-dom";

const OtherPage = () => {
  return (
    <div className="status-page">
      <section className="panel status-panel">
        <p className="eyebrow">Service map</p>
        <h2>Application status</h2>
        <p>
          The client sends indexes to the API, the API stores them in Postgres,
          and the worker publishes calculated values back through Redis.
        </p>
        <div className="service-list">
          <span>Client</span>
          <span>API</span>
          <span>Redis</span>
          <span>Worker</span>
          <span>Postgres</span>
        </div>
        <Link className="secondary-link" to="/">
          Back to calculator
        </Link>
      </section>
    </div>
  );
};

export default OtherPage;
