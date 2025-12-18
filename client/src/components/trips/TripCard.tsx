type Trip = any;

const TripCard = ({ trip, onClick }: { trip: Trip; onClick: () => void }) => {
  const getTripStatus = () => {
    const today = new Date();
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    if (today < start) return 'upcoming';
    if (today >= start && today <= end) return 'ongoing';
    return 'past';
  };
  const getStatusBadge = () => {
    const status = getTripStatus();
    const badges: any = {
      upcoming: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Upcoming' },
      ongoing: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Ongoing' },
      past: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Past' },
    };
    const badge = badges[status];
    return (<span className={`${badge.bg} ${badge.text} px-2 py-1 rounded-full text-xs font-medium`}>{badge.label}</span>);
  };
  const getDaysUntil = () => {
    const start = new Date(trip.startDate);
    const today = new Date();
    const diffTime = (start.getTime() - today.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''} until`;
    return null;
  };
  const getTripDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };
  const formatDate = (date: string) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const daysUntil = getDaysUntil();
  return (
    <div onClick={onClick} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group">
      {/* identical JSX as JS version */}
    </div>
  );
};

export default TripCard;
