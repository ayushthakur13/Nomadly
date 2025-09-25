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

        const userId = String(req.user._id);

        messages.forEach(msg => {
            if (msg.sender && typeof msg.sender === 'object') {
                msg.senderId = msg.sender._id.toString();
                msg.senderName = msg.sender.name || 'Unknown';
                msg.isMe = (msg.sender._id.toString() === userId);
            } 
            else {
                msg.senderId = '';
                msg.senderName = 'Unknown';
                msg.isMe = false;
            }
        });

        res.render('trips/chat', { 
            trip, 
            messages, 
            user: req.user,
            userId
        });
    } 
    catch(err){
        console.error(err);
        console.log('Cannot get chat');
    }
}

