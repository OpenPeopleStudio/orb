import AgentDetailPanel from "../../../../src/components/agents/AgentDetailPanel";

interface AgentDetailPageProps {
  params: {
    id: string;
  };
}

export default function AgentDetailPage({ params }: AgentDetailPageProps) {
  return <AgentDetailPanel agentId={params.id} />;
}

