import type { Metadata } from "next";
import { NodeDetailClient } from "@/components/monitoring/NodeDetailClient";

interface PageProps {
  params: Promise<{ nodeId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { nodeId } = await params;
  return {
    title: `Detail ${nodeId}`,
    description: `Data sensor dan tren kerentanan node ${nodeId}.`,
  };
}

export default async function NodeDetailPage({ params }: PageProps) {
  const { nodeId } = await params;
  return <NodeDetailClient nodeId={nodeId} />;
}
