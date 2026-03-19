# Mintu bro! - Smart Education Admission Platform (MERN)

A production-ready admissions discovery platform for schools and colleges. Students can explore institutions, submit enquiries, and admins can manage institutions and export leads to Excel.

## Tech Stack
- Frontend: React + Tailwind CSS (Vite)
- Backend: Node.js + Express
- Database: MongoDB Atlas
- Auth: JWT (admin-only)
- Uploads: Multer + Cloudinary
- Excel: exceljs

## Features
- Home, Institutions, Institution Details, Contact
- Advanced filters (location, type, name)
- Admission enquiry form with dynamic institution selection
- Admin dashboard with stats, lead growth chart, institution CRUD
- Lead management, filtering, and Excel export (date-wise)
- Professional blue-and-amber visual theme with updated Mintu bro! branding

## Folder Structure
```text
COLLEGE_LEADS/
|-- client/                # React frontend
|   |-- public/
|   `-- src/
|      |-- api/
|      |-- components/
|      |-- context/
|      |-- hooks/
|      |-- pages/
|      `-- utils/
`-- server/                # Express backend
    |-- config/
    |-- controllers/
    |-- middleware/
    |-- models/
    |-- routes/
    `-- utils/
```

## API Endpoints
```text
POST   /api/admin/login
GET    /api/admin/me

POST   /api/institution
GET    /api/institution
GET    /api/institution/filter
GET    /api/institution/:id
PUT    /api/institution/:id
DELETE /api/institution/:id
GET    /api/institution/stats

POST   /api/lead
GET    /api/lead
GET    /api/lead/stats
DELETE /api/lead/:id

GET    /api/export/leads
```

## Local Setup
### 1. Install dependencies
```bash
cd server
npm install

cd ../client
npm install
```

### 2. Environment Variables
Create `server/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_super_secret_jwt_key
ADMIN_USERNAME=superadmin
ADMIN_PASSWORD=Admin@1234
NODE_ENV=development
CLIENT_URL=http://localhost:5173
CLIENT_URLS=http://localhost:5173,https://your-frontend-domain.vercel.app

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Create `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

### 3. Run the app
```bash
cd server
npm run start
```

In another terminal:
```bash
cd client
npm run dev
```

Frontend: `http://localhost:5173`  
Backend: `http://localhost:5000/health`

## Admin Access
- Hidden login route: `/super-admin-login`
- Sample credentials:
  - Username: `superadmin`
  - Password: `Admin@1234`

## Deployment Guide
### Frontend (Netlify)
1. Push the repo to GitHub.
2. Create a new Netlify site from the repo.
3. Set base directory to `client`.
4. Set build command to `npm run build`.
5. Set publish directory to `dist`.
6. Add `VITE_API_URL` with your Render backend URL, for example `https://mintu-bro-api.onrender.com/api`.
7. Deploy. The included `client/public/_redirects` and `client/netlify.toml` keep React routes working on refresh.

### Backend (Render)
1. Create a new Web Service from the `server` folder, or use the included `render.yaml`.
2. Set build command: `npm install`
3. Set start command: `node index.js`
4. Add all variables from `server/.env`, except do not commit real secrets.
5. Set `NODE_ENV=production`.
6. Set `CLIENT_URL` or `CLIENT_URLS` with your Netlify domain, for example `https://your-site.netlify.app`.
7. Deploy and copy the public URL.

### MongoDB Atlas
1. Create a cluster and database.
2. Add a DB user and whitelist Render/Vercel IPs, or use `0.0.0.0/0` for development.
3. Use the connection string in `MONGO_URI`.

### Cloudinary
1. Create a Cloudinary account.
2. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET`.

## Notes
- Institution images are stored in Cloudinary.
- Excel exports support institution filtering and date ranges.
- Admin routes are JWT protected.
- Before pushing to GitHub, rotate any secrets currently stored in `server/.env`.
