const Trip = require('../models/trip');

module.exports.getTrips = async (req, res) => {
    try {
        const userId = req.user._id;
        const trips = await Trip.find({ createdBy: userId }).sort({ createdAt: -1 });

        res.render('trips/trips',{ trips });
    } 
    catch (err) {
        console.error('Failed to fetch trips:', err);
        res.status(500).send("Server Error");
    }
};


module.exports.getTripDetails = async (req,res)=>{
    try {
        const {tripId} = req.params;

        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) 
            return res.status(404).render('404');

        res.render('trips/trip-details',{ trip });
    } 
    catch (err) {
        console.error('Failed to fetch trip:', err);
        res.status(500).send("Server Error");
    }
};


module.exports.getCreateTrip = (req, res) => {
  res.render('trips/create');
};

module.exports.postCreateTrip = async (req,res)=>{
    const { tripName, destination, startDate, endDate, description } = req.body;
    try {
        await Trip.create({
            tripName,
            destination,
            startDate,
            endDate,
            description,
            createdBy: req.user._id,
            participants: [req.user._id]
        });
        res.redirect('/trips');
    }
    catch(err){
        console.error('Trip creation error:', err.message);
        res.redirect('/trips/create');
    }
}
