import React from "react";
import ProfilePic from "./profilepic";
import Bio from "./bio";

export default class Profile extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    render() {
        return (
            <div className="profile flex row">
                <div>
                    <h1>Your Profile</h1>
                    <div
                        className="instruction"
                        onClick={this.props.showUploader}
                    >
                        Click on image to change
                    </div>
                    <ProfilePic
                        className="profilePicBig"
                        url={this.props.profilePic}
                        first={this.props.first}
                        last={this.props.last}
                        showUploader={this.props.showUploader}
                    />
                </div>
                <div className="bioWindow">
                    <Bio text={this.props.text} saveBio={this.props.saveBio} />
                </div>
            </div>
        );
    }
}
