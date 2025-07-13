document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector(".destination-form");
    const tripId = window.location.pathname.split("/")[2];

    // ADD DESTINATION
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await axios.post(`/trips/${tripId}/destinations`, data);

            if (res.data.success) {
                const dest = res.data.destination;

                const newHTML = `
                <div class="destination-card" data-dest-id="${dest._id}">
                    <div class="card-left-actions">
                        <button type="button" class="edit-toggle-btn" title="Edit">✏️</button>
                        <form method="POST" action="/trips/${tripId}/destinations/${dest._id}/delete">
                            <button type="submit" title="Delete">🗑️</button>
                        </form>
                    </div>

                    <div class="card-content">
                        <div class="view-mode">
                            <h4>${dest.name}, ${dest.location}</h4>
                            ${dest.notes ? `<p>${dest.notes}</p>` : ""}
                            ${dest.date ? `<p><strong>Date:</strong> ${new Date(dest.date).toLocaleDateString()}</p>` : ""}
                        </div>

                        <form class="edit-mode hidden" method="POST" action="/trips/${tripId}/destinations/${dest._id}/edit">
                            <input type="text" name="name" value="${dest.name}" required />
                            <input type="text" name="location" value="${dest.location}" required />
                            <textarea name="notes">${dest.notes || ""}</textarea>
                            <input type="date" name="date" value="${dest.date ? new Date(dest.date).toISOString().split("T")[0] : ""}" />
                            <div class="edit-actions">
                                <button type="submit">💾 Save</button>
                                <button type="button" class="cancel-edit-btn">❌ Cancel</button>
                            </div>
                        </form>
                    </div>
                </div>`;

                const destinationList = document.querySelector(".destination-list");
                destinationList.insertAdjacentHTML("beforeend", newHTML);
                form.reset();
            }
        } catch (err) {
            console.error("Error adding destination:", err);
        }
    });

    // DELETE DESTINATION 
    document.querySelector(".destination-list").addEventListener("click", async (e) => {
        if (e.target.closest('form') && e.target.closest('form').action.includes('/delete')) {
            e.preventDefault();

            const form = e.target.closest('form');
            const card = form.closest('.destination-card');

            try {
                const res = await axios.post(form.action);
                if (res.data.success) {
                    card.remove();
                }
            } catch (err) {
                console.error('Error deleting destination:', err);
            }
        }

        // TOGGLE TO EDIT MODE
        if (e.target.classList.contains("edit-toggle-btn")) {
            const card = e.target.closest(".destination-card");
            const viewMode = card.querySelector(".view-mode");
            const editMode = card.querySelector(".edit-mode");

            viewMode.classList.add("hidden");
            editMode.classList.remove("hidden");
        }

        // CANCEL EDIT MODE
        if (e.target.classList.contains("cancel-edit-btn")) {
            const card = e.target.closest(".destination-card");
            const viewMode = card.querySelector(".view-mode");
            const editMode = card.querySelector(".edit-mode");

            viewMode.classList.remove("hidden");
            editMode.classList.add("hidden");
        }
    });

    // EDIT DESTINATION 
    document.addEventListener('submit', async (e) => {
        const form = e.target.closest('.edit-mode');
        if (!form) return;

        e.preventDefault();

        const card = form.closest('.destination-card');
        const destId = card.dataset.destId;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        try {
            const res = await axios.post(`/trips/${tripId}/destinations/${destId}/edit`, data);
            if (res.data.success) {
                const dest = res.data.destination;

                const viewMode = card.querySelector('.view-mode');
                viewMode.innerHTML = `
                    <h4>${dest.name}, ${dest.location}</h4>
                    ${dest.notes ? `<p>${dest.notes}</p>` : ""}
                    ${dest.date ? `<p><strong>Date:</strong> ${new Date(dest.date).toLocaleDateString()}</p>` : ""}
                `;

                form.classList.add('hidden');
                viewMode.classList.remove('hidden');
            }
        } catch (err) {
            console.error('Error editing destination:', err);
        }
    });
});
