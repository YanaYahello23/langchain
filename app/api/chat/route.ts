import OpenAI from "openai";
import { streamText } from "ai";
import {DataAPIClient} from "@datastax/astra-db-ts";
import { openai } from '@ai-sdk/openai';

const {
    ASTRA_DB_COLLECTION,
    ASTRA_DB_API_ENDPOINT,
    ASTRA_DB_APPLICATION_TOKEN,
    OPENAI_API_KEY
} = process.env;

const openAi = new OpenAI({
    apiKey: OPENAI_API_KEY
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT);

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();
        const latestMessage = messages && messages[messages.length - 1]?.content;

        let docContext = "";

        // create with open ai
        const embedding = await openAi.embeddings.create({
            model: "text-embedding-3-small",
            input: latestMessage,
            encoding_format:"float"
        });

        // check in db if this embedding exist
        try {
           const collection  = db.collection(ASTRA_DB_COLLECTION);
            const cursor = collection.find(null,{
               sort: {
                   $vector: embedding.data[0].embedding,
               },
               limit: 10
           });

            const documents = await cursor.toArray();
            const docsMap = documents?.map((doc) => doc.text);
            docContext = JSON.stringify(docsMap);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch(error) {
            console.log("Error querying db...");
            docContext = "";
        }

        const template =
           `You are an AI assistant who knows everything about AI and LangChain.
            Use the below context to augment what you know about AI and LangChain. 
            The context will provide you with the most resent page data from wikipedia and 
            other sites. If the context doesn't include the information you need to answer based on your 
            existing knowledge and don't mention the source of your information or what the context does
            or doesn't include.
            Format the response using markdown where applicable and don't return images.
            --------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            --------------
            QUESTION: ${latestMessage}
            --------------
            `

        const result = await streamText({
            model: openai('gpt-4'),
            system: "You are an AI assistant",
            prompt: template,
        })

         return result.toDataStreamResponse();
    } catch (error) {
        throw error;
    }
}
