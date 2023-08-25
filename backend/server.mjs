import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
// import { MongoClient } from "mongodb";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = process.env.PORT || 5001;
const pass = process.env.PASS || "test";
const mongoURL = process.env.MONGO_URL || "";
const admin_url = process.env.ADMIN_URL;
const refreshTime = 60*1000; //1 minute in milliseconds

let leaderboard = undefined;
let prevTime = Date.now();

console.log(`Port: ${PORT}, mongo URL: ${mongoURL}`);

const app = express();
app.use(cors());
app.use(express.json());

console.log(process.env)

app.use(express.static("frontend-build/assets"));


await mongoose.connect(mongoURL);


const eventSchema = new mongoose.Schema({
	//stored event-wise
	//edit categories, pool names here
	eventname: {type: String, required:true},
	eventcategory: {type:String, enum: ["Pixel", "Fusion", "Innovate", "Quest", "Insight", "SnT Code"], required: true},
	poolpoints: {
		Aryans: {type:Number, required: true},
		Kshatriyas: {type:Number, required: true},
		Nawabs: {type:Number, required: true},
		Peshwas: {type:Number, required: true},
		Shauryas: {type:Number, required: true}
	},
	link: {
		type: String, 
		match: /^http(s)?:\/\/[a-zA-Z0-9.\/-]+$/,
		required: false}
}, {strict: "throw"});

const event_categories = eventSchema.obj.eventcategory.enum;
const pools_names = Object.keys(eventSchema.obj.poolpoints);


// console.log(eventSchema.obj);
// console.log(event_categories);
// console.log(pools_names);


const eventModel = new mongoose.model("Event", eventSchema);

app.get("/", (req, res) => {
	res.sendFile("index.html", {root: path.join(__dirname,"frontend-build")});
});

app.get(`/${admin_url}`, (req, res) => {
	res.sendFile("admin.html", {root: path.join(__dirname,"frontend-build")});
});


app.get("/api/", async (request, response) => {
	//send leaderboard
	console.log(Date.now() - prevTime);
	console.log(prevTime);
	if (leaderboard === undefined || Date.now() - prevTime > refreshTime) {
		leaderboard = await eventModel.find({});
		prevTime = Date.now();
	}
// 	console.log(leaderboard);
	response.json(leaderboard);
});

app.get("/api/categories", (req, res) => {
	res.json(event_categories);
});

app.get("/api/pools", (req, res) => {
	res.json(pools_names);
});

app.get("*", (req, res) => {
	res.status(404).send("404");
})

//after this: password-protected endpoints
app.post("/*", (request, response, next) => {
	console.log(request);
	console.log(request.body);
	if (request.body.password !== pass) {
		response.status(400).json(["Invalid request"]);
		console.log("Password incorrect");
		return;
	}
	next();
});

app.post("/api/add/", async (request, response) => {
	//add an event
	//validate request
	let to_add = {
		eventname: request.body.eventname,
		eventcategory: request.body.eventcategory,
		poolpoints: request.body.poolpoints,
		link: request.body.link
	}

	//schema is set up to validate data -> try turning into model straight away
	try {
		to_add = new eventModel(to_add);
		await to_add.save();
		response.json([`Added event ${to_add.eventname}`]);
	} catch (e) {
		console.error(e);
		response.status(400).json(["Invalid request"]);
	}
});

app.post("/api/edit/", async (req, res) => {
	//edit an event
	//an _id is sent in the request, find event using that, and edit it
	try {
		// let to_edit = (await eventModel.findOne({_id: req.body._id}));
		let id = req.body._id;
		let new_event = req.body;
		delete new_event._id;
		delete new_event.password;
		let change = await eventModel.replaceOne({_id:id}, new_event);
		if (change.modifiedCount !== 1) {
			console.log(change);
			throw new Error(`Didn't modify anything`);
		}
	} catch (e) {
		console.log(e);
		res.status(400).json(["Invalid request"]);
		return;
	}
	res.status(200).json([`Edited event ${req.body.eventname}`]);
});

app.post("/api/delete/", async (req, res) => {
	//delete an event
	//_id in request, find event using that and delete it
	try {
		let to_del = (await eventModel.deleteOne({_id: req.body._id})).deletedCount;
		
		if (to_del !== 1) throw new Error(`Something wrong, to_del = ${to_del}`);
	} catch (e) {
		console.log(e);
		res.status(400).json(["Invalid request"]);
		return;
	}
	res.status(200).json([`Deleted event ${req.body.eventname}`])
});


app.listen(PORT, () => {
	console.log(`Running on port ${PORT}`);
})