const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB for migration');
    const db = mongoose.connection.db;
    const tasksCollection = db.collection('tasks');
    const result = await tasksCollection.updateMany(
      { createdBy: { $exists: true } },
      { $rename: { "createdBy": "assignedBy" } }
    );
    console.log('Migration completed:', result);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
