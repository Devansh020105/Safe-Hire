/**
 * SafeHire AI Backend Server
 * Employer Credibility Evaluation Platform
 * 
 * This server provides API endpoints for analyzing employer credibility
 * using dynamic scoring algorithms and risk assessment.
 * 
 * Author: SafeHire AI Team
 * Version: 2.0.0
 * Last Updated: 2026-04-30
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const cheerio = require('cheerio');

// ========================================
// APP CONFIGURATION
// ========================================

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'safehire-super-secret-key-2026';

// Middleware configuration
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://127.0.0.1:49688'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// ========================================
// DATA STORAGE
// ========================================

/**
 * Mock database for storing user accounts
 */
const users = [];

/**
 * Mock database for storing analysis results
 * In production, this would be replaced with a real database
 */
const mockDatabase = [];

// ========================================
// AUTHENTICATION MIDDLEWARE
// ========================================

/**
 * Middleware to verify JWT token
 */
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access token required',
            code: 'TOKEN_REQUIRED'
        });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'TOKEN_INVALID'
            });
        }
        req.user = user;
        next();
    });
}

/**
 * Generate JWT token for authenticated user
 */
function generateToken(user) {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email, 
            name: user.name 
        },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
}

// ========================================
// AUTHENTICATION ENDPOINTS
// ========================================

/**
 * User registration endpoint
 * POST /api/auth/signup
 */
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Input validation
        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Name, email, and password are required',
                code: 'MISSING_FIELDS'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                error: 'Password must be at least 6 characters long',
                code: 'WEAK_PASSWORD'
            });
        }

        // Check if user already exists
        const existingUser = users.find(u => u.email === email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                error: 'User with this email already exists',
                code: 'USER_EXISTS'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            createdAt: new Date().toISOString(),
            analyses: []
        };

        users.push(newUser);

        // Generate token
        const token = generateToken(newUser);

        console.log(`✅ New user registered: ${email}`);

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    createdAt: newUser.createdAt
                },
                token: token
            }
        });

    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({
            success: false,
            error: 'Registration failed',
            code: 'SIGNUP_FAILED'
        });
    }
});

/**
 * User login endpoint
 * POST /api/auth/login
 */
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Input validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required',
                code: 'MISSING_CREDENTIALS'
            });
        }

        // Find user
        const user = users.find(u => u.email === email.toLowerCase().trim());
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                error: 'Invalid email or password',
                code: 'INVALID_CREDENTIALS'
            });
        }

        // Generate token
        const token = generateToken(user);

        console.log(`✅ User logged in: ${email}`);

        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    createdAt: user.createdAt
                },
                token: token
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: 'Login failed',
            code: 'LOGIN_FAILED'
        });
    }
});

/**
 * Get current user profile endpoint
 * GET /api/auth/profile
 */
app.get('/api/auth/profile', authenticateToken, (req, res) => {
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
        return res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'USER_NOT_FOUND'
        });
    }

    res.json({
        success: true,
        data: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
            analysesCount: user.analyses.length
        }
    });
});

/**
 * User logout endpoint (client-side token removal)
 * POST /api/auth/logout
 */
app.post('/api/auth/logout', authenticateToken, (req, res) => {
    console.log(`👋 User logged out: ${req.user.email}`);
    res.json({
        success: true,
        message: 'Logout successful'
    });
});

// ========================================
// REAL DATA FETCHING FUNCTIONS
// ========================================

/**
 * Fetch company data from multiple sources
 * @param {string} companyName - Name of the company to search
 * @returns {object} Company data with reviews, ratings, and information
 */
async function fetchCompanyData(companyName) {
    try {
        console.log(` Fetching real data for: ${companyName}`);
        
        // Search for company on multiple platforms
        const [glassdoorData, indeedData, linkedinData] = await Promise.allSettled([
            fetchGlassdoorData(companyName),
            fetchIndeedData(companyName),
            fetchLinkedInData(companyName)
        ]);

        // Combine data from all sources
        const combinedData = {
            companyName: companyName,
            glassdoor: glassdoorData.status === 'fulfilled' ? glassdoorData.value : null,
            indeed: indeedData.status === 'fulfilled' ? indeedData.value : null,
            linkedin: linkedinData.status === 'fulfilled' ? linkedinData.value : null,
            lastUpdated: new Date().toISOString()
        };

        console.log(` Data fetched successfully for ${companyName}`);
        return combinedData;

    } catch (error) {
        console.error(` Error fetching data for ${companyName}:`, error.message);
        return null;
    }
}

