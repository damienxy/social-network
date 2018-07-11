import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleInput = this.handleInput.bind(this);
        this.submitLogin = this.submitLogin.bind(this);
    }
    handleInput(e) {
        this[e.target.name] = e.target.value;
    }
    submitLogin(e) {
        e.preventDefault();
        axios
            .post("/login.json", {
                email: this.email,
                password: this.password
            })
            .then(resp => {
                if (resp.data.success) {
                    console.log("successfully logged in");
                    location.replace("/");
                } else {
                    console.log("login failed");
                    this.setState({
                        error: true
                    });
                }
            })
            .catch(err => {
                console.log("Error in axios.post('/login') ", err);
            });
    }
    render() {
        return (
            <div>
                <form
                    className="form flex column"
                    method="post"
                    onSubmit={this.submitLogin}
                >
                    <input
                        type="email"
                        name="email"
                        placeholder="Email address"
                        onChange={this.handleInput}
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={this.handleInput}
                    />
                    <button>Login</button>
                    <button className="instead">
                        <Link
                            to="/register"
                            className="instead"
                            onClick={this.props.welcomeToggle}
                        >
                            Register instead
                        </Link>
                    </button>
                    {this.state.error && (
                        <div className="error">
                            Login unsuccessful. Please try again
                        </div>
                    )}
                </form>
            </div>
        );
    }
}
