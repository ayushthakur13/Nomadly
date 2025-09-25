module.exports = (userId, trip) => {
    if (!userId || !trip) return 'Unknown';

    const participants = Array.isArray(trip.participants) ? trip.participants : [];
    const createdBy = trip.createdBy || {};

    const all = [createdBy, ...participants];

    const user = all.find(p => p && p._id?.toString() === userId.toString());

    return user?.username || 'Unknown';
};
