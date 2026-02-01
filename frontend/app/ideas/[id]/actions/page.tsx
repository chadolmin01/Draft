import { ActionsPage } from '@/components/actions-page';
import { getMockIdea, getMockActions } from '@/lib/mock-data';
import { notFound } from 'next/navigation';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function Actions({ params }: PageProps) {
  const { id } = await params;

  // TODO: 백엔드 완성 후 실제 API 호출
  // const actions = await apiClient.getActions(id);

  // 임시: 목업 데이터 사용
  const idea = getMockIdea(id);
  const actions = getMockActions(id);

  if (!idea) {
    notFound();
  }

  return <ActionsPage actions={actions} ideaId={id} tier={idea.idea.tier} />;
}
