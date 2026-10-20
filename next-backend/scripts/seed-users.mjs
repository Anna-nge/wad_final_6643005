import nextEnv from "@next/env";
import bcrypt from "bcrypt";
import { MongoClient } from "mongodb";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const testUsers = [
  { username: "student1", email: "student1@example.com", password: "Student123!", role: "Student" },
  { username: "student2", email: "student2@example.com", password: "Student123!", role: "Student" },
  { username: "student3", email: "student3@example.com", password: "Student123!", role: "Student" },
  { username: "teacher1", email: "teacher1@example.com", password: "Teacher123!", role: "Teacher" },
  { username: "teacher2", email: "teacher2@example.com", password: "Teacher123!", role: "Teacher" },
  { username: "teacher3", email: "teacher3@example.com", password: "Teacher123!", role: "Teacher" },
];

const uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Set MONGODB_URI in .env.local before seeding test users");
}

const client = new MongoClient(uri);

try {
  await client.connect();
  const db = client.db(process.env.DB_NAME || "wad_final");
  const users = db.collection("users");

  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ email: 1 }, { unique: true });

  for (const testUser of testUsers) {
    const password = await bcrypt.hash(testUser.password, 12);
    await users.updateOne(
      { email: testUser.email },
      {
        $set: {
          username: testUser.username,
          email: testUser.email,
          password,
          role: testUser.role,
        },
        $setOnInsert: { createdAt: new Date() },
      },
      { upsert: true },
    );
    console.log(`Seeded ${testUser.role}: ${testUser.email}`);
  }
} finally {
  await client.close();
}
