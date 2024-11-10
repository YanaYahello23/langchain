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
        // @ts-ignore
        const { messages } = req.json();
        const lastMessage = messages && messages[messages.length - 1]?.content;
        console.log(messages);

        let docContext = "";
        const embedding = await openAi.embeddings.create({
            model: "text-embedding-3-small",
            input: lastMessage,
            encoding_format:"float"
        });

        try {
           const collection  = db.collection(ASTRA_DB_COLLECTION);
           // @ts-ignore
            const cursor = collection.find(({
               sort: {
                   $vector: embedding.data[0].embedding,
               },
               limit: 10
           }));

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
            Format the response using markdown here applicable and don't return images.
            --------------
            START CONTEXT
            ${docContext}
            END CONTEXT
            --------------
            QUESTION: ${lastMessage}
            --------------
            `
        const result = await streamText({
            model: openai('gpt-4'),
            system: template,
            messages,
        });

        return result.toDataStreamResponse();
    } catch (error) {
        throw error;
    }
}
