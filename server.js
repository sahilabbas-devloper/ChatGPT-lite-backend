import express from "express";
import cors from "cors"
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config()




const app = express()
app.use(cors())
app.use(express.json())



const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY, { apiVersion: 'v1' })


app.post("/askgpt", async (req, res) => {

    try {
        const { prompt } = req.body;

          
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" })

        const result = await model.generateContent(prompt)

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