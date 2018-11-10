const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server, { origins: "localhost:8080" });
const multer = require("multer");
const uidSafe = require("uid-safe");
const path = require("path");
const s3 = require("./s3");
const compression = require("compression");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const csurf = require("csurf");
const db = require("./db");
const s3Url = "https://s3.amazonaws.com/spicedling/";
const secrets = require("./secrets");

// ********** START Configuration of discStorage ********** //
const diskStorage = multer.diskStorage({
    destination: function(req, file, callback) {
        callback(null, __dirname + "/uploads");
    },
    filename: function(req, file, callback) {
        uidSafe(24).then(function(uid) {
            callback(null, uid + path.extname(file.originalname));
        });
    }
});
// ********** END Configuration of discStorage ********** //

// ********** START Image uploader ********** //
const uploader = multer({
    storage: diskStorage,
    limits: {
        fileSize: 2097152
    },
    fileFilter: function(req, file, callback) {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif|svg)$/)) {
            return callback(new Error("Invalid file type"));
        }
        callback(null, true);
    }
});

const upload = uploader.single("img");
// ********** END Image uploader ********** //

// Middleware

app.use(
    bodyParser.urlencoded({
        extended: false
    })
);

app.use(bodyParser.json());

const cookieSessionMiddleware = cookieSession({
    secret: secrets.COOKIE_SECRET,
    maxAge: 1000 * 60 * 60 * 24 * 14
});

app.use(cookieSessionMiddleware);

io.use(function(socket, next) {
    cookieSessionMiddleware(socket.request, socket.request.res, next);
});

app.use(compression());

app.use(csurf());

app.use(function(req, res, next) {
    res.cookie("mytoken", req.csrfToken());
    next();
});

app.use(express.static("./public"));

if (process.env.NODE_ENV != "production") {
    app.use(
        "/bundle.js",
        require("http-proxy-middleware")({
            target: "http://localhost:8081/"
        })
    );
} else {
    app.use("/bundle.js", (req, res) => res.sendFile(`${__dirname}/bundle.js`));
}

// Routes

app.post("/register.json", function(req, res) {
    db.hashPassword(req.body.password).then(hash => {
        db.register(req.body.first, req.body.last, req.body.email, hash)
            .then(results => {
                req.session.userId = results.rows[0].id;
            })
            .then(() => {
                res.json({
                    success: true
                });
            })
            .catch(err => {
                console.log("Error in app.post '/register' ", err);
                res.json({
                    success: false
                });
            });
    });
});

app.post("/login.json", function(req, res) {
    let userId;
    db.getUserByEmail(req.body.email)
        .then(results => {
            userId = results.rows[0].id;
            return db.checkPassword(
                req.body.password,
                results.rows[0].password
            );
        })
        .then(doesMatch => {
            if (doesMatch) {
                req.session.userId = userId;
            } else {
                throw new Error("Incorrect password");
            }
        })
        .then(() => {
            res.json({
                success: true
            });
        })
        .catch(err => {
            console.log("Error in app.post('/login') ", err);
            res.json({
                success: false
            });
        });
});

app.post(
    "/upload.json",
    (req, res, next) => {
        upload(req, res, err => {
            if (err) {
                res.status(400).send({
                    message: err.message
                });
                return;
            }
            next();
        });
    },
    s3.upload,
    (req, res) => {
        const imgUrl = s3Url + req.file.filename;
        db.saveProfilePic(imgUrl, req.session.userId)
            .then(() => {
                res.json({
                    profilePic: imgUrl
                });
            })
            .catch(err => {
                console.log("Error in app.post('/upload'): ", err.message);
                if (err.code == 23502) {
                    res.status(500).send({
                        message: "Fields cannot be empty"
                    });
                } else if (err.code == 22001) {
                    res.status(500).send({
                        message: "Title or username too long"
                    });
                } else {
                    res.status(500).send({
                        message: "Upload failed"
                    });
                }
            });
    }
);

app.post("/bio.json", (req, res) => {
    db.saveBio(req.body.bio, req.session.userId)
        .then(() => {
            res.json({
                success: true
            });
        })
        .catch(err => {
            console.log("Error in app.post('/bio') ", err);
            res.json({
                success: false
            });
        });
});

