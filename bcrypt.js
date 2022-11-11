const bcrypt = require("bcryptjs");
const { promisify } = require("util");

const hash = promisify(bcrypt.hash);
const compare = promisify(bcrypt.compare);
const genSalt = promisify(bcrypt.genSalt);

exports.hash = (password) => {
    return genSalt().then((salt) => {
        return hash(password, salt);
    });
};

exports.compare = compare;
