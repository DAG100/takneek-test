import express from "express";
import cors from "cors";
import * as dotenv from "dotenv";
// import { MongoClient } from "mongodb";
import mongoose from "mongoose";

dotenv.config();

const PORT = process.env.PORT || 5001;
const mongoURL = process.env.MONGO_URL || "";

console.log(`Port: ${PORT}, mongo URL: ${mongoURL}`);

const app = express();

// const client = new MongoClient(mongoURL);
// try {
// 	var conn = await client.connect();
// } catch (e) {
// 	console.log("Error occurred when connecting to DB.");
// 	console.log(e);
// }
// leaderboard = conn.db("leaderboard");

mongoose.connect(mongoURL, {});

const eventSchema = new mongoose.Schema({
	//stored event-wise
	//poolpoints: array of arrays [[pool_name, pool_points]]
	eventname: String,
	eventcategory: String,
	poolpoints: Array
});

const eventModel = new mongoose.model("events", eventSchema);

app.use(cors());
app.use(express.json());

app.get("/", (request, response) => {
	//home: send leaderboard
	response.json({test:"hello"});
	
});



app.listen(PORT, () => {
	console.log(`Running on port ${PORT}`);
})