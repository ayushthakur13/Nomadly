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


module.exports.postAddTask = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { title } = req.body;

        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) return res.status(403).send("Unauthorized access to this trip.");

        trip.tasks.push({ title });
        await trip.save();

        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error("Error adding task:", err);
        res.status(500).send("Something went wrong.");
    }
};

module.exports.postToggleTask = async (req, res) => {
    try {
        const { tripId, taskId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) return res.status(403).send("Unauthorized access.");

        const task = trip.tasks.id(taskId); 
        if (!task) return res.status(404).send("Task not found.");

        task.completed = !task.completed;
        await trip.save();

        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error("Error toggling task:", err);
        res.status(500).send("Internal server error.");
    }
};

module.exports.postDeleteTask = async (req, res) => {
    try {
        const { tripId, taskId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) return res.status(403).send("Unauthorized access.");

        trip.tasks = trip.tasks.filter(t => t._id.toString() !== taskId);
        await trip.save();

        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error("Error Deleting task:", err);
        res.status(500).send("Internal server error.");
    }
};


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
    const { name, notes, date } = req.body;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(403).send("Unauthorized");

        const dest = trip.destinations.id(destId);
        if (!dest) return res.status(404).send("Destination not found");

        dest.name = name;
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
