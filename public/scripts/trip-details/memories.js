document.addEventListener("DOMContentLoaded", () => {
    
    const tripId = window.location.pathname.split("/")[2];

    const coverInput = document.getElementById("coverImageInput");
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
                const isOwnerOrUploader = window.isOwner || memory.uploadedBy === window.currentUserId;

                const card = document.createElement("div");
                card.classList.add("memory-card");
                card.dataset.memoryId = memory._id;

                const caption = memory.caption ? `<p class="memory-caption">“${memory.caption}”</p>` : "";

                const buttons = isOwnerOrUploader
                    ? `<div class="memory-btn">
                        <form class="download-memory-form">
                            <input type="hidden" name="memoryId" value="${memory._id}" />
                            <button type="submit" class="memory-download-btn" title="Download">
                                <i class="fa-solid fa-file-arrow-down"></i>
                            </button>
                        </form>
                        <form class="delete-memory-form">
                            <input type="hidden" name="memoryId" value="${memory._id}" />
                            <button type="submit" class="memory-delete-btn" title="Delete">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </form>
                    </div>` : "";

                card.innerHTML = `
                    <img src="${memory.url}" alt="Memory Image" class="memory-img" />
                    ${caption}
                    <p class="memory-uploader">— ${uploaderName}</p>
                    ${buttons}
                `;

                card.style.opacity = 0;
                await loadMemories(1);
                setTimeout(() => card.style.opacity = 1, 50);
                imageInput.value = "";
                captionInput.value = "";

                // Re-trigger FontAwesome to render icons
                if (window.FontAwesome && window.FontAwesome.dom)
                    window.FontAwesome.dom.i2svg();
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

            if (res.data.success) {
                const { totalMemoriesAfterDelete, pageSize } = res.data;
                const newTotalPages = Math.ceil(totalMemoriesAfterDelete / pageSize);

                if (currentPage > newTotalPages) 
                    currentPage = Math.max(1, newTotalPages);

                await loadMemories(currentPage); 
            }
        } catch (err) {
            console.error("Failed to delete memory:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Delete failed");
        }
    });

    //Pagination 
    let currentPage = 1;

    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');

    const loadMemories = async (page = 1) => {
        try {
            const res = await axios.get(`/trips/${tripId}/memories/paginated?page=${page}`);
            const { memories, userMap, pagination } = res.data;

            const memoryGrid = document.querySelector('.memory-grid');
            memoryGrid.innerHTML = '';

            memories.forEach(memory => {
                const uploaderName = userMap[memory.uploadedBy] || 'Unknown';
                const caption = memory.caption ? `<p class="memory-caption">"${memory.caption}"</p>` : '';

                memoryGrid.innerHTML += `
                    <div class="memory-card" data-memory-id="${memory._id}">
                        <img src="${memory.url}" alt="Memory Image" class="memory-img" />
                        ${caption}
                        <p class="memory-uploader">— ${uploaderName}</p>

                        <div class="memory-btn">
                            <form class="download-memory-form">
                                <input type="hidden" name="memoryId" value="${memory._id}" />
                                <button type="submit" class="memory-download-btn" title="Download">
                                    <i class="fa-solid fa-file-arrow-down"></i>
                                </button>
                            </form>

                            <form class="delete-memory-form">
                                <input type="hidden" name="memoryId" value="${memory._id}" />
                                <button type="submit" class="memory-delete-btn" title="Delete">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </form>
                        </div>
                    </div>
                `;
            });
            
            const paginationContainer = document.getElementById('pagination-container');
            if (pagination.totalPages > 1) {
                paginationContainer.innerHTML = `
                    <div class="pagination-buttons">
                        <button id="prevBtn" class="pagination-btn" ${pagination.currentPage === 1 ? 'disabled' : ''}>⬅ Prev</button>
                        <span id="pageIndicator" class="page-indicator">Page ${pagination.currentPage} of ${pagination.totalPages}</span>
                        <button id="nextBtn" class="pagination-btn" ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}>Next ➡</button>
                        <a href="/trips/${tripId}/memories" class="pagination-btn view-all-btn">View All</a>
                    </div>
                `;
            } 
            else paginationContainer.innerHTML = ''; 

            currentPage = pagination.currentPage;

            const newPrevBtn = document.getElementById('prevBtn');
            const newNextBtn = document.getElementById('nextBtn');

            if (newPrevBtn) {
                newPrevBtn.addEventListener('click', () => {
                    if (currentPage > 1) loadMemories(currentPage - 1);
                });
            }

            if (newNextBtn) {
                newNextBtn.addEventListener('click', () => {
                    if (currentPage < pagination.totalPages) loadMemories(currentPage + 1);
                });
            }
            
            // Tell FontAwesome to scan new DOM changes
            if (window.FontAwesome && window.FontAwesome.dom) 
                window.FontAwesome.dom.i2svg(); 

        } catch (err) {
            console.error('Error loading paginated memories:', err);
        }
    };

    // Initial load
    loadMemories(currentPage);


});
