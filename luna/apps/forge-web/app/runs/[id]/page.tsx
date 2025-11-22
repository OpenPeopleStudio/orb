import RunDetailView from "../../../../src/components/runs/RunDetailView";

interface RunDetailPageProps {
  params: {
    id: string;
  };
}

export default function RunDetailPage({ params }: RunDetailPageProps) {
  return <RunDetailView runId={params.id} />;
}

