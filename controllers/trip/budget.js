const Trip = require('../../models/trip');

function userCanEditTrip(trip, userId) {
    return trip.createdBy.equals(userId) || trip.participants.includes(userId);
}

module.exports.postAddBudget = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { budget } = req.body;

        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).render('404');

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized");

        trip.budget.total = budget;
        await trip.save();

        res.json({ success: true, budget });
    } 
    catch (err) {
        console.error('Failed to add budget:', err);
        res.status(500).send("Server Error");
    }
};

module.exports.postResetBudget = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).json({ success: false });

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).json({ success: false });

        trip.budget.total = 0;
        trip.budget.expenses = [];
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error("Reset budget failed:", err);
        res.status(500).json({ success: false });
    }
};

module.exports.postAddExpense = async (req, res) => {
    try {
        const { tripId } = req.params;
        const { category, amount, description, spentBy, date } = req.body;

        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).render('404');

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized");

        trip.budget.expenses.push({ category, amount, description, spentBy, date });
        await trip.save();

        const savedExpense = trip.budget.expenses[trip.budget.expenses.length - 1];
        res.json({ success: true, expense: savedExpense });
    } 
    catch (err) {
        console.error('Failed to add expense:', err);
        res.status(500).send("Server Error");
    }
};

module.exports.postDeleteExpense = async (req, res) => {
    const { tripId, expenseId } = req.params;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) return res.status(404).send("Trip not found");

        if (!userCanEditTrip(trip, req.user._id))
            return res.status(403).send("Unauthorized");

        trip.budget.expenses = trip.budget.expenses.filter(e => e._id.toString() !== expenseId);
        await trip.save();

        res.json({ success: true });
    } 
    catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).send('Something went wrong');
    }
};
