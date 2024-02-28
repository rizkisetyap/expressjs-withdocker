const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Task = require("./src/schema/Task.Schema");
const bodyParser = require("body-parser");
dotenv.config();

const connectionsStrings = process.env.CONNECTION_STRING ?? "mongodb://root:example@mongodb:27017/";

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

function RunApp() {
	mongoose
		.connect(connectionsStrings)
		.then(() => {
			app.listen(3000, () => {
				console.log("listening on port 3000");
			});
		})
		.catch((err) => {
			console.log(err);
			console.error("Cannot connect database");
		});
}

app.post("/", async function (req, res) {
	const { title, description } = req.body;
	if (!title || !description) {
		return res.status(400).send("Invalid form");
	}
	const newtask = await Task.create({ title, description });
	res.status(201).json({ task: newtask });
});
app.get("/tasks", async (req, res) => {
	const tasks = await Task.find();

	res.status(200).json({
		data: tasks,
	});
});

app.get("/tasks/:id", async (req, res) => {
	const task = await Task.findById(req.params.id);
	if (!task) {
		return res.status(404).json({ message: "Task not found" });
	}
	return res.status(200).json(task);
});
app.put("/tasks/:id", async (req, res) => {
	const id = req.params.id;
	const { title, description } = req.body;
	await Task.findByIdAndUpdate(id, { title, description });

	res.status(201).send("Update success");
});

RunApp();
