const router=require('express').Router();
const requireAuth=require('../middlewares/requireAuth');
const mongoose = require("mongoose");
const { User } = require("../models/User");
const { File } = require("../models/File");
const Grid = require("gridfs-stream");

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


// cascade delete user and its files

router.delete('/:id', async (req, res) => {
	console.log("delete sta");

	const id = req.params.id;
	console.log(id);
	const user = await User.findOne({ _id: id });
	if (!user) return res.status(400).send({ message: "User not found" });
	
	userId=user._id;
	const files = await File.find({ userId });
	files.forEach(async (file) => {
		//! Delete file from GridFS
		gfs.delete(file.fileId, (err) => {
			if (err) return res.status(400).send(err);
		}
		);
	})
	user.remove();



	
  
  
  res.status(202).send({message:`User  deleted successfully`});
});

module.exports=router;