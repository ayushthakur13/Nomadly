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
      {/* Cover Image */}
      <div className="relative h-40 w-full overflow-hidden">
        <img
          src={trip.coverImageUrl || '/images/default-trip.jpg'}
          alt={trip.tripName}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
          onError={(e: any) => { e.currentTarget.src = '/images/default-trip.jpg'; }}
        />
        <div className="absolute top-3 left-3">
          {getStatusBadge()}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-base font-semibold text-gray-900 truncate">{trip.tripName}</h3>
            <p className="text-sm text-gray-600 truncate">{trip.mainDestination}</p>
          </div>
          {daysUntil && (
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">
              {daysUntil}
            </span>
          )}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="truncate">{getTripDuration()}</span>
          </div>
          <div className="text-right truncate">
            {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
          </div>
        </div>

        {trip.category && (
          <div className="mt-3">
            <span className="inline-block text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">{trip.category}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TripCard;
