const express = require("express");
const app = express();

const { addPetitioner } = require("./db");

//handlerbar
const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");

//everytime with post grab  data
app.use(express.urlencoded());

app.get("/petition", (req, res) => {
    //check here if logged
    //else cookies section create

    res.render("petition_form");
});

app.post("/petition", (req, res) => {
    // check fields
    if (!(req.body.first_name || req.body.last_name)) {
        res.send("fill all field");
    }
    addPetitioner({
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        signature: "abc",
    }).then(res.send("Success!"));
});

app.listen(8000, () => {
    console.log("PORT 8000");
});

//LOGOUT
// path /logout
// req.session = null
//redirect t0 /