app.get("/user.json", function(req, res) {
    if (!req.session.userId) {
        res.redirect("welcome");
    } else {
        db.getUserById(req.session.userId)
            .then(results => {
                if (!results.rows[0].imgurl) {
                    results.rows[0].imgurl = "/img/default.jpg";
                }
                res.json({
                    user: results.rows[0]
                });
            })
            .catch(err => {
                console.log("Error in app.get('/user') ", err);
                res.json({
                    success: false
                });
            });
    }
});

app.get("/user/:id.json", (req, res) => {
    if (req.params.id == req.session.userId) {
        res.json({
            redirectToProfile: true
        });
    } else {
        Promise.all([
            db.getUserById(req.params.id),
            db.getFriendshipStatus(req.session.userId, req.params.id)
        ])
            .then(([result1, result2]) => {
                if (!result1.rows[0]) {
                    res.json({
                        userDoesntExist: true
                    });
                } else {
                    if (!result1.rows[0].imgurl) {
                        result1.rows[0].imgurl = "/img/default.jpg";
                    }
                    if (!result2.rows[0]) {
                        res.json({
                            user: result1.rows[0],
                            friendship: "none"
                        });
                    } else {
                        res.json({
                            user: result1.rows[0],
                            friendship: result2.rows[0]
                        });
                    }
                }
            })
            .catch(err => console.log("Error in app.get('/user/:id') ", err));
    }
});

app.get("/friendstatus/:id.json", (req, res) => {
    db.getFriendshipStatus(req.session.userId, req.params.id)
        .then(results => {
            if (!results.rows[0]) {
                res.json({
                    friendship: {
                        sender_id: req.session.userId,
                        recipient_id: req.params.id,
                        status: 0
                    }
                });
            } else {
                res.json({
                    friendship: results.rows[0]
                });
            }
        })
        .catch(err => console.log("Error in app.get('/friendstatus') ", err));
});

app.post("/makerequest.json", (req, res) => {
    db.makeRequest(req.session.userId, req.body.extUser)
        .then(({ rows }) => {
            res.json({
                friendship: rows[0]
            });
        })
        .catch(err => console.log("Error in app.post('/makerequest') ", err));
});

app.post("/acceptrequest.json", (req, res) => {
    db.acceptRequest(req.session.userId, req.body.extUser)
        .then(({ rows }) => {
            res.json({
                friendship: rows[0]
            });
        })
        .catch(err => console.log("Error in app.post('/acceptrequest') ", err));
});

app.post("/nofriendship.json", (req, res) => {
    db.noFriendship(req.session.userId, req.body.extUser)
        .then(() => {
            res.json({
                friendship: {
                    sender_id: req.session.userId,
                    recipient_id: req.params.id,
                    status: 0
                }
            });
        })
        .catch(err => console.log("Error in app.post('/endfriendship') ", err));
});

app.get("/getfriendlist.json", (req, res) => {
    db.getFriendList(req.session.userId)
        .then(({ rows }) => {
            for (var i = 0; i < rows.length; i++) {
                if (!rows[i].imgurl) {
                    rows[i].imgurl = "/img/default.jpg";
                }
            }
            res.json({
                friends: rows
            });
        })
        .catch(err => console.log("Error in app.get('/getfriendlist') ", err));
});

app.get("/getallusers.json", (req, res) => {
    db.getAllUsers(req.session.userId)
        .then(({ rows }) => {
            for (var i = 0; i < rows.length; i++) {
                if (!rows[i].imgurl) {
                    rows[i].imgurl = "/img/default.jpg";
                }
            }
            res.json({
                allUsers: rows
            });
        })
        .catch(err => console.log("Error in app.get('/getallUserslist')", err));
});

app.post("/usersearch.json", (req, res) => {
    db.searchUsers(req.body.query)
        .then(({ rows }) => {
            for (var i = 0; i < rows.length; i++) {
                if (!rows[i].imgurl) {
                    rows[i].imgurl = "/img/default.jpg";
                }
            }
            res.json({
                results: rows
            });
        })
        .catch(err =>
            console.log("Error in app.post('/usersearch.json')", err)
        );
});

app.get("/logout", function(req, res) {
    req.session = null;
    res.redirect("/");
});

// All other routes should be above these two:

