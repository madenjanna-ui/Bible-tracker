/* Bible Tracker */
const list = document.getElementById("readingList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const progressBar = document.querySelector(".progress-bar");
const saveButton = document.getElementById("saveButton");
const todayDate = document.getElementById("todayDate");
const todayDay = document.getElementById("todayDay");
const todayReading = document.getElementById("todayReading");
const todayState = document.getElementById("todayState");
const todayDoneButton = document.getElementById("todayDoneButton");

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
        title.textContent = item.date ? `День ${item.day} · ${item.date}` : `День ${item.day}`;

        const reading = document.createElement("div");
        reading.className = "reading";
        reading.textContent = item.reading;

        info.append(title, reading);
        card.append(check, info);
        list.append(card);
    });

    updateProgress();
    updateTodayPanel();
}

function getLocalDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
}

function parsePlanDate(item) {
    const match = (item.date || "").match(/^(\d{1,2})\s+([а-яё]+)/i);
    if (!match) return null;
    const months = {"января":0,"февраля":1,"марта":2,"апреля":3,"мая":4,"июня":5,"июля":6,"августа":7,"сентября":8,"октября":9,"ноября":10,"декабря":11};
    const month = months[match[2].toLowerCase()];
    if (month === undefined) return null;
    let year = new Date().getFullYear();
    const now = new Date();
    // This plan crosses October and November; infer the year nearest the current date.
    let date = new Date(year, month, Number(match[1]));
    if (date.getTime() < new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - 180*86400000) date = new Date(year + 1, month, Number(match[1]));
    return date;
}

function getTodayItem() {
    const now = new Date();
    const todayKey = getLocalDateKey(now);
    return readingPlan.find(item => {
        const date = parsePlanDate(item);
        return date && getLocalDateKey(date) === todayKey;
    }) || null;
}

function updateTodayPanel() {
    if (!todayDate || !todayReading) return;
    const now = new Date();
    todayDate.textContent = now.toLocaleDateString("ru-RU", { weekday: "long", day: "numeric", month: "long" });
    const item = getTodayItem();
    document.querySelectorAll(".day.is-today").forEach(card => card.classList.remove("is-today"));
    if (!item) {
        const first = readingPlan[0];
        const firstDate = first ? parsePlanDate(first) : null;
        if (firstDate && now < firstDate) {
            todayDay.textContent = "Подготовка к началу плана";
            todayReading.textContent = `Завтра: ${first.reading}`;
            todayState.textContent = `Старт ${first.date}`;
        } else {
            todayDay.textContent = "План чтения завершён";
            todayReading.textContent = "Все отрывки по плану прочитаны";
            todayState.textContent = "Отличная работа!";
        }
        todayDoneButton.disabled = true;
        todayDoneButton.textContent = "Нет задания";
        todayDoneButton.classList.remove("is-done");
        return;
    }
    todayDay.textContent = `День ${item.day} · ${item.date}`;
    todayReading.textContent = item.reading;
    todayState.textContent = completed[item.day] ? "Сегодня прочитано ✓" : "Отметь после чтения";
    todayDoneButton.disabled = false;
    todayDoneButton.textContent = completed[item.day] ? "Прочитано ✓" : "Отметить прочитанным";
    todayDoneButton.classList.toggle("is-done", !!completed[item.day]);
    const cards = [...document.querySelectorAll(".day")];
    const card = cards.find(el => el.querySelector(".title")?.textContent.includes(`День ${item.day} ·`));
    if (card) card.classList.add("is-today");
}

if (todayDoneButton) {
    todayDoneButton.addEventListener("click", () => {
        const item = getTodayItem();
        if (!item) return;
        completed[item.day] = !completed[item.day];
        persistLocal();
        render();
        scheduleCloudSave();
    });
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
