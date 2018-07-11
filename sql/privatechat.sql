DROP TABLE IF EXISTS privatechat;

CREATE TABLE privatechat (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES users(id) NOT NULL,
    recipient_id INTEGER REFERENCES users(id) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
