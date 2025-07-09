const Trip = require('../../models/trip');

module.exports.postAddDestination = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { name, location, date, notes, imageUrl } = req.body;

        const trip = await Trip.findById(tripId);

        if (!trip) return res.status(404).send("Trip not found");

        trip.destinations.push({
            name,
            location,
            date,
            notes,
            imageUrl
        });

        await trip.save();
        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error("Error adding destination:", err);
        res.status(500).send("Server Error");
    }
};

module.exports.postDeleteDestinantion = async (req, res) => {
    const { tripId, destId } = req.params;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(404).send("Trip not found or you don't have permission.");

        trip.destinations = trip.destinations.filter(d => d._id.toString() !== destId);
        await trip.save();

        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error('Error deleting destination:', err);
        res.status(500).send('Something went wrong');
    }
}

module.exports.postEditDestination = async (req, res) => {
    const { tripId, destId } = req.params;
    const { name, location, notes, date } = req.body;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(403).send("Unauthorized");

        const dest = trip.destinations.id(destId);
        if (!dest) return res.status(404).send("Destination not found");

        dest.name = name;
        dest.location = location;
        dest.notes = notes;
        dest.date = date;

        await trip.save();
        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error("Error editing destination:", err);
        res.status(500).send("Something went wrong");
    }
};
