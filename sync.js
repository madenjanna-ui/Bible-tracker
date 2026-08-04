/* ==========================
   sync.js
========================== */
const cloudStatus =
    document.getElementById("cloudStatus");

function setCloudStatus(text){

    if(cloudStatus){

        cloudStatus.textContent = text;

    }

}
const CLOUD_URL = CONFIG.SCRIPT_URL;

// Скачать данные из Google Drive
async function downloadCloud() {

    setCloudStatus("🟡 Загрузка...");

    try {

        const response = await fetch(CLOUD_URL);

        if (!response.ok) {
            throw new Error("Ошибка загрузки");
        }

        const data = await response.json();

        setCloudStatus("🟢 Сохранено");

        return data;

    } catch (error) {

        console.error("Ошибка загрузки:", error);

        setCloudStatus("🔴 Нет соединения");

        return null;

    }

}

// Отправить данные
async function uploadCloud(data) {

    try {

        const response = await fetch(CLOUD_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        return await response.json();

    } catch (e) {

        console.error(e);

        return null;

    }

}
