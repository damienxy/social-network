// ??? Change error to error[0], add error for private messaging

import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import { getSocket } from "./socket";
import Online from "./online";

class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleInput = this.handleInput.bind(this);
        this.submitChatMessage = this.submitChatMessage.bind(this);
        this.hitEnter = this.hitEnter.bind(this);
        this.socket = getSocket();
    }
    componentDidMount() {
        this.chatWindow.scrollTop =
            this.chatWindow.scrollHeight - this.chatWindow.clientHeight;
    }
    componentDidUpdate() {
        this.chatWindow.scrollTop =
            this.chatWindow.scrollHeight - this.chatWindow.clientHeight;
    }
    handleInput(e) {
        this[e.target.name] = e.target.value;
    }
    submitChatMessage() {
        if (this.message) {
            this.socket.emit("newChatMessage", this.message.trim());
            this.field.value = null;
        } else {
            this.socket.emit("newChatMessage", this.message);
            this.field.value = null;
        }
    }
    hitEnter(e) {
        if (e.keyCode == 13) {
            this.submitChatMessage();
        }
    }
    render() {
        return (
            <div className="chat flex column">
                <div
                    className="chatWindow public"
                    ref={chatWindow => (this.chatWindow = chatWindow)}
                >
                    {this.props.chatMessages &&
                        this.props.chatMessages.map(message => {
                            return (
                                <div
                                    className="message flex row"
                                    key={message.id}
                                >
                                    <div className="messageImage">
                                        <img
                                            className="profilePicSmall"
                                            src={message.imgurl}
                                            alt={message.firstname}
                                        />
                                    </div>
                                    <div className="messageInfo">
                                        <Link to={"/user/" + message.user_id}>
                                            <div className="messageName">
                                                {message.firstname}{" "}
                                                {message.lastname}
                                                {":"}
                                            </div>
                                        </Link>
                                        <div className="messageText">
                                            {message.message}
                                        </div>
                                        <div className="messageDate">
                                            on{" "}
                                            {new Date(
                                                message.created_at
                                            ).toLocaleDateString()}{" "}
                                            at{" "}
                                            {new Date(
                                                message.created_at
                                            ).toLocaleTimeString()}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>
                <textarea
                    className="textareaPublic"
                    name="message"
                    onChange={this.handleInput}
                    ref={field => (this.field = field)}
                    placeholder="Write a message"
                    onKeyDown={e => this.hitEnter(e)}
                />
                <div className="form">
                    <button onClick={this.submitChatMessage}>
                        Submit (or hit enter)
                    </button>
                </div>
                {this.props.error &&
                    this.props.error.map(error => {
                        return (
                            <div className="error" key={error.error}>
                                {error.error}
                            </div>
                        );
                    })}
                <h3>Online right now</h3>
                <Online />
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        chatMessages: state.chatMessages,
        error: state.error
    };
};

export default connect(mapStateToProps)(Chat);
