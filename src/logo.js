import React from "react";

export default function Logo(props) {
    return (
        <div className={props.className} onClick={props.logoutClassToggle}>
            <i className="fas fa-barcode logoIcon" />
        </div>
    );
}
