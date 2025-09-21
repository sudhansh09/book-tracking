# Book Management App - Supabase Deployment Guide

## Step-by-Step Migration from Local PostgreSQL to Supabase

### 1. Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be set up (takes a few minutes)

### 2. Get Supabase Connection Details
1. Go to **Settings > API** in your Supabase dashboard
2. Copy your **Project URL** and **anon public key**
3. Go to **Settings > Database**
4. Copy your **Database password** (you set this during project creation)
5. Your database host will be: `db.your-project-id.supabase.co`

### 3. Set Up Database
1. Go to **SQL Editor** in your Supabase dashboard
2. Run the SQL script from `supabase_setup.sql`:
   ```sql
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
   ```

### 4. Configure Environment Variables
1. Update `supabase.env` with your actual Supabase credentials:
   ```
   SUPABASE_URL=https://your-project-id.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   DB_USER=postgres
   DB_HOST=db.your-project-id.supabase.co
   DB_NAME=postgres
   DB_PASS=your-database-password
   DB_PORT=5432
   ```

### 5. Test Locally with Supabase
1. Run: `npm start` (uses Supabase)
2. Or run: `npm run dev` (uses local PostgreSQL)
3. Visit `http://localhost:3000`

### 6. Deploy to Production

#### Option A: Deploy to Vercel (Recommended)
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Set environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `DB_USER`
   - `DB_HOST`
   - `DB_NAME`
   - `DB_PASS`
   - `DB_PORT`

#### Option B: Deploy to Railway
1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy automatically

#### Option C: Deploy to Heroku
1. Install Heroku CLI
2. Run: `heroku create your-app-name`
3. Set environment variables: `heroku config:set SUPABASE_URL=...`
4. Deploy: `git push heroku main`

### 7. Environment Variables for Production
Make sure to set these in your deployment platform:
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `DB_USER`: postgres
- `DB_HOST`: db.your-project-id.supabase.co
- `DB_NAME`: postgres
- `DB_PASS`: Your Supabase database password
- `DB_PORT`: 5432
- `PORT`: (usually set automatically by hosting platform)

### 8. Security Notes
- Never commit your `.env` files to version control
- Use environment variables for all sensitive data
- Supabase handles authentication and security for you
- Consider enabling Row Level Security (RLS) in Supabase for production

### 9. Troubleshooting
- Check Supabase dashboard for database connection issues
- Verify environment variables are set correctly
- Check browser console for JavaScript errors
- Review server logs for backend errors

## Files Created/Modified:
- `index-supabase.js`: Supabase-enabled version of your app
- `supabase.env`: Environment variables for Supabase
- `supabase_setup.sql`: Database setup script
- `package.json`: Updated with start scripts
- `export_db.js`: Script to export local data
- `schema.json` & `data.json`: Exported data from local database
