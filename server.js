const express = require("express");
const { Pool } = require("pg");
require('dotenv').config();

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

const app = express();

app.get("/", function(request, response) {
    response.json({
        message: "v-education API",
        version: "1.0.0",
        endpoints: [
            "GET /subjects",
            "GET /subjects/:subjectId",
            "GET /subjects/:subjectId/lessons/:lessonId"
        ]
    });
});

app.get("/subjects", async function(request, response) {
    try {
        const result = await pool.query("SELECT * FROM subjects");
        response.json({ subjects: result.rows });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Serverfehler" });
    }
});


app.get("/subjects/:subjectId", async function(request, response) {
    try {
        const { subjectId } = request.params;
        const subjectResult = await pool.query("SELECT * FROM subjects WHERE id = $1", [subjectId]);
        const lessonsResult = await pool.query("SELECT * FROM lessons WHERE subject_id = $1", [subjectId]);
        const subject = subjectResult.rows[0];

        if (!subject) {
            return response.status(404).json({ error: "Kein Fach gefunden" });
        }

        response.json({ subject: subject, lessons: lessonsResult.rows });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Serverfehler" });
    }
});


app.get("/subjects/:subjectId/lessons/:lessonId", async function(request, response) {
    try {
        const { subjectId, lessonId } = request.params;
        const result = await pool.query(
            "SELECT * FROM lessons WHERE id = $1 AND subject_id = $2", 
            [lessonId, subjectId]
        );
        const lesson = result.rows[0];

        if (!lesson) {
            return response.status(404).json({ error: "Kein Fach gefunden" });
        }

        response.json({ lesson: lesson });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Serverfehler" });
    }
});

app.listen(3000, function() {
    console.log("Server listening on port 3000");
});