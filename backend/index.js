require("./models/File");
require("./models/User");

const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

// Swagger imports
const  swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

// security packages
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

//optimization packages
const compression = require("compression");

// routes
const FileOperationsRoute = require("./routes/FileOperationsRoute");

const AuthOperationsRoute = require("./routes/AuthOperationsRoute");
const SinginRoute = require("./routes/SinginRoute");
const passwordResetRoutes = require("./routes/PasswordReset");
const deleteAccountRoute = require("./routes/DeleteAccount");
const checkUsers = require("./utils/cleanInactive");

const app = express();

// secure headers
app.use(helmet());
app.disable("x-powered-by");

//Swagger config
const swaggerOptions = {
	swaggerDefinition: {
		info: {
			title: "Netcad3d API",
			description: "Netcad3d API Information",
			contact:{
				name: "Netcad3d Dev Team",
				url: "https://netcad3d.com",
			}
		},
		servers: ["https://netcad-vtk.herokuapp.com/"],
		api:["index.js","routes/*.js"]
	}
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const port = process.env.PORT || 3000;

// Restrict all routes to only 100 requests per IP address every 1o minutes
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // 100 requests per IP
});
app.use(limiter);

app.use(
  compression({
    level: 8,
    threshold: 0,
  })
);

app.use(express.static("public"));

app.use(cors());
app.use(bodyParser.json());

app.use(FileOperationsRoute);

app.use("/api/signup", AuthOperationsRoute);
app.use("/api/signin", SinginRoute);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/delete-account", deleteAccountRoute);
app.get("/", (req, res) => {
  res.send("APP IS RUNNING");
});
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

// cleaning inactivity  accounts after 48 hours inactivity
checkUsers();

// app.get("/", requireAuth, (req, res) => {
//   res.send(`Welcome ${req.user.username}`);
// });

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
