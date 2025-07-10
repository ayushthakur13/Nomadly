const Trip = require('../../models/trip');

module.exports.postPublishTrip = async (req,res)=>{
    try{
        const { tripId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(404).send("Trip not found or Unauthorized access");

        trip.isPublic = true;
        await trip.save();

        res.redirect(`/trips/${tripId}/details`);
    }
    catch(err){
        console.error('Error publishing trip:', err);
        res.status(500).send('Server Error');
    }
}

module.exports.postUnpublishTrip = async (req,res)=>{
    try{
        const { tripId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(404).send("Trip not found or Unauthorized access");

        trip.isPublic = false;
        await trip.save();

        res.redirect(`/trips/${tripId}/details`);
    }
    catch(err){
        console.error('Error unpublishing trip:', err);
        res.status(500).send('Server Error');
    }
}
