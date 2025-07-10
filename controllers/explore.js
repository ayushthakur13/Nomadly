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


module.exports.getFeaturedTrips = async (req,res)=>{
    try{
        const featuredTrips = await Trip.find({ isFeatured: true }).sort({ createdAt: -1 }).lean();
        if (!featuredTrips.length) return res.status(404).send('No featured trips found.');
        

        res.render('explore/featured-trips', { featuredTrips });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}

module.exports.getPublicTrips = async (req,res)=>{
    try{
        const publicTrips = await Trip.find({ isPublic: true }).sort({ createdAt: -1 }).lean().populate('createdBy');
        if (!publicTrips.length) return res.status(404).send('No public trips found.');

        res.render('explore/public-trips', { publicTrips });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}
