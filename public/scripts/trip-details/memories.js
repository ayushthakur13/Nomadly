document.addEventListener("DOMContentLoaded", () => {
    
    const tripId = window.location.pathname.split("/")[2];

    const coverInput = document.getElementById("coverImageInput");
    const coverForm = document.querySelector(".update-trip-cover-form");
    const deleteCoverForm = document.querySelector(".delete-trip-cover-form");
    const tripCoverImg = document.querySelector(".trip-cover-img");

    // Upload new cover image
    coverInput?.addEventListener("change", async () => {
        if (!coverInput.files[0]) return;

        const formData = new FormData();
        formData.append("image", coverInput.files[0]);

        try {
            const res = await axios.post(`/trips/${tripId}/cover/update`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success && res.data.imageUrl) {
                tripCoverImg.src = res.data.imageUrl;
                coverInput.value = "";
            }
        } 
        catch (err) {
            console.error("Error uploading cover image:", err.response?.data || err.message);
            alert("Failed to update trip cover image.");
        }
    });

    // Delete cover image
    deleteCoverForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post(`/trips/${tripId}/cover/delete`);
            if (res.data.success) 
                tripCoverImg.src = "/images/default-trip.jpg";
        } 
        catch (err) {
            console.error("Error deleting cover image:", err.response?.data || err.message);
            alert("Failed to delete cover image.");
        }
    });


    // Upload memory
    const memoryForm = document.querySelector(".add-memory-form");
    const imageInput = document.getElementById("memoryImage");
    const captionInput = memoryForm.querySelector(".memory-caption-input");
    const memoryGrid = document.querySelector(".memory-grid");

    imageInput?.addEventListener("change", async () => {
        const image = imageInput.files[0];
        const caption = captionInput.value;

        if (!image) return;

        const formData = new FormData();
        formData.append("image", image);
        formData.append("caption", caption);

        try {
            const res = await axios.post(`/trips/${tripId}/memories/add`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                const memory = res.data.memory;
                const uploaderName = window.userMap?.[memory.uploadedBy] || "Someone";

                const card = document.createElement("div");
                card.classList.add("memory-card");
                card.dataset.memoryId = memory._id;

                card.innerHTML = `
                <img src="${memory.url}" alt="Memory Image" class="memory-img" />
                ${memory.caption ? `<p class="memory-caption">“${memory.caption}”</p>` : ""}
                <p class="memory-uploader">— ${uploaderName}</p>
                ${
                    window.isOwner || memory.uploadedBy === window.currentUserId
                    ? `<form class="delete-memory-form">
                        <input type="hidden" name="memoryId" value="${memory._id}" />
                        <button type="submit" class="memory-delete-btn" title="Delete">🗑️</button>
                        </form>`
                    : ""
                }
                `;

                card.style.opacity = 0;
                memoryGrid.prepend(card);
                setTimeout(() => card.style.opacity = 1, 50);
                imageInput.value = "";
                captionInput.value = "";
            }
        } catch (err) {
            console.error("Memory upload failed:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Upload failed.");
        }
    });


    // Delete memory
    memoryGrid.addEventListener("submit", async (e) => {
        const form = e.target.closest(".delete-memory-form");
        if (!form) return;

        e.preventDefault();
        const memoryId = form.querySelector("[name='memoryId']").value;

        try {
            const res = await axios.post(`/trips/${tripId}/memories/delete`, { memoryId });
            if (res.data.success) 
                form.closest(".memory-card")?.remove();
        } 
        catch (err) {
            console.error("Failed to delete memory:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Delete failed");
        }
    });

});
