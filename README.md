# HackConnect

HackConnect is a modern, full-stack web application designed to facilitate hackathon discovery, management, and team collaboration. The platform connects passionate developers with exciting hackathons, providing an intuitive interface for both participants and administrators.

## 🚀 Features

- **User Profiles & Authentication:** Secure JWT-based authentication. Users can create profiles showcasing their skills, certifications, GitHub, and LinkedIn links.
- **Global Communications Hub (NEW):** Real-time chat system synchronized via Spring Boot backend and MySQL, allowing global communication across all active users.
- **Progressive Web App (PWA) Support:** Installable on Android and iOS devices directly from Chrome, featuring splash screens and offline-ready manifestation.
- **Responsive Admin Portal:** A data-heavy dashboard completely optimized for mobile devices with adaptive grids and horizontal scrolling tables.
- **Event Discovery & Registration:** Users can browse upcoming or ongoing hackathons and submit their applications.
- **Approval Workflow:** Streamlined process for admins to review, approve, or reject participant registrations.
- **Interactive AI Chatbot:** An integrated smart chatbot to assist users with platform navigation and hackathon queries.
- **Community Intelligence:** Filterable member network with specialized views for discovering collaborators.

## 🛠️ Technology Stack

**Frontend**
- React 18
- Vite & PWA Standard (Service Workers, Manifest)
- Tailwind CSS
- Framer Motion & Lottie React (Animations)

**Backend**
- Java 17
- Spring Boot 3
- Spring Security with JWT Authentication
- Spring Data JPA

**Database**
- MySQL

## 💻 Running Locally

### Prerequisites
Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **Java 17** (JDK)
- **MySQL** Server

### 1. Backend Setup

1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Configure the database: Create a MySQL database (the application will create tables automatically via Hibernate). Update your database credentials if they differ from the defaults in `application.properties`:
   - Default Port: `3306`
   - Default Username: `root`
   - Default Password: `Manoj$2005`
3. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
   *The backend will start running on http://localhost:8080*

### 2. Frontend Setup

1. Open a new terminal and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The frontend will start running on http://localhost:5173* (or another port if 5173 is occupied).

## 🌍 Production Deployment

This project is configured for cloud deployment:
- **Frontend:** Configured for Netlify (includes a `_redirects` file for React Router support and leverages Environment Variables like `VITE_API_URL` for connecting to the remote backend).
- **Backend:** Configured for Render or similar services. Environment variables (like `DB_URL`, `DB_USER`, `DB_PASSWORD`, and `FRONTEND_URL`) dynamically override default configuration without requiring code changes. 
- **Database:** Can be connected to any cloud MySQL provider (like Aiven or Clever Cloud) via environment variables.