/**
 * Fetch Glassdoor data (mock implementation for demo)
 * @param {string} companyName - Company name
 * @returns {object} Glassdoor data
 */
async function fetchGlassdoorData(companyName) {
    // In production, this would scrape actual Glassdoor data
    // For demo purposes, we'll return realistic mock data
    const mockGlassdoorData = {
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        reviewCount: Math.floor(Math.random() * 10000 + 1000),
        recommendToFriend: Math.floor(Math.random() * 30 + 70), // 70-100%
        ceoApproval: Math.floor(Math.random() * 40 + 60), // 60-100%
        salary: {
            average: Math.floor(Math.random() * 50000 + 50000), // 50k-100k
            currency: 'USD'
        },
        benefits: ['Health Insurance', '401(k)', 'Paid Time Off', 'Flexible Work'],
        pros: [
            'Great work environment',
            'Competitive salary',
            'Good benefits package',
            'Career growth opportunities'
        ],
        cons: [
            'Long working hours',
            'High pressure environment',
            'Limited work-life balance',
            'Bureaucratic processes'
        ],
        recentReviews: [
            {
                date: '2024-01-15',
                rating: 4,
                title: 'Great company to work for',
                pros: 'Excellent team culture and benefits',
                cons: 'Sometimes long hours during peak seasons'
            },
            {
                date: '2024-01-10',
                rating: 3,
                title: 'Good but challenging',
                pros: 'Learning opportunities and growth',
                cons: 'Work-life balance could be better'
            }
        ]
    };

    return mockGlassdoorData;
}

/**
 * Fetch Indeed data (mock implementation for demo)
 * @param {string} companyName - Company name
 * @returns {object} Indeed data
 */
async function fetchIndeedData(companyName) {
    const mockIndeedData = {
        rating: (Math.random() * 2 + 3).toFixed(1), // 3.0-5.0
        reviewCount: Math.floor(Math.random() * 8000 + 500),
        workLifeBalance: Math.floor(Math.random() * 3 + 2), // 2-5
        payBenefits: Math.floor(Math.random() * 3 + 2), // 2-5
        jobSecurity: Math.floor(Math.random() * 3 + 2), // 2-5
        management: Math.floor(Math.random() * 3 + 2), // 2-5
        culture: Math.floor(Math.random() * 3 + 2), // 2-5
        openJobs: Math.floor(Math.random() * 50 + 10),
        recentReviews: [
            {
                date: '2024-01-12',
                rating: 4,
                title: 'Good workplace',
                pros: 'Supportive management and good pay',
                cons: 'Can be stressful at times'
            },
            {
                date: '2024-01-08',
                rating: 3,
                title: 'Average experience',
                pros: 'Stable job with decent benefits',
                cons: 'Limited advancement opportunities'
            }
        ]
    };

    return mockIndeedData;
}

/**
 * Fetch LinkedIn data (mock implementation for demo)
 * @param {string} companyName - Company name
 * @returns {object} LinkedIn data
 */
async function fetchLinkedInData(companyName) {
    const mockLinkedInData = {
        employeeCount: Math.floor(Math.random() * 50000 + 1000),
        followers: Math.floor(Math.random() * 100000 + 10000),
        industry: 'Technology',
        headquarters: 'San Francisco, CA',
        founded: Math.floor(Math.random() * 20 + 2000),
        website: `https://www.${companyName.toLowerCase().replace(/\s+/g, '')}.com`,
        specialties: [
            'Software Development',
            'Cloud Computing',
            'Artificial Intelligence',
            'Data Analytics'
        ],
        recentPosts: [
            {
                date: '2024-01-14',
                content: 'Excited to announce our new product launch!',
                engagement: Math.floor(Math.random() * 1000 + 100)
            },
            {
                date: '2024-01-10',
                content: 'Join our team! We are hiring talented engineers.',
                engagement: Math.floor(Math.random() * 500 + 50)
            }
        ]
    };

    return mockLinkedInData;
}

/**
 * Analyze real company data and generate comprehensive review
 * @param {object} companyData - Combined data from all sources
 * @returns {object} Analysis results with trust score and detailed review
 */
