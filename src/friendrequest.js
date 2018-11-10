import React, { useState, useEffect } from "react";
import axios from "./axios";

export default function FriendRequest(props) {
    const { currentOpp: id, connect, unfriend } = props;
    const [friendStatus, setFriendStatus] = useState(null);
    const [friendReceiver, setFriendReceiver] = useState(null);
    const [buttonText, setButtonText] = useState(null);

    useEffect(() => {
        axios
            .get(`/friendstatus/${id}.json`)
            .then(({ data }) => {
                setFriendStatus(data.friendship.status);
                setFriendReceiver(data.friendship.recipient_id);
            })
            .catch(err =>
                console.log("Error in axios.get('/friendstatus/id')", err)
            );
    }, []);

    useEffect(
        () => {
            getButtonText();
        },
        [friendStatus, friendReceiver]
    );

    const getButtonText = () => {
        const buttonText =
            friendStatus === 0
                ? "Make friend request"
                : friendStatus === 2
                    ? "End friendship"
                    : friendStatus === 1
                        ? friendReceiver == id
                            ? "Cancel friend request"
                            : "Accept friend request"
                        : "";
        setButtonText(buttonText);
    };

    const makeRequest = () => {
        axios
            .post("/makerequest.json", {
                extUser: id
            })
            .then(({ data }) => {
                setFriendStatus(data.friendship.status);
                setFriendReceiver(id);
            })
            .catch(err =>
                console.log("Error in axios.post('/makerequest') ", err)
            );
    };

    const acceptRequest = () => {
        axios
            .post("/acceptrequest.json", {
                extUser: id
            })
            .then(({ data }) => {
                connect();
                setFriendStatus(data.friendship.status);
            })
            .catch(err =>
                console.log("Error in axios.post('/acceptrequest') ", err)
            );
    };

    const noRequest = () => {
        axios
            .post("/nofriendship.json", {
                extUser: id
            })
            .then(({ data }) => {
                setFriendStatus(data.friendship.status);
            })
            .catch(err =>
                console.log(
                    "Error in axios.post('/nofriendship' to cancel request) ",
                    err
                )
            );
    };

    const newFriendStatus = () => {
        if (!friendStatus || friendStatus == 0) {
            makeRequest();
        } else if (friendStatus == 1) {
            if (friendReceiver == id) {
                noRequest();
            } else {
                acceptRequest();
            }
        } else if (friendStatus == 2) {
            unfriend();
            noRequest();
        }
    };

    return (
        <button
            onClick={() => {
                newFriendStatus();
            }}
        >
            {buttonText}
        </button>
    );
}
