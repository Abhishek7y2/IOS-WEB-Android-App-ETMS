const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to DB');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // check users in the users collection
    const usersCount = await mongoose.connection.collection('users').countDocuments();
    console.log('Users count:', usersCount);
    const someUser = await mongoose.connection.collection('users').findOne({});
    console.log('One user:', someUser);
    
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
