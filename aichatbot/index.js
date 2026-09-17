import { GoogleGenAI } from "@google/genai";

process.loadEnvFile(".env");

 const context = [];

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

// const response = await genai.models.generateContent({
//   model: "gemini-3.6-flash",
//   contents: context,
// });

async function chat(message){

   context.push({
     role: "user",
     parts: [{text : message}],
   })

    const response = await genai.models.generateContent({
        model : "gemini-3.6-flash",
        contents : context,
    })

    context.push({
        role: "assistant",
        parts : [{text : response.text}],
    })

    return response.text;
}

const result = await chat("hello my name is Alok Rai");
console.log(result);

const result1 = await chat("what is my name?");
console.log(result1);

