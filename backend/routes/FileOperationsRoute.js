const express = require("express");
const path = require("path");
const requireAuth = require("../middlewares/requireAuth");
const fs = require("fs");
const mongoose = require("mongoose");

//mail imports
const Token = require("../models/token");

//
const multer = require("multer");
const upload = require("../middlewares/upload");
const Grid = require("gridfs-stream");
const methodOverride = require("method-override");

const File = require("../models/File");
const { User } = require("../models/User");
const router = express.Router();

router.use(methodOverride("_method"));

//! DB Connection
const mongoUri = process.env.MONGO_URI;
const connection = mongoose.createConnection(mongoUri);

//! GridFS Storage
let gfs;

connection.once("open", () => {
  //! Init stream
  gfs = new mongoose.mongo.GridFSBucket(connection.db, {
    bucketName: "uploads",
  });
});

//! @route POST /upload
//! @desc Uploads file to DB
router.post("/uploads", [upload.single("file"), requireAuth], (req, res) => {
  const userId = req.user._id;
  const reqFile = req.file;

  const file = new File({
    userId: userId,
    originalName: reqFile.originalname,
    fileName: reqFile.filename,
    size: reqFile.size,
    fileId: reqFile.id,
    uploadDate: reqFile.uploadDate,
    contentType: reqFile.contentType,
  });

  file.save().then((file) => {
    res.json(file);
  });
});

//! @route GET /fetchFiles
//! @desc Fetch all user files from DB
/** 
* @openapi
* 	/fetchFiles:
* 	get:
*   description: Fetch all user files from DB
*   responses:
*	 '200':
*		description: Success
*/
router.get("/fetchFiles", requireAuth, async (req, res) => {
  const userId = req.user._id;
  const files = await File.find({ userId });

  res.status(200).json(files);
});

//! @route GET /fetchFile/:id
//! @desc Fetch a file from DB
router.get("/getFile/:id", async (req, res) => {
  const id = req.params.id;

  if (!id || id === "undefined") return res.status(400).send("No File ID");

  const _id = new mongoose.Types.ObjectId(id);

  gfs.find({ _id }).toArray((err, files) => {
    if (!files || files.length === 0)
      return res.status(400).send("no files exist");
    gfs.openDownloadStream(_id).pipe(res);
  });
});

//! @route DELETE /deleteFile/:id
//! @desc Delete a file from DB
router.delete("/deleteFile/:id", requireAuth, async (req, res) => {
  const id = req.params.id;

  if (!id || id === "undefined") return res.status(400).send("No File ID");

  const _id = new mongoose.Types.ObjectId(id);

  const file = await File.findOneAndDelete({ fileId: _id });

  if (!file) return res.status(400).send("No File Found");

  await File.findByIdAndDelete(id);

  gfs.delete(_id, (err) => {
    if (err) return res.status(400).send(err);
  });
});

//! @route delete /deleteAllFiles
//! @desc Delete all files from DB
router.delete("/deleteAllFiles", requireAuth, async (req, res) => {
  const userId = req.user._id;
  const files = await File.find({ userId });

  if (!files) return res.status(400).send("No Files Found");

  await File.deleteMany({ userId });

  files.forEach((file) => {
    //! Delete file from GridFS
    gfs.delete(file.fileId, (err) => {
      if (err) return res.status(400).send(err);
    });
  });
});

// verify email

router.get("/:id/verify/:token", async (req, res) => {
  try {
    console.log("heyy");
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ message: "Invalid Link" });
    console.log(user);
    console.log(req.params.token);
    console.log(typeof req.params.token);
    //console.log(mongoose.Types.ObjectId(req.params.token));
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    console.log("token findounu geçti");
    console.log(token);

    if (!token) return res.status(400).send({ message: "Invalid Link" });

    await User.updateOne({ _id: user._id }, { verified: true });

    console.log("updateyi geçti");
    console.log(user);
    console.log(user.verified);
    await token.remove();
    let usr = await User.findOne({ _id: req.params.id });

    res
      .status(200)
      .send({ message: "Account Verified", verified: usr.verified });
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Internal Server Error" });
  }
});

module.exports = router;
