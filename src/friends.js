import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";
import {
    receiveFriendsAndPotentialFriends,
    acceptFriendship,
    terminateFriendship
} from "./actions";

class Friends extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.dispatch(receiveFriendsAndPotentialFriends());
    }
    render() {
        return (
            <div>
                <h1>Friends</h1>
                <div className="friends flex column">
                    <div>
                        <h2>Friendships</h2>
                        <div className="flex row wrap center">
                            {this.props.friends &&
                                this.props.friends.map(friend => {
                                    return (
                                        <div key={friend.id}>
                                            <div className="userDiv flex column">
                                                <div>
                                                    {friend.firstname}{" "}
                                                    {friend.lastname}
                                                </div>
                                                <Link to={"/user/" + friend.id}>
                                                    <img
                                                        className="profilePicThumbnail"
                                                        src={friend.imgurl}
                                                        alt={friend.firstname}
                                                    />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        this.props.dispatch(
                                                            terminateFriendship(
                                                                friend.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    End friendship
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            <div />
                        </div>
                    </div>
                    <div>
                        <h2>Received requests</h2>
                        <div className="flex row wrap center">
                            {this.props.pending &&
                                this.props.pending.map(sender => {
                                    return (
                                        <div key={sender.id}>
                                            <div className="userDiv flex column">
                                                <div>
                                                    {sender.firstname}{" "}
                                                    {sender.lastname}
                                                </div>
                                                <Link to={"/user/" + sender.id}>
                                                    <img
                                                        className="profilePicThumbnail"
                                                        src={sender.imgurl}
                                                        alt={sender.firstname}
                                                    />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        this.props.dispatch(
                                                            acceptFriendship(
                                                                sender.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    Accept friend request
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                    <div>
                        <h2>Sent requests</h2>
                        <div className="flex row wrap center">
                            {this.props.asked &&
                                this.props.asked.map(sender => {
                                    return (
                                        <div key={sender.id}>
                                            <div className="userDiv flex column">
                                                <div>
                                                    {sender.firstname}{" "}
                                                    {sender.lastname}
                                                </div>
                                                <Link to={"/user/" + sender.id}>
                                                    <img
                                                        className="profilePicThumbnail"
                                                        src={sender.imgurl}
                                                        alt={sender.firstname}
                                                    />
                                                </Link>
                                                <button
                                                    onClick={() =>
                                                        this.props.dispatch(
                                                            terminateFriendship(
                                                                sender.id
                                                            )
                                                        )
                                                    }
                                                >
                                                    Cancel friend request
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        friends:
            state.friends && state.friends.filter(friend => friend.status == 2),
        pending:
            state.friends &&
            state.friends.filter(
                friend => friend.status == 1 && friend.id != friend.recipient_id
            ),
        asked:
            state.friends &&
            state.friends.filter(
                friend => friend.status == 1 && friend.id == friend.recipient_id
            )
    };
};

export default connect(mapStateToProps)(Friends);
