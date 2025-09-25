const Trip = require('../../models/trip');

function userCanEditTrip(trip, userId) {
    return trip.createdBy.equals(userId) || trip.participants.includes(userId);
}

module.exports.postAddDestination = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { name, location, date, notes, imageUrl } = req.body;

        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id)) 
            return res.status(403).send("Unauthorized");

        trip.destinations.push({ name, location, date, notes, imageUrl });
        await trip.save();

        const added = trip.destinations[trip.destinations.length - 1];
        res.json({ success: true, destination: added });
    } 
    catch (err) {
        console.error("Error adding destination:", err);
        res.status(500).send("Server Error");
    }
};

module.exports.postDeleteDestinantion = async (req, res) => {
    const { tripId, destId } = req.params;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id)) 
            return res.status(403).send("Unauthorized");

        trip.destinations = trip.destinations.filter(d => d._id.toString() !== destId);
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error('Error deleting destination:', err);
        res.status(500).send('Something went wrong');
    }
};

module.exports.postEditDestination = async (req, res) => {
    const { tripId, destId } = req.params;
    const { name, location, notes, date } = req.body;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id)) 
            return res.status(403).send("Unauthorized");

        const dest = trip.destinations.id(destId);
        if (!dest) return res.status(404).send("Destination not found");

        dest.name = name;
        dest.location = location;
        dest.notes = notes;
        dest.date = date;

        await trip.save();
        res.json({ success: true, destination: dest });
    } 
    catch (err) {
        console.error("Error editing destination:", err);
        res.status(500).send("Something went wrong");
    }
};
