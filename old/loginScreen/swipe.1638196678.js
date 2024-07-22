/**
 * https://web3r.ru/swipe-event
 * Функция определения события swipe на элементе.
 * @param {Object} element - элемент DOM.
 * @param {Object} setSettings - объект с предварительными настройками.
 * @param {Object} swipeHandlers - объект для установки обработчиков событий swipe. Swipe влево - реализован методом leftSwipeHandler
 * передаваемого объекта. Вправо метод rightSwipeHandler, вверх upSwipeHandler, вниз downSwipeHandler.  Можно установить
 * как один, так и все.
 */
function initSwipe(element, setSettings, swipeHandlers) {
    if (!element || !navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera.Mini|IEMobile/ig)) {
        return;
    }
    // настройки по умолчанию
    var settings = {
        minDist: 60,
        maxDist: 150,
        maxTime: 1000,
        minTime: 100
    };
    if (setSettings && typeof setSettings === 'object') {
        settings = $.extend(settings, setSettings);
    }
    // коррекция времени при ошибочных значениях
    if (settings.maxTime < settings.minTime) settings.maxTime = settings.minTime + 500;
    if (settings.maxTime < 100 || settings.minTime < 100) {
        settings.maxTime = 1000;
        settings.minTime = 100;
    }
    var el = element,       // отслеживаемый элемент
        dir,                  // направление свайпа (horizontal, vertical)
        swipeType,            // тип свайпа (up, down, left, right)
        dist,                 // дистанция, пройденная указателем
        startX = 0,           // начало координат по оси X (pageX)
        distX = 0,            // дистанция, пройденная указателем по оси X
        startY = 0,           // начало координат по оси Y (pageY)
        distY = 0,            // дистанция, пройденная указателем по оси Y
        startTime = 0,        // время начала касания
        support = {           // поддерживаемые браузером типы событий
            pointer: !!("PointerEvent" in window || ("msPointerEnabled" in window.navigator)),
            touch: !!(typeof window.orientation !== "undefined"
                || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
                || "ontouchstart" in window
                || navigator.msMaxTouchPoints
                || "maxTouchPoints" in window.navigator > 1
                || "msMaxTouchPoints" in window.navigator > 1)
        };
    /**
     * Подмена CustomEvent для устаревших браузеров
     */
    var checkCustomEvent = function() {
        if (typeof window.CustomEvent === 'function') {
            return;
        }
        function CustomEvent(event, params){
            params = params || {
                bubbles: false,
                cancelable: false,
                detail: null
            };
            var evt = document.createEvent('CustomEvent');
            evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
            return evt;
        }
        CustomEvent.prototype = window.Event.prototype;
        window.CustomEvent = CustomEvent;
    };
    /**
     * Опредление доступных в браузере событий: pointer, touch и mouse.
     * @returns {Object} - возвращает объект с доступными событиями.
     */
    var getSupportedEvents = function() {
        checkCustomEvent();
        switch (true) {
            case support.pointer:
                events = {
                    type:   "pointer",
                    start:  "PointerDown",
                    move:   "PointerMove",
                    end:    "PointerUp",
                    cancel: "PointerCancel",
                    leave:  "PointerLeave"
                };
                // добавление префиксов для IE10
                var ie10 = (window.navigator.msPointerEnabled && Function('/*@cc_on return document.documentMode===10@*/')());
                for (var value in events) {
                    if (value === "type") continue;
                    events[value] = (ie10) ? "MS" + events[value] : events[value].toLowerCase();
                }
                break;
            case support.touch:
                events = {
                    type:   "touch",
                    start:  "touchstart",
                    move:   "touchmove",
                    end:    "touchend",
                    cancel: "touchcancel"
                };
                break;
            default:
                events = {
                    type:  false
                };
                break;
        }
        return events;
    };
    /**
     * Объединение событий mouse/pointer и touch.
     * @param e {Event} - принимает в качестве аргумента событие.
     * @returns {TouchList|Event} - возвращает либо TouchList, либо оставляет событие без изменения.
     */
    var eventsUnify = function(e) {
        return e.changedTouches ? e.changedTouches[0] : e;
    };
    /**
     * Обрабочик начала касания указателем.
     * @param e {Event} - получает событие.
     */
    var checkStart = function(e) {
        var event = eventsUnify(e);
        if (support.touch && typeof e.touches !== "undefined" && e.touches.length !== 1) return; // игнорирование касания несколькими пальцами
        dir = "none";
        swipeType = "none";
        dist = 0;
        startX = event.pageX;
        startY = event.pageY;
        startTime = new Date().getTime();
    };
    /**
     * Обработчик движения указателя.
     * @param e {Event} - получает событие.
     */
    var checkMove = function(e) {
        var event = eventsUnify(e);
        distX = event.pageX - startX;
        distY = event.pageY - startY;
        if (Math.abs(distX) > Math.abs(distY)) dir = (distX < 0) ? "left" : "right";
        else dir = (distY < 0) ? "up" : "down";
        if (swipeHandlers !== undefined) {
            switch (dir) {
                case 'left':
                    if ('leftSwipeHandler' in swipeHandlers) {
                        swipeHandlers.leftSwipeHandler();
                    }
                    break;
                case 'right':
                    if ('rightSwipeHandler' in swipeHandlers) {
                        swipeHandlers.rightSwipeHandler();
                    }
                    break;
                case 'up':
                    if ('upSwipeHandler' in swipeHandlers) {
                        swipeHandlers.upSwipeHandler();
                    }
                    break;
                case 'down':
                    if ('downSwipeHandler' in swipeHandlers) {
                        swipeHandlers.downSwipeHandler();
                    }
                    break;
            }
        }
    };
    /**
     * Обработчик окончания касания указателем.
     * @param e {Event} - получает событие.
     */
    var checkEnd = function(e) {
        var endTime = new Date().getTime();
        var time = endTime - startTime;
        if (time >= settings.minTime && time <= settings.maxTime) { // проверка времени жеста
            if (Math.abs(distX) >= settings.minDist && Math.abs(distY) <= settings.maxDist) {
                swipeType = dir; // опредление типа свайпа как "left" или "right"
            } else if (Math.abs(distY) >= settings.minDist && Math.abs(distX) <= settings.maxDist) {
                swipeType = dir; // опредление типа свайпа как "top" или "down"
            }
        }
        dist = (dir === "left" || dir === "right") ? Math.abs(distX) : Math.abs(distY); // опредление пройденной указателем дистанции

        // генерация кастомного события swipe
        if (swipeType !== "none" && dist >= settings.minDist) {
            var swipeEvent = new CustomEvent("swipe", {
                bubbles: true,
                cancelable: true,
                detail: {
                    full: e, // полное событие Event
                    dir:  swipeType, // направление свайпа
                    dist: dist, // дистанция свайпа
                    time: time // время, потраченное на свайп
                }
            });
            el.dispatchEvent(swipeEvent);
        }
    };
    // добавление поддерживаемых событий
    var events = getSupportedEvents();
    if (events.type) {
        // добавление обработчиков на элемент
        el.addEventListener(events.start, checkStart);
        el.addEventListener(events.move, checkMove);
        el.addEventListener(events.end, checkEnd);
    }
}