const express = require("express");
const router = express.Router();
const {
    getSignature,
    getCurrentUserDetails,
    addSignature,
    getPetitionersCount,
    listAllPetitioner,
    getPetitionerByCity,
    getProfileValue,
    updateUserWithPass,
    updateUser,
    editProfile,
    deleteSignature,
    delete1,
    delete2,
    delete3,
} = require("../db");

const { body, validationResult } = require("express-validator");
const { hash, compare } = require("../bcrypt");
const { checkUrl } = require("../public/utils/checkurl");

let canvasScript = [{ script: "/scripts/canvas.js" }];

let userdetails;

router.get("/", (req, res) => {
    return res.redirect("/petition");
});

/****************** P E T I T I O N *********************/
router.get("/petition", (req, res) => {
    if (req.session.user_id) {
        getSignature(req.session.user_id).then((user) => {
            if (user) {
                userdetails = {
                    signature: user.signature,
                };
                return res.redirect("/signed");
            } else {
                user_id = req.session.user_id;
                let currentUser;

                getCurrentUserDetails(user_id)
                    .then((user) => {
                        currentUser = {
                            firstName: user.first_name,
                            lastName: user.last_name,
                            user_id: user_id,
                        };
                        return currentUser;
                    })
                    .then((user) =>
                        res.render("petition_form", {
                            user,
                            scripts: canvasScript,
                        })
                    );
            }
        });
    } else res.redirect("/signup");
});

router.post("/petition", body("signatureUrl").isDataURI(), (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.render("petition_form", {
            error: " no !!!",
            scripts: canvasScript,
        });
    }
    // check fields
    if (!req.body.signatureUrl) {
        return res.render("petition_form", {
            error: "Sign it",
            scripts: canvasScript,
        });
    }

    addSignature({
        user_id: req.session.user_id,
        // signature: "req.body.signatureUrl",
        signature: req.body.signatureUrl,
    })
        .then((result) => {
            //set cookies
            return res.redirect("/");
        })
        .catch((err) => console.log(err));
});

/************* T H A N K S **************/
router.get("/signed", (req, res) => {
    getPetitionersCount()
        .then((count) => {
            return res.render("petition_signed", {
                count: count,
                signature: userdetails.signature,
            });
        })
        .catch((error) => {
            //need to look routes
            return res.redirect("/");
        });
});

/********************* S I G N E R S  L I S T ************************** */
router.get("/petition/signers", (req, res) => {
    if (req.session.user_id) {
        listAllPetitioner().then((result) => {
            return res.render("petition_signers", { user: result });
        });
    } else res.redirect("/");
});

/********************* S I G N E R S  L I S T  C I T Y************************** */
router.get("/petition/signers/:city", (req, res) => {
    if (req.session.user_id) {
        const city = req.params.city;
        getPetitionerByCity(city)
            .then((result) => {
                return res.render("city_signers", { user: result, city: city });
            })
            .catch((err) => res.redirect("/"));
    } else res.redirect("/");
});

/******************** P R O F I L E  ************************* */
router.get("/profile", (req, res) => {
    if (req.session.currentUrl === "/signup") {
        req.session.currentUrl = null;
        return res.render("profile_form");
    } else res.redirect("/");
});

router.post(
    "/profile",
    body("age")
        .isInt()
        .withMessage("age must be integer")
        .optional({ nullable: true, checkFalsy: true }),
    (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            const msg = errors.array()[0].msg;
            return res.render("profile_form", {
                error: msg,
            });
        }
        if (req.body.submit == "skip") {
            editProfile({
                user_id: req.session.user_id,
                age: null,
                city: "",
                url: "",
            }).then(() => res.redirect("/"));
        } else {
            const { age, city, url } = req.body;

            let safe = checkUrl(url);
            let realage = age ? age : null;
            editProfile({
                user_id: req.session.user_id,
                age: realage,
                city,
                url: safe,
            })
                .then(() => res.redirect("/"))
                .catch((err) => console.log(error));
        }
    }
);

/********************* E D I T F O R M ************************** */
router.get("/profile/edit", (req, res) => {
    console.log(req.session.user_id);
    getProfileValue(req.session.user_id)
        .then((user) => {
            return res.render("profile_edit", { user });
        })
        .catch((err) => res.redirect("/"));
});

router.post(
    "/profile/edit",
    body("age")
        .isInt()
        .withMessage("age must be integer")
        .optional({ nullable: true, checkFalsy: true }),
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            const msg = errors.array()[0].msg;
            console.log(msg);
            getProfileValue(req.session.user_id)
                .then((user) => {
                    return res.render("profile_edit", { user, error: msg });
                })
                .catch((err) => res.redirect("/"));
        } else {
            let user_id = req.session.user_id;
            let { first_name, last_name, email, password, city, url, age } =
                req.body;

            if (password) {
                hash(password)
                    .then((hashPassword) => {
                        updateUserWithPass({
                            user_id,
                            first_name,
                            last_name,
                            email,
                            password: hashPassword,
                        });
                    })
                    .catch((err) => console.log(err));
            } else {
                updateUser({
                    user_id,
                    first_name,
                    last_name,
                    email,
                }).catch((err) => console.log(err));
            }
            safe = checkUrl(url);
            let realage = age ? age : null;
            editProfile({ user_id, age: realage, city, url: safe })
                .then(() => res.redirect("/"))
                .catch((err) => console.log(err));
        }
    }
);

/********************* D E L E T E  S I G N ************************** */
router.post("/signature/delete", (req, res) => {
    let user_id = req.session.user_id;
    deleteSignature(user_id)
        .then(() => res.redirect("/"))
        .catch((err) => console.log(err));
});

/********************* D E L E T E  USER ************************** */
router.post("/delete/user", (req, res) => {
    let user_id = req.session.user_id;
    Promise.all([delete1(user_id), delete2(user_id), delete3(user_id)])
        .then(() => {
            req.session = null;
            return res.redirect("/");
        })
        .catch((err) => console.log(err));
});

module.exports = router;
