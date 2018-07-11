import React from "react";

export default function ProfilePic(props) {
    return (
        <div>
            <img
                className={props.className}
                src={props.url}
                alt={props.first}
                onClick={props.showUploader}
            />
        </div>
    );
}
