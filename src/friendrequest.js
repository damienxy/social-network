import React from "react";
import axios from "./axios";

export default class FriendRequest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.getButtonText = this.getButtonText.bind(this);
        this.setFriendState = this.setFriendState.bind(this);
    }
    componentDidMount() {
        const id = this.props.currentOpp;
        axios
            .get(`/friendstatus/${id}.json`)
            .then(({ data }) => {
                this.setState({
                    friendStatus: data.friendship.status,
                    friendReceiver: data.friendship.recipient_id,
                    friendSender: data.friendship.sender_id
                });
            })
            .catch(err =>
                console.log("Error in axios.get('/friendstatus/id')", err)
            );
    }
    getButtonText() {
        if (!this.state.friendStatus || this.state.friendStatus == 0) {
            return "Make friend request";
        } else if (this.state.friendStatus == 1) {
            if (this.state.friendReceiver == this.props.currentOpp) {
                return "Cancel friend request";
            } else {
                return "Accept friend request";
            }
        } else if (this.state.friendStatus == 2) {
            return "End friendship";
        }
    }
    setFriendState() {
        if (!this.state.friendStatus || this.state.friendStatus == 0) {
            // Make axios request to set friend status to 1
            axios
                .post("/makerequest.json", {
                    extUser: this.props.currentOpp
                })
                .then(({ data }) => {
                    this.setState({
                        friendStatus: data.friendship.status,
                        friendReceiver: this.props.currentOpp
                    });
                })
                .catch(err =>
                    console.log("Error in axios.post('/makerequest') ", err)
                );
        } else if (this.state.friendStatus == 1) {
            if (this.state.friendReceiver == this.props.currentOpp) {
                // Make axios request to set friend status to 0
                axios
                    .post("/nofriendship.json", {
                        extUser: this.props.currentOpp
                    })
                    .then(({ data }) => {
                        this.setState({
                            friendStatus: data.friendship.status
                        });
                    })
                    .catch(err =>
                        console.log(
                            "Error in axios.post('/nofriendship' to cancel request) ",
                            err
                        )
                    );
            } else {
                // Make axios request to set friend status to 2
                axios
                    .post("/acceptrequest.json", {
                        extUser: this.props.currentOpp
                    })
                    .then(({ data }) => {
                        this.props.connect();
                        this.setState({
                            friendStatus: data.friendship.status
                        });
                    })
                    .catch(err =>
                        console.log(
                            "Error in axios.post('/acceptrequest') ",
                            err
                        )
                    );
            }
        } else if (this.state.friendStatus == 2) {
            // Make axios request to set friend status to 0
            axios
                .post("/nofriendship.json", {
                    extUser: this.props.currentOpp
                })
                .then(({ data }) => {
                    this.props.unfriend();
                    this.setState({
                        friendStatus: data.friendship.status
                    });
                })
                .catch(err =>
                    console.log(
                        "Error in axios.post('/nofriendship' to cancel request) ",
                        err
                    )
                );
        }
    }
    render() {
        return (
            <button
                onClick={() => {
                    this.setFriendState();
                }}
            >
                {this.getButtonText()}
            </button>
        );
    }
}
