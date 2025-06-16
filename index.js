import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";

const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "book",
    password: "@Sudhansh0912",
    port: 5432
});
db.connect();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [
    { id: 1, title: "Harry Potter", rate: 4.00, book_date: "2024-04-14", note: "its a nice mistry book"},
    { id: 2, title: "Never have I ever", rate: 3.90, book_date: "2024-06-12", note: "book about teen love & their problems"},
]
let currentBookId =[];

app.get("/", async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM book ORDER BY rate DESC;");
        const items = result.rows;

        // Optional: use a book title if available
        const title = items.length > 0 ? items[0].title : "default";

        const response = await axios.get("https://covers.openlibrary.org/b/isbn/0385472579-M.jpg");

        res.render("index.ejs", {
            listItems: items,
            // activity: response.data,
        });
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

    try{
      const result = await db.query("INSERT INTO book (title, rate, book_date, note) VALUES ($1, $2, $3, $4);",
            [title,rate,date,note]
        );
        // const id = result.rows[0].id;
        // currentBookId = id;

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
    const bookId = currentBookId[currentBookId.length + 1];
    const title = req.body.updatetitle;
    const rate = req.body.updaterate;
    const date = req.body.updatedate;
    const note = req.body.updatenote;
    if(title){
        await db.query("UPDATE book SET title = ($1) WHERE id = $2;",
            [title, bookId]
        );
        res.redirect("/");
    }else if(rate)
    {
        await db.query("UPDATE book SET rate = ($1) WHERE id = $2;",
            [rate, bookId]
        );
        res.redirect("/");
    }else if(date)
    {
        await db.query("UPDATE book SET date = ($1) WHERE id = $2;",
            [date, bookId]
        );
        res.redirect("/");
    }else if(note)
    {
        await db.query("UPDATE book SET note = ($1) WHERE id = $2;",
            [note, bookId]
        );
        res.redirect("/");
    }else
    {
        await db.query("UPDATE book SET title = ($1) WHERE id = $2;",[title, bookId]);
        await db.query("UPDATE book SET rate = ($1) WHERE id = $2;",[rate, bookId]);
        await db.query("UPDATE book SET date = ($1) WHERE id = $2;",[date, bookId]);
        await db.query("UPDATE book SET note = ($1) WHERE id = $2;",[note, bookId]);
        res.redirect("/");
    }
})

app.get("/date", async (req, res) => {
    await db.query("SELECT * FROM book ORDER BY book_date ASC;");
    res.redirect("/");
});

app.get("/rate", async (req, res) => {
    await db.query("SELECT * FROM book ORDER BY rate ASC;");
    res.redirect("/");
});

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

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});