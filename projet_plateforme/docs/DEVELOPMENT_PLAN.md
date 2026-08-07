# Development Plan - CinéÉtudiants

## 📅 Overview
8 phases de développement, ~7-8 semaines estimées pour le MVP complet.

---

## 🏗️ Phase 1 : Foundation Backend
**Duration**: ~1-2 jours  
**Priority**: CRITICAL - Everything depends on this

### Tasks
- [ ] Setup Node.js + Express + TypeScript boilerplate
- [ ] Setup PostgreSQL database
- [ ] Setup Prisma ORM with schema
- [ ] Create folder structure (`/routes`, `/controllers`, `/services`, `/models`)
- [ ] Setup environment variables (.env)
- [ ] Setup basic logging (Winston/Pino)
- [ ] Setup error handling middleware

### Deliverables
- Working Node/Express server on localhost:3000
- PostgreSQL connection working
- Prisma migrations ready
- Folder structure in place

### Why First?
Without DB and API structure, impossible to build anything else.

---

## 🔐 Phase 2 : Authentication System
**Duration**: ~3-5 jours  
**Depends on**: Phase 1

### Tasks
- [ ] User model in Prisma (email, password, role, status)
- [ ] POST /auth/register - Create new user account
- [ ] POST /auth/login - Return JWT token
- [ ] POST /auth/logout - Invalidate token
- [ ] POST /auth/refresh - Refresh token
- [ ] Setup JWT middleware for protected routes
- [ ] Email verification system (Nodemailer)
- [ ] POST /auth/verify-email - Confirm email
- [ ] POST /auth/forgot-password - Reset flow
- [ ] POST /auth/reset-password - New password

### Deliverables
- Authentication endpoints fully working
- JWT tokens working
- Email verification working
- Middleware protecting routes

### Why 2nd?
All other features depend on knowing WHO the user is (creator vs viewer vs admin).

---

## ⚙️ Phase 3 : Moderation System (Admin)
**Duration**: ~3-4 jours  
**Depends on**: Phase 2

### Tasks
- [ ] Add status field to User model (PENDING, APPROVED, BANNED)
- [ ] Add status field to Video model (PENDING, APPROVED, REJECTED)
- [ ] POST /admin/approve-user/:userId - Admin approves account
- [ ] POST /admin/reject-user/:userId - Admin rejects account
- [ ] POST /admin/ban-user/:userId - Admin bans user
- [ ] POST /admin/approve-video/:videoId - Admin approves video
- [ ] POST /admin/reject-video/:videoId - Admin rejects video
- [ ] GET /admin/pending-users - List users awaiting approval
- [ ] GET /admin/pending-videos - List videos awaiting approval
- [ ] Setup admin role check middleware

### Deliverables
- Admin endpoints working
- Status tracking in database
- Admin can approve/reject users and videos

### Why 3rd?
Core requirement: videos and accounts must be moderated before becoming public.

---

## 🎥 Phase 4 : Video Upload & Processing
**Duration**: ~4-5 jours  
**Depends on**: Phase 2, Phase 3

### Tasks
- [ ] Video model in Prisma (title, description, filePath, status, categoryId, creatorId)
- [ ] Setup file upload middleware (multer)
- [ ] POST /videos/upload - Upload video file
- [ ] Video validation (format: MP4/WebM, max duration)
- [ ] FFmpeg integration for thumbnails
- [ ] Auto-generate thumbnail on upload
- [ ] Store video in `/public/uploads/videos`
- [ ] Store metadata in database
- [ ] DELETE /videos/:id - Creator can delete own video
- [ ] Setup video streaming (serve MP4)

### Deliverables
- Upload endpoint working
- Videos stored locally
- Thumbnails auto-generated
- Video validation working

### Why 4th?
After auth and moderation, creators can now upload videos.

---

## 🎬 Phase 5 : Video Discovery APIs
**Duration**: ~4-5 jours  
**Depends on**: Phase 4

### Tasks
- [ ] GET /videos - List all APPROVED videos (pagination)
- [ ] GET /videos/:id - Get single video + increment views
- [ ] GET /videos/search?q=term - Search by title/description
- [ ] GET /videos/category/:categoryId - Filter by category
- [ ] GET /creators/:userId - Creator profile + their videos
- [ ] GET /creators/:userId/stats - Creator stats (views, likes, comments count)
- [ ] Add duration filter (min/max)
- [ ] Add date filter (newest first)
- [ ] Add sort options (popular, recent, trending)
- [ ] Setup video streaming response headers

