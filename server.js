const express = require("express");
const app = express();
const path = require("path");
const cookieSession = require("cookie-session");
const {
    addPetitioner,
    getPetitionersCount,
    getPetitioners,
    authenticateUser,
    getCurrentUserDetails,
    addSignature,
    getSignature,
    userEmailExist,
    addUserProfile,
    listAllPetitioner,
} = require("./db");
const { hash, compare } = require("./bcrypt");

//handlerbar
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

// install middleware to help us read POST body (form data) easily
app.use(express.urlencoded({ extended: false }));

app.use(
    cookieSession({
        name: "session",
        keys: ["I am hungry"],
        maxAge: 1000 * 60 * 60 * 24 * 14, // 24 * 14 hours
    })
);
// app.use((req, res, next) => {
//     console.log("---------------------");
//     console.log("req.url:", req.url);
//     console.log("req.method:", req.method);
//     console.log("req.session:", req.session);
//     console.log("---------------------");
//     next();
// });

//check for session cookies
function auth(req, res, next) {
    //check if signed
    if (!req.session.user_id) {
        return res.redirect("/login");
    } else {
        next();
    }
}

//App start
app.get("/", auth, (req, res) => {
    console.log("kjdkddddn");
    getSignature(req.session.user_id).then((user) => {
        if (user) {
            console.log("here");
            getPetitionersCount().then((count) => {
                return res.render("petition_signed", {
                    count: count,
                    signature: user.signature,
                });
            });
        } else {
            return res.redirect("/petition");
        }
    });
});

app.get("/login", (req, res) => {
    return res.render("login_form");
});

// login action
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    userEmailExist(email)
        .then((user) => {
            if (user) {
                compare(password, user.password).then((result) => {
                    if (result) {
                        // store the id of the logged in user inside the session cookie
                        req.session.user_id = user.id;
                        return res.redirect("/");
                    } else {
                        console.log("herer2");
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
});

//signup route
app.get("/signup", (req, res) => {
    return res.render("signup_form");
});

//signup post
app.post("/signup", (req, res) => {
    // check fields
    const { first_name, last_name, email, password } = req.body;
    if (!first_name || !last_name || !email || !password) {
        return res.render("signup_form", { error: "Fill all fields" });
    }
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
                return res.redirect("/profile");
            })
            .catch(() => {
                res.render("signup_form", {
                    error: "signup failed!",
                });
            });
    });
});

app.get("/profile", (req, res) => {
    return res.render("profile_form");
});

app.post("/profile", (req, res) => {
    const { age, city, url } = req.body;

    let safe = url.startsWith("http://")
        ? url
        : url.startsWith("https://")
        ? url
        : "";
    console.log("hhebdhedvhe", req.session.user_id);
    let realage = age ? age : null;
    addUserProfile({
        age: realage,
        url: safe,
        city,
        user_id: req.session.user_id,
    }).then(() => res.redirect("/"));
});
//logout
app.get("/logout", (req, res) => {
    req.session = null;
    return res.redirect("/");
});

app.get("/petition", (req, res) => {
    user_id = req.session.user_id;
    let currentUser;
    //grab all detail
    getCurrentUserDetails(user_id)
        .then((user) => {
            req.session.first_name = user.first_name;
            req.session.last_name = user.last_name;
            currentUser = {
                firstName: user.first_name,
                lastName: user.last_name,
                user_id: user_id,
            };
            return currentUser;
        })
        .then((user) => res.render("petition_form", { user }));
});

app.post("/petition", (req, res) => {
    const submit = req.body.submit;
    //check if submit button clicked

    // check fields
    if (!req.body.signatureUrl) {
        return res.render("petition_form", { error: "Fill all fields" });
    }

    addSignature({
        user_id: req.session.user_id,
        // signature: "req.body.signatureUrl",
        signature: req.body.signatureUrl,
    }).then((result) => {
        //set cookies
        return res.redirect("/signed");
    });
});

app.get("/signed", (req, res) => {
    let user;
    getSignature(req.session.user_id)
        .then((result) => {
            user = {
                first_name: req.session.first_name,
                last_name: req.session.last_name,
                signature: result.signature,
            };
        })
        .then(
            getPetitionersCount().then((count) => {
                return res.render("petition_signed", {
                    count: count,
                    signature: user.signature,
                });
            })
        );
});

app.get("/petition/signers", (req, res) => {
    // getPetitioners().then((signers) =>
    //     res.render("petition_signers", { signers: signers })
    // );

    listAllPetitioner().then((result) => {
        console.log("#####", result);
        return res.render("petition_signers", { user: result });
    });
});

app.use("/", express.static(path.join(__dirname, "public")));

app.listen(8000, () => {
    console.log("PORT 8000");
});

//LOGOUT
// path /logout
// req.session = null
//redirect t0 /
