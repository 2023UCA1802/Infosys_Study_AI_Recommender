const express = require("express");
const app = express();
const dotenv = require("dotenv");
const { MongoClient, ObjectId } = require("mongodb");
const url = process.env.MONGO_URI || "mongodb://localhost:27017/";
const cors = require("cors");
const jwt = require("jsonwebtoken");
const client = new MongoClient(url);
const dbname = "Infosys";
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
dotenv.config();
const { encrypt, decrypt } = require("./cryptoutils");
const { parseConnectionUrl } = require("nodemailer/lib/shared");

app.use(cookieParser());
const port = 3000;



app.use(bodyParser.json());

client.connect().then(() => {
  const db = client.db(dbname);
  db.collection("Sessions").createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 3600 }
  );
  db.collection("otps").createIndex(
    { createdAt: 1 },
    { expireAfterSeconds: 300 }
  );
});
app.use((req, res, next) => {
  console.log("Request Origin:", req.headers.origin);
  next();
});

app.use(cors({
  origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
  credentials: true
}));

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "yourSecretKey";
const TOKEN_EXPIRY = process.env.TOKEN_EXPIRY || "1h";


const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.AUTH_EMAIL || "",
    pass: process.env.AUTH_PASS || "",
  },
});

const otpverification = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "OTP Verification",
      text: `Your OTP is ${otp}`,
    };

    await transporter.sendMail(mailOptions);
    return otp;
  } catch (error) {
    console.error("Error in OTP verification:", error);
  }
};

router.post("/change-password", async (req, res) => {
  const { email, password } = req.body;
  const db = client.db(dbname);
  const user = await db.collection("Users").findOne({ email });
  if (!user) {
    return res.status(404).json({ success: false, message: "User not found" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  await db
    .collection("Users")
    .updateOne(
      { email: email },
      { $set: { password: hashedPassword } },
      { upsert: true }
    );
  const token = jwt.sign({ email: email, username: user.username }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  await db
    .collection("Sessions")
    .insertOne({ email: email, token, createdAt: new Date() });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 3600000,
  });

  res.status(200).json({ success: true, message: "Email sent successfully", username: user.username });
});
router.post("/send-email", async (req, res) => {
  const { email } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");
  const existing = await collection.findOne({ email: email });
  console.log(email);
  if (existing) {
    console.log(email)
      return res
      .status(400)
      .json({ success: false, message: "User already exists" });
    }

  const otp = await otpverification(email);
  if (!otp) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email" });
  }


  await db
    .collection("otps")
    .updateOne(
      { email: email },
      { $set: { otp: otp, createdAt: new Date() } },
      { upsert: true }
    );

  res.status(200).json({ success: true, message: "Email sent successfully" });
});

router.post("/send-emailforgot", async (req, res) => {
  const { email } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");
  const existing = await collection.findOne({ email: email });
  console.log(email);
 

  const otp = await otpverification(email);
  if (!otp) {
    return res
      .status(500)
      .json({ success: false, message: "Failed to send email" });
  }


  await db
    .collection("otps")
    .updateOne(
      { email: email },
      { $set: { otp: otp, createdAt: new Date() } },
      { upsert: true }
    );

  res.status(200).json({ success: true, message: "Email sent successfully" });
});


app.get("/", async (req, res) => {
  const user = req.query.user;
  const db = client.db(dbname);
  const collection = db.collection("passwords");
  const findresult = await collection.find({ user: user }).toArray();
  const decryptedResults = findresult.map(entry => ({
    id: entry.id,
    site: decrypt(entry.site),
    username: decrypt(entry.username),
    password: decrypt(entry.password),
    user: entry.user,
  }));

  res.json(decryptedResults);
});


router.post("/login", async (req, res) => {
  const { user, password } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");

  const found = await collection.findOne({ email: user });
  const username = found.username;
  console.log(username)
  if (!found) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, found.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }

  const token = jwt.sign({ email: user, username: username, role: found.role || "student" }, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });

  await db
    .collection("Sessions")
    .insertOne({ email: user, token, createdAt: new Date() });

  res.cookie("token", token, {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
    maxAge: 3600000,
  });

  res.status(200).json({ success: true, username: username, role: found.role || "student", image: found.image });
});

