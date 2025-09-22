import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import axios from "axios";
import dotenv from "dotenv";
import path from "path";
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config({ path: './supabase.env' });

const app = express();
const port = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
);

// Fallback to direct PostgreSQL connection if needed
const db = new pg.Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASS,
    port: process.env.DB_PORT
});

// Connect to database
db.connect().catch(console.error);

app.set("view engine", "ejs");
app.set("views", path.join(process.cwd(), "views"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Helper function to get books using Supabase
async function getBooksSupabase() {
    try {
        const { data, error } = await supabase
            .from('book')
            .select('*')
            .order('id', { ascending: true });
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Supabase error:', error);
        throw error;
    }
}

// Helper function to add book using Supabase
async function addBookSupabase(title, rate, date, note, isbn) {
    try {
        const { data, error } = await supabase
            .from('book')
            .insert([
                { title, rate: parseFloat(rate), book_date: date, note, isbn }
            ])
            .select();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Supabase error:', error);
        throw error;
    }
}

// Helper function to update book using Supabase
async function updateBookSupabase(updates, isbn) {
    try {
        const { data, error } = await supabase
            .from('book')
            .update(updates)
            .eq('isbn', isbn)
            .select();
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Supabase error:', error);
        throw error;
    }
}

// Helper function to delete book using Supabase
async function deleteBookSupabase(id) {
    try {
        const { data, error } = await supabase
            .from('book')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Supabase error:', error);
        throw error;
    }
}

app.get("/", async (req, res) => {
    try {
        const items = await getBooksSupabase();
        const isbn = items.length > 0 ? items[0].isbn : "9780441013593";
        console.log("Items fetched from Supabase:", items);

        const response = await axios.get(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`);

        res.render("index", { listItems: items, coverImage: response });
    } 
    catch (error) {
        console.log("Error occurred:", error.message);
        res.status(500).send("Failed to load page data.");
    }
});

app.get("/add", (req, res) => {
    res.render("add");
});

app.post("/add", async (req, res) => {
    const title = req.body.bookname;
    const rate = req.body.rate;
    const date = req.body.date;
    const note = req.body.note;
    const isbn = req.body.isbn;

    try {
        await addBookSupabase(title, rate, date, note, isbn);
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Failed to add book.");
    }
});

app.get("/edit", (req, res) => {
    res.render("edit");
});

app.post("/edit", async (req, res) => {
    const isbn = req.body.isbn;
    const title = req.body.updatetitle;
    const rate = req.body.updaterate;
    const date = req.body.updatedate;
    const note = req.body.updatenote;

    try {
        const updates = {};
        
        if (title) updates.title = title;
        if (rate) updates.rate = parseFloat(rate);
        if (date) updates.book_date = date;
        if (note) updates.note = note;

        if (Object.keys(updates).length > 0) {
            await updateBookSupabase(updates, isbn);
        }
        
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Failed to update book.");
    }
});

app.post("/delete", async (req, res) => {
    const deleteItemId = req.body.deleteItemId;
    try {
        await deleteBookSupabase(parseInt(deleteItemId));
        res.redirect("/");
    }
    catch (err) {
        console.log(err);
        res.status(500).send("Failed to delete book.");
    }
});

app.post("/view", async (req, res) => {
    const isbn = req.body.isbn;
    try {
        const { data, error } = await supabase
            .from('book')
            .select('*')
            .eq('isbn', isbn);

        if (error) throw error;

        const items = data;
        const coverImageUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
        res.render("view", { 
            listItems: items, 
            title: items[0]?.title, 
            coverImage: coverImageUrl, 
            currentBookId: items[0]?.id 
        });
    } catch (error) {
        console.log("Error occurred:", error.message);
        res.status(500).send("Failed to load book data.");
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    console.log(`Using Supabase: ${process.env.SUPABASE_URL}`);
});
