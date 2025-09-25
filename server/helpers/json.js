module.exports = (context)=>{
    return JSON.stringify(context).replace(/</g, '\\u003c');
}