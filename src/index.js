import dotenv from 'dotenv';
import app from './app.js';
import connectDB from './db/index.js';
dotenv.config({ path: './.env' });

// console.log(process.env.NAME);
// console.log(`Server is running on port ${process.env.PORT}`);

const port = process.env.PORT || 3000;

// app.listen(port, () => {
//   console.log(`Example app listening on port http://localhost:${port}`)
// })


connectDB()
 .then(() => {
    app.listen(port, () => {
        console.log(`Server is running on port http://localhost:${port}`);
    });
 })
 .catch((error) => {
    console.error("Failed to connect to the database:", error);
 });  