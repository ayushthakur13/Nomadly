const Trip = require('../../models/trip');
const User = require('../../models/users');

module.exports.postInviteMember = async (req, res) => {
    const { tripId } = req.params;
    const { identifier } = req.body;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) 
            return res.status(403).json({ success: false, message: "Unauthorized" });

        const user = await User.findOne({ $or: [{ username: identifier }, { email: identifier }] });
        if (user._id.equals(req.user._id))
            return res.status(400).json({ success: false, message: "You are already the trip owner" });

        if (!user) 
            return res.status(404).json({ success: false, message: "User not found" });

        if (trip.participants.includes(user._id) || trip.createdBy.equals(user._id)) 
            return res.status(400).json({ success: false, message: "User already in trip" });

        trip.participants.push(user._id);
        await trip.save();

        res.json({ success: true, user: { _id: user._id, name: user.name || user.username } });
    } 
    catch (err) {
        console.error("Invite error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports.postRemoveMember = async (req, res) => {
    const { tripId, memberId } = req.params;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) 
            return res.status(403).json({ success: false, message: "Unauthorized" });

        if (trip.createdBy.toString() === memberId) 
            return res.status(400).json({ success: false, message: "Owner can't remove self" });

        trip.participants = trip.participants.filter(id => id.toString() !== memberId);
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error("Remove member error:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

module.exports.postLeaveTrip = async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user._id;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) 
            return res.status(404).json({ success: false, message: "Trip not found" });

        if (trip.createdBy.equals(userId)) 
            return res.status(400).json({ success: false, message: "Owner cannot leave the trip" });

        const alreadyParticipant = trip.participants.includes(userId);
        if (!alreadyParticipant) 
            return res.status(400).json({ success: false, message: "You are not a participant" });

        trip.participants = trip.participants.filter(id => !id.equals(userId));
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error("Error leaving trip:", err);
        res.status(500).json({ success: false, message: "Server error" });
    }
};
