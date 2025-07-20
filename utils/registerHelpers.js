const hbs = require('hbs');
const path = require('path');

module.exports = () => {
    const helpers = {
        formatDate: require(path.join(__dirname, '../helpers/formatDate')),
        calculateTripDuration: require(path.join(__dirname, '../helpers/calculateTripDuration')),
        countCompletedTasks: require(path.join(__dirname, '../helpers/countCompletedTasks')),
        taskProgress: require(path.join(__dirname, '../helpers/taskProgress')),
        daysUntil: require(path.join(__dirname, '../helpers/daysUntil')),
        calculateSpent: require(path.join(__dirname, '../helpers/calculateSpent')),
        calculateRemaining: require(path.join(__dirname, '../helpers/calculateRemaining')),
        getUserName: require(path.join(__dirname, '../helpers/getUserName')),
        ifEquals: require(path.join(__dirname, '../helpers/ifEquals')),
        ifEqualsStr: require(path.join(__dirname, '../helpers/ifEqualsStr')),
        or: require(path.join(__dirname, '../helpers/or')),
        json: require(path.join(__dirname, '../helpers/json')),
        lookup: require(path.join(__dirname, '../helpers/lookup')),
        formatDateTime: require(path.join(__dirname, '../helpers/formatDateTime')),
        add: require(path.join(__dirname, '../helpers/add')),
        subtract: require(path.join(__dirname, '../helpers/subtract')),
        gt: require(path.join(__dirname, '../helpers/gt')),
        lt: require(path.join(__dirname, '../helpers/lt')),
    };

    for (const [name, fn] of Object.entries(helpers)) {
        hbs.registerHelper(name, fn);
    }
};
