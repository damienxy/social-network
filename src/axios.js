import axios from "axios";

export function getCancelSource() {
    return axios.CancelToken.source();
}

const instance = axios.create({
    xsrfCookieName: "mytoken",
    xsrfHeaderName: "csrf-token"
});

export default instance;