router.delete("/logout", async (req, res) => {
  console.log("here")
  const db = client.db(dbname);
  const collection = db.collection("Sessions");
  const token = req.cookies?.token;
  if (!token) {
    return res
      .status(400)
      .json({ success: false, message: "Token not found in cookies" });
  }
  const decoded = jwt.verify(token, JWT_SECRET);
  const email = decoded.email;
  const result = await collection.deleteOne({ email: email, token: token });

  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "Lax",
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
    deleted: result.deletedCount,
  });
});

router.get("/verify", async (req, res) => {
  const db = client.db(dbname);
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ success: false });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const session = await db
      .collection("Sessions")
      .findOne({ email: payload.email, token });

    if (!session) return res.status(403).json({ success: false });

    const user = await db.collection("Users").findOne({ email: payload.email });

    res.json({ 
      success: true, 
      email: payload.email, 
      username: payload.username, 
      role: payload.role,
      image: user ? user.image : null
    });
  } catch (err) {
    return res.status(403).json({ success: false });
  }
});
app.use(router);


app.post("/signupforgot", async (req, res) => {
  const user = req.body;
  const db = client.db(dbname);
  const userCollection = db.collection("Users");
  const otpCollection = db.collection("otps");
  const sessionCollection = db.collection("Sessions");


  try {
    console.log(user.email)
    const stored = await otpCollection.findOne({ email: user.email });
    const isExpired = new Date() - new Date(stored.createdAt) > 5 * 60 * 1000;

    if (isExpired) {
      return res
        .status(410)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (!stored) return res.status(400).json({ message: "Email not found." });
    if (stored.otp != user.otp) {

      return res.status(401).json({ message: "Invalid OTP." });
    }
    await otpCollection.deleteOne({ email: user.email });
   

   
    res.status(201).json({
      success: true,
      message: "User created successfully",
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});
app.post("/signup", async (req, res) => {
  const user = req.body;
  const db = client.db(dbname);
  const userCollection = db.collection("Users");
  const otpCollection = db.collection("otps");
  const sessionCollection = db.collection("Sessions");


  try {
    console.log(user.email)
    const stored = await otpCollection.findOne({ email: user.email });
    const isExpired = new Date() - new Date(stored.createdAt) > 5 * 60 * 1000;

    if (isExpired) {
      return res
        .status(410)
        .json({ message: "OTP expired. Please request a new one." });
    }

    if (!stored) return res.status(400).json({ message: "Email not found." });
    if (stored.otp != user.otp) {

      return res.status(401).json({ message: "Invalid OTP." });
    }
    await otpCollection.deleteOne({ email: user.email });
    const hashedPassword = await bcrypt.hash(user.password, 10);
    await userCollection.insertOne({
      email: user.email,
      username: user.username,
      password: hashedPassword,
      institution: user.institution,
      role: "student",
    });
    const token = jwt.sign({ email: user.email, username: user.username, role: "student" }, JWT_SECRET, {
      expiresIn: TOKEN_EXPIRY,
    });
    await sessionCollection.insertOne({
      email: user.email,
      token,
      createdAt: new Date(),
      institution: user.institution,
    });
    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
      maxAge: 3600000,
    });
    res.status(201).json({
      success: true,
      message: "User created successfully",
      username: user.username,
      role: "student",
      image: null
    });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});





// Feedback Endpoints

// POST: Create Feedback
router.post("/api/feedback", async (req, res) => {
  const { userEmail, subject, category, rating, message } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Feedback");

  try {
    const newFeedback = {
      userEmail,
      subject,
      category,
      rating: parseInt(rating),
      message,
      status: category === "General" ? "Resolved" : "Pending",
      createdAt: new Date()
    };
    
    const result = await collection.insertOne(newFeedback);
    res.status(201).json({ success: true, message: "Feedback submitted successfully", feedback: { ...newFeedback, _id: result.insertedId } });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET: Get User's Feedback
router.get("/api/feedback", async (req, res) => {
  const { userEmail } = req.query;
  const db = client.db(dbname);
  const collection = db.collection("Feedback");

  try {
    const feedbacks = await collection.find({ userEmail }).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT: Update Feedback
router.put("/api/feedback/:id", async (req, res) => {
  const { id } = req.params;
  const { subject, category, rating, message } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Feedback");

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { subject, category, rating: parseInt(rating), message, updatedAt: new Date() } }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Feedback not found or not modified" });
    }

    res.json({ success: true, message: "Feedback updated successfully" });
  } catch (error) {
    console.error("Error updating feedback:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE: Delete Feedback
router.delete("/api/feedback/:id", async (req, res) => {
  const { id } = req.params;
  const db = client.db(dbname);
  const collection = db.collection("Feedback");

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Admin Feedback Endpoints

// GET: All Feedback (Admin)
router.get("/api/admin/all-feedback", async (req, res) => {
  const db = client.db(dbname);
  const collection = db.collection("Feedback");

  try {
    const feedbacks = await collection.find({}).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, feedbacks });
  } catch (error) {
    console.error("Error fetching all feedback:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT: Update Feedback Status (Admin)
router.put("/api/admin/feedback/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Feedback");

  try {
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "Feedback not found" });
    }

    res.json({ success: true, message: "Status updated successfully" });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Goals Endpoints

// POST: Create Goal
router.post("/api/goals", async (req, res) => {
  const { userEmail, title, description, deadline, targetCompletionDate } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Goals");

  try {
    const newGoal = {
      userEmail,
      title,
      description,
      deadline: deadline ? new Date(deadline) : null,
      targetCompletionDate: targetCompletionDate ? new Date(targetCompletionDate) : null,
      progress: 0,
      status: "Pending",
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await collection.insertOne(newGoal);
    res.status(201).json({ success: true, message: "Goal created successfully", goal: { ...newGoal, _id: result.insertedId } });
  } catch (error) {
    console.error("Error creating goal:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET: Get User's Goals
router.get("/api/goals", async (req, res) => {
  const { userEmail } = req.query;
  const db = client.db(dbname);
  const collection = db.collection("Goals");

  try {
    const goals = await collection.find({ userEmail }).sort({ createdAt: -1 }).toArray();
    res.json({ success: true, goals });
  } catch (error) {
    console.error("Error fetching goals:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT: Update Goal
router.put("/api/goals/:id", async (req, res) => {
  const { id } = req.params;
  const { title, description, progress, status, deadline, targetCompletionDate } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Goals");

  try {
    const updateFields = {
      updatedAt: new Date()
    };
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    if (progress !== undefined) updateFields.progress = parseInt(progress);
    if (status !== undefined) updateFields.status = status;
    if (deadline !== undefined) updateFields.deadline = deadline ? new Date(deadline) : null;
    if (targetCompletionDate !== undefined) updateFields.targetCompletionDate = targetCompletionDate ? new Date(targetCompletionDate) : null;

    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ success: false, message: "Goal not found or not modified" });
    }

    res.json({ success: true, message: "Goal updated successfully" });
  } catch (error) {
    console.error("Error updating goal:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE: Delete Goal
router.delete("/api/goals/:id", async (req, res) => {
  const { id } = req.params;
  const db = client.db(dbname);
  const collection = db.collection("Goals");

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Goal not found" });
    }

    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    console.error("Error deleting goal:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Schedule Endpoints

// POST: Create Schedule Task
router.post("/api/schedule", async (req, res) => {
  const { userEmail, title, date, startTime, endTime, description } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Schedule");

  try {
    const newTask = {
      userEmail,
      title,
      date,
      startTime,
      endTime,
      description,
      createdAt: new Date()
    };
    
    // For this specific request "add and delete tasks at any time with each timeline of 1 hour",
    // We will just store whatever the frontend sends.
    
    const result = await collection.insertOne(newTask);
    res.status(201).json({ success: true, message: "Task added successfully", task: { ...newTask, _id: result.insertedId } });
  } catch (error) {
    console.error("Error adding schedule task:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET: Get User's Schedule
router.get("/api/schedule", async (req, res) => {
  const { userEmail } = req.query;
  const db = client.db(dbname);
  const collection = db.collection("Schedule");

  try {
    const tasks = await collection.find({ userEmail }).sort({ startTime: 1 }).toArray();
    res.json({ success: true, tasks });
  } catch (error) {
    console.error("Error fetching schedule:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE: Delete Schedule Task
router.delete("/api/schedule/:id", async (req, res) => {
  const { id } = req.params;
  const db = client.db(dbname);
  const collection = db.collection("Schedule");

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    res.json({ success: true, message: "Task deleted successfully" });
  } catch (error) {
    console.error("Error deleting schedule task:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});



// Profile Endpoints

// GET: Get User Profile
router.get("/api/profile", async (req, res) => {
  const { userEmail } = req.query;
  const db = client.db(dbname);
  const collection = db.collection("Users");

  try {
    const user = await collection.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    // Exclude password from response
    const { password, ...userProfile } = user;
    res.json({ success: true, user: userProfile });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PUT: Update User Profile
router.put("/api/profile", async (req, res) => {
  const { userEmail, username, password, studyHoursPerWeek, image, dailyStudyHours } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Users");

  try {
    const updateFields = {
      username,
      studyHoursPerWeek: parseFloat(studyHoursPerWeek) || 0,
      image,
      dailyStudyHours: dailyStudyHours || { mon: 4, tue: 4, wed: 4, thu: 4, fri: 4, sat: 4, sun: 4 },
      updatedAt: new Date()
    };

    if (password && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateFields.password = hashedPassword;
    }

    const result = await collection.updateOne(
      { email: userEmail },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Profile updated successfully" });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Admin Endpoints
router.get("/api/admin/students", async (req, res) => {
  const db = client.db(dbname);
  const usersCollection = db.collection("Users");
  const goalsCollection = db.collection("Goals");
  const scheduleCollection = db.collection("Schedule");

  try {
    const students = await usersCollection.find({ role: { $ne: "admin" } }).project({ password: 0 }).toArray();

    const studentsWithStats = await Promise.all(students.map(async (student) => {
      const email = student.email;

      // Aggregating Goals
      const goals = await goalsCollection.find({ userEmail: email }).toArray();
      const totalGoals = goals.length;
      const completedGoals = goals.filter(g => g.status === "Finished" || g.progress === 100).length;
      
      const totalProgress = goals.reduce((sum, g) => sum + (g.progress || 0), 0);
      const avgProgress = totalGoals > 0 ? (totalProgress / totalGoals).toFixed(0) : 0;

      // Aggregating Study Hours
      const tasks = await scheduleCollection.find({ userEmail: email }).toArray();
      let totalMinutes = 0;
      tasks.forEach(task => {
        if (task.startTime && task.endTime) {
            const start = new Date(`1970-01-01T${task.startTime}:00`);
            const end = new Date(`1970-01-01T${task.endTime}:00`);
            const diff = (end - start) / (1000 * 60); // minutes
            if (diff > 0) totalMinutes += diff;
        }
      });
      const studyHours = (totalMinutes / 60).toFixed(1);

      // Calculating Focus Score (Mock logic: based on completion rate + random variation for realism)
      // Base score 50, + 5 per completed goal, max 100.
      let focusScore = 50 + (completedGoals * 5);
      if (focusScore > 100) focusScore = 100;
      if (totalGoals === 0 && tasks.length > 0) focusScore = 60; // Has schedule but no goals
      if (totalGoals === 0 && tasks.length === 0) focusScore = 0;

      return {
        ...student,
        completedGoals,
        totalGoals,
        avgProgress,
        studyHours,
        focusScore
      };
    }));

    res.json({ success: true, students: studentsWithStats });
  } catch (error) {
    console.error("Error fetching students:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// Study Logs Endpoints

// POST: Create Study Log
router.post("/api/study-logs", async (req, res) => {
  const { userEmail, date, startTime, endTime, subject } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("StudyLogs");

  try {
    const newLog = {
      userEmail,
      date, // "YYYY-MM-DD" format
      startTime, // "HH:mm" format
      endTime, // "HH:mm" format
      subject: subject || "",
      createdAt: new Date()
    };

    const result = await collection.insertOne(newLog);
    res.status(201).json({ success: true, message: "Study log added", log: { ...newLog, _id: result.insertedId } });
  } catch (error) {
    console.error("Error adding study log:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET: Get User's Study Logs
router.get("/api/study-logs", async (req, res) => {
  const { userEmail } = req.query;
  const db = client.db(dbname);
  const collection = db.collection("StudyLogs");

  try {
    const logs = await collection.find({ userEmail }).sort({ date: -1, startTime: -1 }).toArray();
    res.json({ success: true, logs });
  } catch (error) {
    console.error("Error fetching study logs:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE: Delete Study Log
router.delete("/api/study-logs/:id", async (req, res) => {
  const { id } = req.params;
  const db = client.db(dbname);
  const collection = db.collection("StudyLogs");

  try {
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: "Log not found" });
    }
    res.json({ success: true, message: "Study log deleted" });
  } catch (error) {
    console.error("Error deleting study log:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET: Detailed Stats for a Single Student (for Admin Charts)
router.get("/api/admin/stats/:email", async (req, res) => {
  const { email } = req.params;
  const db = client.db(dbname);
  const goalsCollection = db.collection("Goals");
  const studyLogsCollection = db.collection("StudyLogs");
  const feedbackCollection = db.collection("Feedback");
  const usersCollection = db.collection("Users");


  try {
    // Get user profile for dailyStudyHours
    const userProfile = await usersCollection.findOne({ email });
    const dailyStudyHours = userProfile?.dailyStudyHours || { mon: 4, tue: 4, wed: 4, thu: 4, fri: 4, sat: 4, sun: 4 };

    // Goals Distribution
    const goals = await goalsCollection.find({ userEmail: email }).toArray();
    const pendingGoals = goals.filter(g => g.status !== "Finished" && g.progress < 100).length;
    const finishedGoals = goals.filter(g => g.status === "Finished" || g.progress === 100).length;

    // Goal Progress Histogram
    const progressBins = [
      { name: '0%', count: 0 },
      { name: '1-25%', count: 0 },
      { name: '26-50%', count: 0 },
      { name: '51-75%', count: 0 },
      { name: '76-99%', count: 0 },
      { name: '100%', count: 0 }
    ];
    goals.forEach(g => {
      const p = g.progress || 0;
      if (p === 0) progressBins[0].count++;
      else if (p <= 25) progressBins[1].count++;
      else if (p <= 50) progressBins[2].count++;
      else if (p <= 75) progressBins[3].count++;
      else if (p < 100) progressBins[4].count++;
      else progressBins[5].count++;
    });

    // Weekly Study Hours (last 7 days) - using StudyLogs with Profile fallback
    const studyLogs = await studyLogsCollection.find({ userEmail: email }).toArray();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayKeys = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
    const today = new Date();
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dayIndex = d.getDay();
      last7Days.push({
        date: d.toISOString().split('T')[0],
        dayName: dayNames[dayIndex],
        dayKey: dayKeys[dayIndex],
        hours: 0,
        hasLog: false
      });
    }

    // Study Time of Day Distribution
    const studyTimeDistribution = [
      { name: 'Morning (6-12)', hours: 0 },
      { name: 'Afternoon (12-18)', hours: 0 },
      { name: 'Evening (18-24)', hours: 0 },
      { name: 'Night (0-6)', hours: 0 }
    ];

    studyLogs.forEach(log => {
      if (log.date && log.startTime && log.endTime) {
        const logDate = log.date; // Already in "YYYY-MM-DD" format
        const startHour = parseInt(log.startTime.split(':')[0]);
        
        const startParts = log.startTime.split(':');
        const endParts = log.endTime.split(':');
        const startMinutes = parseInt(startParts[0]) * 60 + parseInt(startParts[1] || 0);
        const endMinutes = parseInt(endParts[0]) * 60 + parseInt(endParts[1] || 0);
        const diff = (endMinutes - startMinutes) / 60;

        // Weekly hours
        const dayEntry = last7Days.find(d => d.date === logDate);
        if (dayEntry && diff > 0) {
          dayEntry.hours += diff;
          dayEntry.hasLog = true;
        }

        // Time of Day
        if (diff > 0) {
          if (startHour >= 6 && startHour < 12) studyTimeDistribution[0].hours += diff;
          else if (startHour >= 12 && startHour < 18) studyTimeDistribution[1].hours += diff;
          else if (startHour >= 18 && startHour < 24) studyTimeDistribution[2].hours += diff;
          else studyTimeDistribution[3].hours += diff;
        }
      }
    });

    // Apply profile dailyStudyHours fallback for days without logs
    last7Days.forEach(d => {
      if (!d.hasLog) {
        d.hours = dailyStudyHours[d.dayKey] || 4;
      }
    });

    // Round hours
    last7Days.forEach(d => d.hours = parseFloat(d.hours.toFixed(1)));
    studyTimeDistribution.forEach(d => d.hours = parseFloat(d.hours.toFixed(1)));

    // Feedback Ratings Distribution
    const feedbacks = await feedbackCollection.find({ userEmail: email }).toArray();
    const feedbackRatings = [
      { rating: '1 Star', count: 0 },
      { rating: '2 Stars', count: 0 },
      { rating: '3 Stars', count: 0 },
      { rating: '4 Stars', count: 0 },
      { rating: '5 Stars', count: 0 }
    ];
    feedbacks.forEach(f => {
      const r = f.rating;
      if (r >= 1 && r <= 5) feedbackRatings[r - 1].count++;
    });

    res.json({
      success: true,
      goalsDistribution: { pending: pendingGoals, finished: finishedGoals },
      weeklyStudyHours: last7Days.map(d => ({ day: d.dayName, hours: d.hours })),
      goalProgressBins: progressBins,
      studyTimeDistribution,
      feedbackRatings
    });
  } catch (error) {
    console.error("Error fetching student stats:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

router.post("/api/recommend", (req, res) => {
  const { spawn } = require("child_process");
  const pythonProcess = spawn("python", ["./predict_and_recommend.py"]);

  let dataString = "";

  // Send data to python script via stdin
  pythonProcess.stdin.write(JSON.stringify(req.body));
  pythonProcess.stdin.end();

  pythonProcess.stdout.on("data", (data) => {
    dataString += data.toString();
    console.log(dataString);
  });

  pythonProcess.stderr.on("data", (data) => {
    console.error(`Python Error: ${data}`);
  });

  pythonProcess.on("close", (code) => {
    try {
      const result = JSON.parse(dataString);
      if (result.success) {
        res.json(result);
      } else {
        res.status(500).json(result);
      }
    } catch (e) {
      console.error("Failed to parse python output:", dataString);
      res.status(500).json({ success: false, error: "Failed to generate recommendations" });
    }
  });
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
