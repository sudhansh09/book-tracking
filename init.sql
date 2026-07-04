CREATE TABLE IF NOT EXISTS book (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    rate NUMERIC(2,1),
    book_date DATE,
    isbn VARCHAR(20),
    note TEXT
);