import { ChatWindow } from "@/components/rag/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

export default function AgentsPage() {
  const InfoCard = (
    <GuideInfoBox>
      <ul>
        <li className="text-l">
          🤖
          <span className="ml-2">
            Welcome to the 6502 Retrieval Agent! This system lets you upload
            yourdatasheets and query detailed information about a specified device.
          </span>
        </li>
        <li className="text-l">
          📄
          <span className="ml-2">
            Use the uploader below to ingest your datasheets. Your files will be
            vectorized and stored for efficient retrieval.
          </span>
        </li>
        <li className="text-l">
          💬
          <span className="ml-2">
            Once uploaded, simply ask questions about your selected system, its datasheets.
          </span>
        </li>
        <li className="text-l">
          🚀
          <span className="ml-2">
            Start by uploading your files, then type your query in the chat
            window below!
          </span>
        </li>
      </ul>
    </GuideInfoBox>
  );

  return (
    <ChatWindow
      endpoint="/api/chat/retrieval_agents" // This endpoint will be your retrieval & generate route.
      emptyStateComponent={InfoCard}
      showIngestForm={true} // Enables the file uploader that connects to your ingestion API route.
      showIntermediateStepsToggle={true}
      placeholder={
        "ask me about your MCU ..."
      }
      emoji="🤖"
    />
  );
}