module.exports = (total, expenses)=>{
    const spent = expenses.reduce((sum, e) => sum + e.amount, 0);
    return total - spent;
}