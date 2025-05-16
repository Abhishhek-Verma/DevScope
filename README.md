# 🛠 DevScope

**DevScope** is a full-stack developer productivity web app that transforms your GitHub activity into beautiful, insightful dashboards and AI-generated professional summaries. Ideal for building a public developer portfolio, visualizing contributions, and standing out with a smart AI profile.

---

## 📌 Overview

DevScope integrates with GitHub to fetch your contribution data and visualizes it using sleek UI components. It also uses OpenAI to generate a polished summary of your developer profile — great for LinkedIn, resumes, or public portfolios.

---

## 🎯 Key Features

- 🔐 **GitHub OAuth2 Login**  
  Secure login using GitHub authentication.

- 🧠 **GitHub Data Fetching (GraphQL API)**  
  Pulls your GitHub data: profile, repos, commits, issues, PRs, languages, and stars (last 6 months).

- 📊 **Analytics Dashboard**  
  - Charts for commit activity & top languages  
  - Stats: PRs, stars, issues, forks  
  - Tables: top repositories

- 🤖 **AI Contribution Summary**  
  - Uses OpenAI GPT-4 to turn your GitHub activity into a professional summary  
  - Perfect for portfolio or LinkedIn use

- 🌐 **Public Portfolio Generator**  
  - Route: `/u/:username`  
  - Includes GitHub avatar, stats, AI summary  
  - Shareable and exportable to PDF/Markdown

---

## ⚙ Tech Stack

### 🖥 Frontend
- React + Tailwind CSS
- Recharts / Chart.js for data visualization

### 🔧 Backend
- Node.js + Express
- GitHub GraphQL API
- OpenAI API (GPT-3.5 or GPT-4)

### 💾 Database
- PostgreSQL with Prisma ORM or Supabase
- Tables:
  - `users`: GitHub user info + access token
  - `repos`: Contribution data
  - `summaries`: AI-generated summaries

### 🔐 Auth
- GitHub OAuth2 flow
- Access tokens stored securely

---

## 📤 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/github` | GitHub OAuth callback |
| GET | `/api/user/:username/stats` | Get contribution stats |
| POST | `/api/user/:username/summary` | Generate or fetch AI summary |
| GET | `/api/user/:username/portfolio` | Public portfolio data |

---




🎁 Bonus Features
 
🏆 GitHub Contributor Leaderboard

⏰ Daily sync with GitHub using webhooks

📤 Export to Notion or resume builder formats

---

🙌 Acknowledgements

* GitHub GraphQL API

* OpenAI API

* Recharts

* Tailwind CSS

* Prisma / Supabase

---

🧪 Status
🚧 In Development — contributions, feedback, and ideas are welcome!



