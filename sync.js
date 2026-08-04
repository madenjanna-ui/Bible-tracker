/* ==========================
   sync.js
========================== */

const CLOUD_URL = CONFIG.SCRIPT_URL;

// Скачать данные
async function downloadCloud() {

    try {

        const response = await fetch(CLOUD_URL);

        if (!response.ok)
            throw new Error("Ошибка загрузки");

        return await response.json();

    } catch (e) {

        console.error(e);

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
