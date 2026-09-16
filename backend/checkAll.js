const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    const users = await mongoose.connection.collection('users').find({}).toArray();
    users.forEach(u => console.log(u.email, u.role));
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
