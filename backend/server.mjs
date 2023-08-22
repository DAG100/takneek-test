import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
// import { MongoClient } from "mongodb";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5001;
const pass = process.env.PASS || "test";
const mongoURL = process.env.MONGO_URL || "";
const event_categories = ["High Prep", "Med Prep", "Low Prep"];
const pools_names = ["Peshwas", "Aryans", "Nawabs", "Shauryas", "Kshatriyas"]

console.log(`Port: ${PORT}, mongo URL: ${mongoURL}`);
console.log(pass)

const app = express();
app.use(cors());
app.use(express.json());

await mongoose.connect(mongoURL);

const eventSchema = new mongoose.Schema({
	//stored event-wise
	//poolpoints: array of arrays [[pool_name, pool_points]]
	eventname: String,
	eventcategory: String,
	poolpoints: Array
});

const eventModel = new mongoose.model("Event", eventSchema);

app.get("/", async (request, response) => {
	//send leaderboard
	const leaderboard = await eventModel.find({});
	console.log(leaderboard);
	response.json(leaderboard);
});

app.post("/", async (request, response) => {
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
	//eventcategory: must be member of event_categories
	if (!event_categories.includes(to_add.eventcategory)) {
		response.json(["Invalid request"]);
		console.log("Category not a member of event_categories");
		return;
	}
	//poolpoints: must have all pools as in pools_names
	//can add points checking here too
	let check = pools_names;
	for (const [pool, points] of to_add.poolpoints) {
		if (check.indexOf(pool) === -1) {
			response.json(["Invalid request"]);
			console.log("Found a pool name not in pools_names");
			return;
		}
		check.splice(check.indexOf(pool), 1);
	}
	if (check.length > 0) { //not all pools present
		response.json(["Invalid request"]);
		console.log("Not all pools included");
		return;
	}
	
	//finally: add to db
	to_add = new eventModel(to_add);
	to_add.save();
	response.json(["Valid request, saved"]);
})

app.get("/categories", (req, res) => {
	res.json(event_categories);
});

app.get("/pools", (req, res) => {
	res.json(pools_names);
});

app.listen(PORT, () => {
	console.log(`Running on port ${PORT}`);
})