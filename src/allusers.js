import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { receiveAllUsers } from "./actions";

class AllUsers extends React.Component {
    constructor(props) {
        super(props);
    }
    componentDidMount() {
        this.props.dispatch(receiveAllUsers());
    }
    render() {
        return (
            <div>
                <div>
                    <h1>All users</h1>
                    <div className="flex row wrap center">
                        {this.props.allUsers &&
                            this.props.allUsers.map(user => {
                                return (
                                    <div key={user.id}>
                                        <div className="userDiv flex column">
                                            <div>
                                                {user.firstname} {user.lastname}
                                            </div>
                                            <Link to={"/user/" + user.id}>
                                                <img
                                                    className="profilePicThumbnail"
                                                    src={user.imgurl}
                                                    alt={user.firstname}
                                                />
                                            </Link>
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                    <div />
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        allUsers: state.allUsers
    };
};

export default connect(mapStateToProps)(AllUsers);
