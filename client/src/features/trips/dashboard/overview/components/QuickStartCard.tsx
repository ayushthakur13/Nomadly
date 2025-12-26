import Icon from '@/components/icon/Icon';

interface QuickStartCardProps {
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  actionText: string;
  actionColor: string;
}

const QuickStartCard = ({
  icon,
  iconColor,
  title,
  description,
  actionText,
  actionColor,
}: QuickStartCardProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer group">
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconColor.replace('text-', 'bg-').replace('600', '50')} group-hover:${iconColor.replace('text-', 'bg-').replace('600', '100')} transition-colors`}>
          <Icon name={icon as any} size={20} className={iconColor} />
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 mb-4">{description}</p>
      <div className={`text-xs font-medium ${actionColor}`}>{actionText} →</div>
    </div>
  );
};

export default QuickStartCard;
