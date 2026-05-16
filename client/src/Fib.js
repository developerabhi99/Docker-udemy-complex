import React, { Component } from 'react';
import axios from 'axios';

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: {},
    index: '',
    error: '',
    isSubmitting: false,
  };

  componentDidMount() {
    this.fetchValues();
    this.fetchIndexes();
  }

  async fetchValues() {
    const values = await axios.get('/api/values/current');
    this.setState({ values: values.data });
  }

  async fetchIndexes() {
    const seenIndexes = await axios.get('/api/values/all');
    this.setState({
      seenIndexes: seenIndexes.data,
    });
  }

  handleSubmit = async (event) => {
    event.preventDefault();

    this.setState({ error: '', isSubmitting: true });

    try {
      await axios.post('/api/values', {
        index: this.state.index,
      });

      this.setState({ index: '' });
      await Promise.all([this.fetchValues(), this.fetchIndexes()]);
    } catch (err) {
      const error =
        err.response && err.response.data
          ? err.response.data
          : 'Unable to submit this index';

      this.setState({ error });
    } finally {
      this.setState({ isSubmitting: false });
    }
  };

  renderSeenIndexes() {
    if (!this.state.seenIndexes.length) {
      return <p className="empty-state">No indexes have been submitted yet.</p>;
    }

    return (
      <div className="index-list">
        {this.state.seenIndexes.map(({ number }, position) => (
          <span key={`${number}-${position}`}>{number}</span>
        ))}
      </div>
    );
  }

  renderValues() {
    const entries = Object.entries(this.state.values || {});

    if (!entries.length) {
      return <p className="empty-state">Calculated values will appear here.</p>;
    }

    return (
      <div className="results-grid">
        {entries.map(([key, value]) => (
          <div className="result-card" key={key}>
            <span className="result-label">Index {key}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
    );
  }

  render() {
    return (
      <div className="fib-page">
        <section className="input-panel">
          <div className="section-heading">
            <p className="eyebrow">Submit a workload</p>
            <h2>Calculate a Fibonacci value</h2>
          </div>

          <form className="fib-form" onSubmit={this.handleSubmit}>
            <label htmlFor="fib-index">Index</label>
            <div className="input-row">
              <input
                id="fib-index"
                inputMode="numeric"
                placeholder="Try 7"
                value={this.state.index}
                onChange={(event) =>
                  this.setState({ index: event.target.value, error: '' })
                }
              />
              <button disabled={this.state.isSubmitting}>
                {this.state.isSubmitting ? 'Submitting' : 'Submit'}
              </button>
            </div>
            {this.state.error && <p className="form-error">{this.state.error}</p>}
          </form>
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="section-heading">
              <p className="eyebrow">Postgres</p>
              <h3>Submitted indexes</h3>
            </div>
            {this.renderSeenIndexes()}
          </div>

          <div className="panel">
            <div className="section-heading">
              <p className="eyebrow">Redis + worker</p>
              <h3>Calculated values</h3>
            </div>
            {this.renderValues()}
          </div>
        </section>
      </div>
    );
  }
}

export default Fib;
