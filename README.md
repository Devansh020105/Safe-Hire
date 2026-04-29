# This is my Copy right project
## Devansh Sharma 
## roll no. 2210991496
## Chitkara University

## Diary Number : SW-20768/2026-CO

# SafeHire AI - Quantum Employer Credibility Evaluation Platform


SafeHire AI is an advanced quantum-powered platform that evaluates employer credibility using cutting-edge AI algorithms, real-time data analysis from multiple sources (Glassdoor, Indeed, LinkedIn), and comprehensive risk assessment to help job seekers make informed career decisions.

## 🚀 Features

### Core Functionality
- **Real-time Employer Analysis**: Fetches live data from Glassdoor, Indeed, and LinkedIn
- **AI-Powered Trust Scoring**: Advanced sentiment analysis and risk detection algorithms
- **Comprehensive Reviews**: Detailed company analysis with strengths, weaknesses, and recommendations
- **User Authentication**: Secure JWT-based authentication system
- **Futuristic UI**: Immersive quantum-themed interface with animations

### Technical Features
- **Multi-Source Data Integration**: Aggregates data from multiple employment platforms
- **Sentiment Analysis**: NLTK-powered text analysis for review credibility
- **Risk Flag Detection**: Identifies potential red flags in employer practices
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Updates**: Live data fetching and analysis

## 🏗️ Architecture

```
SafeHire AI/
├── trust_engine.py          # Python AI module for sentiment analysis
├── safehire-backend/        # Node.js/Express API server
│   ├── server.js           # Main server file with API endpoints
│   └── package.json        # Backend dependencies
└── safehire-ui/            # React frontend application
    ├── src/
    │   ├── App.js         # Main React component
    │   ├── App.css        # Styling
    │   └── index.js       # App entry point
    ├── public/
    │   └── index.html     # HTML template
    └── package.json       # Frontend dependencies
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React 18** - UI framework
- **React DOM** - Virtual DOM rendering
- **CSS3** - Styling with animations
- **Google Fonts (Orbitron)** - Futuristic typography

### AI/ML
- **Python 3.8+** - AI processing
- **NLTK** - Natural Language Toolkit
- **VADER Sentiment Analysis** - Pre-trained sentiment model

## 📋 Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

## 🚀 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/Devansh020105/Safe-Hire.git
cd Safe-Hire
```

### 2. Backend Setup

#### Install Dependencies
```bash
cd safehire-backend
npm install
```

#### Start the Backend Server
```bash
npm start
```
The backend will start on `http://localhost:5000`

### 3. Frontend Setup

#### Install Dependencies
```bash
cd ../safehire-ui
npm install
```

#### Start the Frontend Application
```bash
npm start
```
The frontend will start on `http://localhost:3000`

### 4. Python AI Module Setup

#### Install Python Dependencies
```bash
pip install nltk
```

#### Run the AI Module (Optional - for testing)
```bash
python ../trust_engine.py
```

## 📖 Usage

### Accessing the Application
1. Open your browser and navigate to `http://localhost:3000`
2. Register a new account or login with existing credentials
3. Enter a company name in the search field
4. Click "Analyze Credibility" to get comprehensive employer evaluation

### API Endpoints

#### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/logout` - User logout

#### Analysis
- `POST /api/analyze` - Analyze company credibility (requires authentication)

#### Request Example
```javascript
// Login
const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123'
  })
});

// Analyze company
const analysisResponse = await fetch('http://localhost:5000/api/analyze', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    companyName: 'Google'
  })
});
```

## 🔍 How It Works

### Trust Score Calculation
1. **Data Collection**: Fetches real-time data from Glassdoor, Indeed, and LinkedIn
2. **Sentiment Analysis**: Uses NLTK VADER to analyze review sentiments
3. **Risk Detection**: Identifies keywords indicating potential issues
4. **Weighted Scoring**: Combines multiple factors for comprehensive evaluation
5. **Review Generation**: Creates detailed analysis with recommendations

### Scoring Scale
- **9-10**: Excellent - Highly recommended
- **7-8**: Good - Generally positive
- **5-6**: Fair - Mixed reviews
- **3-4**: Poor - Significant concerns
- **1-2**: Very Poor - High risk

## 🧪 Testing

### Backend Testing
```bash
cd safehire-backend
npm test
```

### Frontend Testing
```bash
cd safehire-ui
npm test
```

### Python Module Testing
```bash
python trust_engine.py
```

## 🚀 Deployment

### Backend Deployment
```bash
cd safehire-backend
npm run build
# Deploy to your preferred hosting service (Heroku, AWS, etc.)
```

### Frontend Deployment
```bash
cd safehire-ui
npm run build
# Deploy build/ folder to static hosting (Netlify, Vercel, etc.)
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow ESLint configuration for JavaScript/React code
- Use meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **SafeHire AI Team** - Initial development
- **Devansh** - Project maintainer

## 🙏 Acknowledgments

- NLTK library for natural language processing
- React community for the amazing framework
- Open source contributors

## 📞 Support

If you have any questions or need help:

- Open an issue on GitHub
- Contact the maintainers
- Check the documentation

---

**SafeHire AI** - Making informed career decisions with quantum-powered intelligence! 🚀
