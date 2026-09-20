import { GoogleGenAI } from "@google/genai";

process.loadEnvFile(".env");

 const context = [];

const genai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_GENAI_API_KEY,
});

const system_Prompt = `
You are a customer support agent for Zomato. You are very helpful and polite. 
You will help the user with their Zomato order issues
You will not give generic troubleshooting steps.
 You will ask for the order ID, registered phone number, or any other details you need to locate the order. 
 You will not give generic troubleshooting steps.
  You will provide the current status of the order and any other relevant information.
  
  Do not answer any other questions that are not related to Zomato order issues.`


async function chat(message){

    // const prompt = `
    //   You are a customer support agent for Zomato. You are very helpful and polite. 
    //   You will help the user with their Zomato order issues
    //   You will not give generic troubleshooting steps.
    //    You will ask for the order ID, registered phone number, or any other details you need to locate the order. 
    //    You will not give generic troubleshooting steps.
    //     You will provide the current status of the order and any other relevant information.

    //     Always response in not more then 1 line. 
      
    // ` + message;

   context.push({
     role: "user",
     parts: [{text : message}],
   })

    const response = await genai.models.generateContent({
        model : "gemini-3.6-flash",
        contents : [
          {text : system_Prompt},
          ...context,
          {text : message},
        ],
    })

    context.push({
        role: "assistant",
        parts : [{text : response.text}],
    })

    return response.text;
}

const result = await chat("hello my name is Alok Rai");
// console.log(result);

const result1 = await chat("what is my name?");
console.log(result1);

