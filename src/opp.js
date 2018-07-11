import React from "react";
import axios from "./axios";
import ProfilePic from "./profilepic";
import FriendRequest from "./friendrequest";
import PrivateChat from "./privatechat";

export default class OtherPersonProfile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.getUser = this.getUser.bind(this);
        this.componentDidMount = this.componentDidMount.bind(this);
        this.connect = this.connect.bind(this);
        this.unfriend = this.unfriend.bind(this);
    }
    componentDidMount() {
        const id = this.props.match.params.id;
        this.getUser(id);
    }
    componentDidUpdate() {
        !this.state.id && this.getUser(this.props.match.params.id);
    }
    static getDerivedStateFromProps(nextProps, state) {
        if (
            nextProps.match &&
            nextProps.match.params &&
            nextProps.match.params.id != state.id
        ) {
            return {
                id: null
            };
        }
        return null;
    }
    getUser(id) {
        axios
            .get(`/user/${id}.json`)
            .then(({ data }) => {
                if (data.redirectToProfile) {
                    this.props.history.push("/");
                }
                if (data.userDoesntExist) {
                    console.log("User doesn't exist");
                    this.props.history.push("/");
                }
                this.setState({
                    first: data.user.firstname,
                    last: data.user.lastname,
                    img: data.user.imgurl,
                    bio: data.user.bio,
                    id: data.user.id,
                    friendSender: data.friendship.sender_id,
                    friendReceiver: data.friendship.recipient_id,
                    friendStatus: data.friendship.status
                });
            })
            .catch(err =>
                console.log("Error in axios.get('/user/:id:json') ", err)
            );
    }
    connect() {
        this.setState(
            {
                friendStatus: 2
            },
            () => console.log("new friend status", this.state.friendStatus)
        );
    }
    unfriend() {
        this.setState({
            friendStatus: 0
        });
    }
    render() {
        if (!this.state.id) {
            return null;
        }
        return (
            <div className="profile flex row">
                <div className="flex column">
                    <h1>{this.state.first}&apos;s Profile</h1>
                    <ProfilePic
                        className="profilePicBig"
                        url={this.state.img}
                        first={this.state.first}
                        last={this.state.last}
                    />
                    <FriendRequest
                        currentOpp={this.props.match.params.id}
                        friendSender={this.state.friendSender}
                        friendReceiver={this.state.friendReceiver}
                        friendStatus={this.state.friendStatus}
                        connect={this.connect}
                        unfriend={this.unfriend}
                    />
                    <div>
                        <div className="bioWindow">
                            <h1>Bio</h1>
                            <div className="opp">
                                <div id="bioText">
                                    {this.state.bio
                                        ? this.state.bio
                                        : "This user has not added a bio yet"}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {this.state.friendStatus == 2 ? (
                    <PrivateChat
                        className="private"
                        currentOpp={this.props.match.params.id}
                    />
                ) : (
                    <h1 className="connect">Connect for private messaging</h1>
                )}
            </div>
        );
    }
}
