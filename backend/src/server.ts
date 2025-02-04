import express, { Express, Request, Response } from "express";
import { Pool } from 'pg';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.BACKEND_PORT

app.use(cors());

const pool = new Pool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,  
    port: 5432,
});

app.get('/electricity', async (req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM electricitydata'); 
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});