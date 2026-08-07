# Admin Dashboard Setup Guide

## What's Been Created

### Backend Files
1. **`backend/prisma/schema.prisma`** - Updated with:
   - `role` field in User model (default: "user")
   - `status` field in Comment model (default: "pending")

2. **`backend/src/middleware/adminOnly.ts`** - New middleware to check admin role

3. **`backend/src/controllers/adminController.ts`** - Admin endpoints:
   - GET `/api/admin/stats` - Dashboard statistics
   - GET `/api/admin/videos` - List all videos for moderation
   - PUT `/api/admin/videos/:videoId/approve` - Approve video
   - PUT `/api/admin/videos/:videoId/reject` - Reject video with reason
   - GET `/api/admin/comments` - List all comments for moderation
   - PUT `/api/admin/comments/:commentId/approve` - Approve comment
   - PUT `/api/admin/comments/:commentId/reject` - Reject/delete comment

4. **`backend/src/routes/adminRoutes.ts`** - Protected admin routes

5. **`backend/src/index.ts`** - Updated to include admin routes

### Frontend Files
1. **`src/pages/AdminDashboard.jsx`** - Complete admin dashboard with:
   - Stats display (Users, Videos, Comments, Likes)
   - Bar chart of videos by category
   - Video moderation tab
   - Comment moderation tab
   - Reject modal with reason input

2. **`src/styles/AdminDashboard.css`** - Professional dark/light mode styles

3. **`src/api.js`** - Added admin API methods

4. **`src/App.jsx`** - Updated with AdminDashboard route and navigation

5. **`src/pages/Home.jsx`** - Added admin button (👑) in header for admin users

6. **`src/styles/Home.css`** - Added admin button styles

## Setup Steps

### 1. Update Database Schema
Run this in the backend directory to apply Prisma migrations:

```bash
cd backend
npx prisma migrate dev --name add_admin_role_and_comment_status
```

This will:
- Add `role` column to `User` table
- Add `status` column to `Comment` table

### 2. Make a User Admin (Manually for Now)
Since there's no admin creation endpoint yet, you need to manually update the database:

```bash
# Option 1: Using Prisma Studio (interactive)
npx prisma studio

# Option 2: Using SQL directly through your database client
UPDATE "User" SET role = 'admin' WHERE email = 'your-admin-email@example.com';
```

### 3. Start the Application

**Backend:**
```bash
cd backend
npm start
```

**Frontend:**
```bash
cd projet_plateforme
npm run dev
```

### 4. Test the Admin Dashboard

1. Login with an admin account (one you marked as admin in step 2)
2. Look for the 👑 (crown) button in the top-right header
3. Click it to access the Admin Dashboard

## Features

### Dashboard Tabs

1. **Statistiques (Stats)**
   - Total Users, Videos, Comments, Likes
   - Bar chart visualization of videos by category
   - Real-time stats updates

2. **Modération Vidéos**
   - List of all videos with creator info
   - Approve/Reject buttons for pending videos
   - Rejection reason modal
   - Status badges

3. **Modération Commentaires**
   - List of all comments with user and video info
   - Approve/Delete buttons for pending comments
   - Quick content preview

## API Endpoints

All endpoints require:
- Authorization header with Bearer token
- Admin role verification

### Stats
```
GET /api/admin/stats
Response: { totalUsers, totalVideos, totalComments, totalLikes, videosByCategory }
```

### Videos
```
GET /api/admin/videos?status=pending
PUT /api/admin/videos/:videoId/approve
PUT /api/admin/videos/:videoId/reject { reason: "string" }
```

### Comments
```
GET /api/admin/comments?status=pending
PUT /api/admin/comments/:commentId/approve
PUT /api/admin/comments/:commentId/reject
```

## Styling Notes

- Dark mode friendly with CSS variables
- Responsive design (mobile, tablet, desktop)
- Gradient header matching the app theme
- Interactive hover states on all buttons
- Modal for rejection reasons
- Color-coded status badges

## Future Enhancements

1. Add real-time updates using WebSockets
2. Create admin creation endpoint
3. Add user ban/suspend functionality
4. Add analytics dashboard
5. Create activity logs
6. Add bulk moderation actions
7. Create admin audit trail

## Troubleshooting

### Admin button not showing
- Make sure user has `role === 'admin'` in database
- Check browser console for errors

### API errors
- Verify token is being sent with requests
- Check backend is running on port 5000
- Verify CORS is enabled in backend

### Database migration fails
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env is correct
- Run `npx prisma db push` if migrate dev doesn't work
