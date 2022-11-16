const { query } = require("express");
const spicedPg = require("spiced-pg");

require("dotenv").config();

//const { USER, PASS, DATABASE, DATABASE_URL } = process.env;

//const db = spicedPg(`postgres:${USER}:${PASS}@localhost:5432/${DATABASE}`);
// const { USER, PASS, DATABASE_URL } = process.env;

// const db = spicedPg(DATABASE_URL);

const db = spicedPg(
    process.env.DATABASE_URL ||
        `postgres:${process.env.USER}:${process.env.PASS}@localhost:5432/${process.env.DATABASE}`
);

module.exports.getPetitioners = () => {
    return db.query("SELECT * FROM users").then((result) => result.rows);
};
//signup
module.exports.addPetitioner = ({ firstName, lastName, email, password }) => {
    return db
        .query(
            `INSERT INTO users ("first_name", "last_name", "email", "password")
    VALUES ($1, $2, $3, $4)
    RETURNING id`,
            [firstName, lastName, email, password]
        )
        .then((result) => result.rows[0]);
};

module.exports.getPetitionersCount = () => {
    return db
        .query("SELECT COUNT(signature) FROM signatures")
        .then((result) => result.rows[0].count);
};

module.exports.getUserDetail = (email, password) => {
    return db
        .query(
            `SELECT first_name, last_name, id FROM users WHERE email=$1 AND password=$2`,
            [email, password]
        )
        .then((result) => result.rows[0]);
};

module.exports.authenticateUser = (email, password) => {
    return db
        .query(`SELECT * FROM users WHERE email=$1 AND password=$2`, [
            email,
            password,
        ])
        .then((result) => result.rows[0]);
};

module.exports.getCurrentUserDetails = (user_id) => {
    return db
        .query(`SELECT * FROM users WHERE id=$1`, [user_id])
        .then((result) => result.rows[0]);
};

module.exports.addSignature = ({ user_id, signature }) => {
    return db
        .query(
            `INSERT INTO signatures ("user_id", "signature") VALUES ($1, $2) RETURNING id`,
            [user_id, signature]
        )
        .then((result) => result.rows[0]);
};

module.exports.getSignature = (user_id) => {
    return db
        .query(`SELECT signature FROM signatures WHERE user_id=$1 `, [user_id])
        .then((result) => {
            if (result.rows.length > 0) return result.rows[0];
            return false;
        });
};

module.exports.userEmailExist = (email) => {
    return db
        .query(`SELECT email, password, id FROM users WHERE email=$1`, [email])
        .then((result) => {
            if (result.rows.length > 0) return result.rows[0];
            return false;
        });
};

module.exports.addUserProfile = ({ age, url, city, user_id }) => {
    return db
        .query(
            `INSERT INTO user_profile ("age", "url", "city", "user_id")
    VALUES ($1, $2, $3, $4)
    `,
            [age, url, city, user_id]
        )
        .then((result) => result.rows[0]);
};

module.exports.listAllPetitioner = () => {
    return db
        .query(
            `SELECT users.first_name AS first_name, users.last_name AS last_name , user_profile.age AS age,
    user_profile.city AS city, user_profile.url AS url
FROM users
JOIN user_profile
ON users.id = user_profile.user_id`
        )
        .then((result) => result.rows);
};

module.exports.getPetitionerByCity = (city) => {
    return db
        .query(
            `SELECT users.first_name AS first_name, users.last_name AS last_name , user_profile.age AS age,
    user_profile.url AS url
FROM users
JOIN user_profile
ON users.id = user_profile.user_id WHERE LOWER(user_profile.city)=LOWER($1)`,
            [city]
        )
        .then((result) => result.rows);
};

module.exports.getProfileValue = (user_id) => {
    return db
        .query(
            `SELECT users.first_name AS first_name, users.last_name AS last_name, users.email AS email, users.password AS password,
        user_profile.city as city, user_profile.age AS age, user_profile.url AS url
        FROM users
        JOIN user_profile
        ON user_profile.user_id = users.id
        WHERE user_id = $1`,
            [user_id]
        )
        .then((result) => result.rows[0]);
};

module.exports.editProfile = ({ user_id, age, city, url }) => {
    return db
        .query(
            `INSERT INTO user_profile (user_id, age, city, url)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (user_id)
    DO UPDATE SET age=$2, city=$3, url=$4
        `,
            [user_id, age, city, url]
        )
        .catch((err) => console.log(err));
};
module.exports.updateUser = ({ user_id, first_name, last_name, email }) => {
    return db.query(
        `UPDATE users
                    SET first_name=$2, last_name=$3, email=$4
                    WHERE id=$1`,
        [user_id, first_name, last_name, email]
    );
};

module.exports.updateUserWithPass = ({
    user_id,
    first_name,
    last_name,
    email,
    password,
}) => {
    return db.query(
        `UPDATE users
                    SET first_name=$2, last_name=$3, email=$4, password=$5
                    WHERE id=$1`,
        [user_id, first_name, last_name, email, password]
    );
};

module.exports.deleteSignature = (user_id) => {
    return db.query(
        `
            DELETE FROM signatures
            WHERE user_id=$1
        `,
        [user_id]
    );
};

module.exports.delete1 = (user_id) => {
    return db.query(`DELETE FROM signatures WHERE user_id = $1`, [user_id]);
};
module.exports.delete2 = (user_id) => {
    return db.query(`DELETE FROM user_profile WHERE user_id = $1`, [user_id]);
};
module.exports.delete3 = (user_id) => {
    return db.query(`DELETE FROM users WHERE id = $1`, [user_id]);
};
