import React from "react";
import { BrowserRouter, Route, Link } from "react-router-dom";
import axios from "./axios";
import Logo from "./logo";
import ProfilePic from "./profilepic";
import Uploader from "./uploader";
import Profile from "./profile";
import OtherPersonProfile from "./opp";
import Friends from "./friends";
import AllUsers from "./allusers";
import Chat from "./chat";
import Search from "./search";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            menuClass: "show"
        };
        this.showUploader = this.showUploader.bind(this);
        this.hideUploader = this.hideUploader.bind(this);
        this.setNewPic = this.setNewPic.bind(this);
        this.saveBio = this.saveBio.bind(this);
        this.menuClassToggle = this.menuClassToggle.bind(this);
    }
    componentDidMount() {
        axios
            .get("/user.json")
            .then(resp => {
                this.setState({
                    userId: resp.data.user.id,
                    first: resp.data.user.firstname,
                    last: resp.data.user.lastname,
                    email: resp.data.user.email,
                    profilePic: resp.data.user.imgurl,
                    bio: resp.data.user.bio
                });
            })
            .catch(err => {
                console.log("Error in axios.get('/user') ", err);
            });
    }
    saveBio(newBio) {
        this.setState({
            bio: newBio
        });
    }
    showUploader() {
        this.setState({
            uploaderIsVisible: true
        });
    }
    hideUploader() {
        this.setState({
            uploaderIsVisible: false
        });
    }
    setNewPic(img) {
        this.setState({
            profilePic: img,
            uploaderIsVisible: false
        });
    }
    menuClassToggle() {
        if (this.state.menuClass == "hide") {
            this.setState({
                menuClass: "show"
            });
        } else {
            this.setState({
                menuClass: "hide"
            });
        }
    }
    render() {
        if (!this.state) {
            return <div>Loading...</div>;
        }
        return (
            <div id="app">
                <BrowserRouter>
                    <div className="appPage flex row">
                        <div className="menuBar left flex column">
                            <div
                                onClick={this.menuClassToggle}
                                className="menuHeading flex row"
                            >
                                <h1 className="greeting">
                                    Hi {this.state.first}
                                </h1>
                                <ProfilePic
                                    className="profilePicSmall"
                                    url={this.state.profilePic}
                                    name={this.state.first}
                                    last={this.state.last}
                                />
                            </div>
                            <div>
                                <div className="flex column">
                                    <Link className="menuLink" to="/">
                                        Profile
                                    </Link>
                                    <Link className="menuLink" to="/friends">
                                        Friends
                                    </Link>
                                    <Link className="menuLink" to="/chat">
                                        Chat
                                    </Link>
                                    <Link className="menuLink" to="/allusers">
                                        All users
                                    </Link>
                                    <Search />
                                    <Logo className="logoSmall" />
                                    <a className="menuLink" href="/logout">
                                        Logout
                                    </a>
                                </div>
                            </div>
                        </div>
                        <div className="middleApp">
                            {this.state.uploaderIsVisible && (
                                <Uploader
                                    setImage={this.setNewPic}
                                    hideUploader={this.hideUploader}
                                />
                            )}
                            <Route
                                exact
                                path="/"
                                render={() => (
                                    <Profile
                                        id={this.state.userId}
                                        profilePic={this.state.profilePic}
                                        first={this.state.first}
                                        last={this.state.last}
                                        showUploader={this.showUploader}
                                        text={this.state.bio}
                                        saveBio={this.saveBio}
                                    />
                                )}
                            />
                            <Route
                                exact
                                path="/user/:id"
                                component={OtherPersonProfile}
                            />
                            <Route exact path="/friends" component={Friends} />
                            <Route
                                exact
                                path="/allusers"
                                component={AllUsers}
                            />
                            <Route
                                exact
                                path="/chat"
                                render={() => (
                                    <div>
                                        <h1>Chat</h1>
                                        <div>Latest messages:</div>
                                        <Chat />
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                </BrowserRouter>
            </div>
        );
    }
}
