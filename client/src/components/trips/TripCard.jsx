const TripCard = ({ trip, onClick }) => {
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
    const badges = {
      upcoming: {
        bg: 'bg-blue-100',
        text: 'text-blue-700',
        label: 'Upcoming'
      },
      ongoing: {
        bg: 'bg-emerald-100',
        text: 'text-emerald-700',
        label: 'Ongoing'
      },
      past: {
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        label: 'Past'
      }
    };

    const badge = badges[status];
    return (
      <span className={`${badge.bg} ${badge.text} px-2 py-1 rounded-full text-xs font-medium`}>
        {badge.label}
      </span>
    );
  };

  const getDaysUntil = () => {
    const start = new Date(trip.startDate);
    const today = new Date();
    const diffTime = start - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 0) {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} until`;
    }
    return null;
  };

  const getTripDuration = () => {
    const start = new Date(trip.startDate);
    const end = new Date(trip.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysUntil = getDaysUntil();

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group"
    >
      {/* Trip Image */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={trip.imageUrl || '/images/default-trip.jpg'}
          alt={trip.tripName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3">
          {getStatusBadge()}
        </div>
        {trip.isPublic && (
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-sm text-gray-700 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
              <i className="fas fa-globe text-emerald-600"></i>
              Public
            </span>
          </div>
        )}
      </div>

      {/* Trip Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1 flex-1">
            {trip.tripName}
          </h3>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-gray-600 text-sm">
            <i className="fas fa-map-marker-alt w-5 text-emerald-600"></i>
            <span className="ml-2">{trip.mainDestination}</span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <i className="fas fa-calendar w-5 text-emerald-600"></i>
            <span className="ml-2">
              {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
            </span>
          </div>

          <div className="flex items-center text-gray-600 text-sm">
            <i className="fas fa-clock w-5 text-emerald-600"></i>
            <span className="ml-2">{getTripDuration()}</span>
          </div>
        </div>

        {/* Category Badge */}
        <div className="mb-4">
          <span className="inline-block bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
            {trip.category}
          </span>
        </div>

        {/* Days Until (for upcoming trips) */}
        {daysUntil && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-4">
            <p className="text-emerald-700 text-sm font-medium text-center">
              🎉 {daysUntil}
            </p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xs text-gray-500">Members</p>
            <p className="text-sm font-semibold text-gray-900">
              {trip.participants?.length || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Tasks</p>
            <p className="text-sm font-semibold text-gray-900">
              {trip.tasks?.length || 0}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500">Places</p>
            <p className="text-sm font-semibold text-gray-900">
              {trip.destinations?.length || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;