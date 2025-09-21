import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const app = express();
const port = 3000;

const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

db.connect();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
    { id: 1, title: "Harry Potter", rate: 4.00, book_date: "2024-04-14",isbn: 9780747532699, note: "its a nice mistry book"},
    { id: 2, title: "Never have I ever", rate: 3.90, book_date: "2024-06-12",isbn: 9781917180047, note: "book about teen love & their problems"},
]

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book;");
        const items = result.rows;
        const isbn = items.length > 0 ? items[0].isbn : "9780441013593"; // Default ISBN if no items
        console.log("Items fetched from database:", items );

        const response = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);

        res.render("index", { listItems: items, coverImage: response});
    } 
    catch (error) {
        console.log("Error occurred:", error.message);
        res.status(500).send("Failed to load page data.");
    }
});

app.get("/add", (req, res) => {
    res.render("add");
});

app.post("/add", async(req,res) =>{
    const title = req.body.bookname;
    const rate = req.body.rate;
    const date = req.body.date;
    const note = req.body.note;
    const isbn = req.body.isbn;

    try{
      const result = await db.query("INSERT INTO book (title, rate, book_date, note, isbn) VALUES ($1, $2, $3, $4, $5);",
            [title,rate,date,note,isbn]
        );

        res.redirect("/");
    }
    catch(err)
    {
        console.log(err);
    }
})


app.get("/edit", (req, res) => {
    res.render("edit");
});

app.post("/edit", async(req, res) =>{
    const isbn = req.body.isbn;
    const title = req.body.updatetitle;
    const rate = req.body.updaterate;
    const date = req.body.updatedate;
    const note = req.body.updatenote;
    if(title){
        await db.query("UPDATE book SET title = ($1) WHERE isbn = $2;",
            [title, isbn]
        );
        res.redirect("/");
    }else if(rate)
    {
        await db.query("UPDATE book SET rate = ($1) WHERE isbn = $2;",
            [rate, isbn]
        );
        res.redirect("/");
    }else if(date)
    {
        await db.query("UPDATE book SET date = ($1) WHERE isbn = $2;",
            [date, isbn]
        );
        res.redirect("/");
    }else if(note)
    {
        await db.query("UPDATE book SET note = ($1) WHERE isbn = $2;",
            [note, isbn]
        );
        res.redirect("/");
    }else
    {
        await db.query("UPDATE book SET title = ($1) WHERE isbn = $2;",[title, isbn]);
        await db.query("UPDATE book SET rate = ($1) WHERE isbn = $2;",[rate, isbn]);
        await db.query("UPDATE book SET date = ($1) WHERE isbn = $2;",[date, isbn]);
        await db.query("UPDATE book SET note = ($1) WHERE isbn = $2;",[note, isbn]);
        res.redirect("/");
    }
})

app.post("/delete", async (req, res) =>{
    const deleteItem = req.body.deleteItemId;
    try{
        await db.query("DELETE FROM book where id = ($1);", [deleteItem]);
        res.redirect("/");
    }
    catch(err)
    {
        console.log(err);
    }
});

app.post("/view", async (req, res) => {
    const isbn = req.body.isbn;
    try {
        const result = await db.query("SELECT * FROM book WHERE isbn = $1;", [isbn]);
        const items = result.rows;
        const coverImageUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
        res.render("view", { listItems: items, title: items[0]?.title, coverImage: coverImageUrl, currentBookId: currentBookId });
    } catch (error) {
        console.log("Error occurred:", error.message);
        res.status(500).send("Failed to load book data.");
    }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});