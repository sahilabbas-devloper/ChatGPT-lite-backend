import express from "express";
import fs from "fs"
import path from "path"
import cors from "cors"
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config()




const app = express()
app.use(cors())
app.use(express.json())



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1' })

// ✅ STEP 1: knowledge.txt padho aur lines mein tod do
const knowledge = fs.readFileSync(path.join(__dirname,"Knowledge.txt"), "utf-8")
    .split("\n")
    .filter(line => line.trim() !== "")

// ✅ STEP 2: Search function - query se related lines dhundo
function findRelevantChunks(query) {
    const words = query.toLowerCase().split(" ")
    return knowledge.filter(chunk =>
        words.some(word => 
            word.length > 3 &&  // "is", "who" ignore hoga
            chunk.toLowerCase().includes(word)
        )
    ).join("\n")
}

app.post("/askgpt", async (req, res) => {

    try {
        const { prompt } = req.body;

        // ✅ STEP 3: Relevant context dhundo
        const context = findRelevantChunks(prompt)


        
        // ✅ STEP 4: Context ke saath prompt banao
    const ragPrompt = `You are Sahil's personal AI assistant named "Sahil's Assistant".
Always respond based on the context provided below.

${context ? `Context:\n${context}\n` : ""}
User question: ${prompt}`


        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash",
        })

        const result = await model.generateContent(ragPrompt)

        const response = await result.response

        const text = response.text()

        res.json({ massage: text }, prompt)
    } catch (error) {
        console.log(" promtres send error", error)
    }

})


const PORT = process.env.PORT || 4005
app.listen(PORT, (req, res) => {
    console.log("server is running on PORT", PORT)
})