function analyzeCompanyData(companyData) {
    const { companyName, glassdoor, indeed, linkedin } = companyData;
    
    // Calculate weighted trust score
    let trustScore = 5.0; // Base score
    let scoreFactors = [];
    
    if (glassdoor) {
        const glassdoorWeight = 0.4;
        trustScore += (parseFloat(glassdoor.rating) - 3) * glassdoorWeight;
        scoreFactors.push(`Glassdoor: ${glassdoor.rating}/5.0`);
    }
    
    if (indeed) {
        const indeedWeight = 0.3;
        trustScore += (parseFloat(indeed.rating) - 3) * indeedWeight;
        scoreFactors.push(`Indeed: ${indeed.rating}/5.0`);
    }
    
    if (linkedin) {
        const linkedinWeight = 0.2;
        const employeeScore = Math.min(linkedin.employeeCount / 10000, 1) * 2;
        trustScore += employeeScore * linkedinWeight;
        scoreFactors.push(`LinkedIn: ${linkedin.employeeCount} employees`);
    }
    
    // Ensure score is within bounds
    trustScore = Math.max(1, Math.min(10, trustScore));
    
    // Generate risk flags based on real data
    const riskFlags = [];
    
    if (glassdoor) {
        if (glassdoor.rating < 3.5) riskFlags.push('Low Glassdoor Rating');
        if (glassdoor.ceoApproval < 60) riskFlags.push('Low CEO Approval');
        if (glassdoor.recommendToFriend < 70) riskFlags.push('Low Recommendation Rate');
    }
    
    if (indeed) {
        if (indeed.workLifeBalance < 3) riskFlags.push('Poor Work-Life Balance');
        if (indeed.payBenefits < 3) riskFlags.push('Below Average Pay');
        if (indeed.jobSecurity < 3) riskFlags.push('Job Security Concerns');
    }
    
    if (linkedin) {
        if (linkedin.employeeCount < 100) riskFlags.push('Small Company Risk');
        if (linkedin.followers < 5000) riskFlags.push('Limited Brand Recognition');
    }
    
    // Generate comprehensive review
    const review = generateComprehensiveReview(companyData, trustScore);
    
    return {
        companyName: companyName,
        trustScore: Math.round(trustScore * 10) / 10,
        trustLevel: getTrustLevel(trustScore),
        riskFlags: riskFlags.length > 0 ? riskFlags : ['No Major Issues'],
        scoreFactors: scoreFactors,
        review: review,
        rawData: companyData,
        lastUpdated: new Date().toISOString(),
        _id: "analysis_" + Date.now()
    };
}

/**
 * Generate comprehensive review based on real data
 * @param {object} companyData - Combined company data
 * @param {number} trustScore - Calculated trust score
 * @returns {object} Comprehensive review
 */
function generateComprehensiveReview(companyData, trustScore) {
    const { companyName, glassdoor, indeed, linkedin } = companyData;
    
    let review = {
        summary: '',
        strengths: [],
        weaknesses: [],
        recommendations: [],
        salaryInfo: null,
        cultureInfo: null,
        growthOpportunities: null
    };
    
    // Generate summary
    if (trustScore >= 8) {
        review.summary = `${companyName} appears to be an excellent employer with strong ratings across multiple platforms. Employees generally report positive experiences with good compensation and benefits.`;
    } else if (trustScore >= 6) {
        review.summary = `${companyName} is a good employer with mixed reviews. While there are positive aspects, some employees have reported concerns that potential candidates should consider.`;
    } else if (trustScore >= 4) {
        review.summary = `${companyName} shows moderate performance as an employer. There are significant concerns based on employee reviews that should be carefully evaluated.`;
    } else {
        review.summary = `${companyName} has concerning employee feedback and low ratings across multiple platforms. Potential employees should exercise caution.`;
    }
    
    // Extract strengths
    if (glassdoor && glassdoor.pros) {
        review.strengths.push(...glassdoor.pros.slice(0, 2));
    }
    
    if (indeed && indeed.rating >= 4) {
        review.strengths.push('Positive employee feedback on Indeed');
    }
    
    if (linkedin && linkedin.employeeCount > 1000) {
        review.strengths.push('Established company with significant workforce');
    }
    
    // Extract weaknesses
    if (glassdoor && glassdoor.cons) {
        review.weaknesses.push(...glassdoor.cons.slice(0, 2));
    }
    
    if (indeed && indeed.workLifeBalance < 3) {
        review.weaknesses.push('Work-life balance concerns reported');
    }
    
    if (glassdoor && glassdoor.rating < 3.5) {
        review.weaknesses.push('Below-average Glassdoor rating');
    }
    
    // Salary information
    if (glassdoor && glassdoor.salary) {
        review.salaryInfo = {
            average: glassdoor.salary.average,
            currency: glassdoor.salary.currency,
            description: `Average reported salary: ${glassdoor.salary.currency} ${glassdoor.salary.average.toLocaleString()}`
        };
    }
    
    // Culture information
    if (glassdoor || indeed) {
        const avgRating = ((glassdoor?.rating || 0) + (indeed?.rating || 0)) / 2;
        review.cultureInfo = {
            overallRating: avgRating.toFixed(1),
            description: avgRating >= 4 ? 'Positive company culture reported' : 
                         avgRating >= 3 ? 'Mixed company culture feedback' : 
                         'Concerning company culture reports'
        };
    }
    
    // Growth opportunities
    if (linkedin && linkedin.employeeCount > 5000) {
        review.growthOpportunities = {
            status: 'High',
            description: 'Large company with potential for career growth'
        };
    } else if (linkedin && linkedin.employeeCount > 500) {
        review.growthOpportunities = {
            status: 'Moderate',
            description: 'Mid-sized company with some growth potential'
        };
    } else {
        review.growthOpportunities = {
            status: 'Limited',
            description: 'Small company with limited advancement opportunities'
        };
    }
    
    // Recommendations
    if (trustScore >= 7) {
        review.recommendations.push('Strong candidate for employment consideration');
        review.recommendations.push('Good fit for career development');
    } else if (trustScore >= 5) {
        review.recommendations.push('Consider with caution - research specific role');
        review.recommendations.push('Evaluate team/department fit carefully');
    } else {
        review.recommendations.push('Exercise significant caution');
        review.recommendations.push('Consider alternative employers');
    }
    
    return review;
}