app.get("/welcome", function(req, res) {
    if (req.session.userId) {
        res.redirect("/");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

app.get("*", function(req, res) {
    if (!req.session.userId) {
        res.redirect("/welcome");
    } else {
        res.sendFile(__dirname + "/index.html");
    }
});

// Server port
server.listen(8080, function() {
    console.log("I'm listening.");
});

// Socket
let onlineUsers = {};
console.log(onlineUsers);

io.on("connection", function(socket) {
    if (!socket.request.session || !socket.request.session.userId) {
        return socket.disconnect(true);
    }

    const socketId = socket.id;
    const userId = socket.request.session.userId;
    onlineUsers[socketId] = userId;
    var userIds = Object.values(onlineUsers);
    db.getUsersByIds(Object.values(onlineUsers))
        .then(({ rows }) => {
            for (var i = 0; i < rows.length; i++) {
                if (!rows[i].imgurl) {
                    rows[i].imgurl = "/img/default.jpg";
                }
                if (rows[i].id == userId) {
                    rows[i].firstname = "You";
                    rows[i].lastname = "";
                }
            }
            socket.emit("onlineUsers", rows);
        })
        .catch(err => console.log("Error in socket.emit onlineUsers ", err));

    if (userIds.filter(id => id == userId).length == 1) {
        db.getUserById(userId)
            .then(({ rows }) => {
                if (!rows[0].imgurl) {
                    rows[0].imgurl = "/img/default.jpg";
                }
                socket.broadcast.emit("userJoined", rows[0]);
            })
            .catch(err =>
                console.log("Error in socket.broadcast.emit userJoined ", err)
            );
    }

    socket.on("newChatMessage", function(message) {
        db.saveChatMessage(userId, message)
            .then(result => {
                return db.getUserById(userId).then(({ rows }) => {
                    if (!rows[0].imgurl) {
                        rows[0].imgurl = "/img/default.jpg";
                    }
                    rows[0].user_id = rows[0].id;
                    rows[0].id = result.rows[0].id;
                    rows[0].message = result.rows[0].message;
                    rows[0].created_at = result.rows[0].created_at;
                    io.emit("newChatMessage", rows[0]);
                });
            })
            .catch(err => {
                console.log("Error in socket.broadcast.emit userJoined ", err);
                if (err.code == 23502) {
                    socket.emit("exception", {
                        error: "You cannot send an empty message"
                    });
                } else {
                    socket.emit("exception", {
                        error: "Your message could not be sent"
                    });
                }
            });
    });

    db.getChatMessages()
        .then(({ rows }) => {
            for (var i = 0; i < rows.length; i++) {
                if (!rows[i].imgurl) {
                    rows[i].imgurl = "/img/default.jpg";
                }
            }
            socket.emit("chatMessages", rows.reverse());
        })
        .catch(err => console.log("Error in db.getChatMessages", err));

    socket.on("getPrivateMessages", function(currentOpp) {
        db.getPrivateMessages(userId, currentOpp)
            .then(({ rows }) => {
                for (var i = 0; i < rows.length; i++) {
                    if (!rows[i].imgurl) {
                        rows[i].imgurl = "/img/default.jpg";
                    }
                }

                socket.emit("privateMessages", rows.reverse());
            })
            .catch(err => console.log("Error in db.getPrivateMessages", err));
    });

    socket.on("newPrivateMessage", function(message, currentOpp) {
        db.savePrivateMessage(userId, currentOpp, message)
            .then(result => {
                return db.getUserById(userId).then(({ rows }) => {
                    if (!rows[0].imgurl) {
                        rows[0].imgurl = "/img/default.jpg";
                    }
                    rows[0].user_id = rows[0].id;
                    rows[0].id = result.rows[0].id;
                    rows[0].message = result.rows[0].message;
                    rows[0].created_at = result.rows[0].created_at;
                    socket.emit("newPrivateMessage", rows[0]);
                    for (const socketId in onlineUsers) {
                        if (onlineUsers[socketId] == currentOpp) {
                            io.sockets.sockets[socketId].emit(
                                "newPrivateMessage",
                                rows[0]
                            );
                        }
                    }
                    io.to(currentOpp).emit();
                });
            })
            .catch(err =>
                console.log("Error in socket.broadcast.emit userJoined ", err)
            );
    });

    socket.on("disconnect", function() {
        const thisUserId = onlineUsers[socketId];
        delete onlineUsers[socketId];
        userIds = Object.values(onlineUsers);
        if (userIds.filter(id => id == thisUserId).length == 0) {
            io.emit("userLeft", thisUserId);
        }
    });
});
