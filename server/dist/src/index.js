import dotenv from 'dotenv/config';
import express from "express";
import authRouter from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
import dietRouter from './routes/dietRoutes.js';
import cors from 'cors';
const app = express();
const PORT = process.env.PORT || 5000;
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));
app.use('/api/auth', authRouter);
app.use('/api/user', userRoutes);
app.use('/api/diet', dietRouter);
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map