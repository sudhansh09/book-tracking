import express from "express";
import bodyParser from "body-parser";
import { createClient } from "@supabase/supabase-js";

// Use environment variables provided by Vercel
const app = express();

// View engine and static assets
app.set("view engine", "ejs");
app.set("views", "views");

// Vercel serves files under `public/` at the root automatically
// so we don't need express.static here. Keep body parsing for forms.
app.use(bodyParser.urlencoded({ extended: true }));

// Initialize Supabase client (HTTP-based; safe for serverless)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// GET home - list books
app.get("/", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("book")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    const items = data || [];
    const isbn = items.length > 0 ? items[0].isbn : "9780441013593";
    const coverImageUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;

    res.render("index", { listItems: items, coverImage: coverImageUrl });
  } catch (err) {
    console.error("Error occurred:", err?.message || err);
    res.status(500).send("Failed to load page data.");
  }
});

// Render add page
app.get("/add", (req, res) => {
  res.render("add");
});

// Add a book
app.post("/add", async (req, res) => {
  const title = req.body.bookname;
  const rate = req.body.rate;
  const date = req.body.date;
  const note = req.body.note;
  const isbn = req.body.isbn;

  try {
    const { error } = await supabase
      .from("book")
      .insert([{ title, rate: parseFloat(rate), book_date: date, note, isbn }]);

    if (error) throw error;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add book.");
  }
});

// Render edit page
app.get("/edit", (req, res) => {
  res.render("edit");
});

// Update a book
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
      const { error } = await supabase.from("book").update(updates).eq("isbn", isbn);
      if (error) throw error;
    }

    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update book.");
  }
});

// Delete a book
app.post("/delete", async (req, res) => {
  const deleteItemId = req.body.deleteItemId;
  try {
    const { error } = await supabase.from("book").delete().eq("id", Number(deleteItemId));
    if (error) throw error;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to delete book.");
  }
});

// View a single book
app.post("/view", async (req, res) => {
  const isbn = req.body.isbn;
  try {
    const { data, error } = await supabase.from("book").select("*").eq("isbn", isbn);
    if (error) throw error;

    const items = data || [];
    const coverImageUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`;
    res.render("view", {
      listItems: items,
      title: items[0]?.title,
      coverImage: coverImageUrl,
      currentBookId: items[0]?.id,
    });
  } catch (err) {
    console.error("Error occurred:", err?.message || err);
    res.status(500).send("Failed to load book data.");
  }
});

// Export a handler compatible with Vercel Serverless Functions
export default function handler(req, res) {
  return app(req, res);
}


