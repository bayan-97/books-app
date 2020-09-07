const express = require("express");
const app = express();
const superagent = require("superagent");
require("dotenv").config();
// express setup
const PORT = process.env.PORT || 3000;
app.use(express.static("./public"));
app.use(express.urlencoded());
app.set("view engine", "ejs");
const pg = require('pg');

const client = new pg.Client(process.env.DATABASE_URL);

// routes

app.get("/", (req, res) => {
    const SQL = `SELECT * FROM books`;
    client.query(SQL).then(({ rows }) => {
        console.log(rows);
        res.render("./pages/index", { books: rows });
    })
})
    app.get("/searches/new", (req, res) => {
        res.render("./pages/searches/new");
    });


    app.post("/searches", (req, res) => {
       
        const url = `https://www.googleapis.com/books/v1/volumes?q=${req.body.title}:${req.body.search}`;

        // console.log(url);
        superagent.get(url).then((data1) => {
            // console.log(data.body.items);
            let a=data1.body.items
            const books = a.map((book) => new Book(book));
            console.log(books);
            res.render("pages/searches/show", { book: books });
        });
    });

    app.post("/addBook", (req, res) => {
        // console.log(req.body.description);

        const { title, image_url, author, isbn, description } = req.body;
        safeValues = [title, image_url, author, isbn, description];
        const SQL = `INSERT INTO books (title, image_url, author, isbn, description) VALUES ($1,$2,$3,$4,$5)`;
        client
            .query(SQL, safeValues)
            .then((results) => {

                res.render("pages/books/details", { book: req.body });
            })
            .catch((err) => {
                res.redirect("/");
            });

    })
    app.get("/books/:id", (req, res) => {

        const value = [req.params.id];
    const SQL = `SELECT * FROM books WHERE id = $1`;
    client.query(SQL, value).then(({ rows }) => {
        res.render("pages/books/details", { book: rows[0] });
    });
    })


    function Book(booknew) {
        if (booknew.volumeInfo.imageLinks === undefined) {
            this.image_url  = "https://i.imgur.com/J5LVHEL.jpg";
        } else {
            this.image_url  = booknew.volumeInfo.imageLinks.thumbnail;
        }
        this.title = booknew.volumeInfo.title;
        this.authors = booknew.volumeInfo.authors||"this book didint has auther "
        this.description = booknew.volumeInfo.description||"this book didint has description "
        this.isbn = booknew.volumeInfo.industryIdentifiers[0].identifier||"this book didint has isbn "
    }
    app.use("*", (req, res) => {
        res.status(404).send("NOT FOUND");
    });

    app.use((error, req, res) => {
    res.render("pages/error");
});

client.connect().then(() => {
    app.listen(PORT, () => console.log(`listening on ${PORT}`));
});