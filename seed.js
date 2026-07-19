require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/she_can_foundation';

// Mongoose Models definition for seeding
const submissionSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const adminSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Submission = mongoose.model('Submission', submissionSchema);
const Admin = mongoose.model('Admin', adminSchema);

// Dataset Definitions
const submissions = [
  // 1. General Contacts
  {
    name: "Aarav Sharma",
    email: "aarav.sharma@gmail.com",
    message: "Hello! I would love to know more about your digital literacy campaigns for women.",
    createdAt: new Date(Date.now() - 3600000 * 2)
  },
  {
    name: "Priya Patel",
    email: "priya.patel@yahoo.com",
    message: "Are there any partnership opportunities available for corporations in Mumbai?",
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    name: "Ananya Iyer",
    email: "ananya.iyer@outlook.com",
    message: "Outstanding work you guys are doing! Let me know if you need any legal consulting support.",
    createdAt: new Date(Date.now() - 3600000 * 12)
  },
  // 2. Volunteers
  {
    name: "Neha Gupta",
    email: "neha.gupta@gmail.com",
    message: "[VOLUNTEER APPLICATION]\nPhone: +91 9876543210\nArea of Interest: Teaching & Digital Skills\n\nStatement of Purpose:\nI have over 3 years of experience teaching basic computer literacy to young girls. I want to contribute 4 hours every weekend to help empower women through your foundation.",
    createdAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    name: "Vikram Malhotra",
    email: "vikram.m@gmail.com",
    message: "[VOLUNTEER APPLICATION]\nPhone: +91 8765432109\nArea of Interest: Social Media & Marketing\n\nStatement of Purpose:\nI am a professional content creator and brand strategist. I want to volunteer my skills to raise awareness of She Can Foundation campaigns.",
    createdAt: new Date(Date.now() - 3600000 * 36)
  },
  {
    name: "Kriti Sen",
    email: "kriti.sen@yahoo.com",
    message: "[VOLUNTEER APPLICATION]\nPhone: +91 7654321098\nArea of Interest: Healthcare & Counseling\n\nStatement of Purpose:\nAs a certified counselor, I would love to host mental wellness and emotional health support workshops for underprivileged women.",
    createdAt: new Date(Date.now() - 3600000 * 48)
  },
  // 3. Appointed Admin records for rendering in the Team tab
  {
    name: "Reeta Mishra",
    email: "president@shecanfoundation.org",
    message: "[TEAM MEMBER] Appointed as Admin",
    createdAt: new Date(Date.now() - 3600000 * 120)
  },
  {
    name: "Siddharth Roy",
    email: "siddharth.roy@shecanfoundation.org",
    message: "[TEAM MEMBER] Appointed as Admin",
    createdAt: new Date(Date.now() - 3600000 * 150)
  }
];

const defaultAdmins = [
  {
    name: "Reeta Mishra",
    email: "president@shecanfoundation.org",
    passwordRaw: "admin123"
  },
  {
    name: "Siddharth Roy",
    email: "siddharth.roy@shecanfoundation.org",
    passwordRaw: "admin123"
  }
];

async function seed() {
  console.log("🚀 Connecting to MongoDB...");
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("🌿 Connected successfully to MongoDB");

    // Clean existing database records to avoid duplicates
    console.log("🧹 Cleaning old records...");
    await Submission.deleteMany({});
    await Admin.deleteMany({});

    // 1. Seed Submissions (Contacts, Volunteers, and Audited Team records)
    console.log("📥 Seeding submissions dataset...");
    const createdSubmissions = await Submission.insertMany(submissions);
    console.log(`✅ Seeded ${createdSubmissions.length} submissions successfully.`);

    // 2. Seed Admin Credentials with Bcrypt Hashing
    console.log("🔐 Hashing admin passwords and seeding credentials...");
    for (const adm of defaultAdmins) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(adm.passwordRaw, salt);

      const newAdmin = new Admin({
        name: adm.name,
        email: adm.email,
        password: hashedPassword
      });

      await newAdmin.save();
      console.log(`👤 Seeded login account for: ${adm.name} (${adm.email})`);
    }

    console.log("\n======================================================");
    console.log("🏁 Database seeding completed successfully!");
    console.log("🔑 Use the following credentials to access the Dashboard:");
    console.log("   📧 Email: president@shecanfoundation.org");
    console.log("   🔑 Password: admin123");
    console.log("======================================================\n");

  } catch (error) {
    console.error("❌ Seeding failed with error:", error);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
  }
}

seed();
