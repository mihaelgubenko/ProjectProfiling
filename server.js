const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Получаем токены из переменных окружения
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || '';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

// Функция отправки сообщения в Telegram
async function sendTelegramMessage(message) {
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
        console.error('❌ Telegram credentials not configured');
        return { success: false, error: 'Telegram not configured' };
    }
    
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        
        const response = await axios.post(url, {
            chat_id: TELEGRAM_CHAT_ID,
            text: message,
            parse_mode: 'HTML'
        });
        
        return { success: true, response: response.data };
    } catch (error) {
        console.error('Ошибка отправки в Telegram:', error.response?.data || error.message);
        return { success: false, error: error.message };
    }
}

// Форматирование сообщения для Telegram
function formatMessage(data) {
    const typeLabel = data.type === 'project' ? '📋 ЗАКАЗ ПРОЕКТА' : '🔧 ЗАКАЗ УСЛУГИ';
    const date = new Date().toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    return `
${typeLabel}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>Клиент:</b> ${data.firstName} ${data.lastName}
📱 <b>Телефон:</b> ${data.phone}
📝 <b>Описание:</b>
${data.description}

⏰ <b>Дата:</b> ${date}
    `.trim();
}

// Обработчик отправки формы
app.post('/api/submit-form', async (req, res) => {
    try {
        const { type, firstName, lastName, phone, description } = req.body;
        
        // Валидация данных
        if (!type || !firstName || !lastName || !phone || !description) {
            return res.status(400).json({
                success: false,
                error: 'Все поля обязательны для заполнения'
            });
        }
        
        // Формируем данные
        const formData = {
            type: type,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            phone: phone.trim(),
            description: description.trim()
        };
        
        // Отправляем в Telegram
        const message = formatMessage(formData);
        const telegramResult = await sendTelegramMessage(message);
        
        if (telegramResult.success) {
            console.log('✅ Уведомление отправлено в Telegram:', formData);
            res.json({
                success: true,
                message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.'
            });
        } else {
            console.error('❌ Ошибка отправки в Telegram:', telegramResult.error);
            res.status(500).json({
                success: false,
                error: 'Ошибка при отправке заявки. Попробуйте позже.'
            });
        }
        
    } catch (error) {
        console.error('Ошибка обработки формы:', error);
        res.status(500).json({
            success: false,
            error: 'Внутренняя ошибка сервера'
        });
    }
});

// Главная страница
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        console.log(`📱 Telegram уведомления настроены для chat_id: ${TELEGRAM_CHAT_ID}`);
    } else {
        console.log(`⚠️  Telegram не настроен. Установите TELEGRAM_BOT_TOKEN и TELEGRAM_CHAT_ID`);
    }
});

