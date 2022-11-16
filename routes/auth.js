const express = require("express");
const router = express.Router();

const { userEmailExist, addPetitioner } = require("../db");
const { hash, compare } = require("../bcrypt");

const { body, validationResult } = require("express-validator");

//AUTH MIDDLEWARE
router.use((req, res, next) => {
    const urls = [
        "/",
        "/signed",
        "/profile",
        "/petition/signers,",
        "/profile/edit",
    ];
    if (urls.includes(req.url) && !req.session.user_id) {
        return res.redirect("/signup");
    } else if (
        (req.url === "/signup" || req.url === "/login") &&
        req.session.user_id
    ) {
        return res.redirect("/petition");
    }
    next();
});

//******* L O G I N ********/

router.get("/signup", (req, res) => {
    return res.render("signup_form");
});

router.get("/login", (req, res) => {
    return res.render("login_form");
});

router.post(
    "/login",
    body("email").isEmail().normalizeEmail(),
    body("password").isLength({ min: 3 }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.render("login_form", {
                error: "Login failed!!!",
            });
        }
        const { email, password } = req.body;

        userEmailExist(email)
            .then((user) => {
                if (user) {
                    compare(password, user.password).then((result) => {
                        if (result) {
                            // store the id of the logged in user inside the session cookie
                            req.session.user_id = user.id;
                            return res.redirect("/petition");
                        } else {
                            res.render("login_form", {
                                error: "Wrong password",
                            });
                        }
                    });
                } else {
                    res.render("login_form", {
                        error: "No user Exist!",
                    });
                }
            })
            .catch(() => {
                res.render("login_form", {
                    error: "Login failed!",
                });
            });
    }
);

//****************** S I N G U P *************************/

router.post(
    "/signup",
    body("email").isEmail().escape().normalizeEmail(),
    body("password")
        .isLength({ min: 3 })
        .withMessage("Password must be at least 3 chars long"),
    body("first_name").not().isEmpty().trim().escape(),
    body("last_name").not().isEmpty().trim().escape(),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const msg = errors.array()[0].msg;
            return res.render("signup_form", {
                error: msg,
            });
        }
        // check fields
        const { first_name, last_name, email, password } = req.body;
        if (!(first_name && last_name && email && password)) {
            return res.render("signup_form", { error: "Fill all fields" });
        }
        userEmailExist(email)
            .then((user) => {
                if (user) {
                    return res.render("signup_form", {
                        error: "email exist!",
                    });
                } else {
                    hash(password).then((hashPassword) => {
                        addPetitioner({
                            firstName: first_name,
                            lastName: last_name,
                            email: email,
                            password: hashPassword,
                        })
                            .then((user) => {
                                //set session user_id
                                req.session.user_id = user.id;
                                req.session.currentUrl = req.url;
                                return res.redirect("/profile");
                            })
                            .catch(() => {
                                res.render("signup_form", {
                                    error: "signup failed!",
                                });
                            });
                    });
                }
            })
            .catch(() => {
                res.render("signup_form", {
                    error: "signup failed!",
                });
            });
    }
);

//****************** L O G O U T **********************/
router.get("/logout", (req, res) => {
    req.session = null;
    return res.redirect("/");
});

module.exports = router;
