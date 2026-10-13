/* Bible Tracker — cloud sync */
const cloudStatus = document.getElementById("cloudStatus");
const saveButtonForSync = document.getElementById("saveButton");
const CLOUD_URL = CONFIG.SCRIPT_URL;

function setCloudStatus(message, state = "neutral") {
    if (!cloudStatus) return;
    cloudStatus.textContent = message;
    cloudStatus.dataset.state = state;
}

async function downloadCloud() {
    setCloudStatus("Загружаем отметки…", "neutral");
    try {
        const response = await fetch(CLOUD_URL, { method: "GET", cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (!data || typeof data !== "object") throw new Error("Некорректный ответ сервера");
        setCloudStatus("Облачные данные загружены", "success");
        return data;
    } catch (error) {
        console.error("Ошибка загрузки облачных данных:", error);
        setCloudStatus("Офлайн-режим · отметки сохранены на этом телефоне", "error");
        return null;
    }
}

async function uploadCloud(data) {
    if (!CLOUD_URL) {
        setCloudStatus("Не задан адрес облачного сохранения", "error");
        return false;
    }
    if (saveButtonForSync) saveButtonForSync.disabled = true;
    setCloudStatus("Сохраняем в облако…", "neutral");
    try {
        // Keep the request a simple POST; Apps Script web apps do not implement OPTIONS preflight.
        const response = await fetch(CLOUD_URL, {
            method: "POST",
            headers: { "Content-Type": "text/plain;charset=utf-8" },
            body: JSON.stringify(data),
            redirect: "follow"
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const raw = await response.text();
        let result;
        try { result = JSON.parse(raw); } catch (_) { result = null; }
        const reply = raw.trim();
        if (result && result.success === true) {
            setCloudStatus("Сохранено в облако", "success");
        } else if (reply === "OK") {
            setCloudStatus("Сохранено в облако", "success");
        } else {
            throw new Error("Сервер не подтвердил сохранение");
        }
        return true;
    } catch (error) {
        console.error("Ошибка сохранения в облако:", error);
        setCloudStatus("Не удалось сохранить в облако · локальная копия сохранена", "error");
        return false;
    } finally {
        if (saveButtonForSync) saveButtonForSync.disabled = false;
    }
}
