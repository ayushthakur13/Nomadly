module.exports = (expenses)=>{
    return expenses.reduce((sum, e) => sum + e.amount, 0);
}