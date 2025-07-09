const Trip = require('../models/trip');

module.exports.getExplore = async (req,res)=>{
    try{
        const publicTrips = await Trip.find({ isPublic: true }).lean().populate('createdBy');
        const featuredTrips = await Trip.find({ isFeatured: true }).lean();

        res.render('explore/explore', { publicTrips, featuredTrips });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}

module.exports.getExploreTripDetail = async (req,res)=>{
    try{
        const trip = await Trip.findOne({
            _id: req.params.id, 
            $or: [{ isPublic: true }, { isFeatured: true }] 
        });

        if (!trip) return res.status(404).send('Trip not found or is private.');
        
        res.render('explore/explore-trip-detail', { trip });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}

