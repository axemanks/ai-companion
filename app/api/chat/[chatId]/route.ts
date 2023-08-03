// Dynamic route based on chatId
import dotenv from "dotenv";
import { StreamingTextResponse, LangChainStream} from 'ai';
import { auth, currentUser} from "@clerk/nextjs";
import { CallbackManager } from "langchain/callbacks";
import { Replicate } from 'langchain/llms/replicate';
import { NextResponse } from 'next/server';

import { MemoryManager } from '@/lib/memory';
import { rateLimit } from '@/lib/rate-limit';
import prismadb from '@/lib/prismadb';

dotenv.config({ path: `.env` });

export async function POST(
    request: Request,
    { params }: { params: { chatId: string } }
) {
    try {
        // extract prompt from request
        const { prompt } = await request.json();
        // get user from clerk
        const user = await currentUser();
        // check if info is missing
        if (!user || !user.firstName || !user.id) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        // identifier for rate limiting - needs to be unique for each user
        // in order to block that specific user and not the whole route
        const identifier = request.url + "-" + user.id;
        // extract success from rateLimit
        const { success } = await rateLimit(identifier);
        // check if rate limit was exceeded
        if (!success) {
            return new NextResponse("Too many requests to Quickly, slow down and try again.", { status: 429 });
        };
        // update companion with prompt
        const companion = await prismadb.companion.update({
            where: {
                id: params.chatId,
            },
            data: {
                messages: {
                    // create new message
                    create: {
                        content: prompt,
                        role: "user",
                        userId: user.id,
                    }
                }
            }
        });

        // check if companion exists
        if(!companion) {
            return new NextResponse("Companion Not Found.", { status: 404 });
        }
        // generate the name
        const name = companion.id;
        // generate the file name
        const companion_file_name = name + ".txt";
        // create companion key
        const companionKey = {
            companionName: name,
            userId: user.id,
            modelName: "llama2-13b",
        }
        // create memory manager
        const memoryManager = await MemoryManager.getInstance();
        const records = await memoryManager.readLatestHistory(companionKey);
        // check if records exist
        if (records.length === 0){
            // seed conversation- companion.seed is from the example text in form, delimiter, companionKey
            await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
        }

        // Write to history with prompt
        await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);

        // fetch recent chat history
        const recentChatHistory = await memoryManager.readLatestHistory(companionKey);

        // Similar Docs
        const similarDocs = await memoryManager.vectorSearch(
            recentChatHistory,
            companion_file_name,
        );
        // Relevant History
        let relevantHistory = ""; // start with empty string
        // The two exclamation points before "similarDocs" in the code are a logical operator called the "not" operator or "logical negation". It is used to check if the variable "similarDocs" exists and is not an empty array. If "similarDocs" is undefined, null, or an empty array, the condition will evaluate to "true". Otherwise, if "similarDocs" is defined and not an empty array, the condition will evaluate to "false".
        if(!!similarDocs && similarDocs.length !== 0) {
            // uses the "map()" method on the "similarDocs" array to create a new array, where each element of the new array is the value of the "pageContent" property of the corresponding object in the "similarDocs" array.
            //It then joins the elements of the new array into a single string, with each element separated by a newline character ("\n")
            relevantHistory = similarDocs.map((doc) => doc.pageContent).join("\n");
        };
        // LangChain handlers
        const { handlers } = LangChainStream();

        // create model - llama-2-13b-chat
        // Replicate - https://replicate.com/a16z-infra/llama-2-13b-chat
        const model = new Replicate({
            model: "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
            input: {
                max_length: 2048,
            },
            apiKey: process.env.REPLICATE_API_TOKEN,
            callbackManager: CallbackManager.fromHandlers(handlers),
        });

        // enable verbose
        model.verbose = true;

        // Response Object with instructions for AI in .call
        const resp = String(
            await model
              .call(
                `
              ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}: prefix. 
      
              ${companion.instructions}
      
              Below are relevant details about ${companion.name}'s past and the conversation you are in.
              ${relevantHistory}
      
      
              ${recentChatHistory}\n${companion.name}:`
              )
              .catch(console.error)
          );
          // replace commas with empty strings
          const cleaned = resp.replaceAll(",","")
          // split by new line
          const chunks = cleaned.split("\n");
          // response is first chunk
          const response = chunks[0];
          // write to history
          await memoryManager.writeToHistory("" + response.trim(), companionKey);
          // create readable stream
          var Readable = require("stream").Readable;
          // s = stream
          let s = new Readable();
          // push response to stream
          s.push(response);
          // push null to stream to end
          s.push(null);
            // if there is a response
          if(response !== undefined && response.length > 1){
            // write to history
            memoryManager.writeToHistory("" + response.trim(), companionKey);
            await prismadb.companion.update({
                where: {
                    id: params.chatId,
                },
                data: {
                    messages: {
                        // create new message
                        create: {
                            content: response.trim(),
                            role: "system",
                            userId: user.id,
                        }
                    }
                }
            })
          };
          // return StreamingTextResponse and pass stream
          return new StreamingTextResponse(s);
      


    } catch (error) {
        console.log("[CHAT_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })

    }
}
