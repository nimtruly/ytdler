# ytdler - YouTube Downloader

A modern YouTube downloader with a React frontend and Node.js backend, featuring a clean UI and best backend practices.

## 🎯 Features

- **Modern Web Interface**: Clean, responsive React UI with Tailwind CSS
- **Video Information**: Fetch and display video metadata (title, duration, thumbnail, etc.)
- **Multiple Format Support**: Download videos in various qualities and formats
- **Audio Extraction**: Download audio-only files
- **RESTful API**: Well-structured backend API with TypeScript
- **Type Safety**: Full TypeScript support on both frontend and backend
- **Best Practices**: Follows industry-standard coding practices and architecture

## 🏗️ Architecture

### Backend
- **Framework**: Express.js with TypeScript
- **YouTube Downloading**: yt-dlp (most reliable YouTube downloader)
- **API Design**: RESTful endpoints with proper error handling
- **Structure**: MVC pattern with controllers, services, and routes

### Frontend
- **Framework**: React with TypeScript
- **Styling**: Tailwind CSS for modern, responsive design
- **API Integration**: Clean service layer for backend communication
- **Components**: Modular, reusable React components

## 📁 Project Structure

```
ytdler/
├── backend/              # Backend API
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   ├── types/        # TypeScript types
│   │   └── index.ts      # Server entry point
│   ├── downloads/        # Downloaded videos (git-ignored)
│   ├── bin/              # yt-dlp binary (git-ignored)
│   └── package.json
│
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Main app component
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm
- Internet connection (for downloading yt-dlp and video downloads)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/nimtruly/ytdler.git
   cd ytdler
   ```

2. **Set up the backend**
   ```bash
   cd backend
   npm install
   ```

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Running the Application

1. **Start the backend server** (in the `backend` directory):
   ```bash
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

2. **Start the frontend** (in the `frontend` directory, in a new terminal):
   ```bash
   npm start
   ```
   The frontend will open in your browser at `http://localhost:3000`

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
```
The production build will be in the `frontend/build/` directory.

## 📖 API Documentation

### Base URL
```
http://localhost:3001
```

### Endpoints

#### Get Video Information
```http
GET /api/video/info?url=<youtube_url>
```

**Response:**
```json
{
  "id": "video_id",
  "title": "Video Title",
  "duration": 180,
  "thumbnail": "https://...",
  "author": "Channel Name",
  "description": "Video description",
  "viewCount": 1000000,
  "uploadDate": "20240101",
  "formats": [
    {
      "formatId": "137",
      "ext": "mp4",
      "resolution": "1080p",
      "filesize": 52428800,
      "formatNote": "1080p",
      "vcodec": "avc1",
      "acodec": "none"
    }
  ]
}
```

#### Download Video
```http
POST /api/video/download
Content-Type: application/json

{
  "url": "https://www.youtube.com/watch?v=...",
  "formatId": "137"  // optional, defaults to best quality
}
```

**Response:**
```json
{
  "message": "Download completed successfully"
}
```

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Video Downloader**: yt-dlp-wrap
- **CORS**: cors
- **Environment**: dotenv

### Frontend
- **Language**: TypeScript
- **Framework**: React
- **Styling**: Tailwind CSS
- **Build Tool**: Create React App

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:3001
```

## 📝 Development

### Backend Development
```bash
cd backend
npm run dev  # Runs with nodemon and ts-node
```

### Frontend Development
```bash
cd frontend
npm start  # Runs with hot reload
```

### Type Checking
Both frontend and backend use TypeScript. Build errors will show type issues:
```bash
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have the right to download.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The amazing YouTube downloader
- [React](https://reactjs.org/) - Frontend framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Express](https://expressjs.com/) - Backend framework
