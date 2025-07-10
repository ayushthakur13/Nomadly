const Trip = require('../../models/trip');
const User = require('../../models/users');

module.exports.postInviteMember = async (req, res) => {
    const { tripId } = req.params;
    const { identifier } = req.body; 

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(403).send("Unauthorized");

        const user = await User.findOne({
            $or: [
                { username: identifier },
                { email: identifier }
            ]
        });

        if (!user) return res.status(404).send("User not found");

        if (trip.participants.includes(user._id) || trip.createdBy.equals(user._id)) 
            return res.status(400).send("User already part of the trip");

        trip.participants.push(user._id);
        await trip.save();

        res.redirect(`/trips/${tripId}/details`);
    } 
    catch (err) {
        console.error("Error inviting member:", err);
        res.status(500).send("Server Error");
    }
};



module.exports.postRemoveMember = async (req, res) => {
    const { tripId, memberId } = req.params;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(403).send("Unauthorized");

        if (trip.createdBy.toString() === memberId)
            return res.status(400).send("Owner cannot remove themselves.");

        trip.participants = trip.participants.filter(id => id.toString() !== memberId);
        await trip.save();

        res.redirect(`/trips/${tripId}/details`);
    } 
    catch (err) {
        console.error("Error removing member:", err);
        res.status(500).send("Server Error");
    }
};

