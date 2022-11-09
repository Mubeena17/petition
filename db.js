const spicedPg = require("spiced-pg");

const user = "mubeena";
const password = "12345";
const database = "petition";

const db = spicedPg(`postgres:${user}:${password}@localhost:5432/${database}`);

module.exports.getPetitioners = () => {
    return db.query("SELECT * FROM signatures").then((result) => result.rows);
};

module.exports.addPetitioner = ({ firstName, lastName, signature }) => {
    return db
        .query(
            `INSERT INTO signatures ("first name", "last name", "signature")
    VALUES ($1, $2, $3)
    RETURNING *`,
            [firstName, lastName, signature]
        )
        .then((result) => result.rows[0]);
};

module.exports.getPetitionersCount = () => {
    return db
        .query("SELECT COUNT(signature) FROM signatures")
        .then((result) => result.rows[0].count);
};
