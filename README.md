# 🌍 Nomadly - Group Travel Planning Platform

Nomadly is a full-stack web application that helps groups plan and manage trips efficiently by centralizing trip creation, collaboration, task management, budgeting, and media sharing in a single platform.

## ✨ Features
- **🔐 User Authentication**: Secure login with local authentication and Google OAuth integration.
- **🗺️ Trip Management**:
  - Create and manage trips with detailed itineraries.
  - Add multiple **destinations** with location, dates, and descriptions.
  - Assign and track **tasks** for trip members.
  - Add and manage **accommodations** with booking details and check-in/check-out dates.
  - Track **budgets** and expenses with clear visibility for all members.
  - Invite and manage **trip members** with role-based access.
- **♻️ Trip Cloning**: Duplicate existing trips (without sensitive data) to quickly reuse itineraries.
- **🌟 Explore Public Trips**: View trips shared publicly by other users for inspiration.
- **💬 Real-time Group Chat**: Collaborate with trip members via instant messaging using Socket.io.
- **📸 Media Sharing**: Upload and share trip photos securely via Cloudinary.

## 🛠️ Tech Stack
- **Frontend**: HTML, CSS, JavaScript, Handlebars (HBS)  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB (Mongoose ORM)  
- **Authentication**: Passport.js (Local + Google OAuth)  
- **Real-time Communication**: Socket.io  
- **Cloud Storage**: Cloudinary for media handling  
- **Deployment**: Render Cloud  
- **Version Control**: Git, GitHub
