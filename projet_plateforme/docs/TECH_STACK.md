# Tech Stack - CinéÉtudiants

## 🎨 Frontend
- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **CSS**: CSS-in-JS ou Tailwind (à décider)
- **State Management**: Context API ou Redux (à décider)
- **HTTP Client**: Axios ou Fetch API

## 🖥️ Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **ORM**: Prisma (auto-migrations, type-safe)

## 💾 Database
- **Primary DB**: PostgreSQL
- **ORM**: Prisma
- **Migrations**: Prisma Migrations (auto)

## 🔐 Authentication
- **Method**: JWT (JSON Web Tokens)
- **Storage**: HttpOnly cookies + localStorage
- **Email Verification**: Nodemailer
- **Password Reset**: JWT tokens

## 📁 File Storage
- **Vidéos**: Local filesystem (`/public/uploads/videos`)
- **Thumbnails**: Generated automatically (FFmpeg)
- **Profile Pictures**: Local (`/public/uploads/users`)
- **Future Migration**: AWS S3 / Cloudinary (if needed)

## 🎥 Video Processing
- **Encoding/Thumbnails**: FFmpeg
- **Job Queue**: Bull (Redis-backed) *(optional, for async processing)*

## 🚀 Deployment
- **Hosting**: Hostinger
- **Environment**: Node.js compatible hosting

## 📦 Additional Libraries (to be added as needed)
- **Validation**: Zod ou Joi
- **Email**: Nodemailer
- **Image Processing**: Sharp (thumbnails)
- **Logging**: Winston ou Pino
- **Testing**: Jest + Supertest
- **API Documentation**: Swagger/OpenAPI

---

## 🤔 Why These Choices?

### Node.js + Express
- Same ecosystem as React (JavaScript)
- Easy to set up and learn
- Fast prototyping
- Scalable if needed later

### PostgreSQL + Prisma
- PostgreSQL: Robust, relational, free, scalable
- Prisma: Modern ORM, type-safe, easy migrations
- No raw SQL needed initially

### Local Storage
- Project étudiant = no AWS costs
- Simple to implement
- Easy migration to S3 later if needed

### JWT Auth
- Stateless (good for scaling)
- Works well with REST APIs
- Industry standard

---

## 📊 Database Schema Overview (Prisma)

Key models to create:

```prisma
model User {
  id          Int      @id @default(autoincrement())
  email       String   @unique
  password    String
  role        Role     @default(VIEWER)  // CREATOR, VIEWER, ADMIN
  status      UserStatus @default(PENDING)  // PENDING, APPROVED, BANNED
  profile     Profile?
  videos      Video[]
  comments    Comment[]
  likes       Like[]
}

model Video {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  filePath    String
  status      VideoStatus @default(PENDING)  // PENDING, APPROVED, REJECTED
  creator     User     @relation(fields: [creatorId], references: [id])
  creatorId   Int
  category    Category?
  comments    Comment[]
  likes       Like[]
  views       Int      @default(0)
  createdAt   DateTime @default(now())
}

model Comment {
  id          Int      @id @default(autoincrement())
  content     String
  status      CommentStatus @default(PENDING)  // PENDING, APPROVED
  user        User     @relation(fields: [userId], references: [id])
  userId      Int
  video       Video    @relation(fields: [videoId], references: [id])
  videoId     Int
  createdAt   DateTime @default(now())
}

model Like {
  id          Int      @id @default(autoincrement())
  user        User     @relation(fields: [userId], references: [id])
  userId      Int
  video       Video    @relation(fields: [videoId], references: [id])
  videoId     Int
  
  @@unique([userId, videoId])
}

model Category {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  videos      Video[]
}

enum Role {
  CREATOR
  VIEWER
  ADMIN
}

enum UserStatus {
  PENDING
  APPROVED
  BANNED
}

enum VideoStatus {
  PENDING
  APPROVED
  REJECTED
}

enum CommentStatus {
  PENDING
  APPROVED
}
```
