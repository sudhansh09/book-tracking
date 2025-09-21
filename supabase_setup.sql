-- Create the book table in Supabase
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE book (
    id SERIAL PRIMARY KEY,
    title VARCHAR NOT NULL,
    rate NUMERIC,
    book_date DATE,
    note VARCHAR,
    isbn VARCHAR
);

-- Insert your data
INSERT INTO book (title, rate, book_date, note, isbn) VALUES
('Do Epic Shit', 5.00, '2025-04-11', 'Its a nice book', '9391165486'),
('The Kite Runner', 4.00, '2025-04-11', 'To chase a Kite', '9781594631931'),
('The Little Prince', 2.00, '2024-10-28', 'nice!!', '9780156012195'),
('To Kill a Mockingbird', 5.00, '2024-10-28', 'Kill.!', '9780099549482');

-- Verify the data was inserted
SELECT * FROM book;
