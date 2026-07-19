# She Can Foundation — NGO Web Portal & Admin Dashboard

A comprehensive, ultra-premium, and highly secure web portal for the **She Can Foundation** (Government Registered NGO). This platform integrates the main public-facing website pages with a Vercel-style matte-black Admin Dashboard to manage applied volunteer candidacies, administer team members, and audit secure portal logins.

---

## ✨ Features

### 🌐 Frontend Website Pages
* **Unified Design System**: Minimalist, high-performance layout built with Vanilla CSS3, featuring fluid responsive typography, stagger grid transitions, and scroll animations.
* **Modern Pages**: Includes home (`index.html`), about story (`about.html`), volunteer applications (`volunteer.html`), donate integrations (`donate.html`), and certification showcases (`certificates.html`).

### 🔒 Admin Dashboard
* **Matte-Black Brutalist Theme**: Sleek matte-black theme (`#09090b`) with sharp block rectangular elements (`0px border-radius`) matching state-of-the-art modern web design.
* **Dashboard Analytics**: Real-time interactive submissions trend chart built using **Chart.js** alongside a live-activity audit logger.
* **Real-time Status Header**: Integrated dynamic clock displaying current date and time in 12-hour format with AM/PM indicators.
* **Volunteers Management**:
  * View applied candidates structured cleanly in a high-density table.
  * **Volunteer Details Viewer**: Expand details into a visual card modal to inspect statement of purpose, email, interest areas, and phone numbers.
  * **Modal Deletion**: Reject/delete candidate profiles directly from inside the details modal.
* **Team & Credentials Management**:
  * Form to appoint new administrators using secure hashing algorithms.
  * Auto-seeding default credentials on startup if the database is empty for seamless zero-config runs.

---

## 🛠️ Technology Stack

* **Frontend**: HTML5, CSS3, ES6+ JavaScript, Chart.js.
* **Backend**: Node.js, Express.js.
* **Database**: MongoDB Atlas, Mongoose ODM.
* **Authentication**: BcryptJS (password hashing), JSON Web Token (signed session authorizations).

---

## 🔑 Login Credentials

> [!IMPORTANT]
> **Dashboard Access:**
> For security reasons, the administrator dashboard is password-protected. 
> To obtain login credentials (email and password), **please contact the system administrator**.

---

## 🚀 Setup & Execution

To run this project locally, follow these simple steps:

### 1. Install Dependencies
Download and install the necessary npm packages:
```bash
npm install
```

### 2. Configure Environment (Optional)
Create a `.env` file in the root directory and supply your own keys:
```env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
```
*(Note: If no `.env` is supplied, the project connects to the default cloud database connection and seeds the administrator logins automatically.)*

### 3. Start the Server
Spin up the unified server:
```bash
npm start
```
Open your browser and navigate to:
* 🌐 **Website Home**: `http://localhost:3000`
* 🔒 **Admin Portal**: `http://localhost:3000/admin-login.html`
