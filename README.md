# Beacon - Job Application Tracker

A modern, high-fidelity **Beacon - Job Application Tracker** featuring a **Chrome Extension (MV3)** to scrape and capture applications on the fly and a **Next.js 14 Dashboard** with a **Kanban Board** to organize and review your applications. All synchronized in real-time with a secure **Supabase** backend.

---

## Repository Structure

```text
/extension           # Chrome extension (Vanilla JS, MV3)
/dashboard           # Next.js 14 Web App (App Router, Tailwind CSS, @dnd-kit)
  /app
    /api/jobs        # Next.js proxy API routes
    /dashboard       # Main Kanban board
    /login           # Sign-in page (Google OAuth + Magic Link)
  /components        # React elements
  /lib
    /supabase.ts     # Supabase client SSR setup
README.md            # Setup and user guide
```

---

## Part 1: Supabase Database & Auth Setup

### 1. Database Schema
Open the **SQL Editor** in your Supabase dashboard and run the following script to create the `jobs` table and configure **Row Level Security (RLS)**:

```sql
-- Create jobs table
create table jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  job_title text,
  company_name text,
  location text,
  platform text,
  url text,
  status text default 'Applied',  -- Applied | Interview | Offer | Rejected | Ghosted
  notes text,
  job_description text,
  date_applied date default now(),
  created_at timestamptz default now()
);

-- Enable Row Level Security (RLS)
alter table jobs enable row level security;

-- Create policy allowing authenticated users to manage ONLY their own jobs
create policy "own jobs" on jobs for all using (auth.uid() = user_id);

-- Enable Supabase Realtime for the jobs table
alter publication supabase_realtime add table jobs;
```

### 2. Enable Authentication Providers
1. Go to **Authentication > Providers** in the Supabase Dashboard.
2. Enable **Email** authentication (used for Magic Link fallback login).
3. (Optional) Enable **Google OAuth** provider. Add your Google Client ID and Client Secret if you wish to use Google Login. Ensure you add the Supabase callback redirect URI to your Google Developer Console.

---

## Part 2: Next.js Dashboard Installation & Local Launch

### 1. Configure Environment Variables
Inside the `/dashboard` directory, create a `.env.local` file by copying the template:

```bash
cd dashboard
cp .env.local.example .env.local
```

Open `.env.local` and enter your project URL and Anon key (found under **Project Settings > API** in Supabase):

```text
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 2. Install Dependencies and Run
Run the following commands inside `/dashboard` to install packages and start the Next.js development server:

```bash
# Install dependencies
npm install

# Start Next.js on port 3000
npm run dev
```

Your web application will run at `http://localhost:3000`.

---

## Part 3: Chrome Extension Loading & Authorization

### 1. Load the Extension in Chrome
1. Open the Google Chrome browser and navigate to `chrome://extensions/`.
2. Toggle the **Developer mode** switch in the top-right corner.
3. Click the **Load unpacked** button in the top-left corner.
4. Select the `/extension` directory in this project workspace.

### 2. Link your Extension to your Dashboard Account
Beacon uses a zero-config synchronization bridge. You never have to manually copy-paste URLs, API keys, or long JWT tokens!

1. Open your browser and log into your Beacon Dashboard (`http://localhost:3000/login` or your deployed URL).
2. Navigate to the dashboard workspace page (`http://localhost:3000/dashboard`).
3. The extension's background observer will instantly detect your dashboard session and synchronize your credentials.
4. Click the **Beacon Extension icon** in your toolbar and go to the **Settings** tab. You'll see the status is green and marked **Connected** with your dashboard URL and session duration synced!

---

## Part 4: How to Track Job Postings

### Floating Scraper
Whenever you navigate to a supported career listing site, a floating **Track Job** button will render in the bottom-right corner. The extension automatically detects and handles scraping for the following sites:
* LinkedIn
* Indeed
* Naukri
* Internshala
* Glassdoor
* Greenhouse listings
* Lever listings
* Workday careers
* Wellfound (AngelList)

Click the **Track Job** button to open the sidebar preview drawer. Verify the details (Title, Company, Location, Date, Description) and select **Save Application**.

### Auto-Prompt on Apply
The extension also listens for clicks on typical apply buttons (e.g. LinkedIn's "Apply Now" button). If clicked, the tracker drawer will automatically slide open to prompt saving the job application to your dashboard before you leave.
