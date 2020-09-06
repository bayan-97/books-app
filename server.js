const express = require("express");
const app = express();
const superagent = require("superagent");
require("dotenv").config();
// express setup
const PORT = process.env.PORT || 3000;
app.use(express.static("./public"));
app.use(express.urlencoded());
app.set("view engine", "ejs");

// routes

app.get("/", (req, res) => {
    res.render("./pages/index");
});
app.get("/searches/new", (req, res) => {
    res.render("./pages/searches/new");
});

app.post("/searches", (req, res) => {
    console.log(req.body);
    const url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.search}+${req.body.title}`;
    // console.log(url);
    superagent.get(url).then((data) => {
        const books = data.body.items.map((book) => new Book(book));
        res.render("pages/searches/show", { book:books });
    });
});

function Book(booknew) {
    if (booknew.volumeInfo.imageLinks === undefined) {
        this.image = "https://i.imgur.com/J5LVHEL.jpg";
    } else {
        this.image =  booknew.volumeInfo.imageLinks.thumbnail;
    }
    this.title = booknew.volumeInfo.title;
    this.authors = booknew.volumeInfo.authors;
    this.description = booknew.volumeInfo.descriptiont;
}
app.use("*", (req, res) => {
    res.status(404).send("NOT FOUND");
});

app.use((error, req, res) => {
    res.status(500).send(error);
});
app.listen(PORT, () => console.log(`listening on port ${PORT}!`));