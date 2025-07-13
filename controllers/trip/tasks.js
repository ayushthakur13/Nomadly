const Trip = require('../../models/trip');

function userCanEditTrip(trip, userId) {
    return trip.createdBy.equals(userId) || trip.participants.includes(userId);
}

module.exports.postAddTask = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { title } = req.body;

        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized access to this trip.");

        trip.tasks.push({ title });
        await trip.save();

        const newTask = trip.tasks[trip.tasks.length - 1];
        res.json({ success: true, task: newTask });
    } 
    catch (err) {
        console.error("Error adding task:", err);
        res.status(500).send("Something went wrong.");
    }
};

module.exports.postToggleTask = async (req, res) => {
    try {
        const { tripId, taskId } = req.params;
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized access.");

        const task = trip.tasks.id(taskId); 
        if (!task) return res.status(404).send("Task not found.");

        task.completed = !task.completed;
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error("Error toggling task:", err);
        res.status(500).send("Internal server error.");
    }
};

module.exports.postDeleteTask = async (req, res) => {
    try {
        const { tripId, taskId } = req.params;
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized access.");

        trip.tasks = trip.tasks.filter(t => t._id.toString() !== taskId);
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error("Error deleting task:", err);
        res.status(500).send("Internal server error.");
    }
};
