const Trip = require('../../models/trip');

module.exports.postAddTask = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { title } = req.body;

        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) return res.status(403).send("Unauthorized access to this trip.");

        trip.tasks.push({ title });
        await trip.save();

        res.redirect(`/trips/${tripId}/details`);
    } 
    catch (err) {
        console.error("Error adding task:", err);
        res.status(500).send("Something went wrong.");
    }
};

module.exports.postToggleTask = async (req, res) => {
    try {
        const { tripId, taskId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) return res.status(403).send("Unauthorized access.");

        const task = trip.tasks.id(taskId); 
        if (!task) return res.status(404).send("Task not found.");

        task.completed = !task.completed;
        await trip.save();

        res.redirect(`/trips/${tripId}/details`);
    } 
    catch (err) {
        console.error("Error toggling task:", err);
        res.status(500).send("Internal server error.");
    }
};

module.exports.postDeleteTask = async (req, res) => {
    try {
        const { tripId, taskId } = req.params;
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });

        if (!trip) return res.status(403).send("Unauthorized access.");

        trip.tasks = trip.tasks.filter(t => t._id.toString() !== taskId);
        await trip.save();

        res.redirect(`/trips/${tripId}/details`);
    } 
    catch (err) {
        console.error("Error Deleting task:", err);
        res.status(500).send("Internal server error.");
    }
};
