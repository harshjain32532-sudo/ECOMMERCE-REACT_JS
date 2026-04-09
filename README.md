# E-Commerce React.js Application

A full-stack e-commerce application built with React.js frontend and Express.js backend, featuring user authentication, product management, shopping cart, and admin panel.

## 🚀 Features

### Frontend (React.js + Vite)
- **Modern UI**: Clean and responsive design
- **User Authentication**: Login, register, forgot password
- **Product Catalog**: Browse products with images
- **Shopping Cart**: Add/remove items, quantity management
- **User Profile**: Manage account and shipping address
- **Order History**: View past orders
- **Wishlist**: Save favorite products
- **Admin Panel**: Product and user management

### Backend (Express.js + MongoDB)
- **RESTful API**: Complete API for all operations
- **User Management**: Authentication with JWT tokens
- **Product Management**: CRUD operations for products
- **Order Processing**: Complete order lifecycle
- **Admin Features**: User and product administration
- **Security**: Password hashing, input validation
- **Database**: MongoDB with Mongoose ODM

## 🛠️ Tech Stack

### Frontend
- **React.js** - UI library
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Git

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/harshjain32532-sudo/ECOMMERCE-REACT_JS.git
cd ECOMMERCE-REACT_JS
```

### 2. Backend Setup
```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
JWT_SECRET=your_jwt_secret_key_here
ADMIN_EMAIL=admin@store.local
ADMIN_PASSWORD=admin123
MONGODB_URI=mongodb://localhost:27017/ecommerce
```

Start the backend server:
```bash
node server.js
```
Backend will run on `http://localhost:5000`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend will run on `http://localhost:5173`

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (Admin only)
- `PUT /api/products/:id` - Update product (Admin only)
- `DELETE /api/products/:id` - Delete product (Admin only)

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `GET /api/users` - Get all users (Admin only)

### Orders
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status (Admin only)

### Cart & Wishlist
- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart
- `GET /api/wishlist` - Get user wishlist
- `POST /api/wishlist` - Add to wishlist
- `DELETE /api/wishlist/:id` - Remove from wishlist

## 👤 Default Admin Account

- **Email:** admin@store.local
- **Password:** admin123

## 📁 Project Structure

```
ecommerce_full_project/
├── backend/
│   ├── package.json
│   ├── server.js
│   └── scripts/
│       └── checkUsers.js
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── src/
│   │   ├── App.js
│   │   ├── App.jsx
│   │   ├── api.js
│   │   ├── main.jsx
│   │   ├── index.css
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── Payment.jsx
│   │   │   └── ProductModal.jsx
│   │   └── pages/
│   │       ├── Admin.js
│   │       ├── Admin.jsx
│   │       ├── Cart.js
│   │       ├── Cart.jsx
│   │       ├── ForgotPassword.jsx
│   │       ├── Home.js
│   │       ├── Home.jsx
│   │       ├── Login.js
│   │       ├── Login.jsx
│   │       ├── Orders.jsx
│   │       ├── Profile.jsx
│   │       ├── Register.jsx
│   │       ├── ResetPassword.jsx
│   │       └── Wishlist.jsx
│   └── public/
│       └── (product images)
├── .gitignore
└── README.md
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcryptjs
- Input validation and sanitization
- CORS protection
- Admin role-based access control

## 🎨 UI/UX Features

- Responsive design for mobile and desktop
- Modern card-based layout
- Smooth transitions and animations
- Intuitive navigation
- Loading states and error handling
- Toast notifications

## 📱 Pages & Components

### Public Pages
- **Home**: Product catalog and featured items
- **Login/Register**: User authentication
- **Product Details**: Individual product view
- **Cart**: Shopping cart management

### User Pages (Authenticated)
- **Profile**: Account management
- **Orders**: Order history and tracking
- **Wishlist**: Saved products

### Admin Pages
- **Admin Dashboard**: User and product management
- **Product Management**: Add/edit/delete products
- **User Management**: View and manage users
- **Order Management**: Process and update orders

## 🚀 Deployment

### Backend Deployment
1. Set up MongoDB database
2. Configure environment variables
3. Deploy to services like Heroku, Railway, or Vercel
4. Update CORS settings for production domain

### Frontend Deployment
1. Build the project: `npm run build`
2. Deploy `dist/` folder to services like:
   - Vercel
   - Netlify
   - GitHub Pages
   - AWS S3 + CloudFront

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Create a Pull Request

## 📄 License

This project is for educational purposes. Feel free to use and modify.

## 📞 Support

For questions or issues, please open an issue on GitHub.

---

**Happy Shopping! 🛒**