# ReliBank - Modern Banking Application

A full-stack banking application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that provides a comprehensive suite of banking features.

## Features of the Customer Panel

- **User Authentication**
  - Secure login and registration
  - Two-factor authentication (Email & Authenticator)
  - Password recovery
  - Security questions

- **Profile Management**
  - Personal information updates
  - Security settings
  - Notification preferences
  - Two-factor authentication setup

- **Banking Features**
  - Account overview and management
  - Transaction history
  - Fund transfers (Internal & External)
  - Loan calculator and applications
  - Scheduled transfers

- **Security**
  - JWT-based authentication
  - Password encryption
  - Session management
  - Rate limiting
  - Input validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone <https://github.com/miralhsn/Bank-Management-System-Customer-Panel>
cd project
```

2. Install server dependencies:
```bash
cd server
npm install
```

3. Install client dependencies:
```bash
cd ../client
npm install
```

4. Create a `.env` file in the server directory with the following variables:
```env
MONGO_URI=mongodb://localhost:27017/bankingapp
JWT_SECRET=your_jwt_secret
PORT=3000
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
```

5. Create a `.env` file in the client directory:
```env
REACT_APP_API_URL=http://localhost:3000/api
```

## Running the Application

1. Start the MongoDB service:
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo service mongod start
```

2. Start the server (from the server directory):
```bash
npm start
```

3. Start the client (from the client directory):
```bash
npm start
```

The application will be available at `http://localhost:3000`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/2fa/update` - Update 2FA settings

### Profile Endpoints
- `GET /api/profile` - Get user profile
- `POST /api/profile/update` - Update profile
- `POST /api/profile/change-password` - Change password
- `POST /api/profile/2fa/setup` - Setup 2FA
- `POST /api/profile/2fa/verify` - Verify 2FA
- `POST /api/profile/notifications` - Update notification preferences

### Banking Endpoints
- `GET /api/accounts` - Get user accounts
- `GET /api/transactions` - Get transaction history
- `POST /api/transfers` - Create transfer
- `GET /api/loans` - Get loan information
- `POST /api/loans` - Submit loan application

## Security Considerations

1. Environment Variables
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate secrets periodically

2. Authentication
   - Use HTTPS in production
   - Implement rate limiting
   - Set secure cookie options

3. Data Protection
   - Encrypt sensitive data
   - Validate all inputs
   - Implement request sanitization

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- MongoDB for the database
- Express.js for the backend framework
- React.js for the frontend framework
- Node.js for the runtime environment
- TailwindCSS for styling
- All other open-source packages used in this project 