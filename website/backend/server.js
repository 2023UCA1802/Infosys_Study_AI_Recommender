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

  res.status(200).json({ success: true, username: username, role: found.role || "student" });
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

    res.json({ success: true, email: payload.email, username: payload.username, role: payload.role });
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
      status: "Pending",
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
  const { userEmail, title, startTime, endTime, description } = req.body;
  const db = client.db(dbname);
  const collection = db.collection("Schedule");

  try {
    const newTask = {
      userEmail,
      title,
      startTime, // Store as string "HH:mm" or similar, or Date object?
                 // Plan said "tasks with timelines of 1 hour".
                 // Let's store day and start hour.
                 // Actually, simpler to just store what the frontend sends.
                 // Frontend will likely send a specific date and time range.
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
