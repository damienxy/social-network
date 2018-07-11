import React from "react";
import axios from "./axios";

export default class Bio extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.handleInput = this.handleInput.bind(this);
        this.showBioInput = this.showBioInput.bind(this);
        this.submitBio = this.submitBio.bind(this);
        this.hideBioInput = this.hideBioInput.bind(this);
        this.handleFocus = this.handleFocus.bind(this);
        this.hitEnter = this.hitEnter.bind(this);
    }
    showBioInput() {
        this.setState({
            bioInputIsVisible: true
        });
    }
    hideBioInput() {
        this.setState({
            bioInputIsVisible: false
        });
    }
    handleFocus(e) {
        e.target.select();
    }
    handleInput(e) {
        this[e.target.name] = e.target.value;
    }
    hitEnter(e) {
        if (e.keyCode == 13) {
            this.submitBio();
        }
    }
    submitBio() {
        this.setState({
            bioInputIsVisible: false
        });
        axios
            .post("/bio.json", {
                bio: this.bio
            })
            .then(resp => {
                if (resp.data.success) {
                    this.props.saveBio(this.bio);
                } else {
                    console.log("Ajax request unsuccessful");
                }
            })
            .catch(err => console.log("Error in axios.post('/bio') ", err));
    }
    render() {
        return (
            <div>
                <h1>Bio</h1>
                <div className="instruction" onClick={this.showBioInput}>
                    {this.props.text ? "Click on bio to edit" : "Add a bio"}
                </div>
                <div id="bioText" onClick={this.showBioInput}>
                    {this.props.text}
                </div>
                {this.state.bioInputIsVisible && (
                    <div id="bioForm">
                        <textarea
                            name="bio"
                            id="bioInput"
                            type="text"
                            onChange={this.handleInput}
                            defaultValue={(this.bio = this.props.text)}
                            onDoubleClick={this.handleFocus}
                            autoFocus="true"
                            onKeyDown={e => this.hitEnter(e)}
                        />
                        <div className="bioButtons form flex row">
                            <button onClick={this.submitBio}>
                                Save bio (or hit enter)
                            </button>
                            <button onClick={this.hideBioInput}>
                                I changed my mind
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    }
}
