import React from "react";
import { Link } from "react-router-dom";
import { connect } from "react-redux";

function Online(props) {
    return (
        <div>
            <div className="onlineUsers flex row">
                {props.onlineUsers &&
                    props.onlineUsers.map(user => {
                        return (
                            <div key={user.id}>
                                <div className="userDiv">
                                    <div>
                                        <div className="online"> </div>
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
        </div>
    );
}

const mapStateToProps = state => {
    return {
        onlineUsers: state.onlineUsers
    };
};

export default connect(mapStateToProps)(Online);
