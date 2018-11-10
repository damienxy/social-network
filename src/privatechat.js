import React from "react";
import { connect } from "react-redux";
import { getSocket } from "./socket";

class PrivateChat extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showMessages: "hide",
            messageTitle: "Show private messages"
        };
        this.socket = getSocket();
        this.handleInput = this.handleInput.bind(this);
        this.hitEnter = this.hitEnter.bind(this);
        this.newPrivateMessage = this.newPrivateMessage.bind(this);
        this.messageToggle = this.messageToggle.bind(this);
    }
    componentDidMount() {
        this.chatWindow.scrollTop =
            this.chatWindow.scrollHeight - this.chatWindow.clientHeight;
        this.socket.emit("getPrivateMessages", this.props.currentOpp);
    }

    componentDidUpdate() {
        this.chatWindow.scrollTop =
            this.chatWindow.scrollHeight - this.chatWindow.clientHeight;
    }
    handleInput(e) {
        this[e.target.name] = e.target.value;
    }
    hitEnter(e) {
        if (e.keyCode == 13) {
            this.newPrivateMessage();
        }
    }
    newPrivateMessage() {
        this.socket.emit(
            "newPrivateMessage",
            this.message,
            this.props.currentOpp
        );
        this.field.value = "";
    }
    messageToggle() {
        if (this.state.showMessages == "hide") {
            this.setState({
                showMessages: "show",
                messageTitle: "Hide private messages"
            });
        } else {
            this.setState({
                showMessages: "hide",
                messageTitle: "Show private messages"
            });
        }
    }
    render() {
        return (
            <div>
                <div className="chat flex column">
                    <h1 className="messageTitle" onClick={this.messageToggle}>
                        {this.state.messageTitle}
                    </h1>
                    <div className={this.state.showMessages}>
                        <div
                            className="chatWindow private"
                            ref={chatWindow => (this.chatWindow = chatWindow)}
                        >
                            {this.props.privateMessages &&
                                this.props.privateMessages.map(message => {
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
                                                <div className="messageName">
                                                    {message.firstname}{" "}
                                                    {message.lastname}
                                                    {":"}
                                                </div>
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
                            name="message"
                            className="textareaPrivate"
                            onChange={this.handleInput}
                            ref={field => (this.field = field)}
                            placeholder="Write a message"
                            onKeyDown={e => this.hitEnter(e)}
                        />
                        <div className="form">
                            <button onClick={this.newPrivateMessage}>
                                Submit (or hit enter)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        privateMessages: state.privateMessages
    };
};

export default connect(mapStateToProps)(PrivateChat);
