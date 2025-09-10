// import { NextRequest, NextResponse } from "next/server";
// import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
// import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
// import { OpenAIEmbeddings } from "@langchain/openai";
// import { createClient } from "@supabase/supabase-js";

// export const config = {
//   api: {
//     bodyParser: false, // Disable Next.js's built-in body parser
//   },
// };

// const apiUrl = process.env.NEXT_PUBLIC_NEXT_PUBLIC_SUPABASE_URL; // Accessible on both client and server
// const secretKey = process.env.SUPABASE_PRIVATE_KEY;  // Accessible only on the server
// if (!apiUrl || !secretKey) {
//   throw new Error("Supabase credentials not found");
// }

// const embeddings = new OpenAIEmbeddings({
//   model: "text-embedding-3-small",
// });

// const supabaseClient = createClient(
//   apiUrl,
//   secretKey
// );

// const vectorStore = new SupabaseVectorStore(embeddings, {
//   client: supabaseClient,
//   tableName: "documents",
//   queryName: "match_documents",
// });

// export async function POST(req: NextRequest) {
//   // Parse the form data directly
//   const formData = await req.formData();

//   // Get the file from the form data
//   const file = formData.get('file') as File;

//   if (!file) {
//     return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//   }

//   // Convert the file to an ArrayBuffer
//   const arrayBuffer = await file.arrayBuffer();

//   // Convert ArrayBuffer to a Blob
//   const fileBlob = new Blob([arrayBuffer], { type: file.type });

//   try {
//     // Use the Blob directly with PDFLoader
//     const loader = new PDFLoader(fileBlob);
//     // USE THE PYTHON CODE SOMEWHERE HERE OR IN A WAY TO GENERATE THE docs which is of the form Document<Record<string, any>>[]
//     const docs = await loader.load();
    

//     // You can now pass the documents and IDs to your vector store
//     await vectorStore.addDocuments(docs);
    
//     // Further processing or save to database, etc.
//     return NextResponse.json({ message: 'File uploaded and processed successfully' });
//   } catch (processingError) {
//     console.error('Error processing PDF', processingError);
//     return NextResponse.json({ error: 'Error processing PDF' }, { status: 500 });
//   }
// }

import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from "@supabase/supabase-js";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

// export const config = {
//   api: {
//     bodyParser: false, // Disable Next.js's built-in body parser
//   },
// };

const apiUrl = process.env.NEXT_PUBLIC_SUPABASE_URL; // Accessible on both client and server
const secretKey = process.env.SUPABASE_PRIVATE_KEY;  // Accessible only on the server
console.log(apiUrl)
console.log(secretKey)
if (!apiUrl || !secretKey) {
  throw new Error("Supabase credentials not found");
}

const embeddings = new OpenAIEmbeddings({
  model: "text-embedding-3-small",
});

const supabaseClient = createClient(apiUrl, secretKey);

const vectorStore = new SupabaseVectorStore(embeddings, {
  client: supabaseClient,
  tableName: "documents",
  queryName: "match_documents",
});

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;

  if (!file) {
    return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const fileBlob = new Blob([arrayBuffer], { type: file.type });

  try {
    const loader = new PDFLoader(fileBlob);
    const docs = await loader.load();

    // Use LangChain's RecursiveCharacterTextSplitter
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
      separators: ["\n\n", "(?<=\. )", " ", ""]
    });

    const splitDocs = await splitter.splitDocuments(docs);

    // Add the split documents to the vector store
    await vectorStore.addDocuments(splitDocs);

    return NextResponse.json({ message: 'File uploaded and processed successfully' });
  } catch (processingError) {
    console.error('Error processing PDF', processingError);
    return NextResponse.json({ error: 'Error processing PDF' }, { status: 500 });
  }
}