const express = require("express");
const MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// MongoDB URI
const dbUrl = process.env.MONGODB_URL;
const dbName = "questions";
const collectionName = "neet";

// Set the view engine to EJS
app.set("view engine", "ejs");

// Serve static files from the 'public' folder
app.use(express.static("public"));

// MongoDB client
const client = new MongoClient(dbUrl);

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/questions", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);
    const questions = await collection.find().toArray();
    res.render("question", { questions });
  } catch (err) {
    res.status(500).send("Error fetching questions: " + err.message);
  } finally {
    await client.close();
  }
});

app.get("/test/:exam/:yearKey", async (req, res) => {
  const exam = req.params.exam;
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(exam);

    // Parse the yearKey parameter and split it into variable name and value
    const parts = req.params.yearKey.split("=");
    const variableName = parts[0];
    const value = parts[1];

    // Construct the query based on the variable name, value, and exam
    const query = {
      [variableName]: value,
      exam: exam,
      type: "mcq",
    };

    // Find questions based on the constructed query
    const questions = await collection.find(query).toArray();

    res.render("question", { questions, exam: questions[0].exam });
  } catch (err) {
    res.status(500).send("Error fetching questions: " + err.message);
  } finally {
    await client.close();
  }
});

app.get("/neet", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Get unique subjects sorted in descending order
    const subjects = await collection.distinct(
      "subject",
      {},
      { sort: { subject: -1 } }
    );

    // Get unique yearKeys sorted in descending order
    const yearKeys = await collection.distinct(
      "yearKey",
      {},
      { sort: { yearKey: -1 } }
    );

    // Initialize an empty array to store the structured chapters
    const structuredChapters = [];

    // Iterate over the subjects array to fetch chapters for each subject
    for (const subject of subjects) {
      // Get unique chapters for the current subject sorted in descending order
      const chapters = await collection.distinct(
        "chapter",
        { subject },
        { sort: { chapter: -1 } }
      );

      // Initialize an empty array to store the chapters along with their topics
      const chaptersWithTopics = [];

      // Iterate over the chapters to fetch topics for each chapter
      for (const chapter of chapters) {
        // Get unique topics for the current chapter and subject
        const topics = await collection.distinct(
          "topic",
          { subject, chapter },
          { sort: { topic: -1 } }
        );

        // Push an object containing the chapter and its topics to the chaptersWithTopics array
        chaptersWithTopics.push({ chapter, topics });
      }

      // Push an object containing the subject, chapters, and topics to the structuredChapters array
      structuredChapters.push({ subject, chapters: chaptersWithTopics });
    }
    // res.json(structuredChapters);
    res.render("exam", {
      exam: "neet",
      subjects,
      yearKeys,
      structuredChapters,
    });
  } catch (err) {
    res.status(500).send("Error fetching NEET data: " + err.message);
  } finally {
    await client.close();
  }
});

app.get("/jee-mains", async (req, res) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection("jee-main");

    // Get unique subjects sorted in descending order
    const subjects = await collection.distinct(
      "subject",
      { type: { $ne: "integer" } }, // Filter out documents with type="integer"
      { sort: { subject: -1 } }
    );

    // Get unique yearKeys sorted in descending order
    const yearKeys = await collection.distinct(
      "yearKey",
      { type: { $ne: "integer" } }, // Filter out documents with type="integer"
      { sort: { yearKey: -1 } }
    );

    // Initialize an empty array to store the structured chapters
    const structuredChapters = [];

    // Iterate over the subjects array to fetch chapters for each subject
    for (const subject of subjects) {
      // Get unique chapters for the current subject sorted in descending order
      const chapters = await collection.distinct(
        "chapter",
        { subject, type: { $ne: "integer" } }, // Filter out documents with type="integer"
        { sort: { chapter: -1 } }
      );

      // Initialize an empty array to store the chapters along with their topics
      const chaptersWithTopics = [];

      // Iterate over the chapters to fetch topics for each chapter
      for (const chapter of chapters) {
        // Get unique topics for the current chapter and subject
        const topics = await collection.distinct(
          "topic",
          { subject, chapter, type: { $ne: "integer" } }, // Filter out documents with type="integer"
          { sort: { topic: -1 } }
        );

        // Push an object containing the chapter and its topics to the chaptersWithTopics array
        chaptersWithTopics.push({ chapter, topics });
      }

      // Push an object containing the subject, chapters, and topics to the structuredChapters array
      structuredChapters.push({ subject, chapters: chaptersWithTopics });
    }

    res.render("exam", {
      exam: "jee-main",
      subjects,
      yearKeys,
      structuredChapters,
    });
  } catch (err) {
    res.status(500).send("Error fetching JEE Main data: " + err.message);
  } finally {
    await client.close();
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
