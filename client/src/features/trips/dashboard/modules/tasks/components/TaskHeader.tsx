import Icon from '@/components/icon/Icon';

interface TaskHeaderProps {
  totalCount: number;
  assignedToMeCount: number;
  dueTodayCount: number;
}

export default function TaskHeader({
  totalCount,
  assignedToMeCount,
  dueTodayCount,
}: TaskHeaderProps) {
  const buildMetadata = () => {
    const parts: string[] = [];

    if (assignedToMeCount > 0) {
      parts.push(`${assignedToMeCount} assigned to you`);
    }

    if (totalCount > 0) {
      parts.push(`${totalCount} total`);
    }

    if (dueTodayCount > 0) {
      parts.push(`${dueTodayCount} due today`);
    }

    return parts.length > 0 ? parts.join(' • ') : 'No tasks yet';
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
      </div>
      <p className="text-sm text-gray-600 flex items-center gap-2">
        <Icon name="checkCircle" size={16} className="text-emerald-600" />
        {buildMetadata()}
      </p>
    </div>
  );
}
