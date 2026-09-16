const mongoose = require('mongoose');

// Need to match the schema
const holidaySchema = new mongoose.Schema({
  holidayName: String,
  holidayDate: Date,
  holidayType: String,
  description: String,
  location: String,
  department: String,
  isOptional: Boolean,
  isRecurring: Boolean,
  recurrenceType: String,
  status: String,
}, { timestamps: true });

const Holiday = mongoose.model('Holiday', holidaySchema);

const holidays2026 = [
  { holidayName: 'Republic Day', holidayDate: new Date('2026-01-26T00:00:00.000Z'), holidayType: 'National Holiday', status: 'Completed' },
  { holidayName: 'Holi', holidayDate: new Date('2026-03-03T00:00:00.000Z'), holidayType: 'Festival Holiday', status: 'Completed' },
  { holidayName: 'Good Friday', holidayDate: new Date('2026-04-03T00:00:00.000Z'), holidayType: 'Festival Holiday', status: 'Completed' },
  { holidayName: 'Independence Day', holidayDate: new Date('2026-08-15T00:00:00.000Z'), holidayType: 'National Holiday', status: 'Upcoming' },
  { holidayName: 'Raksha Bandhan', holidayDate: new Date('2026-08-28T00:00:00.000Z'), holidayType: 'Festival Holiday', status: 'Upcoming' },
  { holidayName: 'Gandhi Jayanti', holidayDate: new Date('2026-10-02T00:00:00.000Z'), holidayType: 'National Holiday', status: 'Upcoming' },
  { holidayName: 'Dussehra', holidayDate: new Date('2026-10-19T00:00:00.000Z'), holidayType: 'Festival Holiday', status: 'Upcoming' },
  { holidayName: 'Diwali', holidayDate: new Date('2026-11-08T00:00:00.000Z'), holidayType: 'Festival Holiday', status: 'Upcoming' },
  { holidayName: 'Christmas', holidayDate: new Date('2026-12-25T00:00:00.000Z'), holidayType: 'Festival Holiday', status: 'Upcoming' },
];

async function seed() {
  try {
    await mongoose.connect('mongodb+srv://sou_db_user:Icz3JvSnEIqw4qtK@cluster0.l4rdehi.mongodb.net/?appName=Cluster0');
    console.log('Connected to MongoDB');
    
    // Check existing
    for (const h of holidays2026) {
      const exists = await Holiday.findOne({ holidayName: h.holidayName, holidayDate: h.holidayDate });
      if (!exists) {
        await Holiday.create(h);
        console.log(`Inserted ${h.holidayName}`);
      } else {
        console.log(`${h.holidayName} already exists`);
      }
    }
    console.log('Done!');
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
}

seed();
