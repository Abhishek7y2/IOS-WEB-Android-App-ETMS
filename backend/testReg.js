const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcrypt');
dotenv.config();

const { Schema, model } = mongoose;

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    try {
      const User = require('./src/models/User').default;
      const user = await User.create({
        name: 'Ashish JHA',
        firstName: 'Ashish',
        lastName: 'JHA',
        gender: 'Male',
        qualification: '10th',
        mobileNumber: '8406088794',
        countryCode: '+91',
        email: 'ashishjha007j@gmail.com',
        password: 'Password@123', // dummy password
        role: 'member',
        designation: 'Employee',
      });
      console.log('SUCCESS:', user);
    } catch (err) {
      console.error('ERROR:', err);
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
