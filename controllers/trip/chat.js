const Trip = require("../../models/trip");
const Message = require("../../models/message");

module.exports.getTripChat = async (req,res)=>{
    const { tripId } = req.params; 

    try{
        const trip = await Trip.findOne({ 
            _id:tripId, 
            $or: [
                { createdBy: req.user._id },
                { participants: req.user._id }
            ]
        });

        if(!trip)
            return res.status(403).json({ success: false, message: "Unauthorized" });

        const messages = await Message.find({ trip: tripId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name')
            .lean();

        res.render('trips/chat', { 
            trip, 
            messages, 
            user: req.user
        });
    } 
    catch(err){
        console.error(err);
        console.log('Cannot get chat');
    }
}

