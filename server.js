const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");
// const session = require("express-session");
const cookieSession = require("cookie-session");

const { addPetitioner, getPetitionersCount, getPetitioners } = require("./db");

//handlerbar
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

// install middleware to help us read POST body (form data) easily
app.use(express.urlencoded({ extended: false }));

// app.use(
//     session({ secret: "mySecret", resave: false, saveUninitialized: false })
// );

app.use(
    cookieSession({
        name: "session",
        keys: ["I am hungry"],

        // Cookie Options
        maxAge: 1000 * 60 * 60 * 24 * 14, // 24 * 14 hours
    })
);

app.get("/petition", (req, res) => {
    //check here if logged
    //else cookies section create

    //res.render(handlebarname)
    return res.render("petition_form");
});

app.post("/petition", (req, res) => {
    const submit = req.body.submit;
    //check if submit button clicked

    // check fields
    if (!req.body.first_name || !req.body.last_name || !req.body.signatureUrl) {
        return res.render("petition_form", { error: "Fill all fields" });
    }

    addPetitioner({
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        signature: req.body.signatureUrl,
    }).then((result) => {
        //set cookies
        res.cookie("signed", true);
        req.session.petitioner = result;
        return res.redirect("/signed");
    });
});

app.get("/signed", (req, res) => {
    const petitioner = req.session.petitioner;
    console.log("petio: ", petitioner);
    getPetitionersCount().then((count) => {
        res.render("petition_signed", { count: count, petitioner });
    });
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
