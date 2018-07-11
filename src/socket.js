import * as io from "socket.io-client";
import {
    onlineUsers,
    userJoined,
    userLeft,
    newChatMessage,
    chatMessages,
    privateMessages,
    newPrivateMessage,
    showError
} from "./actions.js";

let socket;

export function getSocket(store) {
    if (!socket) {
        socket = io.connect();

        socket.on("onlineUsers", users => {
            store.dispatch(onlineUsers(users));
        });

        socket.on("userJoined", user => {
            store.dispatch(userJoined(user));
        });

        socket.on("userLeft", id => {
            store.dispatch(userLeft(id));
        });

        socket.on("newChatMessage", message => {
            store.dispatch(newChatMessage(message));
        });

        socket.on("chatMessages", messages => {
            store.dispatch(chatMessages(messages));
        });
        socket.on("privateMessages", messages => {
            store.dispatch(privateMessages(messages));
        });
        socket.on("newPrivateMessage", message => {
            store.dispatch(newPrivateMessage(message));
        });
        socket.on("exception", error => {
            store.dispatch(showError(error));
        });
    }
    return socket;
}
