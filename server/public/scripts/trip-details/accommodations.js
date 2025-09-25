document.addEventListener("DOMContentLoaded", () => {
    const tripId = window.location.pathname.split("/")[2];
    const accommoList = document.querySelector(".accommodation-list");

    function bindAccommoToggle() {
        const toggleBtn = document.querySelector(".toggle-accommo-form");
        const form = document.querySelector(".accommodation-form");

        if (toggleBtn && form) {
            toggleBtn.addEventListener("click", () => {
                form.classList.toggle("hidden");
            });
        }
    }

    function bindAccommoAdd() {
        const form = document.querySelector(".accommodation-form");

        form?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await axios.post(`/trips/${tripId}/accommodations`, data);
                if (res.data.success) {
                    const acc = res.data.accommo;
                    const checkIn = new Date(acc.checkIn).toLocaleDateString();
                    const checkOut = new Date(acc.checkOut).toLocaleDateString();

                    const newCard = document.createElement("div");
                    newCard.className = "accommodation-card";
                    newCard.dataset.accommoId = acc._id;
                    newCard.innerHTML = getAccommoCardHTML(acc, checkIn, checkOut);

                    accommoList.appendChild(newCard);
                    form.reset();
                    form.classList.add("hidden");

                    bindCardEvents(newCard); // Bind buttons for new card
                }
            } catch (err) {
                console.error("Error adding accommodation:", err);
            }
        });
    }

    function getAccommoCardHTML(acc, checkIn, checkOut) {
        return `
            <div class="accommo-view">
                <div class="card-content">
                    <div class="left-column">
                        <h3>🏨 ${acc.name}</h3>
                        ${acc.address ? `<p>📍 ${acc.address}</p>` : ""}
                        <p>💵 ₹${acc.price}</p>
                        ${acc.bookingUrl ? `<a href="${acc.bookingUrl}" target="_blank" class="booking-link">🔗 Booking</a>` : ""}
                    </div>
                    <div class="right-column">
                        <p>🛬 <strong>Check-In:</strong> ${checkIn}</p>
                        <p>🛫 <strong>Check-Out:</strong> ${checkOut}</p>
                        ${acc.notes ? `<p class="notes">📝 ${acc.notes}</p>` : ""}
                        <div class="accommo-actions">
                            <button class="edit-toggle-btn">✏️</button>
                            <form class="delete-form">
                                <button type="submit">🗑️</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <form class="accommo-edit hidden">
                <div class="form-row">
                    <input type="text" name="name" value="${acc.name}" required />
                    <input type="text" name="address" value="${acc.address || ''}" />
                    <input type="number" name="price" value="${acc.price || ''}" />
                </div>
                <div class="form-row">
                    <input type="date" name="checkIn" value="${acc.checkIn.split('T')[0]}" />
                    <input type="date" name="checkOut" value="${acc.checkOut.split('T')[0]}" />
                    <input type="url" name="bookingUrl" value="${acc.bookingUrl || ''}" />
                </div>
                <textarea name="notes" placeholder="Notes">${acc.notes || ''}</textarea>
                <div class="edit-actions">
                    <button type="submit">💾 Save</button>
                    <button type="button" class="cancel-edit-btn">❌ Cancel</button>
                </div>
            </form>
        `;
    }

    function bindCardEvents(card) {
        const editBtn = card.querySelector(".edit-toggle-btn");
        const cancelBtn = card.querySelector(".cancel-edit-btn");
        const view = card.querySelector(".accommo-view");
        const edit = card.querySelector(".accommo-edit");

        editBtn?.addEventListener("click", () => {
            view.classList.add("hidden");
            edit.classList.remove("hidden");
        });

        cancelBtn?.addEventListener("click", () => {
            edit.classList.add("hidden");
            view.classList.remove("hidden");
        });

        const deleteForm = card.querySelector(".delete-form");
        deleteForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = card.dataset.accommoId;
            try {
                const res = await axios.post(`/trips/${tripId}/accommodations/${id}/delete`);
                if (res.data.success) {
                    card.remove();
                }
            } catch (err) {
                console.error("Error deleting accommodation:", err);
            }
        });

        const editForm = card.querySelector(".accommo-edit");
        editForm?.addEventListener("submit", async (e) => {
            e.preventDefault();
            const id = card.dataset.accommoId;
            const formData = new FormData(editForm);
            const data = Object.fromEntries(formData.entries());

            try {
                const res = await axios.post(`/trips/${tripId}/accommodations/${id}/edit`, data);
                if (res.data.success) {
                    const acc = res.data.accommo;
                    const checkIn = new Date(acc.checkIn).toLocaleDateString();
                    const checkOut = new Date(acc.checkOut).toLocaleDateString();

                    card.innerHTML = getAccommoCardHTML(acc, checkIn, checkOut);
                    bindCardEvents(card);
                }
            } catch (err) {
                console.error("Error updating accommodation:", err);
            }
        });
    }

    document.querySelectorAll(".accommodation-card").forEach(bindCardEvents);

    bindAccommoToggle();
    bindAccommoAdd();
});
