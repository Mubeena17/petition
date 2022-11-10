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
} = require("./db");

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

//check for session cookies
function auth(req, res, next) {
    if (!req.session.user_id) {
        return res.redirect("/login");
    } else {
        next();
    }
}

//App start
app.get("/", auth, (req, res) => {
    return res.redirect("/petition");
});

app.get("/login", (req, res) => {
    return res.render("login_form");
});

// login action
app.post("/login", (req, res) => {
    const { email, password } = req.body;

    // authenticateUser() returns a Promise
    // if the authentication is successful, the promise is resolved
    // with the logged in user (object)
    // if authentication fails, the promise is rejected
    authenticateUser(email, password)
        .then((user) => {
            // store the id of the logged in user inside the session cookie
            req.session.user_id = user.id;
            res.redirect("/petition");
        })
        .catch(() => {
            res.render("login", {
                message: "Login failed!",
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
    addPetitioner({
        firstName: first_name,
        lastName: last_name,
        email: email,
        password: password,
    }).then((user) => {
        //set session user_id
        req.session.user_id = user.id;
        return res.redirect("/petition");
    });
});

//logout
app.get("/logout", (req, res) => {
    req.session = null;
    res.clearCookie("signed");
    return res.redirect("/petition");
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
        res.cookie("signed", true);
        // not working req.session.signature = req.body.signatureUrl;
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
                    petitioner: user,
                });
            })
        );
});

app.get("/signers", (req, res) => {
    getPetitioners().then((signers) =>
        res.render("petition_signers", { signers: signers })
    );
});

app.use("/", express.static(path.join(__dirname, "public")));

app.listen(8000, () => {
    console.log("PORT 8000");
});

//LOGOUT
// path /logout
// req.session = null
//redirect t0 /
