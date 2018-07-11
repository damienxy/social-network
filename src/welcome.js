import React from "react";
import { HashRouter, Route, Link } from "react-router-dom";
import Register from "./register";
import Login from "./login";
import Logo from "./logo";

export default class Welcome extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            buttonText: "Welcome"
        };
        this.welcomeToggle = this.welcomeToggle.bind(this);
    }
    welcomeToggle() {
        if (this.state.buttonText == "Welcome") {
            this.setState({
                buttonText: "Login"
            });
        } else if (this.state.buttonText == "Register") {
            this.setState({
                buttonText: "Login"
            });
        } else if (this.state.buttonText == "Login") {
            this.setState({
                buttonText: "Register"
            });
        }
    }
    render() {
        return (
            <div id="welcome" className="flex row">
                <HashRouter>
                    <div className="menuBar left welcome">
                        <h1 onClick={this.welcomeToggle}>
                            {this.state.buttonText == "Welcome" ? (
                                <Link className="hiddenLink" to="/login">
                                    {this.state.buttonText}
                                    <span className="plus">+</span>
                                </Link>
                            ) : this.state.buttonText == "Login" ? (
                                <Link className="hiddenLink" to="/register">
                                    {this.state.buttonText}
                                </Link>
                            ) : (
                                <Link className="hiddenLink" to="/login">
                                    {this.state.buttonText}
                                </Link>
                            )}
                        </h1>
                        <Route
                            exact
                            path="/register"
                            render={() => (
                                <Register welcomeToggle={this.welcomeToggle} />
                            )}
                        />
                        <Route
                            path="/login"
                            render={() => (
                                <Login welcomeToggle={this.welcomeToggle} />
                            )}
                        />
                    </div>
                </HashRouter>
                <Logo className="middleWelcome logoBig" />
                <div className="menuBar right" />
            </div>
        );
    }
}
