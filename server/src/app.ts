import dotenv from "dotenv";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

// Derive __dirname for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.routes';
import tripRoutes from './routes/trip.routes';

dotenv.config();

const app: Application = express();

// Core middleware
app.set('trust proxy', 1);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, "../public")));

// CORS setup
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
}));

// Health check
app.get('/', (req: Request, res: Response) => {
    res.status(200).json({ message: "Nomadly API is alive" });
})

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
    if (req.path.startsWith("/api/"))
        return res.status(404).json({
            success: false,
            error: "API endpoint not found"
        });

    return res.status(404).send("404 | Not Found");
});

// Error Handling Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            success: false,
            message: 'Validation error',
            errors: Object.values(err.errors).map((e: any) => e.message)
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(409).json({
            success: false,
            message: 'Duplicate field value entered'
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Token expired'
        });
    }

    // Multer file upload errors
    if (err.name === 'MulterError') {
        return res.status(400).json({
            success: false,
            message: `File upload error: ${err.message}`
        });
    }

    // Default error
    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || 'Internal server error'
    });
});


export default app;