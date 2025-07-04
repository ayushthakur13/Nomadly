module.exports = tasks => {
  return tasks.filter(t => t.completed).length;
}