### Deliverables
- All video discovery endpoints working
- Search and filters working
- Creator profiles working
- View counts incrementing

### Why 5th?
Spectators need to discover and watch videos.

---

## 👍 Phase 6 : Likes & Comments
**Duration**: ~4-5 jours  
**Depends on**: Phase 5

### Tasks
- [ ] Like model in Prisma (userId, videoId, unique constraint)
- [ ] Comment model in Prisma (userId, videoId, content, status)
- [ ] POST /videos/:id/like - User likes video
- [ ] DELETE /videos/:id/like - User unlikes video
- [ ] GET /videos/:id/likes - Get like count
- [ ] GET /videos/:id/liked - Check if current user liked
- [ ] POST /videos/:id/comments - Add comment
- [ ] GET /videos/:id/comments - Get all comments (paginated)
- [ ] DELETE /comments/:id - User delete own comment
- [ ] Setup comment moderation (PENDING status)
- [ ] Possibly auto-approve comments after first one from user

### Deliverables
- Like system fully working
- Comment system fully working
- Moderation workflow for comments

### Why 6th?
Depends on auth and videos working properly.

---

## 🎨 Phase 7 : Frontend Integration
**Duration**: ~5-7 jours  
**Depends on**: Phase 6

### Tasks
- [ ] Remove hardcoded video data from React
- [ ] Create Auth pages (Register, Login, Forgot Password)
- [ ] Create API service layer (Axios/Fetch wrapper)
- [ ] Connect Gallery to GET /videos
- [ ] Connect Video Player to real videos
- [ ] Implement Like button
- [ ] Implement Comments section
- [ ] Create Creator profile page
- [ ] Create Search functionality
- [ ] Add filters UI (category, duration, date)
- [ ] Handle loading/error states
- [ ] Setup protected routes (creator dashboard)

### Deliverables
- Frontend fully integrated with API
- All user flows working
- No more hardcoded data

### Why 7th?
Backend should be stable before heavy integration.

---

## 👨‍💼 Phase 8 : Admin Dashboard
**Duration**: ~4-5 jours  
**Depends on**: Phase 7

### Tasks
- [ ] Create Admin login page
- [ ] Admin Dashboard - Overview stats (total users, videos, comments)
- [ ] Pending Users page - Approve/Reject/Ban
- [ ] Pending Videos page - Approve/Reject
- [ ] Users Management page - View all users, ban/unban
- [ ] Videos Management page - View all videos, delete
- [ ] Comments Moderation page - Approve/Reject comments
- [ ] Reports Management - View flagged content
- [ ] Stats/Analytics page (basic)

### Deliverables
- Fully functional Admin Dashboard
- All moderation workflows in UI

### Why 8th?
Less critical than core features. Can be added after MVP is complete.

---

## 🔄 Dependency Graph

```
Phase 1: Backend Foundation
    ↓
Phase 2: Auth
    ↓
Phase 3: Moderation
    ↓
Phase 4: Video Upload
    ↓
Phase 5: Video Discovery
    ↓
Phase 6: Likes & Comments
    ↓
Phase 7: Frontend Integration
    ↓
Phase 8: Admin Dashboard
```

---

## ⏱️ Timeline Estimate

| Phase | Duration | Cumulative |
|-------|----------|-----------|
| Phase 1 | 1-2 days | 1-2 days |
| Phase 2 | 3-5 days | 4-7 days |
| Phase 3 | 3-4 days | 7-11 days |
| Phase 4 | 4-5 days | 11-16 days |
| Phase 5 | 4-5 days | 15-21 days |
| Phase 6 | 4-5 days | 19-26 days |
| Phase 7 | 5-7 days | 24-33 days |
| Phase 8 | 4-5 days | 28-38 days |

**Total**: ~1 month for full MVP (can be parallelized)

---

## 🎯 Next Steps

1. Phase 1 complete → Node/Express/TypeScript/PostgreSQL setup
2. Phase 2 complete → Users can register and login
3. Phase 3 complete → Accounts and videos require moderation
4. Continue through remaining phases...

---

## 📝 Notes
- Each phase can be adjusted based on complexity
- Frontend (Phase 7) can start earlier if needed
- Admin Dashboard (Phase 8) is least critical, can be simplified initially
- Testing can be added incrementally or done at the end
- Deployment to Hostinger happens after Phase 7 (MVP complete)

**Status**: Ready to start Phase 1 🚀
