import React from "react";
import axios from "./axios";
import { Link } from "react-router-dom";

export default class Register extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleInput = this.handleInput.bind(this);
        this.submitRegistration = this.submitRegistration.bind(this);
    }
    handleInput(e) {
        this[e.target.name] = e.target.value;
    }
    submitRegistration(e) {
        e.preventDefault();
        axios
            .post("/register.json", {
                first: this.first,
                last: this.last,
                email: this.email,
                password: this.password
            })
            .then(resp => {
                if (resp.data.success) {
                    location.replace("/");
                } else {
                    console.log("registration not successful");
                    this.setState({
                        error: true
                    });
                }
            })
            .catch(err => {
                console.log("Error in axios.post('/register') ", err);
            });
    }
    render() {
        return (
            <div>
                <form
                    className="form flex column"
                    method="post"
                    onSubmit={this.submitRegistration}
                >
                    <input
                        type="text"
                        name="first"
                        placeholder="First name"
                        onChange={this.handleInput}
                    />
                    <input
                        type="text"
                        name="last"
                        placeholder="Last name"
                        onChange={this.handleInput}
                    />
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
                    <button>Register</button>
                    <button className="instead">
                        <Link
                            to="/login"
                            className="instead"
                            onClick={this.props.welcomeToggle}
                        >
                            Login instead
                        </Link>
                    </button>
                </form>
                {this.state.error && (
                    <div className="error">
                        Registration did not work. Please try again
                    </div>
                )}
            </div>
        );
    }
}
