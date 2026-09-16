const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    const result = await mongoose.connection.collection('users').updateMany(
      { role: 'user' },
      { $set: { role: 'member' } }
    );
    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
