import React, { Component } from "react";
import ReactDOM from "react-dom";

import "./styles.css";

class Canvas extends Component {
  setRef = ctx => {
    this.ctx = ctx.getContext("2d");
    this.ctx.scale(4, 4);
    this.ctx.strokeText(this.props.captcha, 0, 30);
  };

  render() {
    return <canvas width={200} height={150} ref={this.setRef} />;
  }
}

class App extends Component {
  constructor() {
    super();
    this.state = {
      captcha: {},
      solution: "",
      loading: true,
      message: ""
    };
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);    

  }

  componentDidMount() {
    this.fetchCaptcha();
  }

  fetchCaptcha() {
    this.setState({ loading: true });
    fetch("https://captcha-serverside.herokuapp.com/create")
      .then(res => res.json())
      .then(data => {
        this.setState({ captcha: data, loading: false });
      })
      .catch(e => console.log(e));
  }

  handleChange(e) {
    this.setState({ solution: e.target.value });
  }

  handleClick(e) {
    const id = this.state.captcha.id;
    fetch("https://captcha-serverside.herokuapp.com/enter/" + id, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ solution: this.state.solution })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          this.setState({ message: "You are good to go." });
        } else {
          this.setState({ message: "Try again." });

        }
      });
    e.preventDefault();
  }

  displayCaptcha() {
    
    const captcha = this.state.captcha.captcha;
    const loading = this.state.loading
    
    if (loading) {
      return(
        <div>Loading... please wait.</div>
      )
    }
    return (
      <Canvas captcha={captcha} />
    )
  }

  render() {
    const message = this.state.message;
    return (
      <div className="App">
      {this.displayCaptcha()}

        <div>
          <label htmlFor="captcha">captcha: </label>
          <input type="text" onChange={this.handleChange} id="captcha" />
          <button onClick={this.handleClick}>Submit</button>
        </div>
        {message}
      </div>
    );
  }
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);


