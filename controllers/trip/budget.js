const Trip = require('../../models/trip');

module.exports.postAddBudget = async (req,res)=>{
    try{
        const { tripId } = req.params;
        const { budget } = req.body;
        
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id })
        
        if (!trip) return res.status(404).render('404');

        trip.budget.total = budget;
        await trip.save();
        res.redirect(`/trips/details?tripId=${tripId}`);
    }
    catch(err){
        console.error('Failed to add budget:', err);
        res.status(500).send("Server Error");
    }
};

module.exports.postAddExpense = async (req,res)=>{
    try{
        const { tripId } = req.params;
        const { category, amount, description, spentBy, date } = req.body;
        
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id })

        if (!trip) return res.status(404).render('404');

        trip.budget.expenses.push({
            category,
            amount,
            description,
            spentBy,
            date
        });

        await trip.save();
        res.redirect(`/trips/details?tripId=${tripId}`);
    }
    catch(err){
        console.error('Failed to add budget:', err);
        res.status(500).send("Server Error");
    }
};

module.exports.postDeleteExpense = async (req, res) => {
    const { tripId, expenseId } = req.params;

    try {
        const trip = await Trip.findOne({ _id: tripId, createdBy: req.user._id });
        if (!trip) return res.status(404).send("Trip not found or you don't have permission.");

        trip.budget.expenses = trip.budget.expenses.filter(e => e._id.toString() !== expenseId);
        await trip.save();

        res.redirect(`/trips/details?tripId=${tripId}`);
    } 
    catch (err) {
        console.error('Error deleting expense:', err);
        res.status(500).send('Something went wrong');
    }
};
