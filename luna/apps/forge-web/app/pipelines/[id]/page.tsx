import PipelineDetailView from "../../../../src/components/pipelines/PipelineDetailView";

interface PipelineDetailPageProps {
  params: {
    id: string;
  };
}

export default function PipelineDetailPage({ params }: PipelineDetailPageProps) {
  return <PipelineDetailView pipelineId={params.id} />;
}

