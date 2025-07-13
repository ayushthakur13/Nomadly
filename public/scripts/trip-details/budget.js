document.addEventListener("DOMContentLoaded", () => {
    const tripId = window.location.pathname.split("/")[2];

    let isExpenseBound = false;

    function updateBudgetSummary() {
        const expenseItems = document.querySelectorAll(".expense-item");
        let spent = 0;

        expenseItems.forEach(item => {
            const text = item.querySelector(".expense-info")?.textContent;
            const match = text?.match(/₹(\d+)/);
            if (match) spent += parseInt(match[1]);
        });

        const budgetTextEl = document.querySelector(".budget-heading");
        const total = budgetTextEl ? parseInt(budgetTextEl.dataset.budget) : 0;
        const remaining = total - spent;

        const boxes = document.querySelectorAll(".budget-box");
        boxes[0].innerHTML = `<span>💰 Remaining:</span> ₹${remaining}`;
        boxes[1].innerHTML = `<span>📊 Amount Spent:</span> ₹${spent}`;
    }

    function bindExpenseToggle() {
        const toggleBtn = document.querySelector('.toggle-expense-form');
        const form = document.querySelector('.expense-form');

        if (toggleBtn && form) {
            const clone = toggleBtn.cloneNode(true); 
            toggleBtn.parentNode.replaceChild(clone, toggleBtn);
            clone.addEventListener('click', () => {
                form.classList.toggle('hidden');
            });
        }
    }

    function initBudgetEventListeners() {
        const budgetForm = document.querySelector(".edit-budget-form");
        const budgetDisplay = document.querySelector(".budget-heading");
        const resetBudgetForm = document.querySelector(".reset-budget-form");

        // Edit Budget
        if (budgetForm) {
            budgetForm.addEventListener("submit", async (e) => {
                e.preventDefault();
                const budgetValue = budgetForm.querySelector('input[name="budget"]').value;

                try {
                    const res = await axios.post(`/trips/${tripId}/budget/update`, { budget: budgetValue });
                    if (res.data.success) {
                        budgetDisplay.textContent = `💵 Total Budget: ₹${res.data.budget}`;
                        budgetDisplay.dataset.budget = res.data.budget;
                        updateBudgetSummary();
                        budgetForm.classList.add("hidden");
                    }
                } catch (err) {
                    console.error("Error updating budget:", err);
                }
            });
        }

        // Reset Budget
        if (resetBudgetForm) {
            resetBudgetForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                try {
                    const res = await axios.post(`/trips/${tripId}/budget/reset`);
                    if (res.data.success) {
                        const budgetSection = document.querySelector("#budget");

                        budgetSection.innerHTML = `
                        <form class="budget-form" data-trip-id="${tripId}">
                            <input type="number" name="budget" placeholder="Enter your total trip budget" required />
                            <button type="submit">Set Budget</button>
                        </form>

                        <div class="budget-summary-wrapper hidden">
                            <div class="budget-summary-header">
                            <h3 class="budget-heading" data-budget="0">💵 Total Budget: ₹0</h3>
                            <div class="budget-actions hidden">
                                <button class="edit-budget-btn" onclick="toggleBudgetEdit()">✏️ Edit</button>
                                <button class="reset-budget-btn" onclick="toggleResetConfirm()">Reset</button>
                            </div>
                            </div>

                            <form class="edit-budget-form hidden">
                            <input type="number" name="budget"" required />
                            <button type="submit">💾 Save</button>
                            <button type="button" onclick="toggleBudgetEdit()">❌ Cancel</button>
                            </form>

                            <form class="reset-budget-form hidden">
                            <p><strong>Are you sure?</strong> This will remove all expenses.</p>
                            <button type="submit" class="btn-danger">Reset</button>
                            <button type="button" onclick="toggleResetConfirm()">Cancel</button>
                            </form>

                            <div class="budget-summary hidden">
                            <div class="budget-box"><span>💰 Remaining:</span> ₹0</div>
                            <div class="budget-box"><span>📊 Amount Spent:</span> ₹0</div>
                            </div>

                            <button class="toggle-expense-form hidden">➕ Add Expense</button>

                            <form class="expense-form hidden">
                            <input type="text" name="category" placeholder="Category (e.g. Travel, Food)" required />
                            <input type="number" name="amount" placeholder="Amount" required />
                            <input type="date" name="date" required />
                            <input type="text" name="description" placeholder="Description (optional)" />
                            <select name="spentBy" required>
                                <option disabled selected>Spent By</option>
                                <option value="${tripId}">You</option>
                            </select>
                            <button type="submit">Add</button>
                            </form>

                            <ul class="expense-list"></ul>
                        </div>
                        `;

                        isExpenseBound = false;
                        initInitialBudgetForm();
                        initBudgetEventListeners();
                        setTimeout(() => {
                            bindExpenseToggle();
                        }, 0);
                    }
                } catch (err) {
                    console.error("Failed to reset budget:", err);
                }
            });
        }

        // Add Expense
        const expenseFormNew = document.querySelector(".expense-form");

        if (expenseFormNew && !isExpenseBound) {
            expenseFormNew.addEventListener("submit", async (e) => {
                e.preventDefault();
                const formData = new FormData(expenseFormNew);
                const data = Object.fromEntries(formData.entries());

                try {
                    const res = await axios.post(`/trips/${tripId}/expenses`, data);
                    if (res.data.success) {
                        const expense = res.data.expense;
                        const date = new Date(expense.date).toLocaleDateString();

                        const newExpenseHTML = `
                            <li class="expense-item" data-expense-id="${expense._id}">
                                <div class="expense-info">
                                    <strong>📁 ${expense.category}</strong> - ₹${expense.amount}<br />
                                    ${expense.description ? `<span>${expense.description}</span><br />` : ""}
                                    <small>🧍 You • 🗓️ ${date}</small>
                                </div>
                                <form method="POST" action="/trips/${tripId}/expenses/${expense._id}/delete">
                                    <button type="submit">🗑️</button>
                                </form>
                            </li>
                        `;
                        document.querySelector(".expense-list").insertAdjacentHTML("beforeend", newExpenseHTML);
                        expenseFormNew.reset();
                        expenseFormNew.classList.add("hidden");
                        updateBudgetSummary();
                    }
                } catch (err) {
                    console.error("Error adding expense:", err);
                }
            });

            isExpenseBound = true;
        }

        // Delete Expense
        document.querySelector(".expense-list")?.addEventListener("submit", async (e) => {
            const form = e.target.closest("form");
            if (!form || !form.action.includes("/delete")) return;

            e.preventDefault();
            const card = form.closest(".expense-item");
            const expenseId = card.dataset.expenseId;

            try {
                const res = await axios.post(`/trips/${tripId}/expenses/${expenseId}/delete`);
                if (res.data.success) card.remove();
                updateBudgetSummary();
            } catch (err) {
                console.error("Error deleting expense:", err);
            }
        });
    }

    function initInitialBudgetForm() {
        const initialBudgetForm = document.querySelector(".budget-form");

        if (initialBudgetForm) {
            initialBudgetForm.addEventListener("submit", async (e) => {
                e.preventDefault();

                const formData = new FormData(initialBudgetForm);
                const data = Object.fromEntries(formData.entries());

                try {
                    const res = await axios.post(`/trips/${tripId}/budget/update`, data);
                    if (res.data.success) {
                        const budgetValue = data.budget;

                        // Hide budget form
                        initialBudgetForm.classList.add("hidden");

                        // Show budget UI
                        document.querySelector(".budget-summary-wrapper")?.classList.remove("hidden");
                        document.querySelector(".budget-summary")?.classList.remove("hidden");
                        document.querySelector(".toggle-expense-form")?.classList.remove("hidden");
                        document.querySelector(".budget-actions")?.classList.remove("hidden");

                        // Update heading
                        const budgetHeading = document.querySelector(".budget-heading");
                        if (budgetHeading) {
                            budgetHeading.textContent = `💵 Total Budget: ₹${budgetValue}`;
                            budgetHeading.dataset.budget = budgetValue;
                        }

                        updateBudgetSummary();
                        initBudgetEventListeners();
                        bindExpenseToggle(); 
                    }
                } catch (err) {
                    console.error("Error setting initial budget:", err);
                }
            });
        }
    }

    // Initial bindings
    initInitialBudgetForm();
    initBudgetEventListeners();
    if (document.querySelector(".expense-list")) updateBudgetSummary();
    bindExpenseToggle();

    // Global helpers
    window.toggleBudgetEdit = () => {
        document.querySelector('.edit-budget-form')?.classList.toggle('hidden');
    };

    window.toggleResetConfirm = () => {
        document.querySelector(".reset-budget-form")?.classList.toggle("hidden");
    };
});
