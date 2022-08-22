require("./models/File");

const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const FileOperationsRoute = require("./routes/FileOperationsRoute");

const AuthOperationsRoute = require("./routes/AuthOperationsRoute");
const SinginRoute = require("./routes/SinginRoute");
const requireAuth = require("./middlewares/requireAuth");

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use(FileOperationsRoute);

app.use("/api/signup", AuthOperationsRoute);
app.use("/api/signin", SinginRoute);

//! DB Connection
const mongoUri = process.env.MONGO_URI;

mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("MongoDB connected");
});

mongoose.connection.on("error", (err) => {
  console.error("Error connecting to mongo", err);
});

app.get("/", requireAuth, (req, res) => {
  res.send(`Welcome ${req.user.username}`);
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
