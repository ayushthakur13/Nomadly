const Trip = require('../models/trip');

module.exports.getExplore = async (req,res)=>{
    try{
        const publicTrips = await Trip.find({ isPublic: true }).lean().limit(4).populate('createdBy');
        const featuredTrips = await Trip.find({ isFeatured: true }).lean().limit(4);

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
        }).populate('createdBy');

        if (!trip) return res.status(404).send('Trip not found or is private.');
        
        res.render('explore/explore-trip-detail', { trip, currentUser: req.user });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}


module.exports.getFeaturedTrips = async (req,res)=>{
    try{
        const { category, sort } = req.query;

        const query = { isFeatured: true };
        if (category) query.category = category;

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const featuredTrips = await Trip.find(query).sort(sortOption).lean();
        if (!featuredTrips.length) return res.status(404).send('No featured trips found.');
        
        res.render('explore/featured-trips', { 
            featuredTrips, 
            selectedCategory: category || "",
            selectedSort: sort || "latest"
        });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}

module.exports.getPublicTrips = async (req,res)=>{
    try{
        const { category, sort } = req.query;

        const query = { isPublic: true };
        if (category) query.category = category;

        let sortOption = { createdAt: -1 };
        if (sort === 'oldest') sortOption = { createdAt: 1 };

        const publicTrips = await Trip.find(query)
            .sort(sortOption)
            .lean()
            .populate('createdBy');
        
        if (!publicTrips.length) return res.status(404).send('No public trips found.');

        res.render('explore/public-trips', { 
            publicTrips ,
            selectedCategory: category || "",
            selectedSort: sort || "latest"
        });
    }
    catch(err){
        console.error(err);
        res.status(500).send('Server Error');
    }
}
