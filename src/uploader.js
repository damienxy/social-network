import React from "react";
import axios from "./axios";

export default class Uploader extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            labelText: "Choose image"
        };
        this.upload = this.upload.bind(this);
        this.handleInput = this.handleInput.bind(this);
    }
    handleInput(e) {
        this.img = e.target.files[0];
        this.setState({
            labelText: "1 file chosen"
        });
    }
    upload(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append("img", this.img);
        axios
            .post("/upload.json", formData)
            .then(({ data }) => {
                this.props.setImage(data.profilePic);
            })
            .catch(err => {
                console.log(
                    "Error in image upload: ",
                    err.response.data.message
                );
                if (err.response.data.message) {
                    this.setState({
                        error: err.response.data.message,
                        labelText: "Choose file"
                    });
                } else {
                    this.setState({
                        error: "Upload failed, please try again",
                        labelText: "Choose file"
                    });
                }
            });
    }
    render() {
        return (
            <div id="uploaderContainer" onClick={this.props.hideUploader}>
                <div id="uploader" onClick={e => e.stopPropagation()}>
                    <h1>Upload your profile picture</h1>
                    <input
                        id="file"
                        name="file"
                        type="file"
                        className="inputFile"
                        onChange={this.handleInput}
                    />
                    <label className="label" htmlFor="file">
                        {this.state.labelText}
                    </label>
                    <button onClick={this.props.hideUploader}>Nevermind</button>
                    <button onClick={this.upload}>Upload</button>
                    {this.state.error && (
                        <div className="error">{this.state.error}</div>
                    )}
                </div>
            </div>
        );
    }
}
