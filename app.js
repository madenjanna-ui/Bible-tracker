/* ==========================
   Bible Tracker
   app.js
========================== */

const list = document.getElementById("readingList");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");

let completed =
JSON.parse(localStorage.getItem("completedDays")) || {};

render();

function render() {

    list.innerHTML = "";

    readingPlan.forEach(item => {

        const card = document.createElement("div");
        card.className = "day";

        if (completed[item.day]) {
            card.classList.add("done");
        }

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "check";
        checkbox.checked = !!completed[item.day];

        checkbox.addEventListener("change", () => {

            completed[item.day] = checkbox.checked;

            if (checkbox.checked) {
                card.classList.add("done");
            } else {
                card.classList.remove("done");
            }

            save();
            updateProgress();

        });

        const info = document.createElement("div");
        info.className = "info";

        const title = document.createElement("div");
        title.className = "title";
        title.textContent = "День " + item.day;

        const reading = document.createElement("div");
        reading.className = "reading";
        reading.textContent = item.reading;

        info.appendChild(title);
        info.appendChild(reading);

        card.appendChild(checkbox);
        card.appendChild(info);

        list.appendChild(card);

    });

    updateProgress();

}

function updateProgress() {

    const total = readingPlan.length;

    const done = Object.values(completed)
        .filter(v => v).length;

    const percent = Math.round(done / total * 100);

    progressFill.style.width = percent + "%";

    progressText.textContent =
        done + " из " + total + " дней";

}

function save() {

    localStorage.setItem(
        "completedDays",
        JSON.stringify(completed)
    );

}