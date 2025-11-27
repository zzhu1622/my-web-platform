# AptExchange

A community marketplace platform for apartment residents to buy and sell second-hand items efficiently and safely.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
  - [Basic Functions](#basic-functions)
  - [Advanced Functions](#advanced-functions)
- [Technology Stack](#technology-stack)
- [Database Design](#database-design)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [API Endpoints](#api-endpoints)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

AptExchange is a full-stack web application designed specifically for apartment communities. Unlike generic marketplaces, AptExchange leverages building-internal data to provide hyper-local trading experiences. The platform connects apartment tenants who want to sell items before moving out with neighbors looking for affordable second-hand goods.

### Key Highlights

- **Community-focused**: Designed exclusively for apartment residents within the same building or complex
- **Move-out aware**: Integrates seller move-out dates to highlight urgent sales
- **Smart pricing**: Uses historical transaction data to suggest fair prices
- **Rich media support**: Listings support up to 9 images and 1 video per item
- **Real-time messaging**: Secure in-app conversations between buyers and sellers
- **Session tracking**: Online/offline status indicators for better communication

---

## Features

### Basic Functions

1. **User Management**
   - User registration with email verification
   - Secure login with bcrypt password hashing
   - Password reset via email verification codes (6-digit, 15-minute expiration)
   - User session tracking with IP address and user agent logging
   - Profile management with move-out date setting

2. **Item and Listing Management**
   - Create listings with title, description, category, and condition
   - Set original price and selling price
   - Upload up to 9 photos and 1 video per listing
   - Edit and delete listings (with ownership verification)
   - Mark items as available, reserved, or sold

3. **Search and Filter**
   - Keyword search across item titles
   - Category filtering (Furniture, Electronics, Kitchen, etc.)
   - Sort by: Newest, Price (Low/High), Expiring Soon/Later
   - Debounced search input for optimal performance

4. **Order and Transaction Management**
   - Place orders on listings
   - Track orders as buyer and seller
   - Order status management (pending, confirmed, completed, cancelled)
   - Platform fee and tax calculation

5. **Review System**
   - Leave ratings (1-5 stars) and comments after purchase
   - View seller reviews and average ratings
   - Reviews linked to completed orders

6. **Messaging System**
   - Initiate conversations from product listings
   - Real-time message history with read/unread tracking
   - Product context preserved in conversations
   - Online/offline status indicators
   - Unread message badge notifications

### Advanced Functions

#### 1. Smart Price Suggestion

Helps sellers set appropriate prices by displaying historical transaction data from similar items sold within the apartment community.

**How it works:**
- When creating a listing, select a category and condition
- The system queries completed orders for items with matching category and condition
- Displays similar sold items with their original and final transaction prices
- Shows average sold price to guide pricing decisions

**Technical Implementation:**
- Database VIEW (`item_analytics`) aggregates pricing patterns
- Multi-table JOIN query across Item, Listing, Order, and ListingMedia tables
- Privacy-safe: Returns only item info and prices, no seller/buyer details
- Dynamic UI panel updates on category/condition selection

**Why it's advanced:**
- Uses aggregate queries with complex JOINs
- Provides building-internal pricing intelligence (novel for apartment marketplaces)
- Requires real-time data synchronization between frontend and backend

#### 2. Move-Out Countdown and Urgent Promotion

Automatically highlights listings with approaching expiration dates, helping buyers find urgent deals and encouraging sellers to complete transactions before moving out.

**How it works:**
- Each user can set their move-out date in their profile
- When creating a listing, the expiration date defaults to the user's move-out date
- Product cards display "Only X days left" urgency badges
- Listings can be sorted by "Expiring Soon" or "Expiring Later"
- Detail pages show countdown timers and savings percentages

**Technical Implementation:**
- Database indexes on `move_out_date` and `expire_date` for optimized queries
- Backend sorting by `expire_date` with ASC/DESC options
- Frontend computed properties calculate remaining days dynamically
- Automatic date pre-fill from user profile

**Why it's advanced:**
- Domain-specific feature unique to apartment communities
- Requires date calculations, index-optimized sorting, and dynamic UI
- Integrates user profile data with listing lifecycle

---

## Technology Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| Vue 3 | JavaScript framework with Composition API |
| Vue Router | Client-side routing and navigation |
| Tailwind CSS | Utility-first CSS framework |
| Axios | HTTP client for API requests |
| Vite | Build tool and development server |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | JavaScript runtime environment |
| Express.js | Web application framework |
| MySQL 8.0 | Relational database management |
| bcrypt | Password hashing and verification |
| Multer | File upload handling |
| Nodemailer | Email sending for password reset |
| CORS | Cross-origin resource sharing |

### Development Tools
| Tool | Purpose |
|------|---------|
| npm | Package management |
| IntelliJ IDEA | IDE |
| DBeaver | Database client (used to create/manage the MySQL database) |
| Git/GitHub | Version control |

---

## Database Design

### Entity-Relationship Diagram

The database consists of 13 tables with the following relationships:

```
User (1) ----< (N) UserSession
User (1) ----< (N) Item
User (1) ----< (N) Listing
User (1) ----< (N) Order
User (1) ----< (N) Review
User (1) ----< (N) Conversation (as buyer)
User (1) ----< (N) Conversation (as seller)
User (1) ----< (N) Message
User (1) ----< (N) verification_codes

Item (1) ----< (N) Listing
Item (1) ----< (N) Conversation

Listing (1) ----< (N) ListingMedia
Listing (1) ----< (N) Order

ListingMedia (1) ---- (0..1) ListingMedia_Video
ListingMedia (1) ---- (0..1) ListingMedia_Image

Order (1) ---- (0..1) Review

Conversation (1) ----< (N) Message
Message (1) ----< (N) MessageMedia
```

### Tables Overview

| Table | Description |
|-------|-------------|
| User | Registered apartment tenants with move-out dates |
| UserSession | Login/logout tracking for online status |
| Item | Individual items owned by users |
| Listing | Active marketplace listings |
| ListingMedia | Photos and videos for listings |
| ListingMedia_Video | Video-specific attributes (duration) |
| ListingMedia_Image | Image-specific attributes (dimensions, slot) |
| Conversation | Chat threads between buyers and sellers |
| Message | Individual messages within conversations |
| MessageMedia | Media attachments in messages |
| Order | Purchase transactions |
| Review | Ratings and comments from buyers |
| verification_codes | Password reset verification codes |

### Database Views

- **user_statistics**: Aggregates seller metrics (active listings, items sold, average rating)
- **item_analytics**: Price patterns by category and condition for smart pricing
- **user_online_status**: Current online/offline status per user
- **conversation_details**: Comprehensive conversation info with participant details

---

## Project Structure

```
my-web-platform/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js          # MySQL connection pool configuration
│   │   ├── controllers/
│   │   │   ├── accountController.js # User profile and listing management
│   │   │   ├── authController.js    # Login and registration
│   │   │   ├── listingController.js # Listing CRUD and price reference
│   │   │   ├── messageController.js # Messaging functionality
│   │   │   ├── orderController.js   # Order management
│   │   │   ├── passwordResetController.js # Password reset flow
│   │   │   ├── photoController.js   # Image file serving
│   │   │   ├── reviewController.js  # Review management
│   │   │   └── videoController.js   # Video file serving
│   │   ├── routes/
│   │   │   ├── accountRoutes.js     # /api/account endpoints
│   │   │   ├── authRoutes.js        # /api/auth endpoints
│   │   │   ├── listingRoutes.js     # /api/listings endpoints
│   │   │   ├── messageRoutes.js     # /api/messages endpoints
│   │   │   ├── orderRoutes.js       # /api/orders endpoints
│   │   │   ├── passwordResetRoutes.js # Password reset endpoints
│   │   │   └── reviewRoutes.js      # /api/reviews endpoints
│   │   ├── services/
│   │   │   └── verificationCodeService.js # Code generation and validation
│   │   └── server.js                # Express app entry point
│   ├── Database/
│   │   ├── photo/                   # Uploaded images storage
│   │   └── video/                   # Uploaded videos storage
│   ├── .env                         # Environment variables
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.vue    # Login page component
│   │   │   │   ├── ForgotPassword.vue # Password reset request
│   │   │   │   └── ResetPassword.vue  # New password form
│   │   │   ├── Detail.vue           # Product detail page
│   │   │   ├── MessageDialog.vue    # Floating chat window
│   │   │   └── OrderCard.vue        # Order display card
│   │   ├── pages/
│   │   │   ├── Home.vue             # Main marketplace listing page
│   │   │   ├── Account.vue          # User profile management
│   │   │   ├── Messages.vue         # Conversation list and chat
│   │   │   ├── Orders.vue           # Order history (buyer/seller)
│   │   │   ├── PostListing.vue      # Create new listing form
│   │   │   └── SellerProfile.vue    # Public seller profile view
│   │   ├── services/
│   │   │   ├── authService.js       # Authentication API calls
│   │   │   ├── listingService.js    # Listing API calls
│   │   │   ├── messageService.js    # Messaging API calls
│   │   │   ├── orderService.js      # Order API calls
│   │   │   ├── passwordResetService.js # Password reset API calls
│   │   │   └── reviewService.js     # Review API calls
│   │   ├── router/
│   │   │   └── index.js             # Vue Router configuration
│   │   ├── App.vue                  # Root Vue component
│   │   └── main.js                  # Vue app entry point
│   ├── public/
│   │   └── assets/                  # Static assets
│   ├── index.html
│   └── package.json
│
├── DATABASE_CREATION_SCRIPT.txt     # Full database schema
├── SAMPLE_DATA_SEED_SCRIPT.txt      # Test data insertion
└── README.md
```

---

## Installation

### Prerequisites

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- MySQL 8.0 or higher
- Git

### Step 1: Clone the Repository

```bash
git clone https://github.com/zzhu1622/my-web-platform.git
cd my-web-platform
```

### Step 2: Set Up the Database

1. Start MySQL server
2. Create the database and tables:

```bash
mysql -u root -p < DATABASE_CREATION_SCRIPT.txt
```

3. (Optional) Insert sample data for testing:

```bash
mysql -u root -p < SAMPLE_DATA_SEED_SCRIPT.txt
```

### Step 3: Configure Backend

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp .env.example .env
```

4. Edit `.env` with your configuration (see [Configuration](#configuration))

### Step 4: Configure Frontend

1. Navigate to frontend directory:

```bash
cd ../frontend
```

2. Install dependencies:

```bash
npm install
```

### Step 5: Start the Application

1. Start backend server (from backend directory):

```bash
npm run dev
```

Backend runs on `http://localhost:3000`

2. Start frontend development server (from frontend directory):

```bash
npm run dev
```

Frontend runs on `http://localhost:5173`

---

## Configuration

### Backend Environment Variables (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=trading_platform_db

# Server Configuration
PORT=3000

# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=AptExchange <noreply@aptexchange.com>

# Security
BCRYPT_SALT_ROUNDS=12
```

### Frontend Environment Variables

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3000/api
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/forgot-password` | Request password reset code |
| POST | `/api/auth/verify-email` | Check if email exists |
| POST | `/api/auth/verify-code` | Validate reset code |
| POST | `/api/auth/reset-password` | Set new password |

### Listings

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/listings` | Get all active listings (with filters) |
| GET | `/api/listings/:id` | Get listing details by ID |
| GET | `/api/listings/user/:uid` | Get user's own listings |
| POST | `/api/listings/create` | Create new listing (multipart) |
| GET | `/api/listings/price-reference` | Get similar sold items for pricing |

### Account

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/account/profile/:uid` | Get user profile |
| GET | `/api/account/overview/:uid` | Get user public overview |
| POST | `/api/account/change-password` | Change password |
| GET | `/api/account/listings/:uid` | Get user listings |
| GET | `/api/account/listings/edit/:listId` | Get listing for editing |
| PUT | `/api/account/listings/:listId` | Update listing |
| DELETE | `/api/account/listings/:listId` | Delete listing |

### Messages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/messages/conversations/:uid` | Get user conversations |
| GET | `/api/messages/conversation/:id` | Get conversation messages |
| POST | `/api/messages/send` | Send a message |
| POST | `/api/messages/conversation` | Create or get conversation |
| PUT | `/api/messages/read/:conversationId` | Mark messages as read |
| GET | `/api/messages/unread-count/:uid` | Get unread message count |

### Orders

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders/buyer/:uid` | Get buyer's orders |
| GET | `/api/orders/seller/:uid` | Get seller's orders |
| POST | `/api/orders/create` | Create new order |
| PUT | `/api/orders/:orderId/status` | Update order status |

### Reviews

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/reviews/create` | Create review for order |
| GET | `/api/reviews/seller/:uid` | Get seller's reviews |

### Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/photo/:filename` | Serve image file |
| GET | `/api/video/:filename` | Serve video file |

---

## Screenshots

### Login Page
The login page features a split-screen design with a background image on the left and the login form on the right.
![alt text](https://github.com/zzhu1622/my-web-platform/blob/main/demo/Login-page.png)

### Home Page (Marketplace)
The main marketplace displays product cards in a three-column grid layout with:
- Product images with urgency badges
- Category tags and pricing
- Search bar with keyword filtering
- Category dropdown filter
- Sort options (Newest, Price, Expiring Soon)
![alt text](https://github.com/zzhu1622/my-web-platform/blob/main/demo/Home-page.png)

### Post Listing Page
Two-column layout with:
- Left: Form fields for item details, media upload, and pricing
- Right: Smart Price Suggestion panel showing similar sold items
![alt text](https://github.com/zzhu1622/my-web-platform/blob/main/demo/Post-Listing-page.png)

### Messages Page
Conversation list with:
- Online/offline status indicators
- Unread message badges
- Product context in chat headers
![alt text](https://github.com/zzhu1622/my-web-platform/blob/main/demo/Message-page.png)

### Product Detail Page
Full product view with:
- Media gallery (images and videos)
- Days remaining countdown
- Savings percentage
- Seller information
- Message seller button
![alt text](https://github.com/zzhu1622/my-web-platform/blob/main/demo/Product-detail-page.png)

---

## Test Credentials

For testing with sample data:

| UID | Email | Password |
|-------|-------|----------|
| 1 | alice.johnson@email.com | password123 |
| 2 | bob.smith@email.com | password123 |
| 3 | carol.davis@email.com | password123 |
| 4 | david.wilson@email.com | password123 |
| 5 | emma.martinez@email.com | password123 |

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## License

This project was developed as part of CSC 4710 Database Systems course at Georgia State University.

---

## Acknowledgments

- Georgia State University - CSC 4710 Database Systems
- Vue.js and Tailwind CSS communities
- Node.js and Express.js communities
