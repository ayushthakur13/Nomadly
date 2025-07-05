const Trip = require('../../models/trip');

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
        const { tripId } = req.query;

        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id })
        .populate('participants createdBy');

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
    const { tripName, mainDestination, startDate, endDate, description } = req.body;
    try {
        await Trip.create({
            tripName,
            mainDestination,
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


module.exports.getEditTrip = async (req, res) => {
    try {
        const { tripId } = req.query;
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) 
            return res.status(404).render('404');

        res.render('trips/edit',{ trip });
    } 
    catch (err) {
        console.error('Failed to fetch trip:', err);
        res.status(500).send("Server Error");
    }
};

module.exports.postEditTrip = async (req,res)=>{
    const { tripName, mainDestination, startDate, endDate, description, tripId } = req.body;
    try {
        let trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        trip.tripName = tripName;
        trip.mainDestination = mainDestination;
        trip.startDate = startDate;
        trip.endDate = endDate;
        trip.description = description;

        trip.save();
        res.redirect(`/trips/details?tripId=${tripId}`);
    }
    catch(err){
        console.error('Cannot edit trip: ', err.message);
        res.redirect('/trips');
    }
}


module.exports.getDeleteTrip = async (req,res)=>{
    const { tripId } = req.query;
    try{
        await Trip.deleteOne({ _id:tripId, createdBy:req.user._id });
        res.redirect('/trips');
    }
    catch(err){
        console.error('Cannot delete trip: ', err.message);
        res.redirect('/trips');
    }
}
