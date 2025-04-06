# CareerSync AI - Intelligent Job Application Platform

![CareerSync AI](https://img.shields.io/badge/Hackathon-ITM%20University%20Gwalior-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Python](https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue)

# 🚀 Project Setup

Follow these steps to set up and run the project locally.

## 📂 Install and Setup

```bash
cd frontend
npm install
npm install -g vite
```

Now, open a new terminal and continue with:

## 🚀 Quick Start

Get everything up and running with a single command:

```bash
npm run dev
```

That's it! This single command will:
- Start the backend server
- Launch the frontend application
- Set up MongoDB connection 
- Initialize job scraping services
- Configure all necessary components automatically

No additional configuration needed - everything works seamlessly out of the box!

## 📌 Overview

CareerSync AI is an intelligent job application platform designed to revolutionize the job search process. Built for the ITM University Gwalior Hackathon, this application uses advanced AI techniques to automate and optimize every aspect of job hunting.

## ✨ Key Features

### 🔍 Automated Job Discovery
- **Multi-platform Job Scraping**: Automatically collects job listings from Internshala and other platforms
- **Real-time Updates**: Continuously monitors for new job postings
- **Smart Filtering**: Categorizes jobs by location, skill requirements, and other criteria

### 🤖 AI-Powered Application Assistance
- **Resume Optimization**: Automatically tailors resumes to match job descriptions
- **Application Auto-fill**: Uses GPT-4o to intelligently complete application forms
- **Interview Preparation**: Generates potential interview questions based on job descriptions

### 📊 Comprehensive Job Management
- **Centralized Dashboard**: Track all applications from a single interface
- **Status Tracking**: Monitor application progress in real-time
- **Intelligent Recommendations**: Receive suggestions for jobs that match your profile

### 🔒 Secure Data Handling
- **Encrypted Storage**: All personal information is securely encrypted
- **Privacy Controls**: Granular control over what information is shared
- **Cached Job Details**: Efficient storage and retrieval of job information

## 🛠️ Technology Stack

### Backend
- **Server**: Node.js with Express
- **Database**: MongoDB Atlas
- **Authentication**: JWT-based authentication
- **API Integration**: Chatgpt 4o API and Internshala Data Scraping integration

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS with Shadcn UI components
- **State Management**: React Context API
- **Routing**: React Router

### AI & Automation
- **Job Scraping**: Python with Selenium
- **Natural Language Processing**: GPT-4o integration
- **Resume Parsing**: Custom NLP algorithms
- **Automated Form Filling**: Selenium WebDriver

## 📋 System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Frontend App   │◄────┤  Backend API    │◄────┤  MongoDB Atlas  │
│  (React + TS)   │     │  (Node.js)      │     │  Database       │
│                 │     │                 │     │                 │
└────────┬────────┘     └────────┬────────┘     └─────────────────┘
         │                       │
         │                       │
         │               ┌───────▼────────┐
         │               │                │
         └──────────────►│  Job Scraping  │
                         │  Services (Py) │
                         │                │
                         └────────────────┘
```

## 🔧 Available Commands

### Main Commands
- `npm run dev` - Start both frontend and backend (use this!)
- `npm run frontend` - Start only the frontend server
- `npm run backend` - Start only the backend server

### Advanced Commands
- `npm run update-mongo-ip` - Update MongoDB Atlas IP whitelist
- `npm run auto-update-ip` - Start daemon to auto-update IP
- `npm run install-all` - Install all dependencies
- `npm run start-all-windows` - Start all services in separate windows

## 🌟 Future Enhancements

- **Multi-platform Integration**: Adding support for LinkedIn, Indeed, and more job platforms
- **Mobile App**: Native mobile applications for iOS and Android
- **Advanced Analytics**: Detailed insights on job market trends
- **AI Interview Coach**: Interactive interview practice with feedback
- **Networking Assistant**: Tools for professional networking and follow-ups

## 👥 The Team

### Major Contributors

- **Shivam Gupta**: 
  - Developed all Python automation scripts
  - Created the complete frontend interface ( landing page, login, signup page, DASHBOARD, Resume Builder, Auto-Apply )
  - Built Completed the resume builder component
  - Updated DashBoard Completely to Fetch jobs by Mongodb Clusters Database
  - Implemented MongoDB connectivity
  - Fixed the IP address auto-update system for MongoDB Atlas
  - Collaborated on backend route connectivity and file setup

- **Rahul Gautam**:
  - Implemented OAuth 2.0 Google authentication
  - Developed backend connectivity from backend to frontend
  - Built core API routes and services
  - Find out the ChatGPT 4o API To Enhance the form Filling Part by ChatGPT Processing

### Contributors

- **Rahul Sharma**:
  - Worked on hackathon presentation
  - Conducted research and testing
  - Provided user feedback for platform improvement

- **Mansi Yadav**:
  - Assisted with hackathon presentation materials
  - Participated in testing and quality assurance
  - Provided user experience feedback

- **Abhishek**:
  - Contributed to research and testing
  - Acted as a feedback user for platform refinement
  - Assisted with documentation

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🏆 Hackathon Project

This project was created for the ITM University Gwalior Hackathon. We aimed to solve the problem of inefficient job searching and application processes by leveraging AI and automation technologies.

## 🙏 Acknowledgements

- ITM University Gwalior for hosting the hackathon
- MongoDB Atlas for database services
- OpenAI for GPT integration capabilities
- The open-source community for various tools and libraries used in this project 