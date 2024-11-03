import { useState } from "react";
import "cheerio";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings, ChatOpenAI } from "@langchain/openai";
import { pull } from "langchain/hub";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

const loadDocs = async (question: string) => {
  const loader = new CheerioWebBaseLoader("src/docs/index.mdx");
  const docs = await loader.load();
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });
  const splits = await textSplitter.splitDocuments(docs);
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splits,
    new OpenAIEmbeddings({ apiKey: import.meta.env.VITE_OPENAI_API_KEY })
  );

  // Retrieve and generate using the relevant snippets of the blog.
  const retriever = vectorStore.asRetriever();
  const prompt = await pull<ChatPromptTemplate>("rlm/rag-prompt");
  const llm = new ChatOpenAI({
    model: "gpt-3.5-turbo",
    temperature: 0,
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  });
  const retrievedDocs = await retriever.invoke(question);
  console.log({ retrievedDocs });

  const ragChain = await createStuffDocumentsChain({
    llm,
    prompt,
    outputParser: new StringOutputParser(),
  });

  const answer = await ragChain.invoke({
    question,
    context: retrievedDocs,
  });
  return answer;
};

const DocsChat = () => {
  const [question, setQuestion] = useState("");
  const [ans, setAns] = useState("");

  const handleClick = () => {
    loadDocs(question).then((answer) => {
      console.log(answer);
      setAns(answer);
    });
  };
  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <input value={question} onChange={(e) => setQuestion(e.target.value)} />
      <button
        onClick={() => {
          handleClick();
        }}
      >
        send
      </button>
      {ans && <p>{ans}</p>}
    </div>
  );
};

export default DocsChat;
