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
} = require("../db");

const { hash, compare } = require("../bcrypt");
const { checkUrl } = require("../public/utils/checkurl");

let canvasScript = [{ script: "/scripts/canvas.js" }];

let userdetails;
//SIGNATURE MIDDLEWARE
// router.use("/petition", (req, res, next) => {
//     console.log("url: ", req.url);
//     console.log("baseurl: ", req.baseUrl);
//     console.log("original url: ", req.originalUrl);

//     getSignature(req.session.user_id).then((user) => {
//         if (user) {
//             userdetails = {
//                 signature: user.signature,
//             };
//             return res.redirect("/signed");
//         }
//     });

//     next();
// });
router.get("/", (req, res) => {
    return res.redirect("/petition");
});

/****************** P E T I T I O N *********************/
router.get("/petition", (req, res) => {
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
                    res.render("petition_form", { user, scripts: canvasScript })
                );
        }
    });
});

router.post("/petition", (req, res) => {
    // check fields
    if (!req.body.signatureUrl) {
        return res.render("petition_form", { error: "Sign it" });
    }

    addSignature({
        user_id: req.session.user_id,
        // signature: "req.body.signatureUrl",
        signature: req.body.signatureUrl,
    }).then((result) => {
        //set cookies
        return res.redirect("/");
    });
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
            return console.log(error);
        });
});

/********************* S I G N E R S  L I S T ************************** */
router.get("/petition/signers", (req, res) => {
    listAllPetitioner().then((result) => {
        return res.render("petition_signers", { user: result });
    });
});

/********************* S I G N E R S  L I S T  C I T Y************************** */
router.get("/petition/signers/:city", (req, res) => {
    const city = req.params.city;
    getPetitionerByCity(city).then((result) => {
        return res.render("city_signers", { user: result, city: city });
    });
});

/******************** P R O F I L E  ************************* */
router.get("/profile", (req, res) => {
    if (req.session.currentUrl === "/signup") {
        req.session.currentUrl = null;
        return res.render("profile_form");
    } else res.redirect("/");
});

router.post("/profile", (req, res) => {
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
});

/********************* E D I T F O R M ************************** */
router.get("/profile/edit", (req, res) => {
    console.log(req.session.user_id);
    getProfileValue(req.session.user_id).then((user) => {
        return res.render("profile_edit", { user });
    });
});

router.post("/profile/edit", (req, res) => {
    let user_id = req.session.user_id;
    let { first_name, last_name, email, password, city, url, age } = req.body;

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
});

/********************* D E L E T E  S I G N ************************** */
router.post("/signature/delete", (req, res) => {
    let user_id = req.session.user_id;
    deleteSignature(user_id)
        .then(() => res.redirect("/"))
        .catch((err) => console.log(err));
});

module.exports = router;
