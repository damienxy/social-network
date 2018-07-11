import axios from "./axios";
import { getCancelSource } from "./axios";

let cancelSource;

export async function receiveFriendsAndPotentialFriends() {
    const { data } = await axios.get("/getfriendlist.json");
    return {
        type: "RECEIVE_FRIENDS_AND_POTENTIAL_FRIENDS",
        friends: data.friends
    };
}

export function acceptFriendship(id) {
    axios.post("/acceptrequest.json", {
        extUser: id
    });
    return {
        type: "ACCEPT_FRIENDSHIP",
        id
    };
}

export function terminateFriendship(id) {
    axios.post("/nofriendship.json", {
        extUser: id
    });
    return {
        type: "TERMINATE_FRIENDSHIP",
        id
    };
}

export async function receiveAllUsers() {
    const { data } = await axios.get("/getallusers.json");
    return {
        type: "RECEIVE_ALL_USERS",
        allUsers: data.allUsers
    };
}

export function sendFriendRequest(id) {
    axios.post("/makerequest.json", {
        extUser: id
    });
    return {
        type: "MAKE_REQUEST",
        id
    };
}

export function onlineUsers(onlineUsers) {
    return {
        type: "USERS_ONLINE",
        onlineUsers
    };
}

export function userJoined(user) {
    return {
        type: "USER_JOINED",
        user
    };
}

export function userLeft(id) {
    return {
        type: "USER_LEFT",
        id
    };
}

export function newChatMessage(message) {
    return {
        type: "NEW_CHAT_MESSAGE",
        message
    };
}

export function chatMessages(messages) {
    return {
        type: "CHAT_MESSAGES",
        messages
    };
}

export function privateMessages(messages) {
    return {
        type: "PRIVATE_MESSAGES",
        messages
    };
}

export function newPrivateMessage(message) {
    return {
        type: "NEW_PRIVATE_MESSAGE",
        message
    };
}

export function showError(error) {
    return {
        type: "SHOW_ERROR",
        error
    };
}

export async function userSearch(query) {
    if (query == "") {
        return {
            type: "USER_SEARCH",
            searchResult: false
        };
    }
    if (cancelSource) {
        cancelSource.cancel("cancelled");
    }
    cancelSource = getCancelSource();
    try {
        const { data } = await axios.post(
            "/usersearch.json",
            {
                query: query
            },
            {
                cancelToken: cancelSource.token
            }
        );
        return {
            type: "USER_SEARCH",
            searchResult: data.results
        };
    } catch (e) {
        console.log(e);
        return {
            type: "USER_SEARCH",
            searchResult: false
        };
    } finally {
        cancelSource = null;
    }
}
