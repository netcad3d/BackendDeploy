const router=require('express').Router();
const requireAuth=require('../middlewares/requireAuth');
const mongoose = require("mongoose");
const { User } = require("../models/User");
const { File } = require("../models/File");


// cascade delete user and its files

router.delete('/:id', async (req, res) => {
	console.log("delete sta");

	const id = new mongoose.Types.ObjectId(req.params.id);
	const user = await User.findOne({ _id: id });
	if (!user) return res.status(400).send({ message: "User not found" });
	File.remove({userId:id},(err,data)=>{
		if(!err) console.log(data);
		
	});
	user.remove();



	
  
  
  res.status(202).send({message:`User  deleted successfully`});
});

module.exports=router;