const express = require("express");
const cors = require("cors");
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
app.use(express.json())
app.use(cors())
app.get("/lessons/:lessonId/reviews", async function(request, response) {
    try {
        const {lessonId} = request.params;
        let result = await pool.query("SELECT id FROM lessons WHERE id=$1", [lessonId]);
        if (result.rows.length === 0) {
            return response.status(404).json({error: "Die Lektion nicht gefunden"})
        }
        result = await pool.query("SELECT * FROM reviews WHERE lesson_id=$1", [lessonId]);
        response.status(200).json({reviews: result.rows});
    } catch (error) {
        console.error(error);
        response.status(500).json({error: "Serverfehler"})
    }
}
)
app.post("/lessons/:lessonId/reviews", async function(request, response) {
    try {
        const { lessonId } = request.params;
        const { author_name, rating, text = "" } = request.body;
        let result = await pool.query("SELECT id FROM lessons where id=$1", [lessonId]);
        if (result.rows.length === 0) {
            return response.status(404).json({ error: "Die Lektion nicht gefunden" });
        }
        if (typeof rating !== "number" || rating > 5 || rating < 1) {
            return response.status(400).json({error: "Rating ist falsch eingegeben"})
        }
        if (typeof author_name !== "string" || author_name === "" || author_name.length > 100) {
            return response.status(400).json({error: "Name ist falsch eingegeben"})
        }
        result = await pool.query(`INSERT INTO reviews (lesson_id, author_name, rating, text) VALUES ($1, $2, $3, $4) RETURNING *`, [lessonId, author_name, rating, text]);
        response.status(201).json({ review: result.rows[0] });
    } catch (error) {
        console.error(error);
        response.status(500).json({ error: "Serverfehler" });
    }
})

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

app.get("/lessons", async function(request, response) {
    try {
        const result = await pool.query("SELECT * FROM lessons");
        response.json({ lessons: result.rows });
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

app.get("/faq", async function(request, response) {
    try {
        const result = await pool.query("SELECT * FROM faq");
        const faq = result.rows;

        response.json({faq: faq})
    } catch (error) {
        console.error(error)
        response.status(500).json({ error: "Serverfehler" });
    }
});

app.listen(3000, function() {
    console.log("Server listening on port 3000");
});