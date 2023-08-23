import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
// import { MongoClient } from "mongodb";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5001;
const pass = process.env.PASS || "test";
const mongoURL = process.env.MONGO_URL || "";

console.log(`Port: ${PORT}, mongo URL: ${mongoURL}`);

const app = express();
app.use(cors());
app.use(express.json());

await mongoose.connect(mongoURL);


const eventSchema = new mongoose.Schema({
	//stored event-wise
	//edit categories, pool names here
	eventname: String,
	eventcategory: {type:String, enum: ["High Prep", "Med Prep", "Low Prep"]},
	poolpoints: {
		Peshwas: {type:Number, required: true},
		Aryans: {type:Number, required: true},
		Nawabs: {type:Number, required: true},
		Shauryas: {type:Number, required: true},
		Kshatriyas: {type:Number, required: true}
	}
}, {strict: "throw"});

const event_categories = eventSchema.obj.eventcategory.enum;
const pools_names = Object.keys(eventSchema.obj.poolpoints);


// console.log(eventSchema.obj);
// console.log(event_categories);
// console.log(pools_names);


const eventModel = new mongoose.model("Event", eventSchema);

app.get("/", (req, res) => {
	res.send("Test");
})


app.get("/api/", async (request, response) => {
	//send leaderboard
	const leaderboard = await eventModel.find({});
	console.log(leaderboard);
	response.json(leaderboard);
});

app.post("/api/", async (request, response) => {
	//add an event
	//first: check password
	console.log(request);
	console.log(request.body);
	if (request.body.password !== pass) {
		response.json(["Invalid request"]);
		console.log("Password incorrect");
		return;
	}
	//second: validate request
	let to_add = {
		eventname: request.body.eventname,
		eventcategory: request.body.eventcategory,
		poolpoints: request.body.poolpoints
	}
	
// 	//eventcategory: must be member of event_categories
// 	if (!event_categories.includes(to_add.eventcategory)) {
// 		response.json(["Invalid request"]);
// 		console.log("Category not a member of event_categories");
// 		return;
// 	}
// 	//poolpoints: must have all pools as in pools_names
// 	//can add points checking here too
// 	let check = pools_names;
// 	for (const [pool, points] of to_add.poolpoints) {
// 		if (check.indexOf(pool) === -1) {
// 			response.json(["Invalid request"]);
// 			console.log("Found a pool name not in pools_names");
// 			return;
// 		}
// 		check.splice(check.indexOf(pool), 1);
// 	}
// 	if (check.length > 0) { //not all pools present
// 		response.json(["Invalid request"]);
// 		console.log("Not all pools included");
// 		return;
// 	}
	
	//schema is set up to validate data -> try turning into model straight away
	try {
		to_add = new eventModel(to_add);
		await to_add.save();
		response.json(["Valid request, saved"]);
	} catch (e) {
		response.json(["Invalid request"]);
		console.error(e);
	}
})

app.get("/api/categories", (req, res) => {
	res.json(event_categories);
});

app.get("/api/pools", (req, res) => {
	res.json(pools_names);
});


app.listen(PORT, () => {
	console.log(`Running on port ${PORT}`);
})