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

    setCloudStatus("🟡 Сохранение...");

    try {

        const response = await fetch(CLOUD_URL, {

            method: "POST",

            body: JSON.stringify(data)

        });

        const text = await response.text();

        console.log(text);

        setCloudStatus("🟢 Сохранено");

    } catch (e) {

        console.error(e);

        setCloudStatus("🔴 Ошибка");

    }

}