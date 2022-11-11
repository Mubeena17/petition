const spicedPg = require("spiced-pg");
const user = "mubeena";
const password = "12345";
const database = "petition";

const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

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
