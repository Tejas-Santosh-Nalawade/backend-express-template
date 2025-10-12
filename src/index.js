import dotenv from 'dotenv';
import app from './app.js';
dotenv.config({ path: './.env' });

// console.log(process.env.NAME);
// console.log(`Server is running on port ${process.env.PORT}`);

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`)
})

