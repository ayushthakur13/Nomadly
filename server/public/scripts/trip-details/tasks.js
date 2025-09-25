document.addEventListener("DOMContentLoaded", () => {
    const tripId = window.location.pathname.split("/")[2];
    const taskForm = document.querySelector(".task-add-form");
    const taskList = document.querySelector(".task-list");

    // ADD TASK
    taskForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(taskForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await axios.post(`/trips/${tripId}/tasks`, data);
            if (res.data.success) {
                const task = res.data.task;

                const newHTML = `
                <li class="task-item ${task.completed ? "completed" : ""}" data-task-id="${task._id}">
                    <form class="task-toggle-form" action="/trips/${tripId}/tasks/${task._id}/toggle" method="POST">
                    <button type="submit" class="check-btn">${task.completed ? "✔️" : "⭕"}</button>
                    </form>
                    <span class="task-title">${task.title}</span>
                    <form class="task-delete-form" action="/trips/${tripId}/tasks/${task._id}/delete" method="POST">
                    <button type="submit" class="delete-btn">🗑️</button>
                    </form>
                </li>
                `;

                taskList.insertAdjacentHTML("beforeend", newHTML);
                taskForm.reset();
            }
        } catch (err) {
            console.error("Error adding task:", err);
        }
    });

    // TOGGLE & DELETE TASK 
    taskList.addEventListener("submit", async (e) => {
        const toggleForm = e.target.closest(".task-toggle-form");
        const deleteForm = e.target.closest(".task-delete-form");

        if (!toggleForm && !deleteForm) return;

        e.preventDefault();

        const taskItem = e.target.closest(".task-item");
        const taskId = taskItem.dataset.taskId;
        
        try {
            // TOGGLE COMPLETED
            if (toggleForm) {
                const res = await axios.post(`/trips/${tripId}/tasks/${taskId}/toggle`);
                if (res.data.success) {
                    const completed = res.data.completed;
                    taskItem.classList.toggle("completed", completed);
                    
                    const checkBtn = e.submitter || toggleForm.querySelector(".check-btn");
                    checkBtn.textContent = completed ? "✔️" : "⭕";
                }
            }

            // DELETE TASK
            if (deleteForm) {
                const res = await axios.post(`/trips/${tripId}/tasks/${taskId}/delete`);
                if (res.data.success) taskItem.remove();
            }
        } catch (err) {
        console.error("Task action failed:", err);
        }
    });
    
});
