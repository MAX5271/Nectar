import express, { urlencoded }  from "express";
import authRouter from "./routes/auth.js";
import bodyParser from "body-parser";
import dotenv from 'dotenv/config'
import path from "node:path";


const app = express();

const PORT = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use('/api/auth',authRouter);

app.listen(PORT, ()=>{
    console.log(`Server is listening on port ${PORT}`);
})