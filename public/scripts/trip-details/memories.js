document.addEventListener("DOMContentLoaded", () => {
    
    const tripId = window.location.pathname.split("/")[2];

    const coverInput = document.getElementById("coverImageInput");
    const deleteCoverForm = document.querySelector(".delete-trip-cover-form");
    const tripCoverImg = document.querySelector(".trip-cover-img");
    const coverLabel = document.querySelector(".cover-upload-label");
    const deleteCoverBtn = deleteCoverForm?.querySelector(".delete-cover-btn");

    function showNoMemoriesMessage() {
        const grid = document.querySelector(".memory-grid");
        if (!grid) return;

        const cards = grid.querySelectorAll(".memory-card");
        if (cards.length === 0) {
            grid.innerHTML = `
            <p class="no-memory-message">No memories found for this trip yet.</p>
            `;
        }
    }

    const coverSpinner = document.createElement("span");
    coverSpinner.className = "cover-upload-spinner";
    coverSpinner.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-left: 8px; color:#4FB286"></i>`;

    // Upload new cover image
    coverInput?.addEventListener("change", async () => {
        if (!coverInput.files[0]) return;

        const formData = new FormData();
        formData.append("image", coverInput.files[0]);

        coverLabel.appendChild(coverSpinner);
        coverInput.disabled = true;

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

        if (coverLabel.contains(coverSpinner)) coverLabel.removeChild(coverSpinner);
        coverInput.disabled = false;
    });

    // Delete cover image
    deleteCoverForm?.addEventListener("submit", async (e) => {
        e.preventDefault();

        const originalHTML = deleteCoverBtn.innerHTML;
        deleteCoverBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin style="color:#4FB286"></i>`;
        deleteCoverBtn.disabled = true;

        try {
            const res = await axios.post(`/trips/${tripId}/cover/delete`);
            if (res.data.success) 
                tripCoverImg.src = "/images/default-trip.jpg";
        } 
        catch (err) {
            console.error("Error deleting cover image:", err.response?.data || err.message);
            alert("Failed to delete cover image.");
        }

        deleteCoverBtn.innerHTML = originalHTML;
        deleteCoverBtn.disabled = false;
    });


    // Upload memory
    const memoryForm = document.querySelector(".add-memory-form");
    const imageInput = document.getElementById("memoryImage");
    const memoryGrid = document.querySelector(".memory-grid");
    const label = memoryForm?.querySelector(".memory-image-label");

    const spinner = document.createElement("span");
    spinner.className = "memory-upload-spinner";
    spinner.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="margin-left: 8px; color:#4FB286"></i>`;

    imageInput?.addEventListener("change", async () => {
        const image = imageInput.files[0];

        if (!image) return;

        const formData = new FormData();
        formData.append("image", image);

        label.appendChild(spinner);
        imageInput.disabled = true;

        try {
            const res = await axios.post(`/trips/${tripId}/memories/add`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });

            if (res.data.success) {
                
                await loadMemories(1);
                imageInput.value = "";

                // Re-trigger FontAwesome to render icons
                if (window.FontAwesome && window.FontAwesome.dom)
                    window.FontAwesome.dom.i2svg();
            }

        } catch (err) {
            console.error("Memory upload failed:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Upload failed.");
        }

        if (label.contains(spinner)) label.removeChild(spinner);
        imageInput.disabled = false;
    });


    // Delete memory
    memoryGrid.addEventListener("submit", async (e) => {
        const form = e.target.closest(".delete-memory-form");
        if (!form) return;

        e.preventDefault();
        const memoryId = form.querySelector("[name='memoryId']").value;
        const deleteBtn = form.querySelector(".memory-delete-btn");

        deleteBtn.disabled = true;
        deleteBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin" style="color:#4FB286"></i>`;

        try {
            const res = await axios.post(`/trips/${tripId}/memories/delete`, { memoryId });

            if (res.data.success) {
                const { totalMemoriesAfterDelete, pageSize } = res.data;
                const newTotalPages = Math.ceil(totalMemoriesAfterDelete / pageSize);

                if (currentPage > newTotalPages) 
                    currentPage = Math.max(1, newTotalPages);

                await loadMemories(currentPage); 
                showNoMemoriesMessage();
            }
        } catch (err) {
            console.error("Failed to delete memory:", err.response?.data || err.message);
            alert(err.response?.data?.message || "Delete failed");
        }

        deleteBtn.innerHTML = `<i class="fa-solid fa-trash"></i>`;
        deleteBtn.disabled = false;
    });

    // Download memory
    document.addEventListener('click', async function (e) {
        if (e.target.closest('.memory-download-btn')) {
            const btn = e.target.closest('.memory-download-btn');
            const imageUrl = btn.dataset.url;

            btn.disabled = true;
            btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin style="color:#4FB286"></i>';

            try {
                const response = await fetch(imageUrl);
                const blob = await response.blob();
                const blobUrl = URL.createObjectURL(blob);

                const fileName = imageUrl.split('/').pop().split('?')[0];

                const link = document.createElement('a');
                link.href = blobUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                URL.revokeObjectURL(blobUrl);
            } catch (err) {
                alert('Download failed. Try again later.');
                console.error('Download error:', err);
            }

            btn.innerHTML = '<i class="fa-solid fa-file-arrow-down"></i>';
            btn.disabled = false;
        }
    });


    //Pagination 
    let currentPage = 1;

    const loadMemories = async (page = 1) => {
        try {
            const res = await axios.get(`/trips/${tripId}/memories/paginated?page=${page}`);
            const { memories, userMap, pagination } = res.data;

            const memoryGrid = document.querySelector('.memory-grid');

            const memoryCountEl = document.getElementById('memoryCount');
            if (memoryCountEl) 
                memoryCountEl.innerText = pagination.totalMemories > 0 ? `(${pagination.totalMemories})` : '';

            memoryGrid.innerHTML = '';

            memories.forEach(memory => {
                const uploaderName = userMap[memory.uploadedBy] || 'Unknown';

                memoryGrid.innerHTML += `
                    <div class="memory-card" data-memory-id="${memory._id}">
                        <img src="${memory.url}" alt="Memory Image" class="memory-img" />
                        <p class="memory-uploader">— ${uploaderName}</p>

                        <div class="memory-btn">
                            <button type="button" class="memory-download-btn" title="Download" data-url="${memory.url}">
                                <i class="fa-solid fa-file-arrow-down"></i>
                            </button>

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
                        <button id="prevBtn" class="pagination-btn">⬅ Prev</button>
                        <span id="pageIndicator" class="page-indicator">Page ${pagination.currentPage} of ${pagination.totalPages}</span>
                        <button id="nextBtn" class="pagination-btn">Next ➡</button>
                        <a href="/trips/${tripId}/memories" class="pagination-btn view-all-btn">View All</a>
                    </div>
                `;
            } 
            else paginationContainer.innerHTML = ''; 

            currentPage = pagination.currentPage;

            const newPrevBtn = document.getElementById('prevBtn');
            const newNextBtn = document.getElementById('nextBtn');

            if (newPrevBtn) {
                newPrevBtn.onclick = () => {
                    if (currentPage > 1) 
                        loadMemories(currentPage - 1);
                };
                newPrevBtn.disabled = (pagination.currentPage === 1);
                newPrevBtn.style.display = (pagination.currentPage === 1) ? 'none' : 'inline-block';
            }

            if (newNextBtn) {
                newNextBtn.onclick = () => {
                    if (currentPage < pagination.totalPages) 
                        loadMemories(currentPage + 1);
                };
                newNextBtn.disabled = (pagination.currentPage === pagination.totalPages);
                newNextBtn.style.display = (pagination.currentPage === pagination.totalPages) ? 'none' : 'inline-block';
            }
            
            // Tell FontAwesome to scan new DOM changes
            if (window.FontAwesome && window.FontAwesome.dom) 
                window.FontAwesome.dom.i2svg(); 

            showNoMemoriesMessage();

        } catch (err) {
            console.error('Error loading paginated memories:', err);
        }
    };

    // Initial load
    loadMemories(currentPage);


});
