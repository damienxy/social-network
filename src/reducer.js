export default function(state = {}, action) {
    if (action.type == "RECEIVE_FRIENDS_AND_POTENTIAL_FRIENDS") {
        return {
            ...state,
            friends: action.friends
        };
    }
    if (action.type == "ACCEPT_FRIENDSHIP") {
        return {
            ...state,
            friends: state.friends.map(friend => {
                if (friend.id == action.id) {
                    return { ...friend, status: 2 };
                } else {
                    return friend;
                }
            })
        };
    }
    if (action.type == "TERMINATE_FRIENDSHIP") {
        return {
            ...state,
            friends: state.friends.map(friend => {
                if (friend.id == action.id) {
                    return { ...friend, status: 0 };
                } else {
                    return friend;
                }
            })
        };
    }
    if (action.type == "RECEIVE_ALL_USERS") {
        return {
            ...state,
            allUsers: action.allUsers
        };
    }
    if (action.type == "MAKE_REQUEST") {
        return {
            ...state,
            allUsers: state.allUsers.filter(user => user.id != action.id)
        };
    }
    if (action.type == "USERS_ONLINE") {
        return {
            ...state,
            onlineUsers: action.onlineUsers
        };
    }
    if (action.type == "USER_JOINED") {
        return {
            ...state,
            onlineUsers: [...state.onlineUsers, action.user]
        };
    }
    if (action.type == "USER_LEFT") {
        return {
            ...state,
            onlineUsers: state.onlineUsers.filter(user => user.id != action.id)
        };
    }
    if (action.type == "NEW_CHAT_MESSAGE") {
        return {
            ...state,
            chatMessages: [...state.chatMessages, action.message],
            error: null
        };
    }
    if (action.type == "CHAT_MESSAGES") {
        return {
            ...state,
            chatMessages: action.messages
        };
    }

    if (action.type == "PRIVATE_MESSAGES") {
        return {
            ...state,
            privateMessages: action.messages
        };
    }
    if (action.type == "NEW_PRIVATE_MESSAGE") {
        return {
            ...state,
            privateMessages: [...state.privateMessages, action.message]
        };
    }
    if (action.type == "USER_SEARCH") {
        return {
            ...state,
            searchResult: action.searchResult
        };
    }
    if (action.type == "SHOW_ERROR") {
        return {
            ...state,
            error: [action.error]
        };
    }
    // return state at the bottom of the reducer function
    return state;
}
