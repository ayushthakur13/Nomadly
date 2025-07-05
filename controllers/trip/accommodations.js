const Trip = require('../../models/trip');

module.exports.postAddAccommodation = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { name, address, checkIn, checkOut, price, bookingUrl, notes } = req.body;

        const trip = await Trip.findById(tripId);

        if (!trip) return res.status(404).send("Trip not found");

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
        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error("Error adding accommodation:", err);
        res.status(500).send("Server Error");
    }
};



module.exports.postDeleteAccommodation = async (req, res) => {
    const { tripId, accommoId } = req.params;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(404).send("Trip not found or you don't have permission.");

        trip.accommodations = trip.accommodations.filter(a => a._id.toString() !== accommoId);
        await trip.save();

        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error('Error deleting accommodation:', err);
        res.status(500).send('Something went wrong');
    }
}



module.exports.postEditAccommodation = async (req, res) => {
    const { tripId, accommoId } = req.params;
    const { name, address, checkIn, checkOut, price, bookingUrl, notes } = req.body;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(403).send("Unauthorized");

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
        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error("Error editing accommodation:", err);
        res.status(500).send("Something went wrong");
    }
};
