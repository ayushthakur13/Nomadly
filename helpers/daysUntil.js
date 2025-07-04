module.exports = (startDate)=>{
    const today = new Date();
    const start = new Date(startDate);
    const diff = Math.ceil((start - today) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
};
