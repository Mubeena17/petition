DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS user_profile;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,
    -- first_name VARCHAR(255) NOT NULL,
    -- last_name VARCHAR(255) NOT NULL,
    signature text NOT NULL,
    user_id INT NOT NULL REFERENCES users(id)
);

CREATE TABLE user_profile(
    id SERIAL PRIMARY KEY,
    age INTEGER,
    url VARCHAR(255),
    city VARCHAR(255),
    user_id INT NOT NULL REFERENCES users(id),
    CONSTRAINT user_id_constrain UNIQUE (user_id)
);