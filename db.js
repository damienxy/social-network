const spicedPg = require("spiced-pg");
const db = spicedPg("postgres:postgres:postgres@localhost:5432/socialnetwork");
const bcrypt = require("bcryptjs");

exports.hashPassword = function(plainTextPassword) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt((err, salt) => {
            if (err) {
                return reject(err);
            }
            bcrypt.hash(plainTextPassword, salt, (err, hash) => {
                if (err) {
                    return reject(err);
                }
                resolve(hash);
            });
        });
    }).catch(err => console.log("Error in hashPassword ", err));
};

exports.checkPassword = function(
    textEnteredInLoginForm,
    hashedPasswordFromDatabase
) {
    return new Promise(function(resolve, reject) {
        bcrypt.compare(
            textEnteredInLoginForm,
            hashedPasswordFromDatabase,
            function(err, doesMatch) {
                if (err) {
                    reject(err);
                } else {
                    resolve(doesMatch);
                }
            }
        );
    });
};

exports.register = function(first, last, email, hash) {
    const q = `
        INSERT INTO users (firstname, lastname, email, password)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, password;
    `;
    const params = [first, last, email, hash];
    return db.query(q, params);
};

exports.getUserByEmail = function(email) {
    const q = `
        SELECT id, email, password FROM users
        WHERE email = $1
    `;
    const params = [email];
    return db.query(q, params);
};

exports.getUserById = function(userId) {
    const q = `
        SELECT id, firstname, lastname, imgurl, bio
        FROM users
        WHERE id = $1;
    `;
    const params = [userId];
    return db.query(q, params);
};

exports.saveProfilePic = function(newImg, userId) {
    const q = `
        UPDATE users
        SET imgurl = $1
        WHERE id = $2
    `;
    const params = [newImg, userId];
    return db.query(q, params);
};

exports.saveBio = function(newBio, userId) {
    const q = `
        UPDATE users
        SET bio = $1
        WHERE id = $2
        RETURNING bio
    `;
    const params = [newBio || null, userId];
    return db.query(q, params);
};

exports.getFriendshipStatus = function(currentUser, potentialFriend) {
    const q = `
        SELECT sender_id, recipient_id, status
        FROM friends
        WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)

    `;
    const params = [currentUser, potentialFriend];
    return db.query(q, params);
};

exports.makeRequest = function(currentUser, potentialFriend) {
    const q = `
        INSERT INTO friends (sender_id, recipient_id, status, updated_at)
        VALUES ($1, $2, 1, CURRENT_TIMESTAMP)
        RETURNING sender_id, recipient_id, status
        `;
    const params = [currentUser, potentialFriend];
    return db.query(q, params);
};

exports.acceptRequest = function(currentUser, potentialFriend) {
    const q = `
        UPDATE friends
        SET status = 2, updated_at = CURRENT_TIMESTAMP
        WHERE sender_id = $2 AND recipient_id = $1
        RETURNING status
        `;
    const params = [currentUser, potentialFriend];
    return db.query(q, params);
};

exports.noFriendship = function(currentUser, potentialFriend) {
    const q = `
        DELETE FROM friends
        WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)
    `;
    const params = [currentUser, potentialFriend];
    return db.query(q, params);
};

exports.getFriendList = function(currentUser) {
    const q = `
        SELECT users.id, recipient_id, firstname, lastname, imgurl, status
        FROM friends
        JOIN users
        ON (status = 1 AND recipient_id = $1 AND sender_id = users.id)
        OR (status = 1 AND sender_id = $1 AND recipient_id = users.id)
        OR (status = 2 AND recipient_id = $1 AND sender_id = users.id)
        OR (status = 2 AND sender_id = $1 AND recipient_id = users.id)
    `;
    const params = [currentUser];
    return db.query(q, params);
};

exports.getAllUsers = function() {
    const q = `
    SELECT id, firstname, lastname, imgurl
    FROM users
    `;
    return db.query(q);
};

exports.getUsersByIds = function(arrayOfIds) {
    const q = `
        SELECT id, firstname, lastname, imgurl FROM users
        WHERE id = ANY($1)
    `;
    const params = [arrayOfIds];
    return db.query(q, params);
};

exports.saveChatMessage = function(currentUser, message) {
    const q = `
        INSERT INTO groupchat (user_id, message)
        VALUES ($1, $2)
        RETURNING id, message, created_at
    `;
    const params = [currentUser, message || null];
    return db.query(q, params);
};

exports.getChatMessages = function() {
    const q = `
        SELECT groupchat.id, users.id as user_id, firstname, lastname, imgurl, message, groupchat.created_at
        FROM groupchat
        LEFT JOIN users
        ON users.id = groupchat.user_id
        ORDER BY groupchat.created_at DESC
        LIMIT 10
    `;
    return db.query(q);
};

exports.savePrivateMessage = function(currentUser, currentOpp, message) {
    const q = `
        INSERT INTO privatechat (sender_id, recipient_id, message)
        VALUES ($1, $2, $3)
        RETURNING id, message, created_at
    `;
    const params = [currentUser, currentOpp, message];
    return db.query(q, params);
};

exports.getPrivateMessages = function(currentUser, otherUser) {
    const q = `
        SELECT privatechat.id, sender_id, recipient_id, users.id as user_id, firstname, lastname, imgurl, message, privatechat.created_at
        FROM privatechat
        LEFT JOIN users
        ON users.id = sender_id
        WHERE (sender_id = $1 AND recipient_id = $2)
        OR (sender_id = $2 AND recipient_id = $1)
        ORDER BY privatechat.created_at DESC
    `;
    const params = [currentUser, otherUser];
    return db.query(q, params);
};

exports.searchUsers = function(query) {
    const q = `
        SELECT id, firstname, lastname, imgurl
        FROM users
        WHERE firstname ILIKE $1
        OR lastname ILIKE $1
        OR firstname || ' ' || lastname ILIKE $1
        OR lastname || ' ' || firstname ILIKE $1
        LIMIT 5
    `;
    const params = [query + "%"];
    return db.query(q, params);
};
