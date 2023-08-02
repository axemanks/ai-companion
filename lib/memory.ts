// this will be the memory for the the conversations
// Create a Class for MemoryManager

import { Redis } from "@upstash/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeClient } from "@pinecone-database/pinecone";
import { PineconeStore } from "langchain/vectorstores/pinecone";

// Type CompanionKey
export type CompanionKey = {
  companionName: string;
  modelName: string;
  userId: string;
};

// Class MemoryManager - defines the memory manager object
export class MemoryManager {
  private static instance: MemoryManager;
  private history: Redis;
  private vectorDBClient: PineconeClient;

  public constructor() {
    this.history = Redis.fromEnv();
    this.vectorDBClient = new PineconeClient();
  }
  // init pinecone client
  public async init() {
    if (this.vectorDBClient instanceof PineconeClient) {
      await this.vectorDBClient.init({
        // env vars
        apiKey: process.env.PINECONE_API_KEY!,
        environment: process.env.PINECONE_ENVIRONMENT!,
      });
    }
  }
  // Vector Search
  public async vectorSearch(
    recentChatHistory: string,
    companionFileName: string
  ) {
    // get client
    const pineconeClient = <PineconeClient>this.vectorDBClient;
    // get index
    const pineconeIndex = pineconeClient.Index(
      process.env.PINECONE_INDEX! || ""
    );
    // get vector store
    const vectorStore = await PineconeStore.fromExistingIndex(
      // pass in  OpenAIEmbeddings 
      new OpenAIEmbeddings({ openAIApiKey: process.env.OPENAI_API_KEY }),
      { pineconeIndex }
    ); 
    // Find similar documents
    const similarDocs = await vectorStore
    // recentChatHistory- number of docs to return- companionFileName
      .similaritySearch(recentChatHistory, 3, { fileName: companionFileName })
      .catch((err) => {
        console.log("WARNING: failed to get vector search results.", err);
      });
      // return the docs
    return similarDocs;
  }
  // Get Instance - Checks for and Creates MemoryManager instance
  public static async getInstance(): Promise<MemoryManager> {
    // there there is none, crate new
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager(); // create
      await MemoryManager.instance.init(); // Init
    }
    // Return
    return MemoryManager.instance;
  }
  // Generate the Redis Companion key - companionKey-modleName-userId
  private generateRedisCompanionKey(companionKey: CompanionKey): string {
    return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
  }
  // Write to History-
  public async writeToHistory(text: string, companionKey: CompanionKey) {
    // check for Key
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }
    // if successfule, write to history
    const key = this.generateRedisCompanionKey(companionKey);
    // add to history via zadd from redis - score is the time
    const result = await this.history.zadd(key, {
      score: Date.now(),
      member: text,
    });

    return result;
  }
  // Read Latest History - takes companionKey and
  public async readLatestHistory(companionKey: CompanionKey): Promise<string> {
    // check for companionKey
    if (!companionKey || typeof companionKey.userId == "undefined") {
      console.log("Companion key set incorrectly");
      return "";
    }
    // generate key (companionKey)
    const key = this.generateRedisCompanionKey(companionKey);
    // Get the data - pass in key, 0, Date.now(), byScore
    let result = await this.history.zrange(key, 0, Date.now(), {
      byScore: true,
    });
    // slice result to get text
    result = result.slice(-30).reverse();
    // join the result
    const recentChats = result.reverse().join("\n");
    return recentChats;
  }
  // Seed Chat History - generates chat from the example text in form
  public async seedChatHistory(
    seedContent: String,
    delimiter: string = "\n",
    companionKey: CompanionKey
  ) {
    const key = this.generateRedisCompanionKey(companionKey);
    // if in redis there is a key then there is history already
    if (await this.history.exists(key)) {
      console.log("User already has chat history");
      return;
    }
    // create the history from the seedContent
    const content = seedContent.split(delimiter);
    let counter = 0; // start a counter
    // add each line via zadd
    for (const line of content) {
      await this.history.zadd(key, { score: counter, member: line });
      counter += 1; // increment count
    }
  }
}
