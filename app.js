/* ==========================
   Bible Tracker
========================== */

const list = document.getElementById("readingList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

let completed = {};
let saveTimer = null;

init();

async function init() {

    // локальная копия
    completed = JSON.parse(
        localStorage.getItem("completedDays")
    ) || {};

    // пробуем получить облако
    const cloud = await downloadCloud();

    if (cloud && cloud.completed) {

        completed = cloud.completed;

        localStorage.setItem(
            "completedDays",
            JSON.stringify(completed)
        );

    }

    render();

}

function render() {

    list.innerHTML = "";

    readingPlan.forEach(item => {

        const card = document.createElement("div");
        card.className = "day";

        if (completed[item.day]) {
            card.classList.add("done");
        }

        const check = document.createElement("input");
        check.type = "checkbox";
        check.className = "check";
        check.checked = !!completed[item.day];

        check.addEventListener("change", () => {

            completed[item.day] = check.checked;

            if (check.checked)
                card.classList.add("done");
            else
                card.classList.remove("done");

            updateProgress();
            save();

        });

        const info = document.createElement("div");
        info.className = "info";

        const title = document.createElement("div");
        title.className = "title";
        title.textContent = "День " + item.day;

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

    const done =
        Object.values(completed)
        .filter(Boolean).length;

    const total = readingPlan.length;

    const percent =
        Math.round(done / total * 100);

    progressFill.style.width =
        percent + "%";

    progressText.textContent =
        `${done} из ${total} дней`;

}

function save() {

    // локально
    localStorage.setItem(
        "completedDays",
        JSON.stringify(completed)
    );

    // задержка, чтобы не отправлять
    // запрос после каждой галочки
    clearTimeout(saveTimer);

    saveTimer = setTimeout(async () => {

        await uploadCloud({
            completed
        });

    }, 800);

}
