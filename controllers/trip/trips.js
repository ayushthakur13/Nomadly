const Trip = require('../../models/trip');
const User = require('../../models/users');

module.exports.getTrips = async (req, res) => {
    try {
        const userId = req.user._id;
        const { category, sort } = req.query;

        const query = {
            $or: [
                { createdBy: userId },
                { participants: userId }
            ]
        };

        if (category) query.category = category;
        
        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };
        
        const trips = await Trip.find(query)
            .sort(sortOption)
            .lean();

        res.render('trips/trips', {
            trips,
            selectedCategory: category || "",
            selectedSort: sort || "latest"
        });
    } 
    catch (err) {
        console.error('Failed to fetch trips:', err);
        res.status(500).send("Server Error");
    }
};


module.exports.getTripDetails = async (req,res)=>{
    try {
        const userId = req.user._id;
        const { tripId } = req.params;

        const trip = await Trip.findOne({
            _id: tripId, 
            $or: [
                { createdBy: userId },
                { participants: userId }
            ]
         })
            .populate('participants', 'name username')
            .populate('createdBy', 'name username');

        if (!trip) 
            return res.status(404).render('404');

        const totalMembers = trip.participants.length + 1;

        const memoryUserIds = trip.memories.map(m => m.uploadedBy?.toString()).filter(Boolean);
        const users = await User.find({ _id: { $in: memoryUserIds } }).lean();

        const userMap = {};
        users.forEach(user => {
            userMap[user._id.toString()] = user.name || user.username;
        });

        res.render('trips/trip-details',{
            trip,
            user: req.user,
            owner: trip.createdBy,
            participants: trip.participants,
            isOwner: req.user._id.equals(trip.createdBy._id),
            totalMembers,
            userMap
        });
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
    const { tripName, mainDestination, startDate, endDate, category, description } = req.body;
    try {
        await Trip.create({
            tripName,
            mainDestination,
            startDate,
            endDate,
            category,
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
        const { tripId } = req.params;
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
    const { tripName, mainDestination, startDate, endDate, category, description, tripId } = req.body;
    try {
        let trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        trip.tripName = tripName;
        trip.mainDestination = mainDestination;
        trip.startDate = startDate;
        trip.endDate = endDate;
        trip.category = category;
        trip.description = description;

        trip.save();
        res.redirect(`/trips/${tripId}/details`);
    }
    catch(err){
        console.error('Cannot edit trip: ', err.message);
        res.redirect('/trips');
    }
}


module.exports.getDeleteTrip = async (req,res)=>{
    const { tripId } = req.params;
    try{
        await Trip.deleteOne({ _id:tripId, createdBy:req.user._id });
        res.redirect('/trips');
    }
    catch(err){
        console.error('Cannot delete trip: ', err.message);
        res.redirect('/trips');
    }
}
