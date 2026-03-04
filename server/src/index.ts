import dotenv from 'dotenv/config'
import express, { urlencoded }  from "express";
import authRouter from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js"
import bodyParser from "body-parser";
import cookieParser from 'cookie-parser';
// import path from "node:path";

const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use('/api/auth',authRouter);
app.use('/api/user',userRoutes);

app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);
})