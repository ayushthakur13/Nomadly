const Trip = require('../../models/trip');

module.exports.postCloneTrip = async (req, res) => {
    try {
        const userId = req.user._id;
        const tripId = req.params.tripId;

        const originalTrip = await Trip.findOne({
             _id: tripId, 
             $or:[{isPublic: true}, {isFeatured:true}] 
        }).lean();

        if (!originalTrip) 
            return res.status(404).send('Trip not found or not available to clone.');

        if (originalTrip.createdBy.toString() === userId.toString()) 
            return res.status(400).send("You can't clone your own trip.");

        const {
            tripName, mainDestination, startDate, endDate,
            category, description, destinations, tasks,
            budget, accommodations, imageUrl, imagePublicId
        } = originalTrip;

        const clonedTrip = new Trip({
            tripName, mainDestination, startDate, endDate,
            category, description, destinations, tasks,
            budget, accommodations, imageUrl, imagePublicId,
            memories: [],
            createdBy: userId,
            participants: [userId],
            isPublic: false,
            isFeatured: false,
            createdAt: new Date()
        });

        await clonedTrip.save();
        res.redirect('/trips');
    } 
    catch (err) {
        console.error('Error cloning trip:', err);
        res.status(500).send('Internal Server Error');
    }
};
