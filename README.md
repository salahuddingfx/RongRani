<div align="center">

<img src="public/RongRani-[Recovered].png" width="180" alt="RongRani Logo" style="border-radius: 50%; box-shadow: 0 10px 30px rgba(0,0,0,0.5); border: 2px solid #7aa2f7;" />

# 🌸 RongRani

### *Elegance In Every Hue*

[![Maintained by Salah Uddin](https://img.shields.io/badge/Maintained%20by-Salah%20Uddin-bb9af7?style=for-the-badge&logo=github&logoColor=white)](https://github.com/salahuddingfx)
[![MERN Stack](https://img.shields.io/badge/Stack-MERN-73daca?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/mern-stack)
[![Live Demo](https://img.shields.io/badge/Live-Demo-f7768e?style=for-the-badge&logo=vercel&logoColor=white)](https://rongrani.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-7aa2f7?style=for-the-badge&logo=mit&logoColor=white)](LICENSE)

![Typing SVG](https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=28&duration=3000&pause=1000&color=7AA2F7&center=true&vCenter=true&multiline=true&width=800&height=120&lines=Premium+Handmade+Gifts+%26+Crafts;Modern+MERN+Stack+Application;Bilingual+Support+(English+%2B+Bengali);Flash+Sale+Campaigns;Seamless+bKash+Integration)

---

<p align="center">
  <b>RongRani</b> is an ultra-premium e-commerce experience crafted for the curated artisan market in Bangladesh. 
  Built with the modern <b>MERN</b> stack, it blends traditional craftsmanship with high-end digital aesthetics.
</p>

</div>

---

## 📋 Table of Contents
- [✨ Features](#-features)
- [🎨 Screenshots](#-screenshots)
- [🛠️ Tech Stack](#️-tech-stack)
- [🚀 Getting Started](#-getting-started)
- [💳 bKash Integration](#-bkash-integration)
- [📁 Project Structure](#-project-structure)
- [🌐 API Documentation](#-api-documentation)
- [🎯 Roadmap](#-roadmap)
- [🤝 Contributing](#-contributing)

---

## ✨ Features

<div align="center">

| 🏷️ **Bespoke Shopping** | 👨‍💼 **Management Hub** | 💳 **Seamless UX** |
| :--- | :--- | :--- |
| • **Advanced Filtering** & Smart Search | • **Real-time Analytics** Dashboard | • **bKash Tokenized** Integration |
| • **Flash Sales** with Countdown Timers | • **Dynamic Banner** & Content Control | • **PWA Support** (Installable App) |
| • **Bespoke Invoices** (Manifest Style) | • **Automated Inventory** Tracking | • **Bilingual (BN/EN)** Persistence |
| • **Order Tracking** with Guest Reviews | • **Review Moderation** System | • **Luxury Email** Notifications |

</div>

---

## 🎨 Creative Showcase (Screenshots)

<div align="center">

### 💎 User Experience
| **🏠 Home Manifest** | **🛍️ Premium Shop** |
|:---:|:---:|
| <img src="screenshots/Home_Pages.png" width="400" /> | <img src="screenshots/Shop_Pages.png" width="400" /> |
| *Luxury Landing & Hero* | *Dynamic Collection Grid* |

| **⚡ Blitz Deals** | **🔍 Order Registry** |
|:---:|:---:|
| <img src="screenshots/Flash_Sale.png" width="400" /> | <img src="screenshots/Order-Track_Pages.png" width="400" /> |
| *Flash Sale Excitement* | *Real-time Manifest Tracking* |

### 🛠️ The Command Center
| **📊 Analytics** | **📦 Inventory** |
|:---:|:---:|
| <img src="screenshots/Admin_Pages.png" width="400" /> | <img src="screenshots/Admin_Products_Pages.png" width="400" /> |
| *Strategic Insights* | *Bespoke Catalog Control* |

### 📜 Brand Identity
| **📑 Artisan Invoice** | **📲 Mobile PWA** |
|:---:|:---:|
| <img src="screenshots/Invoice.png" width="400" /> | <img src="screenshots/Mobile_PWA.jpeg" width="200" /> |
| *High-End PDF Generation* | *App-like Fluidity* |

</div>

---

## �️ The MERN Stack Architecture

<div align="center">
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
</div>

### 💻 Frontend (React.js)
```javascript
{
  "framework": "React 18.2.0 (Vite)",
  "styling": "TailwindCSS + Custom Nightowl Animations",
  "state_management": "Context API",
  "routing": "React Router DOM v6",
  "http_client": "Axios",
  "pwa": "Vite PWA Plugin (Offline Support)",
  "icons": "Lucide React",
  "notifications": "React Hot Toast"
}
```

### ⚙️ Backend (Node.js & Express)
```javascript
{
  "runtime": "Node.js (LTS)",
  "framework": "Express.js",
  "database": "MongoDB (Mongoose ODM)",
  "auth": "JWT (JSON Web Tokens)",
  "realtime": "Socket.io",
  "payments": "bKash Tokenized API",
  "security": "Helmet, CORS, Rate Limiting",
  "email": "Nodemailer (Premium Templates)"
}
```

---

## � Getting Started

### Prerequisites
Ensure you have the following installed:
- **Node.js**: v18.x or higher
- **MongoDB**: v6.0 or higher
- **npm**: v9.x or higher

### 📥 Installation Steps

1. **Clone the project**:
   ```bash
   git clone https://github.com/salahuddingfx/rongrani.git
   cd rongrani
   ```

2. **Setup Backend**:
   ```bash
   cd backend
   npm install
   # Create a .env file based on .env.example
   npm run dev
   ```

3. **Setup Frontend**:
   ```bash
   # Back to root
   cd ..
   npm install
   npm run dev
   ```

### 🔑 Configuration (Environment Variables)
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
BKASH_APP_KEY=your_key
BKASH_APP_SECRET=your_secret
BKASH_USERNAME=your_username
BKASH_PASSWORD=your_password
EMAIL_USER=your_gmail
EMAIL_PASS=your_app_password
```

---

## 💳 bKash Integration

```mermaid
sequenceDiagram
    participant C as Customer
    participant F as Frontend
    participant B as Backend
    participant bK as bKash API
    
    C->>F: Checkout
    F->>B: Init Payment
    B->>bK: Create Agreement
    bK-->>B: Payment URL
    B-->>F: Redirect
    C->>bK: Pay
    bK->>B: Callback
    B-->>F: Success
```

---

## 📁 Project Structure
```text
rongrani/
├── 📂 backend/         # Node.js API
│   ├── 📂 controllers/ # Logic
│   ├── 📂 models/      # Database Schemas
│   ├── 📂 routes/      # API Endpoints
│   └── 📂 utils/       # PDF & Helpers
├── 📂 src/             # React Frontend
│   ├── 📂 components/  # Shared UI
│   ├── 📂 pages/       # View Logic
│   └── 📂 contexts/    # State Management
└── 📂 public/          # Static Assets
```

---

## 🌐 API Documentation

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| **POST** | `/api/auth/login` | Secure JWT Login |
| **GET** | `/api/products` | Paginated Product List |
| **POST** | `/api/orders` | Create New Order |
| **GET** | `/api/flash-sales/active` | Current Live Deals |
| **POST** | `/api/payment/init` | Start bKash Process |

---

## 🎯 Roadmap
- [x] **MERN Core Flow** (DONE)
* [x] **Premium Signature Invoices** (DONE)
- [x] **Flash Sale Manager** (DONE)
- [ ] **AI-Powered Gift Finder** (WIP)
- [ ] **Multi-vendor Dashboard**

---

## 👨‍💻 Author

<div align="center">

<img src="https://img.shields.io/badge/Author-Salah%20Uddin%20Kader-7aa2f7?style=for-the-badge&logo=github&logoColor=white" />

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://linkedin.com/in/salahuddingfx)
[![Portfolio](https://img.shields.io/badge/Portfolio-f7768e?style=for-the-badge&logo=google-chrome&logoColor=white)](https://salahuddin.codes)

**Visionary Architect behind RongRani**

</div>

---

<div align="center">

### ⭐ Star if you find this project helpful!

![GitHub stars](https://img.shields.io/github/stars/salahuddingfx/rongrani?style=social)
![GitHub forks](https://img.shields.io/github/forks/salahuddingfx/rongrani?style=social)

**Made with ❤️ by Salah Uddin Kader**

</div>