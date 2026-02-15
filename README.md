# ytdler - YouTube Downloader

A modern YouTube downloader with a Next.js frontend and Node.js backend, featuring a clean UI with Tailwind CSS and best backend practices.

## 🎯 Features

- **Modern Web Interface**: Clean, responsive Next.js UI with Tailwind CSS
- **Video Information**: Fetch and display video metadata (title, duration, thumbnail, etc.)
- **Multiple Format Support**: Download videos in various qualities and formats
- **Audio Extraction**: Download audio-only files
- **Clean Filenames**: Downloaded files use the original YouTube video title
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

- **Framework**: Next.js 14 with React and TypeScript
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
├── frontend/             # Next.js frontend
│   ├── pages/            # Next.js pages
│   │   ├── _app.tsx      # App wrapper
│   │   ├── _document.tsx # Document structure
│   │   └── index.tsx     # Home page
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── services/     # API services
│   │   └── types/        # TypeScript types
│   ├── public/           # Static assets
│   └── package.json
│
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Internet connection** (for downloading yt-dlp and video downloads)
- **Windows/Linux/macOS** (yt-dlp supports all platforms)

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

   The backend will automatically download the yt-dlp binary on first run.

3. **Set up the frontend**
   ```bash
   cd ../frontend
   npm install
   ```

### Configuration

#### Backend Environment Variables (Optional)

Create a `.env` file in the `backend` directory:

```env
PORT=3001
NODE_ENV=development
```

#### Frontend Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

For production, update this to your backend API URL.

### Running the Application

1. **Start the backend server** (in the `backend` directory):

   ```bash
   npm run dev
   ```

   The backend will run on `http://localhost:3001`
   - On first run, it will download yt-dlp binary automatically
   - Watch for "Server is running on port 3001" message

2. **Start the frontend** (in the `frontend` directory, in a new terminal):
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:3002`
   - Open your browser to http://localhost:3002
   - The app will hot-reload on changes

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
npm start
```

## 🌐 Hosting & Deployment

### Backend Hosting Options

#### 1. **Railway.app** (Recommended - Easy & Free Tier)

- **Pros**: Automatic deployments, free tier, supports long-running processes
- **Setup**:
  1. Sign up at [railway.app](https://railway.app)
  2. Create new project from GitHub repo
  3. Select the `backend` directory
  4. Add environment variable: `PORT=3001`
  5. Railway will automatically install dependencies and start your server

#### 2. **Render.com** (Recommended - Free Tier Available)

- **Pros**: Free tier with 750 hours/month, automatic SSL, easy setup
- **Setup**:
  1. Sign up at [render.com](https://render.com)
  2. Create new "Web Service"
  3. Connect your GitHub repository
  4. Set root directory to `backend`
  5. Build command: `npm install && npm run build`
  6. Start command: `npm start`
  7. Add environment variables as needed

#### 3. **Heroku**

- **Pros**: Reliable, easy deployment, good documentation
- **Setup**:
  ```bash
  cd backend
  heroku create your-app-name
  git subtree push --prefix backend heroku main
  ```

#### 4. **DigitalOcean App Platform**

- **Pros**: $5/month, reliable, good performance
- **Setup**: Similar to Render, but with more control

#### 5. **VPS (DigitalOcean, Linode, AWS EC2)**

- **Pros**: Full control, best for production
- **Setup**:
  ```bash
  # On your server
  sudo apt update
  sudo apt install nodejs npm
  git clone your-repo
  cd ytdler/backend
  npm install
  npm run build
  # Use PM2 to keep it running
  npm install -g pm2
  pm2 start dist/index.js --name ytdler-backend
  pm2 startup
  pm2 save
  ```

**Important for Backend Hosting:**

- Ensure the hosting provider allows long-running processes (video downloads can take time)
- Make sure adequate disk space is available for temporary video files
- The server needs to download yt-dlp binary on first run (or include it in your deployment)

### Frontend Hosting Options

#### 1. **Vercel** (Recommended for Next.js - Free Tier)

- **Pros**: Built for Next.js, automatic deployments, free SSL, CDN
- **Setup**:
  1. Sign up at [vercel.com](https://vercel.com)
  2. Import your GitHub repository
  3. Set root directory to `frontend`
  4. Add environment variable: `NEXT_PUBLIC_API_URL=your-backend-url`
  5. Deploy automatically happens on git push

#### 2. **Netlify** (Free Tier Available)

- **Pros**: Easy setup, free tier, automatic deployments
- **Setup**:
  1. Sign up at [netlify.com](https://netlify.com)
  2. Connect GitHub repository
  3. Build command: `npm run build`
  4. Publish directory: `.next`
  5. Add environment variable for API URL

#### 3. **AWS Amplify**

- **Pros**: Integrated with AWS services, scalable
- **Setup**: Connect repository and configure build settings

#### 4. **Static Export + CDN**

- Export as static site and host on any CDN (CloudFlare, Netlify, etc.)

### Production Environment Variables

**Backend (.env):**

```env
PORT=3001
NODE_ENV=production
```

**Frontend (.env.production):**

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Deployment Checklist

- [ ] Update API URL in frontend environment variables
- [ ] Set NODE_ENV=production for backend
- [ ] Ensure CORS is configured correctly in backend
- [ ] Test backend API endpoints work from production
- [ ] Verify video downloads work in production
- [ ] Check error handling and logging
- [ ] Set up monitoring (optional but recommended)

## 📖 API Documentation

npm run build
npm start

````

**Frontend:**
```bash
cd frontend
npm run build
````

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
Streams the video file directly with the original YouTube title as filename.

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
- **Framework**: Next.js 14 with React 19
- **Styling**: Tailwind CSS
- **Build Tool**: Next.js with SWC

## 🔧 Troubleshooting

### Backend Issues

**yt-dlp not downloading:**

- The backend automatically downloads yt-dlp on first run
- On Windows, it downloads `yt-dlp.exe`
- Check the `backend/bin` directory

**Port already in use:**

```bash
# Change port in backend/.env or use:
PORT=3002 npm run dev
```

**Download fails:**

- Ensure you have a stable internet connection
- Some videos may be region-restricted
- Check backend console for detailed error messages

### Frontend Issues

**API connection refused:**

- Ensure backend is running on port 3001
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify CORS is enabled in backend

**Build errors:**

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run dev
```

## 📝 Development

### Backend Development

```bash
cd backend
npm run dev  # Runs with nodemon and ts-node for hot reload
```

### Frontend Development

```bash
cd frontend
npm run dev  # Runs Next.js dev server with hot reload
```

### Type Checking

Both frontend and backend use TypeScript:

```bash
# Backend
cd backend
npm run build

# Frontend
cd frontend
npm run build
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws. Only download videos you have the right to download.

## 🙏 Acknowledgments

- [yt-dlp](https://github.com/yt-dlp/yt-dlp) - The amazing YouTube downloader
- [Next.js](https://nextjs.org/) - The React framework
- [Tailwind CSS](https://tailwindcss.com/) - Styling framework
- [Express](https://expressjs.com/) - Backend framework

---

Made with ❤️ by the community
