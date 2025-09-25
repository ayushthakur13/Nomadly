const Trip = require('../../models/trip');

function userCanEditTrip(trip, userId) {
    return trip.createdBy.equals(userId) || trip.participants.includes(userId);
}

module.exports.postAddAccommodation = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { name, address, checkIn, checkOut, price, bookingUrl, notes } = req.body;

        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized");

        trip.accommodations.push({
            name,
            address, 
            checkIn, 
            checkOut, 
            price, 
            bookingUrl, 
            notes 
        });

        await trip.save();

        const newAccommo = trip.accommodations[trip.accommodations.length - 1];
        res.json({ success: true, accommo: newAccommo });
    } 
    catch (err) {
        console.error("Error adding accommodation:", err);
        res.status(500).send("Server Error");
    }
};

module.exports.postDeleteAccommodation = async (req, res) => {
    const { tripId, accommoId } = req.params;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized");

        trip.accommodations = trip.accommodations.filter(a => a._id.toString() !== accommoId);
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error('Error deleting accommodation:', err);
        res.status(500).send('Something went wrong');
    }
};

module.exports.postEditAccommodation = async (req, res) => {
    const { tripId, accommoId } = req.params;
    const { name, address, checkIn, checkOut, price, bookingUrl, notes } = req.body;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized");

        const accommo = trip.accommodations.id(accommoId);
        if (!accommo) return res.status(404).send("Accommodation not found");

        accommo.name = name;
        accommo.address = address;
        accommo.checkIn = checkIn;
        accommo.checkOut = checkOut;
        accommo.price = price;
        accommo.bookingUrl = bookingUrl;
        accommo.notes = notes;

        await trip.save();
        res.json({ success: true, accommo });
    } 
    catch (err) {
        console.error("Error editing accommodation:", err);
        res.status(500).send("Something went wrong");
    }
};
