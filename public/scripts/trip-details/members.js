document.addEventListener("DOMContentLoaded", () => {
    const tripId = window.location.pathname.split("/")[2];
    const inviteForm = document.querySelector(".invite-member-form");
    const memberList = document.querySelector(".member-list");

    let currentCount = memberList.querySelectorAll(".member-card").length;

    function updateMemberCount(newCount) {
        const label = newCount === 1 ? "member" : "members";
        document.querySelector(".member-count").innerHTML = `👥 <span id="total-members">${newCount}</span> ${label} total`;
        currentCount = newCount; 
    }

    inviteForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const formData = new FormData(inviteForm);
        const identifier = formData.get("identifier");
        const messageEl = inviteForm.querySelector(".form-message");

        messageEl.classList.add("hidden");
        messageEl.textContent = "";

        try {
            const res = await axios.post(`/trips/${tripId}/members/invite`, { identifier });
            if (res.data.success) {
                const member = res.data.user;
                const isCurrentUser = member._id === window.currentUserId;

                const li = document.createElement("li");
                li.classList.add("member-card");
                if(isCurrentUser) li.classList.add("current-user");

                li.innerHTML = `
                    <span class="member-name">${member.name}</span>
                    <form class="remove-member-form" data-user-id="${member._id}">
                        <button type="submit" class="remove-btn" title="Remove">❌</button>
                    </form>
                `;

                memberList.appendChild(li);
                inviteForm.reset();
                updateMemberCount(currentCount + 1);
            }
        } catch (err) {
            console.error("Error inviting member:", err.response?.data || err.message);

            let errorMsg = "Could not invite member";

            if (err.response?.data) {
                if (typeof err.response.data === "string") {
                    errorMsg = err.response.data;
                } else if (err.response.data.message) {
                    errorMsg = err.response.data.message;
                } else {
                    errorMsg = JSON.stringify(err.response.data);
                }
            }

            messageEl.textContent = errorMsg;
            messageEl.classList.remove("hidden");
        }
    });

    memberList.addEventListener("submit", async (e) => {
        const form = e.target.closest(".remove-member-form");
        if (!form) return;

        e.preventDefault();
        const memberId = form.dataset.userId;

        try {
            const res = await axios.post(`/trips/${tripId}/members/${memberId}/remove`);
            if (res.data.success) {
                form.closest(".member-card")?.remove();
                updateMemberCount(currentCount - 1);
            }
        } catch (err) {
            console.error("Error removing member:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Could not remove member");
        }
    });

    document.querySelector(".leave-trip-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`/trips/${tripId}/leave`);
            if (res.data.success) 
                window.location.href = "/trips"; 
        } catch (err) {
            console.error("Failed to leave trip:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Couldn't leave trip");
        }
    });

});
