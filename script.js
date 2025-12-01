// ============================================
// JavaScript для модальных окон и анимаций
// Минимум зависимостей, простая функциональность
// ============================================

// Функция открытия модального окна
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // Блокируем прокрутку фона
    }
}

// Функция закрытия модального окна
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = 'auto'; // Восстанавливаем прокрутку
    }
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modals = document.querySelectorAll('.modal');
    modals.forEach(modal => {
        if (event.target === modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Закрытие модального окна по клавише Escape
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (modal.classList.contains('active')) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
        // Также закрываем lightbox
        closeLightbox();
    }
});

// ============================================
// Lightbox для увеличения скриншотов
// ============================================

// Функция открытия lightbox
function openLightbox(imageSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    if (lightbox && lightboxImg) {
        lightboxImg.src = imageSrc;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Функция закрытия lightbox
function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// Закрытие lightbox при клике вне изображения
document.addEventListener('click', function(event) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox && event.target === lightbox) {
        closeLightbox();
    }
});

// Плавная прокрутка для якорных ссылок (если будут добавлены)
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Простая анимация появления элементов при скролле (опционально)
function observeElements() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, {
        threshold: 0.1
    });

    // Применяем наблюдение к карточкам проектов
    document.querySelectorAll('.project-card, .article-column').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

// ============================================
// Обработка форм с placeholder'ами
// ============================================

// Функция для работы с placeholder'ами (автоматическое стирание при фокусе)
function setupPlaceholders() {
    const textareas = document.querySelectorAll('.order-form textarea');
    
    textareas.forEach(textarea => {
        const originalPlaceholder = textarea.placeholder;
        let isPlaceholderActive = true;
        
        // Сохраняем placeholder в data-атрибут
        textarea.setAttribute('data-placeholder', originalPlaceholder);
        
        textarea.addEventListener('focus', function() {
            if (isPlaceholderActive || this.value === originalPlaceholder) {
                this.value = '';
                this.style.color = '#1a1a1a';
                isPlaceholderActive = false;
            }
        });
        
        textarea.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.value = originalPlaceholder;
                this.style.color = '#888';
                isPlaceholderActive = true;
            } else {
                isPlaceholderActive = false;
            }
        });
        
        // Устанавливаем начальное значение как placeholder
        if (textarea.value === '') {
            textarea.value = originalPlaceholder;
            textarea.style.color = '#888';
            isPlaceholderActive = true;
        }
    });
}

// Обработка отправки форм
function handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const formData = new FormData(form);
    
    // Получаем данные формы
    const data = {
        type: formType,
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        phone: formData.get('phone'),
        description: formData.get('description')
    };
    
    // Проверяем, что описание не является placeholder'ом
    const textarea = form.querySelector('textarea');
    const placeholder = textarea.getAttribute('data-placeholder') || textarea.placeholder;
    if (data.description.trim() === '' || data.description === placeholder) {
        alert('Пожалуйста, опишите ваш запрос.');
        textarea.focus();
        textarea.value = '';
        textarea.style.color = '#1a1a1a';
        return false;
    }
    
    // Отправка данных на сервер
    const submitButton = form.querySelector('.form-submit-btn');
    const originalButtonText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Отправка...';
    
    fetch('/api/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            alert(result.message || 'Спасибо! Ваша заявка принята. Мы свяжемся с вами в ближайшее время.');
            // Очищаем форму
            form.reset();
            setupPlaceholders(); // Восстанавливаем placeholder'ы
        } else {
            alert('Ошибка: ' + (result.error || 'Не удалось отправить заявку. Попробуйте позже.'));
        }
    })
    .catch(error => {
        console.error('Ошибка отправки формы:', error);
        alert('Ошибка соединения с сервером. Проверьте подключение к интернету и попробуйте снова.');
    })
    .finally(() => {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
    });
    
    return false;
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    // Инициализируем наблюдение за элементами (если нужно)
    if ('IntersectionObserver' in window) {
        observeElements();
    } else {
        // Fallback для старых браузеров
        document.querySelectorAll('.project-card, .article-column').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        });
    }
    
    // Настраиваем placeholder'ы для форм
    setupPlaceholders();
    
    console.log('Ретро-газета загружена! 📰');
});

