/* Bible Tracker */
const list = document.getElementById("readingList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressBar = document.querySelector(".progress-bar");
const saveButton = document.getElementById("saveButton");

let completed = {};
let saveTimer = null;
let hasLocalData = false;

init();

async function init() {
    try {
        const saved = localStorage.getItem("completedDays");
        if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                completed = parsed;
                hasLocalData = true;
            }
        }
    } catch (error) {
        console.warn("Не удалось прочитать локальные отметки:", error);
        completed = {};
    }

    render();
    const cloud = await downloadCloud();

    // Merge so an offline/local tick is not erased by an empty cloud response.
    if (cloud && cloud.completed && typeof cloud.completed === "object") {
        completed = hasLocalData
            ? { ...cloud.completed, ...completed }
            : cloud.completed;
        persistLocal();
        render();
    }
}

function render() {
    if (!list || !Array.isArray(readingPlan)) return;
    list.innerHTML = "";

    readingPlan.forEach(item => {
        const card = document.createElement("article");
        card.className = "day";
        if (completed[item.day]) card.classList.add("done");

        const check = document.createElement("input");
        check.type = "checkbox";
        check.className = "check";
        check.checked = !!completed[item.day];
        check.setAttribute("aria-label", `Отметить день ${item.day} прочитанным`);
        check.addEventListener("change", () => {
            completed[item.day] = check.checked;
            card.classList.toggle("done", check.checked);
            persistLocal();
            updateProgress();
            scheduleCloudSave();
        });

        const info = document.createElement("div");
        info.className = "info";

        const title = document.createElement("div");
        title.className = "title";
        title.textContent = `День ${item.day}`;

        const reading = document.createElement("div");
        reading.className = "reading";
        reading.textContent = item.reading;

        info.append(title, reading);
        card.append(check, info);
        list.append(card);
    });

    updateProgress();
}

function updateProgress() {
    const done = readingPlan.reduce((count, item) => count + (completed[item.day] ? 1 : 0), 0);
    const total = readingPlan.length;
    const percent = total ? Math.round(done / total * 100) : 0;

    progressFill.style.width = `${percent}%`;
    progressText.textContent = `${done} из ${total} дней`;
    if (progressBar) progressBar.setAttribute("aria-valuenow", String(done));
}

function persistLocal() {
    try {
        localStorage.setItem("completedDays", JSON.stringify(completed));
        hasLocalData = true;
    } catch (error) {
        console.error("Не удалось сохранить локальные отметки:", error);
        setCloudStatus("Не удалось сохранить данные на телефоне", "error");
    }
}

function scheduleCloudSave() {
    clearTimeout(saveTimer);
    setCloudStatus("Отметки сохранены на телефоне", "neutral");
    saveTimer = setTimeout(() => uploadCloud({ completed }), 900);
}

if (saveButton) {
    saveButton.addEventListener("click", async () => {
        clearTimeout(saveTimer);
        persistLocal();
        await uploadCloud({ completed });
    });
}