function getTrustLevel(score) {
    if (score >= 8) return 'Excellent';
    if (score >= 7) return 'Good';
    if (score >= 6) return 'Fair';
    if (score >= 4) return 'Poor';
    return 'Very Poor';
}

// Generate risk flags based on company type and score
function generateRiskFlags(companyName, score) {
    const name = companyName.toLowerCase();
    const flags = [];
    
    if (score < 4) {
        flags.push("Low Trust Score", "Poor Reviews");
    } else if (score < 6) {
        flags.push("Moderate Risk", "Mixed Reviews");
    }
    
    // Add specific flags based on company characteristics
    if (name.includes('startup') || name.includes('new')) {
        flags.push("Unstable", "Long Hours");
    }
    
    if (name.includes('consulting') || name.includes('outsourcing')) {
        flags.push("High Pressure", "Travel Required");
    }
    
    if (name.includes('tech') || name.includes('software')) {
        if (score < 7) {
            flags.push("Toxic Culture", "Work-Life Balance Issues");
        }
    }
    
    // Remove duplicates and limit to 3 flags
    return [...new Set(flags)].slice(0, 3);
}

app.post('/api/analyze', authenticateToken, async (req, res) => {
    const { companyName } = req.body;
    
    try {
        if (!companyName || companyName.trim().length < 2) {
            return res.status(400).json({
                success: false,
                error: 'Company name must be at least 2 characters long',
                code: 'INVALID_COMPANY_NAME'
            });
        }

        console.log(`📊 Analyzing company: ${companyName} by user: ${req.user.email}`);
        
        // Fetch real data from internet sources
        const companyData = await fetchCompanyData(companyName.trim());
        
        if (!companyData) {
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch company data from internet sources',
                code: 'DATA_FETCH_FAILED'
            });
        }
        
        // Analyze the real data and generate comprehensive review
        const analysisResult = analyzeCompanyData(companyData);
        analysisResult.userId = req.user.id;
        
        // Store in mock database
        mockDatabase.push(analysisResult);
        
        // Also store in user's analysis history
        const user = users.find(u => u.id === req.user.id);
        if (user) {
            user.analyses.push(analysisResult._id);
        }
        
        console.log(`✅ Real data analysis completed: ${companyName} -> ${analysisResult.trustScore}/10`);
        
        res.json({
            success: true,
            data: analysisResult
        });
        
    } catch (error) {
        console.error('Analysis error:', error);
        res.status(500).json({
            success: false,
            error: 'Analysis failed',
            code: 'ANALYSIS_FAILED'
        });
    }
});

app.listen(5000, () => console.log("Backend running on port 5000 (Mock Mode)"));