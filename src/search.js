import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { userSearch } from "./actions";

class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSearch: false
        };
        this.searchToggle = this.searchToggle.bind(this);
        this.highlightResult = this.highlightResult.bind(this);
        this.removeHighlight = this.removeHighlight.bind(this);
    }
    searchToggle() {
        this.setState({
            showSearch: !this.state.showSearch
        });
    }
    highlightResult(e) {
        e.target.classList.add("highlight");
    }
    removeHighlight(e) {
        e.target.classList.remove("highlight");
    }
    render() {
        return (
            <div>
                <div className="menuLink" onClick={this.searchToggle}>
                    Search
                </div>
                {this.state.showSearch && (
                    <div>
                        <input
                            className="searchInput"
                            autoFocus="autofocus"
                            onChange={e => {
                                const value = e.target.value;
                                clearTimeout(this.timer);
                                this.timer = setTimeout(() => {
                                    this.props.dispatch(userSearch(value));
                                }, 200);
                            }}
                            placeholder="Search for users"
                        />
                        <div
                            className="searchResults"
                            ref={searchResults =>
                                (this.searchResults = searchResults)
                            }
                        >
                            {this.props.searchResult &&
                                this.props.searchResult.map(result => {
                                    return (
                                        <div
                                            className={this.state.resultClass}
                                            key={result.id}
                                            onMouseOver={this.highlightResult}
                                            onMouseOut={this.removeHighlight}
                                        >
                                            <Link
                                                onClick={() => {
                                                    this.searchToggle();
                                                    this.props.dispatch(
                                                        userSearch("")
                                                    );
                                                }}
                                                className="resultLink flex row"
                                                to={"/user/" + result.id}
                                            >
                                                <img
                                                    className="profilePicSmall"
                                                    src={result.imgurl}
                                                />
                                                <div className="resultName">
                                                    {result.firstname}{" "}
                                                    {result.lastname}
                                                </div>
                                            </Link>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        searchResult: state.searchResult
    };
};

export default connect(mapStateToProps)(Search);
