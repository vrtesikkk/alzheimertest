function revealWorldInput() {
    document.getElementById('world-display').style.display = 'none';
    document.getElementById('world-ready-btn').style.display = 'none';
    document.getElementById('world-input-area').style.display = 'block';
    document.getElementById('world-backwards').focus();
}

function revealRepetitionInput() {
    document.getElementById('repetition-display').style.display = 'none';
    document.getElementById('repetition-ready-btn').style.display = 'none';
    document.getElementById('repetition-input-area').style.display = 'block';
    document.getElementById('repetition').focus();
}

function revealCommandButtons() {
    document.getElementById('command-instructions-display').style.display = 'none';
    document.getElementById('command-ready-btn').style.display = 'none';
    document.getElementById('commandButtons').style.display = 'flex';
}

// ========================================
        // УПРАВЛЕНИЕ СОСТОЯНИЕМ (STATE MANAGEMENT)
        // ========================================
        
        // Переменная для отслеживания текущего вопроса (начинаем с вопроса 1)
        let currentQuestion = 1;
        
        // Константа - общее количество вопросов в тесте
        const totalQuestions = 30;
        
        // Объект для хранения баллов по каждой категории теста
        let scores = {
            orientation_time: 0,    // Ориентация во времени (максимум 1 балл)
            registration: 0,        // Регистрация слов (максимум 1 балл)
            attention: 0,           // Внимание и вычисления (максимум 1 балл)
            recall: 0,              // Воспоминание слов (максимум 1 балл)
            naming: 0,              // Называние предметов (максимум 1 балл)
            repetition: 0,          // Повторение фразы (максимум 1 балл)
            command: 0,             // Выполнение команд (максимум 1 балл)
            writing: 0,             // Написание предложения (максимум 1 балл)
            // Add scores for q9-q30
            q9: 0, q10: 0, q11: 0, q12: 0, q13: 0, q14: 0, q15: 0, q16: 0, q17: 0, q18: 0, q19: 0, q20: 0, q21: 0, q22: 0, q23: 0, q24: 0, q25: 0, q26: 0, q27: 0, q28: 0, q29: 0, q30: 0
        };

        // Массив для хранения последовательности нажатых кнопок в задании с командами
        let commandSequence = [];

        // ========================================
        // ОБРАБОТКА КНОПОК КОМАНД (BLUE, RED, GREEN)
        // ========================================
        
        // Получаем все кнопки команд из HTML
        const commandButtons = document.querySelectorAll('.command-btn');
        
        // Для каждой кнопки команды добавляем обработчик клика
        commandButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Получаем цвет кнопки из атрибута data-color
                const color = btn.dataset.color;
                
                // Добавляем цвет в массив последовательности нажатых кнопок
                commandSequence.push(color);
                
                // Добавляем CSS класс "clicked" к кнопке (визуальная индикация)
                btn.classList.add('clicked');
                
                // Отключаем кнопку чтобы нельзя было нажать повторно
                btn.disabled = true;
                
                // Получаем элемент для отображения обратной связи
                const feedback = document.getElementById('commandFeedback');
                
                // Показываем пользователю какие шаги он уже выполнил
                // join(' → ') соединяет элементы массива стрелкой
                feedback.textContent = `Steps completed: ${commandSequence.join(' → ')}`;
                
                // Проверяем, нажал ли пользователь все 3 кнопки
                if (commandSequence.length === 3) {
                    // Проверяем правильность последовательности
                    const correct = commandSequence[0] === 'blue' &&   // Первая кнопка - синяя
                                  commandSequence[1] === 'red' &&      // Вторая кнопка - красная
                                  commandSequence[2] === 'green';      // Третья кнопка - зеленая
                    
                    // Если последовательность правильная
                    if (correct) {
                        // Начисляем 1 балл за правильное выполнение
                        scores.command = 1;
                        
                        // Показываем сообщение об успехе
                        feedback.textContent = '✓ Correct! You followed all three steps in order.';
                        
                        // Делаем текст зеленым
                        feedback.style.color = '#42f545';
                    } else {
                        // Если последовательность неправильная - 0 баллов
                        scores.command = 0;
                        
                        // Показываем сообщение об ошибке и правильную последовательность
                        feedback.textContent = '✗ Incorrect sequence. The correct order was: blue → red → green';
                        
                        // Делаем текст красным
                        feedback.style.color = '#f54242';
                    }
                }
            });
        });

        // ========================================
        // НАВИГАЦИЯ ПО ВОПРОСАМ
        // ========================================
        
        /**
         * Функция обновления прогресс-бара
         * Показывает сколько процентов теста пройдено
         */
        function updateProgress() {
            // Вычисляем процент прогресса (текущий вопрос / всего вопросов * 100)
            const progress = (currentQuestion / totalQuestions) * 100;
            
            // Устанавливаем ширину заполненной части прогресс-бара
            document.getElementById('progressFill').style.width = progress + '%';
        }

        /**
         * Функция показа конкретного вопроса
         * @param {number} num - номер вопроса для показа
         */
        function showQuestion(num) {
            // Скрываем все секции с вопросами (убираем класс 'active')
            document.querySelectorAll('.question-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Находим секцию с нужным номером вопроса по атрибуту data-question
            const targetSection = document.querySelector(`[data-question="${num}"]`);
            
            // Если секция найдена
            if (targetSection) {
                // Показываем её (добавляем класс 'active')
                targetSection.classList.add('active');
            }

            // Обновляем кнопки навигации
            
            // Показываем кнопку "Previous" только если это не первый вопрос
            document.getElementById('prevBtn').style.display = num > 1 ? 'block' : 'none';
            
            // Меняем текст кнопки "Next" на "Finish Test" если это последний вопрос
            document.getElementById('nextBtn').textContent = num === totalQuestions ? 'Finish Test' : 'Next';
            
            // Сохраняем текущий номер вопроса
            currentQuestion = num;
            
            // Обновляем прогресс-бар
            updateProgress();
        }

        // ========================================
        // ПОДСЧЕТ БАЛЛОВ
        // ========================================
        
        /**
         * Функция подсчета баллов по всем категориям теста
         * Проверяет ответы пользователя и начисляет баллы
         */
        function calculateScores() {
            // ВОПРОС 1: ОРИЕНТАЦИЯ ВО ВРЕМЕНИ (максимум 1 балл)
            
            // Обнуляем баллы за ориентацию во времени
            scores.orientation_time = 0;
            
            // Получаем все чекбоксы для вопроса 1 и проверяем каждый
            // Массив ID полей для ввода ответов на ориентацию во времени
            const orientationInputs = ['q1-year', 'q1-season', 'q1-day', 'q1-month'];
            
            // Проверяем каждое поле ввода
            orientationInputs.forEach(id => {
                // Получаем элемент input по ID
                const input = document.getElementById(id);
                
                // Если поле заполнено (не пусто) - добавляем 1 балл
                if (input && input.value.trim() !== '') {
                    scores.orientation_time = 1;
                }
            });

            // ВОПРОС 2: РЕГИСТРАЦИЯ СЛОВ (максимум 1 балл)
            
            // Обнуляем баллы за регистрацию
            scores.registration = 0;
            
            // Массив ID текстовых полей для ввода трех слов
            const regWords = ['reg-word1', 'reg-word2', 'reg-word3'];
            
            // Проверяем каждое поле ввода
            regWords.forEach(id => {
                // Получаем элемент input по ID
                const input = document.getElementById(id);
                
                // Получаем правильный ответ из атрибута data-answer
                const answer = input.dataset.answer;
                
                // Сравниваем введенное значение с правильным ответом
                // toLowerCase() - переводим в нижний регистр, trim() - убираем пробелы
                if (input.value.toLowerCase().trim() === answer) {
                    // Если ответ правильный - добавляем 1 балл
                    scores.registration = 1;
                }
            });

            // ВОПРОС 3: ВНИМАНИЕ И ВЫЧИСЛЕНИЕ (максимум 1 балл)
            
            // Обнуляем баллы за внимание
            scores.attention = 0;
            
            // ПРОВЕРКА ВАРИАНТА A: Вычитание семерок (Serial Sevens)
            
            // Массив ID полей для ввода ответов на вычитание
            const serialInputs = ['serial1', 'serial2', 'serial3', 'serial4', 'serial5'];
            
            // Переменная для подсчета баллов за вычитание
            let serialScore = 0;
            
            // Проверяем каждый ответ
            serialInputs.forEach(id => {
                // Получаем элемент input
                const input = document.getElementById(id);
                
                // Получаем правильный ответ
                const answer = input.dataset.answer;
                
                // Сравниваем ответ пользователя с правильным (без учета пробелов)
                if (input.value.trim() === answer) {
                    // Если правильно - добавляем 1 балл
                    serialScore = 1;
                }
            });

            // ПРОВЕРКА ВАРИАНТА B: Слово WORLD наоборот
            
            // Получаем поле ввода для слова WORLD наоборот
            const worldInput = document.getElementById('world-backwards');
            
            // Получаем правильный ответ (dlrow)
            const worldAnswer = worldInput.dataset.answer;
            
            // Переменная для подсчета баллов за WORLD
            let worldScore = 0;
            
            // Проверяем полностью правильный ответ
            if (worldInput.value.toLowerCase().trim() === worldAnswer) {
                // Если полностью правильно - 1 балл
                worldScore = 1;
            } else {
                // Если не полностью правильно - считаем частичные баллы
                // Подсчет на основе правильного порядка букв
                
                // Получаем введенный ответ в нижнем регистре
                const userAnswer = worldInput.value.toLowerCase().trim();
                
                // Счетчик правильно расположенных букв
                let correctOrder = 0;
                
                // Индекс последней найденной буквы
                let lastIndex = -1;
                
                // Проходим по каждой букве введенного ответа
                for (let char of userAnswer) {
                    // Ищем эту букву в правильном ответе после предыдущей найденной буквы
                    const index = worldAnswer.indexOf(char, lastIndex + 1);
                    
                    // Если буква найдена в правильном порядке
                    if (index > lastIndex) {
                        // Увеличиваем счетчик
                        correctOrder++;
                        
                        // Обновляем индекс последней найденной буквы
                        lastIndex = index;
                    }
                }
                
                // Баллы равны количеству букв в правильном порядке
                worldScore = correctOrder > 0 ? 1 : 0;
            }

            // Используем лучший результат из двух вариантов (Serial Sevens или WORLD)
            // Math.max выбирает большее значение
            scores.attention = Math.max(serialScore, worldScore);

            // ВОПРОС 5: ВОСПОМИНАНИЕ СЛОВ (максимум 1 балл)
            
            // Обнуляем баллы за воспоминание
            scores.recall = 0;
            
            // Массив ID полей для ввода вспомненных слов
            const recallWords = ['recall-word1', 'recall-word2', 'recall-word3'];
            
            // Проверяем каждое поле
            recallWords.forEach(id => {
                // Получаем элемент input
                const input = document.getElementById(id);
                
                // Получаем правильный ответ
                const answer = input.dataset.answer;
                
                // Сравниваем введенное слово с правильным
                if (input.value.toLowerCase().trim() === answer) {
                    // Если правильно - добавляем 1 балл
                    scores.recall = 1;
                }
            });

            // ВОПРОС 6: НАЗЫВАНИЕ ПРЕДМЕТОВ (максимум 2 балла)
            
            // Обнуляем баллы за называние
            scores.naming = 0;
            
            // Проверяем оба объекта (часы и карандаш)
            ['object1', 'object2'].forEach(id => {
                // Получаем элемент input
                const input = document.getElementById(id);
                
                // Получаем правильный ответ
                const answer = input.dataset.answer;
                
                // Получаем введенное значение
                const value = input.value.toLowerCase().trim();
                
                // Для первого объекта (часы) принимаем несколько вариантов ответа
                if (id === 'object1' && (value === 'watch' || value === 'wristwatch' || value === 'clock')) {
                    // Если любой из вариантов правильный - добавляем 1 балл
                    scores.naming++;
                } 
                // Для второго объекта (карандаш) также принимаем два варианта
                else if (id === 'object2' && (value === 'pencil' || value === 'pen')) {
                    // Если любой из вариантов правильный - добавляем 1 балл
                    scores.naming = 1; // Устанавливаем 1 балл, так как максимум 2 балла за оба объекта
                }
            });

            // ВОПРОС 7: ПОВТОРЕНИЕ ФРАЗЫ (максимум 1 балл)
            
            // Обнуляем баллы за повторение
            scores.repetition = 0;
            
            // Получаем введенную фразу
            const repetition = document.getElementById('repetition').value.toLowerCase().trim();
            
            // Проверяем точность повторения (принимаем с запятыми и без)
            if (repetition === 'no ifs, ands, or buts' || repetition === 'no ifs ands or buts') {
                // Если фраза правильная - 1 балл
                scores.repetition = 1;
            }

            // ВОПРОС 8: КОМАНДЫ - уже подсчитаны ранее
            // Баллы были установлены при нажатии кнопок (см. обработчик commandButtons)
            // scores.command уже содержит правильное значение

            // ВОПРОС 9: ЧТЕНИЕ И ВЫПОЛНЕНИЕ (максимум 1 балл)
            
            // ВОПРОС 8: НАПИСАНИЕ ПРЕДЛОЖЕНИЯ (максимум 1 балл)
            
            // Получаем текст предложения
            const sentence = document.getElementById('sentence').value.trim();
            
            // Обнуляем баллы за написание
            scores.writing = 0;
            
            // Базовая проверка: предложение должно быть достаточно длинным
            // и содержать минимум 3 слова (подлежащее, сказуемое и возможно дополнение)
            if (sentence.length > 5 && sentence.split(' ').length >= 3) {
                // Если условия выполнены - 1 балл
                scores.writing = 1;
            }

            // Questions 9-30: Each is 1 point if correct
            for (let i = 9; i <= 30; i++) {
                scores[`q${i}`] = 0;
                const input = document.getElementById(`q${i}`);
                if (input && input.value.toLowerCase().trim() === input.dataset.answer) {
                    scores[`q${i}`] = 1;
                }
            }

        }

        // ========================================
        // ПОКАЗ РЕЗУЛЬТАТОВ
        // ========================================
        
        /**
         * Функция отображения результатов теста
         * Подсчитывает финальный балл и показывает интерпретацию
         */
        function showResults() {
            // Вызываем функцию подсчета баллов по всем категориям
            calculateScores();
            
            // Вычисляем общий балл
            // Object.values(scores) - получает все значения из объекта scores в массив
            // reduce((a, b) => a + b, 0) - суммирует все элементы массива
            const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
            
            // Отображаем общий балл на странице
            document.getElementById('totalScore').textContent = totalScore;
            
            // ИНТЕРПРЕТАЦИЯ РЕЗУЛЬТАТА
            
            // Переменная для хранения HTML текста интерпретации
            let interpretation = '';
            
            // Переменная для CSS класса уровня (не используется в коде, но объявлена)
            let levelClass = '';
            
            // Определяем уровень когнитивных нарушений на основе баллов
            
            // 19-30 баллов: Норма
            if (totalScore <= 30) {
                interpretation = '<span class="interpretation-level level-normal">Normal cognition</span><p>Score indicates no cognitive impairment.</p>';
            } 
            // 18-21 балла: Легкие нарушения
            else if (totalScore < 20) {
                interpretation = '<span class="interpretation-level level-mild">Mild cognitive impairment</span><p>Score suggests mild cognitive impairment. Consider professional evaluation.</p>';
            } 
            // 13-17 баллов: Умеренные нарушения
            else if (totalScore < 13) {
                interpretation = '<span class="interpretation-level level-moderate">Moderate cognitive impairment</span><p>Score indicates moderate cognitive impairment. Professional evaluation recommended.</p>';
            } 
            // 0-12 баллов: Тяжелые нарушения
            else {
                interpretation = '<span class="interpretation-level level-severe">Severe cognitive impairment</span><p>Score suggests severe cognitive impairment. Please consult a healthcare professional.</p>';
            }
            
            // Вставляем HTML с интерпретацией на страницу
            document.getElementById('interpretationText').innerHTML = interpretation;
            
            // ДЕТАЛЬНАЯ РАЗБИВКА ПО КАТЕГОРИЯМ
            
            // Создаем HTML строку с баллами по каждой категории
            // Используем template literals (обратные кавычки) для многострочного текста
            // ${переменная} - вставляет значение переменной в текст
            let breakdown = `
                <p><strong>Orientation to Time:</strong> ${scores.orientation_time}/1</p>
                <p><strong>Registration:</strong> ${scores.registration}/1</p>
                <p><strong>Attention & Calculation:</strong> ${scores.attention}/1</p>
                <p><strong>Recall:</strong> ${scores.recall}/1</p>
                <p><strong>Naming:</strong> ${scores.naming}/1</p>
                <p><strong>Repetition:</strong> ${scores.repetition}/1</p>
                <p><strong>Three-Step Command:</strong> ${scores.command}/1</p>
                <p><strong>Writing:</strong> ${scores.writing}/1</p>
            `;
            
            // Add breakdown for questions 9-30
            for (let i = 9; i <= 30; i++) {
                breakdown += `<p><strong>Question ${i}:</strong> ${scores[`q${i}`]}/1</p>`;
            }
            
            // Вставляем разбивку на страницу
            document.getElementById('categoryBreakdown').innerHTML = breakdown;
            
            // Скрываем все секции с вопросами
            document.querySelectorAll('.question-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Показываем секцию с результатами
            document.getElementById('resultsSection').classList.add('active');
            
            // Скрываем кнопки навигации
            document.querySelector('.navigation').style.display = 'none';
        }

        // ========================================
        // ОБРАБОТЧИКИ СОБЫТИЙ ДЛЯ КНОПОК НАВИГАЦИИ
        // ========================================
        
        /**
         * Обработчик кнопки "Next" (Далее)
         * Переходит к следующему вопросу или показывает результаты
         */
        document.getElementById('nextBtn').addEventListener('click', () => {
            // Проверяем, не последний ли это вопрос
            if (currentQuestion < totalQuestions) {
                // Если не последний - показываем следующий вопрос
                showQuestion(currentQuestion + 1);
            } else {
                // Если последний - показываем результаты
                showResults();
            }
        });

        /**
         * Обработчик кнопки "Previous" (Назад)
         * Возвращает к предыдущему вопросу
         */
        document.getElementById('prevBtn').addEventListener('click', () => {
            // Проверяем, не первый ли это вопрос
            if (currentQuestion > 1) {
                // Если не первый - показываем предыдущий вопрос
                showQuestion(currentQuestion - 1);
            }
        });

        // ========================================
        // ИНИЦИАЛИЗАЦИЯ
        // ========================================
        
        // При загрузке страницы обновляем прогресс-бар
        // (показываем что мы на первом вопросе)
        updateProgress();