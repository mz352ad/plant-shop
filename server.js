const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Налаштування статичних файлів
app.use(express.static(__dirname));

// Маршрут для головної сторінки
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Маршрут для API (можна додати в майбутньому)
app.get('/api/plants', (req, res) => {
    res.json({
        message: 'API для рослин готовий',
        status: 'success'
    });
});

// Обробка 404 помилок
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '404.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🌱 PlantShop сервер запущений на http://localhost:${PORT}`);
    console.log(`📱 Сайт доступний за адресою: http://localhost:${PORT}`);
    console.log(`🔄 Для зупинки сервера натисніть Ctrl+C`);
    console.log(`📂 Статичні файли обслуговуються з папки: ${__dirname}`);
}); 