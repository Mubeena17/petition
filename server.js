const express = require("express");
const app = express();
const authRouter = require("./routes/auth");
const petitionRouter = require("./routes/petition");
const cookieSession = require("cookie-session");
const path = require("path");
require("dotenv").config();
const { PORT } = process.env;

//handlerbar
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

// install middleware to help us read POST body (form data) easily
app.use(express.urlencoded({ extended: false }));

app.use(
    // used for created a Session object (req.session) and persist this object
    cookieSession({
        secret: `I'm always hungry.`,
        maxAge: 1000 * 60 * 60 * 24 * 14,
        sameSite: false,
    })
);

app.use(authRouter);
app.use(petitionRouter);

app.use("/", express.static(path.join(__dirname, "public")));

app.use((req, res) => {
    res.status(404).render("not_found", {
        title: "Sorry, page not found",
    });
});

app.listen(PORT, () => {
    console.log("server listening to localhost:", PORT);
});
