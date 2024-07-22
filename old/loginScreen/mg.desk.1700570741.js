//функция для получения правильных окончаний
function _ending(value, endings)
{
    var result = '';
    if (value > 20) {
        value = (value % 100) % 10;
    }
    if (value < 2) {
        if (value === 0) {
            result = endings[2];
        } else {
            result = endings[0];
        }
    } else if (value < 5) {
        result = endings[1];
    } else {
        result = endings[2];
    }
    return result;
}

/*!
 * функция для быстрого отображения миниатюр выбранных изображений
 * использование:
 * 	loadedImgPreview({
 *		'files' : files, // список файлов (`FileList`)
 *		'maxWidth' : previewW, // максимальная ширина изображения
 *		'maxHeight' : previewH // максимальная высота изображения
 *	}, function (canvas) {
 *
 *		// продолжаем работу с миниатюрами
 *		// например, добавляем на страницу по очереди
 *		test.appendChild(canvas);
 *	});
 */
function loadedImgPreview(options, callback)
{
	// если не переданы файлы
    if (!options.files) {
        return false;
    }
    // если выбран только один файл
    if (!options.files.length) {
        options.files = [options.files];
    }
    var URL = window.URL || window.webkitURL;
    for (var i = 0; i < options.files.length; i++) {
        var f = options.files[i];
        // если есть нужный метод и загружается изображение
        if (URL.createObjectURL && f.type.match('image.*')) {
            // получаем ссылку на файл и создаём объект изображения
            var url = URL.createObjectURL(f);
            var img = new Image();
            img.onload = function (e) {
                var width = this.naturalWidth;
                var height = this.naturalHeight;
                var canvasW, canvasH;
                // получаем соотношение сторон изображения
                var ratio = width / height;
                // изображение будет отрисовываться в канвас
                var canvas = document.createElement('canvas');
                var ctx = canvas.getContext('2d');
                // выбираем правильные размеры
                if (!!options.maxWidth && !!options.maxHeight) {
                    if (width > height) {
                        canvasW = options.maxWidth;
                        canvasH = canvasW / ratio;
                    } else {
                        canvasH = options.maxHeight;
                        canvasW = canvasH * ratio;
                    }
                } else if (!!options.maxWidth) {
                    canvasW = options.maxWidth;
                    canvasH = canvasW / ratio;
                } else if (!!options.maxHeight) {
                    canvasH = options.maxHeight;
                    canvasW = canvasH * ratio;
                } else {
                    canvasW = width;
                    canvasH = height;
                }
                // отрисовываем
                canvas.width = canvasW;
                canvas.height = canvasH;
                ctx.drawImage(this, 0, 0, canvasW, canvasH);
                // продолжаем работу
                callback(canvas);
                // освобождаем память
                URL.revokeObjectURL(this.src);
            };
            // начинаем загружать файл
            img.src = url;
        }
    }
}

//аналоги стандартных уведомлений для фенсибокса
//вызов должен быть в `$(document).ready()`
function fancyAlert(message, opts)
{
    //Сбрасываем focus у текущего элемента, чтоб например нельзя было написать текст в input, когда выведен попап
	var activeElement = $(document.activeElement);
	var content = '<div class="FancyModal FancyModal--alert"><h2 class="FancyModal__header">'
        + message
        + '</h2><div class="FancyModal__controls"><button class="btnMain btnOutline">Закрыть</button></div></div>';
	var defaults = {
		content: content,
		closeClick: true,
		showCloseButton: false,
		hideOnContentClick: true,
		scrolling: 'no',
		hideOnOverlayClick: false,
		padding: 0
	};
	opts = $.extend({}, defaults, opts);
	activeElement.blur();
	$.fancybox(opts);
}
function fancyConfirm(opts, callback)
{
    if (!opts) {
        return;
    }
    var content = '<div class="FancyModal '
        + opts.additionalClass
        + '">'
        + (opts.header ? '<h2 class="FancyModal__header">' + opts.header + '</h2>' : '')
        + (opts.message ? '<div class="FancyModal__content">' + opts.message + '</div>' : '')
        + '<div class="FancyModal__control"><button class="'
        + (opts.confirmButtonClass ? opts.confirmButtonClass : 'btn btnMain')
        + ' js-fancyConfirm">'
        + (opts.confirmButtonText ? opts.confirmButtonText : 'Отправить')
        + '</button> '
        + '<button class="'
        + (opts.cancelButtonClass ? opts.cancelButtonClass : 'btn btnMain btnOutline FancyModal__cancel')
        + ' js-closeFancybox">Отмена</button></div></div>';
    var defaults = {
        content: content,
        closeClick: true,
        showCloseButton: false,
        hideOnContentClick: false,
        scrolling: 'no',
        hideOnOverlayClick: false,
        padding: 0
    };
    opts = $.extend({}, defaults, opts);
    if (typeof callback === 'function') {
        if (typeof opts.onComplete === 'function') {
            var additionalCallback = opts.onComplete;
            opts.onComplete = function() {
                $('#fancybox-content').on('click', '.js-fancyConfirm', function(){
                    $.fancybox.close();
                    callback();
                });
                additionalCallback();
            };
        } else {
            opts.onComplete = function() {
                $('#fancybox-content').on('click', '.js-fancyConfirm', function(){
                    $.fancybox.close();
                    callback();
                });
            };
        }
    }
    $(document.activeElement).blur();
    $.fancybox(opts);
}
/**
 * Всплывающее сообщение fancybox
 */
function fancyMessage(title, message, opts, additionalClass) {
    additionalClass = additionalClass || '';
    var headerHtml = '<h2 class="FancyModal__header">' + title + '</h2>';
    var contentHtml = (!!message
        ? '<div class="FancyModal__content">' + message + '</div>'
        : ''
    );
    var content = '' +
        '<div class="FancyModal ' + additionalClass + '">' + headerHtml + contentHtml +
        '   <div class="FancyModal__control"><button class="btn btnMain FancyModal__submit">Закрыть</button></div>' +
        '</div>';
    var defaults = {
        content: content,
        closeClick: true,
        showCloseButton: false,
        hideOnContentClick: true,
        scrolling: 'no',
        hideOnOverlayClick: false,
        padding: 0
    };
    opts = $.extend({}, defaults, opts);
    $(document.activeElement).blur(); // сбросить focus у текущего элемента
    $.fancybox(opts);
}

//календарь
function InitDatePicker(extObj)
{
    if ($('.js-dateInput').length > 0) {
        $('.js-dateInput').each(function () {
            var objInput = $(this);
            var optObj = {
                buttonText: 'Выберите дату',
                showOn: 'button',
                dateFormat: objInput.attr('data-format') !== undefined
                    ? objInput.attr('data-format') : 'dd.mm.yy',
                minDate: objInput.attr('data-date-min') !== undefined
                    ? objInput.attr('data-date-min') : null,
                maxDate: objInput.attr('data-date-max') !== undefined
                    ? objInput.attr('data-date-max') : null,
                yearRange: objInput.attr('data-year-range') !== undefined
                    ? objInput.attr('data-year-range') : "c-10:c+10",
                changeMonth: true,
                changeYear: true,
                disabled: objInput.attr('data-disabled') !== undefined
                ? objInput.attr('data-disabled') : false
            };
            if (extObj && typeof (extObj) === 'object') {
                optObj = $.extend(optObj, extObj);
            }
            if (typeof objInput.datepicker !== 'undefined') {
                objInput.datepicker(optObj);
            }
            deskCalender.setViewIcon(objInput);
            // перевязка label на id
            var label = $('label[for="' + objInput.attr('name') + '"]');
            if (
                label.length > 0
                && objInput.attr('name') !== objInput.attr('id')
                && $('#' + objInput.attr('name')).length <= 0
            ) {
                label.attr('for', objInput.attr('id'));
            }
        });
    }
}

var deskCalender = {
    setViewIcon: function(dateField) {
        dateField.nextAll('.ui-datepicker-trigger').addClass('btn date');
        $(dateField).unbind('click').on('click', function () {
            $(this).nextAll('.ui-datepicker-trigger')[0].click();
        });
    }
};

// маска телефона
function initPhoneMask($input) {
    if ($input === undefined) {
        $input = $('.js-phoneMask');
    }
    if (!$input.length) {
        return false;
    }
    $input
        .closest('.js-phoneItem')
        .find('.js-phoneExtension')
        .on('keypress', function(e) {
            // разрешено вводить только цифры
            if (e.which && e.which !== 0 && (e.which < 48 || e.which > 57) )
                return false;
        })
        .on('input', function(e) {
            e.target.value = e.target.value.replace(/[^\d]/g, '');
            var $that = $(this);
            if ($that.closest('.js-phoneItem').find('.js-phoneMaskWithAjaxValidation').length) {
                clearTimeout(window._phoneExtensionTimerID);
                window._phoneExtensionTimerID = setTimeout(function() {
                    validatePhone($that);
                }, 1000);
            }
        });
    $input.maskPhone({
        completed: function() {
            var $that = $(this);

            if ($that.is('.js-phoneMaskNoCompetedOnce')) {
                $that.removeClass('js-phoneMaskNoCompetedOnce');
                return true;
            }
            if ($that.is('.js-phoneMaskWithAjaxValidation')) {
                validatePhone($that);
            }
            // перескок на поле добавочного номера в рабочем телефоне
            $that
                .closest('.js-phoneItem')
                .find('.js-phoneExtension')
                .focus();
        }
    });

    // проверка номера телефона
    function validatePhone($element) {
        var $number = $element.closest('.js-phoneItem').find('.js-phoneMask');
        var $extension = $element.closest('.js-phoneItem').find('.js-phoneExtension');
        var value = $number.val();
        if (!value) {
            return true;
        }
        if ($extension.length && $.trim($extension.val())) {
            value += ' доб.' + $extension.val();
        }
        $.ajax({
            url: '/ajax/validate.php',
            type: 'POST',
            cache: false,
            data: {
                action: 'phone',
                value: value
            },
            dataType: 'json',
            success: function(result) {
                if (result) {
                    $number.attr('data-error-text', (result.error || ''));
                    $number.trigger('ajaxSuccess');
                }
            }
        });
    }
}

function InitCountElementPage()
{
    var url = new URL(window.location.href),
        params = new URLSearchParams(url.search);
    params.set('COUNT', $(this).val());
    var strParam = params.toString();
    document.location.href = window.location.pathname + '?' + strParam;
}

//новых обращений от неавторизованных
function GetNewOrdersCatalogCountOKT(form_id, date, time)
{
    $.ajax({
        url: '/ajax/desk/feedback.php',
        type: 'POST',
        data: {
            action: 'GetNewOrdersCatalogCountOKT',
            form_id: form_id,
            date: date
        },
        dataType: 'json',
        success: function(result) {
            if (result['success'] && result['success'].length > 0) {
                $('#newOrdersNotify').html(result['success']);
                $('#newOrdersNotify').slideDown();
            } else {
                $('#newOrdersNotify').hide();
            }
            setTimeout('GetNewOrdersCatalogCountOKT("'+form_id+'", "' + date + '", ' + time + ');', time);
        }
    });
    return false;
}


//функция для скрытия ошибок tipTip
function HideTipTipError(isStopClear)
{
	if (!isStopClear && window.tipTipErrorTimeout !== undefined) {
        clearTimeout(window.tipTipErrorTimeout);
    }
    if ($('.TipTip__active').length) {
        $('.TipTip__active').tipTip('hide').tipTip('destroy');
    } else if ($('.TipTip--theme-error:visible').length) {
        $('.TipTip--theme-error:visible').hide();
    }
}

//функция для показа ошибок tipTip'ом
function ShowTipTipError(elem, content, position, theme, timeView, maxWidth, edgeOffset)
{
    if ($(elem).hasClass('js-tipComponent')) {
        changeViewTip($(elem), content);
    }
    var optionsTip = {
        activation: 'manual',
        theme: 'error',
        maxWidth: 'auto',
        defaultPosition: 'right',
        edgeOffset: 0,
        afterEnter: function () {
            setTimeout(function () {
                $(document).one('click', function () {
                    HideTipTipError(true);
                });
            }, 300);
        }
    };
    if (typeof content === 'object' && !$(elem).hasClass('js-tipComponent')) {
        timeView = position === undefined || position < 0 ? 0 : position;
        $.extend(optionsTip, content);
    } else {
        optionsTip.resetPaddingContent = false;
        optionsTip.content = content;
        if (position === undefined && $(elem).attr('data-position')) {
            optionsTip.defaultPosition = $(elem).attr('data-position');
        }
        if (timeView === undefined || timeView < 0) {
            timeView = 0;
        }
        if (maxWidth === undefined) {
            optionsTip.maxWidth = $(elem).attr('data-width')
                ? (parseInt($(elem).attr('data-width')) > 0
                    ? parseInt($(elem).attr('data-width')) : $(elem).attr('data-width'))
                : 'auto';
        }
        if (edgeOffset === undefined && $(elem).attr('data-edge-offset')) {
            optionsTip.edgeOffset = $(elem).attr('data-edge-offset');
        }
        if ($(elem).attr('data-reset-padding') === 'true') {
            optionsTip.resetPaddingContent = true;
        }
    }
    HideTipTipError();
    if ($(elem).is(':visible')) {
        window.tipTipErrorTimeout = window.setTimeout(function () {
            if ($(elem).is(':visible')) {
                $(elem).tipTip(optionsTip).tipTip('show');
                if (timeView > 0) {
                    window.tipTipErrorTimeout = window.setTimeout(function() {
                        HideTipTipError();
                    }, timeView);
                }
            }
        }, 300);
    }
}

// выполяет изменения в верстке элементов самого компонента tiptip
function changeViewTip(obj, options)
{
    if (options === undefined) {
        return;
    }
    var virsionTip = 'TipNote2__';
    // ключи в options это часть названия класса, которое используется в TipNote2_
    var rsOptions = {
        // header - часть имени класса которое использует метод setHeader при создании
        header: options.header ? options.header : null,
        // для метода setContent
        content: options.content ? options.content : null
    };
    $.each(rsOptions, function (key, val) {
        $tipInnerEl = obj.find('.' + virsionTip + key);
        if (val === null) {
            $tipInnerEl.hide();
        } else {
            $tipInnerEl.text(val);
            $tipInnerEl.show();
        }
    });
}


//функция привязывает правильный тип тип
function setTipTip(obj)
{
    if ($(obj).is('.js-tipOnClick')) {
        $(obj).tipTip({
            'activation': 'click',
            'defaultPosition': 'top',
            'hideOnClick': true,
            'keepAlive': true,
            'theme': 'white',
            'delay': 100,
            'fadeIn': 0,
            'fadeOut': 200,
            'maxWidth': 340
        });
    } else {
        obj.tipTip({defaultPosition: 'top'});
    }
}


//функция для перезагрузки контента по ajax
function ReloadAjaxContent(url, objSend, isSetHistory, callback)
{
	if (url.length <= 0) {
		url = document.location.pathname;
	}
	if ('append' in objSend) {
		objSend.append('ajaxContent', 'Y');
	} else {
		objSend['ajaxContent'] = 'Y';
	}
	var curTime = new Date();
    //$('.js-ajaxContentBlock').addClass('Loading Loading--active');
	//сбразываем предыдущий запрос
	if (window.ajaxSend) {
        window.ajaxSend.hasAborted = true;
		window.ajaxSend.abort();
	}
	//отправляем запрос
	window.ajaxSend = $.ajax({
		url: url,
		type: 'POST',
		data: objSend,
		processData: !('append' in objSend),
		contentType: 'append' in objSend ? false : 'application/x-www-form-urlencoded',
		cache: false,
		dataType: 'html',
		success: function(result) {
            window.ajaxSend.hasAborted = null;
			curTime = curTime + 300 - new Date();
			window.setTimeout(function(){
				//обновляем контент
				window.ajaxBlock = $('.js-ajaxContentBlock');
                //window.ajaxBlock.removeClass('Loading Loading--active');
				if (window.ajaxBlock.length > 0) {
					window.ajaxBlock.html(result);
					window.ajaxBlock.trigger('js-ajaxContentReady');
					//обновляем заголовок страницы
					var title = window.ajaxBlock.find('.js-ajaxContentTitle');
					if (title.length > 0 && title.val().length > 0) {
                        if (window.history.replaceState
                            && typeof(window.history.replaceState) === 'function') {
                            window.history.replaceState(null, title.val() + ' - ОФИСМАГ');
                        }
						$('title').html(title.val() + ' - ОФИСМАГ');
						title.remove();
					}
					if (isSetHistory && window.history.pushState
                        && typeof(window.history.pushState) === 'function') {
						window.history.pushState(null, null, url);
					}
					if (callback && typeof(callback) === 'function') {
						callback();
					}
					//убираем загрузчик
					curTime = false;
				}
			}, curTime > 0 ? curTime : 0);
		},
        error: function(){
		    if (!window.ajaxSend.hasAborted) {
                fancyAlertError('Запрос не обработан! Проверьте подключение к&nbsp;интернету и&nbsp;повторите '
                    + 'запрос. При&nbsp;повторной ошибке воспользуйтесь сервисом '
                    + '«<span class="pseudoLink" onclick="$(\'#fancyBoxMessageLink\').click();">Сообщить&nbsp;о&nbsp;проблеме</span>» '
                    + 'или обратитесь к&nbsp;менеджерам ИНТ. ');
            }
        }
	});

}

//функция для привязки событий к элементам ajax блока
function setAjaxContentCallback (fn) {
    window.ajaxBlock.on('js-ajaxContentReady', fn);
    fn();
}

//вывод ошибки в fancybox
function fancyAlertError(message)
{
    if (!message || message.length <= 0) {
        return;
    }
    $.fancybox({
        content: '<div class="FancyModal FancyModal--dialog FancyModal--requestSaveError">'
            + '<h2 class="FancyModal__header">Ошибка</h2>'
            + '<div class="FancyModal__content">'
            + message
            + '</div><div class="FancyModal__control">'
            + '<button class="btnMain btnOutline FancyModal__cancel js-closeFancybox">Закрыть</button>'
            + '</div></div>',
        showCloseButton: false,
        hideOnOverlayClick: false,
        padding: 0
    });
}
//функция вложенные элементы формы в объект
function pushValueInObject(obj, name, value)
{
    if (name.indexOf('[') >= 0) {
        var parentName = name.substr(0, name.indexOf('['));
        var curName = name.substr(name.indexOf('[') + 1, name.indexOf(']') - name.indexOf('[') - 1);
        var subName = name.substr(name.indexOf(']') + 1);
        if (!(parentName in obj)) {
            if (curName.length == 0) {
                obj[parentName] = [];
            } else {
                obj[parentName] = {};
            }
        }
        pushValueInObject(obj[parentName], curName + subName, value);
    } else {
        if (name.length > 0) {
            obj[name] = value;
        } else {
            obj.push(value);
        }
    }
    return obj;
}
//функция возвращает объект из набора полей
function createObjectForForm(inputList)
{
    var isForm = inputList.filter('input[type=file]').length > 0;
    var objSend = isForm ? new FormData() : {};
    inputList.each(function () {
        var name = $(this).attr('name');
        if (name) {
            if (isForm) {
                if ($(this).is('input[type=file]')) {
                    $.each(this.files, function(key, value) {
                        objSend.append(name, value);
                    });
                } else {
                    objSend.append(name, $(this).val());
                }
            } else {
                objSend = pushValueInObject(objSend, name, $(this).val());
            }
        }
    });
    return objSend;
}

//автообновление формы ajax
function SubmitOnEvent(objAjaxBlock, event, input, form, callback, timeout)
{
    if (!objAjaxBlock && $('.js-ajaxContentBlock').length > 0) {
        objAjaxBlock = $('.js-ajaxContentBlock');
    }
    //подписываем на событие
    if (event && input) {
        $(objAjaxBlock).on(event, input, function () {
            var eventInput = $(this);
            if (eventInput.is('.js-spinnerButton')) {
                eventInput.addClass('Spinner--active');
            }
            var url = '';
            if (eventInput.attr('data-url')) {
                url = eventInput.attr('data-url');
            }
            var ajaxForm = eventInput.parents(form);
            if (ajaxForm.find('.js-spinnerTriggerAgent').length > 0) {
                if (eventInput.parents('.js-spinnerTriggerAgent').length > 0) {
                    eventInput.parents('.js-spinnerTriggerAgent').addClass('Spinner--active');
                }
                if ($('.js-spinnerDisable').length > 0) {
                    $('.js-spinnerDisable').addClass('disabled');
                }
                if ($('.js-routesItemsList').length > 0) {
                    $('.js-routesItemsList').addClass('Items--loading');
                }
            }
            if (ajaxForm.length > 0) {
                if (timeout && timeout > 0) {
                    window.setTimeout(function () {
                        var objSend = createObjectForForm(ajaxForm
                            .find('input[type=hidden], input:visible:not([type=checkbox]), input[type=checkbox]:checked,'
                                + ' select:visible, textarea:visible')
                            .filter(':not([disabled=disabled])'));
                        if ('append' in objSend) {
                            objSend.append(eventInput.attr('name'), eventInput.val());
                        } else {
                            objSend[eventInput.attr('name')] = eventInput.val();
                        }
                        if (callback && typeof (callback) === 'function') {
                            ReloadAjaxContent(url, objSend, true, callback);
                        } else {
                            ReloadAjaxContent(url, objSend, true);
                        }
                    }, timeout);
                } else {
                    var objSend = createObjectForForm(ajaxForm
                        .find('input[type=hidden], input:visible:not([type=checkbox]), input[type=checkbox]:checked,'
                            + ' select:visible, textarea:visible')
                        .filter(':not([disabled=disabled])'));
                    if ('append' in objSend) {
                        objSend.append(eventInput.attr('name'), eventInput.val());
                    } else {
                        objSend[eventInput.attr('name')] = eventInput.val();
                    }
                    if (callback && typeof (callback) === 'function') {
                        ReloadAjaxContent(url, objSend, true, callback);
                    } else {
                        ReloadAjaxContent(url, objSend, true);
                    }
                }
            }
        });
    } else {
        //просто перезагружаем форму
        var ajaxForm = $(form);
        if (ajaxForm.length > 0) {
            var objSend = createObjectForForm(ajaxForm
                .find('input[type=hidden], input:visible:not([type=checkbox]), input[type=checkbox]:checked,'
                    + ' select:visible, textarea:visible')
                .filter(':not([disabled=disabled])'));
            if ($(input).length > 0 && $(input).attr('name')) {
                if ('append' in objSend) {
                    objSend.append($(input).attr('name'), $(input).val());
                } else {
                    objSend[$(input).attr('name')] = $(input).val();
                }
            }
            if (callback && typeof (callback) === 'function') {
                ReloadAjaxContent('', objSend, true, callback);
            } else {
                ReloadAjaxContent('', objSend, true);
            }
        }
    }

}

//скачивание файла ajax'ом
function GetReportAjax(button)
{
	if ($(button).length > 0) {
		$(button).addClass('Spinner--active').attr('disabled', true);
		var ajaxForm = $(button).parents('form');
		if (ajaxForm.length > 0) {
            var objSend = createObjectForForm(ajaxForm
                .find('input[type=hidden], input:visible, input[type=checkbox]:checked, '
                    + 'select:visible, textarea:visible')
                .filter(':not([disabled=disabled])'));
            objSend.excel = 'Y';
			$.ajax({
				url: document.location.href,
				type: 'POST',
				data: objSend,
				dataType: 'json',
				success: function (result) {
					if (result != null && result['xls_file'] != null) {
						document.location.href = result['xls_file'];
					}
				},
				complete: function () {
					$(button).removeClass('Spinner--active').attr('disabled', false);
				}
			});
		}
	}
}

// установить сообщение об ошибке для поля формы
function setFormFieldError($element, errorText, $errorWrap) {
    unsetFormFieldError($element, $errorWrap);
    $element.addClass('error');
    setAutoCorrection($element, $errorWrap);
    if ((!$errorWrap || !$errorWrap.length)
        && ($element.is(':not(.js-phoneMaskWithAjaxValidation)') && $element.closest('.Info__value').length)
    ) {
        $errorWrap = $element.closest('.Info__value');
    }
    if (!$errorWrap || !$errorWrap.length) {
        $errorWrap = $element.parent();
    }
    $errorWrap.append('<div class="Form__error">' + errorText + '</div>')
}

// убрать сообщение об ошибке для поля формы.
function unsetFormFieldError($element, $errorWrap) {
    $element.removeClass('error');
    if (!$errorWrap || !$errorWrap.length) {
        $errorWrap = $element.closest('.Form__field, .Info__value');
        if (!$errorWrap.length) {
            $errorWrap = $element.parent();
        }
    }
    $errorWrap
        .removeClass('Form__field--error')
        .find('.Form__error')
        .remove();
}

//проверка формы на заполненность
function CheckFormRequired(form) {
    var
        $element = form.find('.js-FormRequired'),
        isValid = true;

    unsetFormFieldError($element);
    $element.each(function () {
        if (!$.trim($(this).val()).length && $(this).is(':visible')) {
            setFormFieldError($(this), ($(this).attr('data-error-text') || 'Заполните обязательное поле'));
            isValid = false;
        }
    });
    if (!isValid) {
        $element.filter('.error').first().focus();
    }
    return isValid;
}

//проверка поля не непустоту
function CheckAndSubmit(button, input)
{
    if ($(button).length > 0 && $(input).length > 0) {
        if ($.trim($(input).val()) !== '') {
            $(button).parents('form').submit();
        } else {
            if ($(button).is('[data-error-text]')) {
                ShowTipTipError(button, $(button).attr('data-error-text'));
            }
            return false;
        }
    }
}

//авто-пропадание сообщения об ошибке в инпутах
function setAutoCorrection($input, $errorWrap) {
    $($input).one('change', function() {
        if ($(this).val() !== '') {
            unsetFormFieldError($input, $errorWrap)
        }
    });
}


//функция инициализации добавления файлов
function initFileList(inputs)
{
    if (!inputs || inputs.length <= 0) {
        return;
    }
    inputs.each(function () {
        var parent = window.ajaxBlock;
        var input = $(this);
        var prefix = 'file';
        if (input.attr('data-parent')) {
            parent = $(input.attr('data-parent'));
        }
        if (input.attr('data-prefix') && input.attr('data-prefix').length > 0) {
            prefix = input.attr('data-prefix');
        }
        var prefixLen = prefix.length + 1;
        if (parent.length > 0) {
            input.on('click', function (e) {
                var number = 0;
                var fileInputs = parent.find('.js-file');
                var currentInput = fileInputs.filter('[name=' + prefix + '_' + number + ']');
                while (currentInput.length > 0) {
                    if (currentInput.is('input[type=file]') && currentInput[0].files.length <= 0) {
                        break;
                    }
                    number++;
                    currentInput = fileInputs.filter('[name=' + prefix + '_' + number + ']');
                }
                if (fileInputs.filter('[name=' + prefix + '_' + number + ']').length <= 0) {
                    input.closest('.Upload__label')
                        .prepend('<input type="file" size="0" class="js-file Upload__field" name="'
                            + prefix
                            + '_'
                            + number
                            + '">');
                }
            });
            parent.on('change', '.js-file', function () {
                var fileList = $(this)[0].files;
                var field = $(this);
                var fileNumber = $(this).attr('name').substr(prefixLen);
                var fieldValue = field.val();
                var upload = field.closest('.Upload');
                var triggerUpload = upload.find('.js-TipTip_upload');
                var uploadContainer = upload.children('.Upload__list');
                var maxfilesize = 30;
                if (triggerUpload.attr('data-size')) {
                    maxfilesize = parseInt(triggerUpload.attr('data-size'));
                }
                var maxfilesizeTotal = 0;
                if (triggerUpload.attr('data-size-total')) {
                    maxfilesizeTotal = parseInt(triggerUpload.attr('data-size-total'));
                }
                var filesizeTotal = 0;
                if (parent.find('.js-file').length > 0) {
                    parent.find('.js-file').each(function(){
                        if ($(this)[0].files) {
                            var curFileList = $(this)[0].files;
                            if (curFileList.length) {
                                filesizeTotal += curFileList[0].size;
                            }
                        } else if (parseInt($(this).data('size')) > 0) {
                            filesizeTotal += parseInt($(this).data('size'));
                        }
                    });
                }
                var isValidateFilename = false;
                if (
                    triggerUpload.attr('data-validate-filename')
                    && parseInt(triggerUpload.attr('data-validate-filename')) > 0
                ) {
                    isValidateFilename = true;
                }
                if (
                    triggerUpload.attr('data-types')
                    && !(new RegExp('\.(' + triggerUpload.attr('data-types') + ')$', 'i')).test(fileList[0].name)
                ) {
                    var typesErrorText = 'Недопустимый формат файла.<br>Допустимые форматы: '
                        + triggerUpload.attr('data-types').toString().split('|').join(', ');
                    if (triggerUpload.attr('data-types-error-text')) {
                        typesErrorText = triggerUpload.attr('data-types-error-text');
                    }
                    ShowTipTipError(
                        triggerUpload,
                        typesErrorText,
                        'top',
                        'error',
                        0,
                        '340px',
                        3
                    );
                    $(field).remove();
                } else if (/\.(exe|com|bat|cmd|vbs|pl|bas|js|java|reg|shs|pif|scr|dll|ssh|chm|hlp|lnk|html|htm|shtml|shtm)$/i.test(fileList[0].name)) {
                    ShowTipTipError(triggerUpload, 'Недопустимый формат файла', 'top', 'error');
                    $(field).remove();
                } else if (isValidateFilename && /[^\u0400-\u04FFa-zA-Z0-9\.\s_-]/i.test(fileList[0].name)) {
                    ShowTipTipError(triggerUpload,
                        'Имя файла содержит недопустимые символы. Переименуйте файл, используя символы:<br>A-Z, А-Я, a-z, а-я, 0-9, ., _, -',
                        'top', 'error', 0, '280px', 3);
                    $(field).remove();
                } else if (maxfilesize && (fileList[0].size / 1048576).toFixed(0) >= maxfilesize) {
                    ShowTipTipError(triggerUpload, 'Недопустимый размер файла.<br>Максимальный размер: '
                        + maxfilesize + ' МБ', 'top', 'error');
                    $(field).remove();
                } else if (maxfilesizeTotal && (filesizeTotal / 1048576).toFixed(0) >= maxfilesizeTotal) {
                    ShowTipTipError(
                        triggerUpload,
                        '<div class="TipNote TipNote--default"> '
                        + '<div class="TipNote__title">Ошибка</div> '
                        + '<div class="TipNote__content">Общий размер файлов не должен превышать '
                        + maxfilesizeTotal
                        + ' МБ</div> </div> ',
                        'top',
                        'error',
                        0,
                        '340px',
                        3
                    );
                    $(field).remove();
                } else {
                    var fileTypeClass = '';
                    if (fieldValue.match(/\.docx?$/)) {
                        fileTypeClass = 'File--doc';
                    } else if (fieldValue.match(/\.xlsx?$/)) {
                        fileTypeClass = 'File--xls';
                    } else if (fieldValue.match(/\.pdf$/)) {
                        fileTypeClass = 'File--pdf';
                    } else if (fieldValue.match(/\.jpe?g$/)) {
                        fileTypeClass = 'File--jpg';
                    } else if (fieldValue.match(/\.png$/)) {
                        fileTypeClass = 'File--png';
                    }
                    uploadContainer.append('<div data-number="' + fileNumber
                        + '" class="File File--upload ' + fileTypeClass + ' js-deleteFile">'
                        + '<span class="File__name">' + fileList[0].name + '</span>'
                        + '<span class="File__size">' + formatSizeUnitsBitrix(fileList[0].size) + '</span>'
                        + '<span class="File__hint">Удалить</span>'
                        + '</div><span>&nbsp;</span>');
                    if (
                        triggerUpload.attr('data-count')
                        && uploadContainer.find('.js-deleteFile').length >= triggerUpload.attr('data-count')
                    ) {
                        triggerUpload.hide();
                    }
                }
            });
            parent.on('click', '.js-deleteFile', function () {
                var fileNumber = $(this).attr('data-number');
                if (parent.find('[name=' + prefix + '_' + fileNumber + ']').length) {
                    parent.find('[name=' + prefix + '_' + fileNumber + ']').remove();
                }
                $(this).closest('.Upload').find('.js-TipTip_upload').show();
                $(this).add($(this).next()).remove();
            });
        }
    });
}

//перевод байт в килобайты, мегабайты как в главном модуле Битрикс
function formatSizeUnitsBitrix(bytes)
{
    if (!bytes) {
        bytes = 0.0;
    }
    var sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    var pos = 0;
    while (bytes >= 1024 && pos < 4) {
        bytes /= 1024;
        pos++;
    }
    return bytes.toFixed(2) + ' ' + sizes[pos];
}
// инициализация мультиселекта
function initRichSelectOld() {
    var listenObj = $('body');
    if (window.ajaxBlock.length > 0) {
        listenObj = window.ajaxBlock;
    }
    $(document).on('click', function (e) {
        var target = $(e.target);
        $('.js-RichSelect').each(function () {
            var select = $(this);
            var options = select.find('.RichSelect__options');
            // если нажато внутри элемента
            if (select.has(target).length) {
                // если нажато внутри активатора
                if (target.is('.js-multiselectTrigger')
                    || target.parents('.js-multiselectTrigger').length) {
                    // скрываем и отображаем соответственно
                    if (select.hasClass('RichSelect--active')) {
                        select.removeClass('RichSelect--active');
                        options.stop().slideUp(200);
                        getMultiSelected(select);
                        if (typeof(getRoutesList) === 'function') {
                            getRoutesList(select);
                        }
                    } else {
                        select.addClass('RichSelect--active');
                        options.stop().slideDown(200);
                    }
                }
            } else {
                // иначе — скрываем
                if (select.hasClass('RichSelect--active')) {
                    select.removeClass('RichSelect--active');
                    options.stop().slideUp(200);
                    getMultiSelected(select);
                    if (typeof(getRoutesList) === 'function') {
                        getRoutesList(select);
                    }
                }
            }
        });
    });
    $(listenObj).on('change', '.js-multiselect input, .js-RichSelect__option:not(.level2) input', function () {
        var item;
        if ($(this).hasClass('js-cbLevel1')) {
            item = $(this).closest('.js-RichSelect__option');
        } else {
            item = $(this).closest('.js-multiselect');
        }
        if ($(this).prop('checked')) {
            selectItem(item);
        } else {
            unselectItem(item);
        }
        var select = $(this).closest('.js-RichSelect');
        getMultiSelected(select);
    });
    //выделить все
    $(listenObj).on('change', '.js-multiselectAll input', function () {
        var status = $(this).prop('checked');
        var select = $(this).closest('.js-RichSelect');
        var separateInput = select.find('.js-filterSeparate:not(:checked)');
        var searchItems = '.js-multiselect.js-multiselectVisible';
        if (separateInput.length > 0) {
            searchItems += ':not(.js-filterSeparateHide)';
        }
        select.find(searchItems + ', .js-multiselectGroup, .js-RichSelect__option:not(.level2)').each(function () {
            if (status) {
                selectItem($(this));
            } else {
                unselectItem($(this));
            }
        });
        select.find('.js-multiselect input:first').change();
    });
}

//мультивыбор с выпадающим окном
function initPlaquesPlaques()
{
    var listenObj = $('body');
    if (window.ajaxBlock.length > 0) {
        listenObj = window.ajaxBlock;
    }

    if (listenObj.find('.Plaques--hasDropdown').length > 0) {
        listenObj.find('.Plaques--hasDropdown').each(function() {
            if (this.dataInitPlaques == 1) {
                return ;
            }
            this.dataInitPlaques = 1;
            var obj = $(this);
            var buttonAdd = obj.find('.Plaque--add');
            var item = obj.find('.RichSelect__item, .RichSelect__option');
            var itemAll = item.filter('.RichSelect__option--accent');
            item = item.filter(':not(.RichSelect__option--accent)');
            var list = obj.find('.Plaques__list');
            var filter = obj.find('.RichSelect__filter input');

            //вызов окна добавления
            buttonAdd.on('click', function() {
                obj.toggleClass('Plaques--showDropdown');
            });

            //удаление элементов из короткого списка
            list.on('click', '.Plaque--item', function(event) {
                var obj = $(this).closest('.Plaques--hasDropdown');
                var item = obj.find('.RichSelect__item, .RichSelect__option');
                var itemAll = item.filter('.RichSelect__option--accent');
                item = item.filter(':not(.RichSelect__option--accent)');
                var input = itemAll.find('input');
                if ($(this).attr('data-id').toString().length > 0) {
                    input = item.find('input[value="' + $(this).attr('data-id') + '"]');
                }
                input.prop('checked', false ).change();
                event.stopPropagation();
            });

            //изменение инпутов
            itemAll.on('change', 'input', function() {
                var input = $(this);
                var obj = $(this).closest('.Plaques--hasDropdown');
                var item = obj.find('.RichSelect__item, .RichSelect__option');
                var itemAll = item.filter('.RichSelect__option--accent');
                item = item.filter(':not(.RichSelect__option--accent)');
                var list = obj.find('.Plaques__list');
                item.find('input').prop('checked', input.is(':checked'));
                if (input.is(':checked')) {
                    itemAll.addClass('RichSelect__option--active');
                    item.addClass('RichSelect__option--active');
                    list.children().remove();
                    list.append('<span class="Plaque Plaque--item js-bonusRuleCondition" data-type="'
                        + input[0].name + '" data-id="' + input.val()
                        + '"><span class="Plaque__icon"></span><span class="Plaque__label">'
                        + input.parent().text() + '</span></span>');
                } else {
                    itemAll.removeClass('RichSelect__option--active');
                    item.removeClass('RichSelect__option--active');
                    list.children().remove();
                }
            });
            item.on('change', 'input', function() {
                var input = $(this);
                var obj = $(this).closest('.Plaques--hasDropdown');
                var item = obj.find('.RichSelect__item, .RichSelect__option');
                var itemAll = item.filter('.RichSelect__option--accent');
                item = item.filter(':not(.RichSelect__option--accent)');
                var list = obj.find('.Plaques__list');
                if (input.is(':checked')) {
                    input.closest(item).addClass('RichSelect__option--active');
                    if (list.children('[data-id="' + input.val() + '"]').length === 0) {
                        list.append('<span class="Plaque Plaque--item js-bonusRuleCondition" data-type="'
                            + input[0].name + '" data-id="' + input.val()
                            + '"><span class="Plaque__icon"></span><span class="Plaque__label">'
                            + input.parent().text() + '</span></span>');
                    }
                } else {
                    input.closest(item).removeClass('RichSelect__option--active');
                    list.children('[data-id="' + input.val() + '"]').remove();
                }

                if (item.length === item.find('input:checked').length) {
                    itemAll.find('input').prop('checked', true).change();
                } else if (itemAll.find('input').is(':checked')) {
                    itemAll.removeClass('RichSelect__option--active').find('input').prop('checked', false);
                    list.children().remove();
                    item.find('input:checked').each(function(){
                        var subInput = $(this);
                        list.append('<span class="Plaque Plaque--item js-bonusRuleCondition" data-type="'
                            + subInput[0].name + '" data-id="' + subInput.val()
                            + '"><span class="Plaque__icon"></span><span class="Plaque__label">'
                            + subInput.parent().text() + '</span></span>');
                    });
                }
            });

            //свертка вложенных блоков
            item.on('click', '.RichSelect__itemLabel', function(event) {
                if ($(event.target).is('input')) {
                    return;
                }
                event.stopPropagation();
                $(this).closest(item).toggleClass('RichSelect__item--open');
            });

            //фильтр значений
            var timeFilter = false;
            filter.on('keyup', function() {
                if (timeFilter) {
                    window.clearTimeout(timeFilter);
                }
                var text = $(this).val().toLowerCase();
                timeFilter = window.setTimeout(function() {
                    if (text.length > 0) {
                        item.hide();
                        item.parent().hide();
                        item.each(function() {
                            if ($(this).text().toLowerCase().indexOf(text) >= 0) {
                                $(this).removeAttr('style')
                                    .parent().removeAttr('style');
                            }
                        });
                    } else {
                        item.removeAttr('style');
                    }
                    timeFilter = false;
                }, 200);
            });

            //скрытие окна по клику вне окна
            $(window).on('click', function(event) {
                if ($(event.target).closest(obj).length === 0) {
                    obj.removeClass('Plaques--showDropdown');
                }
            });
        });
    }
}
//~мультивыбор с выподающим окном

//функции для богатого селекта
function selectItem(item)
{
    if (item.length > 0) {
        $(item).addClass('RichSelect__option--active')
            .find('input[type="checkbox"]').prop('checked', true);
    }
}
function unselectItem(item)
{
    if (item.length > 0) {
        $(item).removeClass('RichSelect__option--active')
            .find('input[type="checkbox"]').prop('checked', false);
    }
}
function getMultiSelected(multiSelect)
{
    if (multiSelect.length > 0) {
        multiSelect.each(function(){
            var select = $(this);
            var trigger = select.find('.js-multiselectTrigger');
            var blockedClass = 'Blocked';
            var disabledClass = 'disabled';
            if (trigger.attr('data-blocked-class') && trigger.attr('data-blocked-class').length > 0) {
                blockedClass = trigger.attr('data-blocked-class');
            }
            var blockedValue = 'Нет';
            if (trigger.attr('data-blocked-value') && trigger.attr('data-blocked-value').length > 0) {
                blockedValue = trigger.attr('data-blocked-value');
            }
            var separateInput = select.find('.js-filterSeparate:not(:checked)');
            var allItems = null;
            if (select.is('.js-RichSelectTwoLevels')) {
                allItems = select.find('.js-RichSelect__option.js-multiselectVisible, .js-RichSelect__option:not(.level2)');
            } else {
                allItems = select.find('.js-multiselect.js-multiselectVisible');
            }
            var possibleItemsCount = allItems.length;
            var selected = allItems.filter('.RichSelect__option--active');
            if (separateInput.length > 0) {
                allItems = allItems.filter(':not(.js-filterSeparateHide)');
            }
            var text = '';
            if (allItems.length <= 0) {
                text = blockedValue;
            } else if (selected.length >= allItems.length) {
                selectItem(select.find('.js-multiselectAll'));
                if (selected.length === 1) {
                    text = $(selected[0]).text();
                } else {
                    text = 'Все';
                }
            } else {
                unselectItem(select.find('.js-multiselectAll'));
                if (selected.length > 0) {
                    if (selected.length === 1) {
                        text = $(selected[0]).text();
                    } else {
                        text = 'Выбрано: <span class="RichSelect__count">'
                            + selected.length + '</span>';
                    }
                } else {
                    text = 'Не выбрано';
                }
            }
            trigger.html(text);
            if (possibleItemsCount <= 0) {
                select.addClass(blockedClass);
            } else {
                select.removeClass(blockedClass);
            }
        });
    }
}
//~функции для богатого селекта


//определение мобильного браузера
function isMobile()
{
	return navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera.Mini|IEMobile/ig);
}


//копирование текста в буфер обмена
function copyToMemory(dataText)
{
    var browserError = false;
    $('.js-copyRange').remove();
    $('body').append('<div class="js-copyRange" style="position: fixed; left: -199px;">'
        + dataText + '</div>');
    $('body').append('<input type="button" value="' + dataText
        + '" class="js-copyRange" style="position: fixed; left: -299px;" />');
    var textElem = $('div.js-copyRange')[0];
    var buttonElem = $('input.js-copyRange')[0];
    try {
        var range = false;
        if (document.createRange) {
            range = document.createRange();
            range.selectNode(textElem);
        } else if (buttonElem.createTextRange
            && buttonElem.createTextRange() !== undefined) {
            range = buttonElem.createTextRange();
        }
        if (range) {
            document.getSelection().removeAllRanges();
            document.getSelection().addRange(range);
            var success = document.execCommand('copy');
            if (!success) {
                browserError = 'Не удалось скопировать ссылку. Текст для копирования: \n'
                    + dataText;
            }
        }
    } catch (e) {
        browserError = 'Ваш браузер не поддерживает работу с буфером обмена на javascript. '
            + 'Текст для копирования: \n' + dataText;
    }
    $('.js-copyRange').remove();
    return browserError;
}

// инициализация тип-типов
function initTipOnHover()
{
	$('.js-tipOnHover').each(function () {
        var defaultPosion = 'top';
        var curPosition = $(this).attr('data-default-position');
        if (curPosition && curPosition.length > 0) {
            defaultPosion = curPosition;
        }
        var defaultTheme = 'white';
        if ($(this).attr('data-theme')) {
            defaultTheme = $(this).attr('data-theme');
        }
        var edgeOffset = $(this).attr('data-edge-offset');
        $(this).tipTip({
            defaultPosition: defaultPosion,
            theme: defaultTheme,
            delay: 100,
            edgeOffset: edgeOffset ? parseInt(edgeOffset) : 0,
            fadeIn: 0,
            fadeOut: 200,
            delayHide: $(this).attr('data-delay-hide')
                ? parseInt($(this).attr('data-delay-hide')) : 0,
            maxWidth: $(this).attr('data-width')
                ? (parseInt($(this).attr('data-width')) > 0
                    ? parseInt($(this).attr('data-width')) : $(this).attr('data-width'))
                : '340',
            hideOthers: !$(this).attr('data-keep-others'),
            resetPaddingContent: $(this).attr('data-reset-padding') === 'true'
        });
	});
    $('.js-tipLastComments').tipTip({
        theme: 'white',
        maxWidth: 370
    });
}

//функция для открытия окна браузера и возможность записи в него содержимого
function OpenPrintWindow(url, content)
{
    var w = window.open(
        url,
        'Print_Basket_Window',
        'width=760, height=600, left=50, top=50, scrollbars=1'
    );
    if (content && content.length > 0) {
        w.document.open();
        w.document.write(content);
        w.document.close();
    }
    return w;
}

//аналог htmlspecailchars_decode
function unEscapeHtml(text) {
    if (text && text.length > 0) {
        var map = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#039;': "'"
        };
        for (var testKey in map) {
            if (map.hasOwnProperty(testKey)) {
                text = text.replace(new RegExp(testKey, 'g'), map[testKey]);
            }
        }
    } else {
        text = '';
    }
    return text;
}

//функция-аналог htmlspecialchars
function escapeHtml(text) {
    var map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, function(m) { return map[m]; });
}


//инициализация скриптов на странице редактирования промостраницы
function InitPromoEditPage()
{
    var sortItems = $('.js-sortItems');
    if (sortItems.length > 0) {
        sortItems.each(function(){
            var list = $(this);
            $(list).sortable({
                items : '.js-sortItem',
                handle : '.js-sortHandle',
                helper : 'clone',
                appendTo: 'body',
                containment: false,
                forcePlaceholderSize: true,
                forceHelperSize: true,
                scroll: true,
                scrollSensitivity: 10,
                scrollSpeed: 10,
                tolerance: 'pointer',
                start: function(event, ui) {
                    if ($(ui.item).find('canvas').length > 0) {
                        var newCanvas = $(ui.item).find('canvas');
                        var oldCanvas = $(ui.helper).find('canvas');
                        $(oldCanvas).before(newCanvas);
                        $(oldCanvas).remove();
                    }
                },
                beforeStop: function(event, ui) {
                    if ($(ui.helper).find('canvas').length > 0) {
                        var newCanvas = $(ui.helper).find('canvas');
                        $(ui.item).find('.js-pagesCategoryImgBlock').prepend(newCanvas);
                    }
                }
            });
        });
    }
    var formBlock = $('.js-pagesEditForm');
    if (formBlock.length > 0) {

        //добавление строки в акции/рубрике
        $(formBlock).on('click', '.js-listItemAdd', function(){
            var block = $(this).parents('.js-listItemsBlock');
            if (block.length > 0) {
                var template = block.find('.js-listItemTemplate').clone();
                var list = block.find('.js-listItems');
                if (template.length > 0 && list.length > 0) {
                    template.removeClass('js-listItemTemplate').removeAttr('style');
                    list.append(template);
                }
            }
        });

        //загрузка изображений
        $(formBlock).on('change', '.js-pagesCategoryImgFile', function(){
            if (this.files) {
                var obj = $(this);
                var fileElem = obj.parent();
                var preview = obj.closest('.ImageUploader');
                var file = this.files[0];
                var inputName = file.name;
                if (!(/\.(jpeg|jpg|png)$/i.test(file.name))) {
                    ShowTipTipError(fileElem, '<h4 style="margin: 0 0 .4em">Недопустимый формат файла</h4>Выберите изображение в формате JPEG или PNG');
                    var elemHtml = fileElem.html();
                    fileElem.html(elemHtml);
                } else {
                    var formData = new FormData();
                    formData.append('file', this.files[0]);
                    formData.append('action', 'upload');
                    formData.append('max-width', preview.attr('data-max-width'));
                    formData.append('max-height', preview.attr('data-max-height'));
                    $.ajax({
                        url: document.location.href,
                        type: 'POST',
                        data: formData,
                        cache: false,
                        dataType: 'json',
                        processData: false,
                        contentType: false,
                        success: function (data) {
                            if (data['result'] != null) {
                                if (!$(preview).hasClass('ImageUploader--withPreview')) {
                                    preview.addClass('ImageUploader--withPreview ImageUploader--contain')
                                        .prepend('<div class="ImageUploader__preview js-PromoImagePreview" '
                                            + 'style="background-image: url(' + data['result']['IMAGE'] + ');" data-url="'
                                            + data['result']['IMAGE'] + '" data-name="'
                                            + inputName
                                            + '"></div>')
                                        .append('<button class="ImageUploader__control ImageUploader__control--remove'
                                            + ' js-PromoImageRemove"></button>')
                                        .find('.js-pagesCategoryImgPreview')
                                        .hide();
                                }
                            } else if (data['error'] != null) {
                                ShowTipTipError(
                                    fileElem,
                                    data['error'],
                                    'right',
                                    'error',
                                    0,
                                    '340px',
                                    5
                                );
                                obj.val('');
                            }
                        },
                    });
                }
            }
        });

        $(document)
            .on('click', '.js-PromoImageRemove', function () {
                var uploadBlock = $(this).closest('.ImageUploader');
                uploadBlock
                    .removeClass('ImageUploader--withPreview')
                    .removeAttr('style')
                    .find('.js-PromoImagePreview, .js-PromoImageRemove')
                    .remove();
                uploadBlock.find('.js-pagesCategoryImgPreview').show();
                uploadBlock.find('.js-pagesCategoryImgFile').val('');
            });

        //изменение кода категории
        $(formBlock).on('change', '.js-pagesCategoryCode', function() {
            var $that = $(this);
            var thatValue = $that.val();

            if (thatValue !== '' && !isNaN(parseInt(thatValue))) {
                if (!!$that.prop('errorTimer')) {
                    clearTimeout($that.prop('errorTimer'));
                }
                $that.prop('errorTimer', setTimeout(function() {
                    if (window.ajaxQuerySingleton) {
                        window.ajaxQuerySingleton.abort();
                    }
                    var $categoryItem = $that.parents('.js-pagesCategoryField');
                    window.ajaxQuerySingleton = $.ajax({
                        url: document.location.href,
                        type: 'POST',
                        data: {
                            action: 'CheckRubricExist',
                            code: thatValue
                        },
                        dataType: 'json',
                        success: function(result) {
                            if (result['result'] != null) {
                                if (!!result['result']['NAME']) {
                                    $categoryItem.find('.js-pagesCategoryName').html(result['result']['NAME']);
                                }
                                if (!!result['result']['UF_IMAGE']) {
                                    $categoryItem.find('.js-pagesCategoryImgPreview').remove();
                                    $categoryItem.find('.js-pagesCategoryImgBlock').prepend(
                                        '<img class="ImageUploader__preview js-pagesCategoryImgPreview" alt="" src="'
                                            + result['result']['UF_IMAGE'] + '"'
                                            + ($categoryItem.find('.js-PromoImagePreview').length ? ' style="display: none;"' : '')
                                            + '>'
                                    );
                                }
                                window.setTimeout(HideTipTipError, 300);
                            } else if (result['error'] != null && result['error'].length > 0) {
                                ShowTipTipError($that, result['error']);
                                $categoryItem.find('.js-pagesCategoryName').html('');
                            }
                        }
                    });
                }, 1000));
            } else if ($that.val() !== '' && isNaN(parseInt($that.val()))) {
                ShowTipTipError($that, '<h4 style="margin: 0 0 .4em">Ошибка</h4>Введите код рубрики в числовом виде');
            } else if ($that.val() === '') {
                window.setTimeout(HideTipTipError, 300);
            }
        });

        //изменение кода акции
        $(formBlock).on('change', '.js-pagesActionID', function(){
            if ($(this).val() !== '') {
                if (window.ajaxQuerySingleton) {
                    window.ajaxQuerySingleton.abort();
                }
                var elem = $(this);
                var actionItem = $(elem).parents('.js-pagesActionField');
                window.ajaxQuerySingleton = $.ajax({
                    url: document.location.href,
                    type: 'POST',
                    data: {
                        action: 'CheckActionExist',
                        ID: $(this).val()
                    },
                    dataType: 'json',
                    success: function(result) {
                        if (result['result'] != null) {
                            var actionName = '';
                            var actionXmlID = '';
                            if (result['result']['NAME'] != null && result['result']['NAME'].length > 0) {
                                actionName = result['result']['NAME'];
                            }
                            if (result['result']['XML_ID'] != null && result['result']['XML_ID'].length > 0) {
                                actionXmlID = 'Акция №' + result['result']['XML_ID'] + '. ';
                            }
                            $(actionItem).find('.js-pagesActionName').html(actionXmlID + actionName);
                            window.setTimeout(HideTipTipError, 300);
                        } else if (result['error'] != null && result['error'].length > 0) {
                            ShowTipTipError(elem, result['error']);
                            $(actionItem).find('.js-pagesActionName').html('');
                        }
                    }
                });
            } else if ($(this).val() === '') {
                window.setTimeout(HideTipTipError, 300);
            }
        });

        //ввод и динамическое изменение полей
        $(formBlock).on('keypress', '.js-pagesActionID, .js-pagesCategoryCode', function(){
            var elem = $(this);
            if (window.pagesKeyPressTimeout) {
                clearTimeout(window.pagesKeyPressTimeout);
            }
            window.pagesKeyPressTimeout = window.setTimeout(function(){
                $(elem).trigger('change');
            }, 500);
        });

        //сохранение
        $(formBlock).on('click', '.js-pagesSave, .js-pagesSavePreview', function(e){
            e.preventDefault();
            var button = $(this);
            var obj = $('.js-pagesEditForm');
            button.addClass('Spinner--active').attr('disabled', true);
            var pagesName = $('.js-pagesName');
            if (pagesName.val() !== '') {
                pagesName.removeClass('error').nextAll('.Form__error').remove();
                var dataObj = new FormData();
                var pagesID = $('.js-pagesID');
                if (pagesID.length > 0 && pagesID.val() !== '') {
                    dataObj.append('ID', pagesID.val());
                }
                dataObj.append('action', 'save');
                dataObj.append('NAME', pagesName.val());
                if (obj.find('.js-pagesActive').is(':checked')) {
                    dataObj.append('ACTIVE', '1');
                }
                if (
                    $(BXHtmlEditor).length > 0
                    && typeof BXHtmlEditor.Get('pagesEditorText').GetContent === 'function'
                    && BXHtmlEditor.Get('pagesEditorText').GetContent() !== ''
                ) {
                    dataObj.append('DETAIL_TEXT', BXHtmlEditor.Get('pagesEditorText').GetContent());
                }
                if (obj.find('.js-pagesCategoryTab').hasClass('Tab2--active')) {
                    //рубрики
                    obj.find('.js-pagesCategoryCode').each(function(){
                        var categoryField = $(this).parents('.js-pagesCategoryField');
                        if (
                            $(this).val() !== ''
                            && !isNaN(parseInt($(this).val()))
                            && categoryField.find('.js-pagesCategoryName').html() !== ''
                        ) {
                            dataObj.append('CATEGORY[]', $(this).val());
                            var $imgPreview = categoryField.find('.js-pagesCategoryImgPreview:visible');
                            if ($imgPreview.length
                                && !!$imgPreview.attr('src')
                            ) {
                                dataObj.append('IMG_' + $.trim($(this).val()), categoryField.find('img.js-pagesCategoryImgPreview').attr('src'));
                            } else if (
                                categoryField.find('.js-pagesCategoryImgFile').length > 0
                                && categoryField.find('.js-pagesCategoryImgFile')[0].files
                                && categoryField.find('.js-pagesCategoryImgFile')[0].files.length > 0
                            ) {
                                dataObj.append(
                                    'FILE_' + $.trim($(this).val()),
                                    categoryField.find('.js-pagesCategoryImgFile')[0].files[0],
                                    $.trim($(this).val()) + '_custom' + (/\.(png)$/i.test(categoryField.find('.js-pagesCategoryImgFile')[0].files[0].name) ? '.png' : '.jpg')
                                );
                            }
                        }
                    });
                    if (obj.find('.js-pagesCategorySub').is(':checked')) {
                        dataObj.append('CATEGORY_SUB', 'Y');
                    }
                } else if (obj.find('.js-pagesActionTab').hasClass('Tab2--active')) {
                    //акции
                    //действуют до
                    if (obj.find('.js-pagesActionDate').val() !== '') {
                        dataObj.append('ACTION_DATE_TO', obj.find('.js-pagesActionDate').val());
                    }
                    obj.find('.js-pagesActionID').each(function(){
                        if ($(this).val() !== '') {
                            dataObj.append('ACTIONS[]', $(this).val());
                        }
                    });
                }
                dataObj.append('ajaxContent', 'Y');
                var isPreview = false;
                if (button.is('.js-pagesSavePreview')) {
                    isPreview = true;
                    dataObj.append('PREVIEW', 'Y');
                }
                if (window.ajaxSend) {
                    window.ajaxSend.abort();
                }
                window.ajaxSend = $.ajax({
                    url: document.location.pathname,
                    type: 'POST',
                    data: dataObj,
                    processData: false,
                    contentType: false,
                    cache: false,
                    dataType: 'html',
                    success: function(result) {
                        if (result.indexOf('success') >= 0) {
                            if (isPreview) {
                                var pageID = 0;
                                var resultJson = JSON.parse(result);
                                if (!!resultJson['success']) {
                                    pageID = resultJson['success'];
                                }
                                if (document.location.href.indexOf('ID') < 0) {
                                    window.setTimeout(function(){
                                        document.location.href = 'edit.php?ID=' + pageID;
                                    }, 500);
                                }
                                $('body').append('<a href="/pages/index.php?ID='
                                    + pageID
                                    + '" target="_blank" class="js-hiddenLink">&nbsp;</a>');
                                $('.js-hiddenLink')[0].click();
                                $('.js-hiddenLink').remove();
                            } else {
                                document.location.href = document.location.pathname.substr(0, document.location.pathname.lastIndexOf('/') + 1);
                            }
                        } else if (result.indexOf('error') >= 0) {
                            ShowTipTipError(button, '<h4 style="margin: 0 0 .4em">Ошибка</h4>Не удалось сохранить промостраницу');
                        }
                    },
                    complete: function() {
                        button.removeClass('Spinner--active').attr('disabled', false);
                    }
                });
            } else {
                pagesName.addClass('error').nextAll('.Form__error').remove();
                pagesName.after('<div class="Form__error">Поле «Заголовок» обязательно для заполнения</div>');
                setAutoCorrection(pagesName);
                pagesName[0].focus();
                button.removeClass('Spinner--active').attr('disabled', false);
            }
        });

        //удаление
        $(formBlock).on('click', '.js-pagesRemovePage', function(e){
            e.preventDefault();
            if (confirm('Удалить промостраницу?')) {
                var dataObj = {};
                dataObj['action'] = 'delete';
                dataObj['ajaxContent'] = 'Y';
                var pagesId = $('.js-pagesID');
                if (pagesId.length > 0 && pagesId.val() !== '') {
                    dataObj['ID'] = pagesId.val();
                }
                $.ajax({
                    url: document.location.pathname,
                    type: 'POST',
                    data: dataObj,
                    dataType: 'json',
                    success: function(result) {
                        if (result['success'] != null && result['success'].length > 0) {
                            document.location.href = document.location.pathname.substr(0, document.location.pathname.lastIndexOf('/') + 1);
                        } else if (result['error'] != null && result['error'].length > 0) {
                            alert(result['error']);
                        }
                    }
                });
            }
        });
    }
}

// функции для управления баннерами
function openBannerEditor(banner) {
    if ($('.js-bannerEditorBlock').length <= 0) {
        var elem = $('.js-bannerEditor').html();
        $('body').append($(elem).addClass('js-bannerEditorBlock'));
        $('.js-bannerEditor').remove();
    }
    var editor = $('.js-bannerEditorBlock');
    var a = banner.offset().top;
    var b = banner.offset().left;
    var c = banner.outerWidth();
    var d = banner.outerHeight();
    banner.addClass('Banner--editing');
    $('.Page__overlay').fadeIn(200);
    editor.css('top', Math.floor(a + d + 13) + 'px').fadeIn(100);
    // Позиционируем окно редактирования по горизонтали
    if (banner.is('.Banner--main')) {
        editor.css('left', b + 'px');
    } else {
        var banners = banner.closest('.Banners').find('.Banner:visible');
        for (var i = 0; i < banners.length; i++) {
            if (banners.eq(i).is('.Banner--editing')) {
                if (i % 3 === 2) {
                    editor.css('left', b + c - 450 + 'px');
                } else {
                    editor.css('left', b + 'px');
                }
                break;
            }
        }
    }
    if (!banner.is('.Banner--empty')) {
        editor.find('.js-bannerEditor-productCode').val(banner.find('.Banner__code').html());
        editor.find('.js-bannerEditor-productName').val(banner.find('.Banner__label').html());
        if (banner.find('.Banner__price').length > 0) {
            editor.find('.js-bannerEditor-productPrice').val(banner.find('.Banner__price').attr('data-val'));
        }
        if (banner.find('img').length > 0) {
            editor.find('.js-bannerEditor-productPhoto').val(banner.find('img').attr('src'));
        }
    }
    // Если область баннера и редактора не помещается, проскроллим
    var e = editor.offset().top;
    var f = editor.outerHeight();
    var nowTop = window.scrollY;
    var nowBottom = nowTop + window.innerHeight;
    var areaHeight = e + f - a;
    if (areaHeight < window.outerHeight) {
        if (a < nowTop || (e + f) > nowBottom) {
            $('html, body').animate({
                scrollTop: a
            }, 500);
        }
    }
}
function closeBannerEditor() {
    var editor = $('.js-bannerEditorBlock');
    editor.fadeOut({
        duration: 100,
        complete: function() {
            $('.Editor').css({
                top: '',
                right: '',
                left: ''
            })
        }
    }).find('.js-bannerEditor-productCode, .js-bannerEditor-productName, .js-bannerEditor-productPrice, .js-bannerEditor-productPhoto').val('');
    editor.find('.Form__field').removeClass('Form__field--error');
    var hiddenBanner = $('.js-hiddenBanner');
    var editing = $('.Banner--editing');
    editing.removeClass('Banner--editing');
    if (hiddenBanner.length > 0) {
        hiddenBanner.removeClass('js-hiddenBanner').show();
        editing.remove();
    } else if (editing.is('.js-tempRemove')) {
        editing.remove();
    }
    $('.Page__overlay').fadeOut(200);
    var tab = $('.TabContent2--active');
    if (!tab.find('.Banner:visible').length) {
        tab.find('.js-noBanners').show();
    }
}
//~ функции для управления баннерами

// Плавающая шапка (одна на странице) -->
function initFloatingHeader(cssClass) {

    var block = $('.js-items-floatableHeader');
    if (!block.length) {
        return;
    }

    var clone = block.clone();
    clone
        .css('margin-top', 0)
        .find('.Items__header')
        .siblings()
        .remove();
    cssClass = cssClass || 'Items__floatingHeader';
    var wrapper = clone.wrap('<div class="js-floatingHeader ' + cssClass + '" style="overflow: hidden;"></div>').closest('.js-floatingHeader');
    var rowOriginal = block.find('.Items__header');
    var rowClone = wrapper.find('.Items__header');
    wrapper.insertBefore(block);

    function copyChildrenWidths(from, to) {
        var itemsFrom = $(from).children();
        var itemsTo = $(to).children();
        for (var i = 0; i < itemsFrom.length; i++) {
            itemsTo.eq(i).width(itemsFrom.eq(i).width());
        }
    }

    var handleScroll = throttle(function() {
        var top = block.offset().top;
        var bottom = top + block.outerHeight() - rowOriginal.outerHeight();
        var pageScroll = $(document).scrollTop();

        if (pageScroll > bottom || pageScroll < top) {
            wrapper.fadeOut(200);
        } else {
            wrapper.fadeIn(200);
        }
    }, 100);

    var handleResize = throttle(function() {
        clone.width(block.width());
        copyChildrenWidths(rowOriginal, rowClone);
    }, 100);

    $(document).on('scroll', handleScroll);
    $(window).on('resize', handleResize);

    $(function() {
        clone.css({
            tableLayout: 'fixed'
        });
        wrapper.css({
            display: 'none',
            position: 'fixed',
            left: block.offset().left,
            top: 0,
            width: block.parent().width()
        });
        handleScroll();
        handleResize();
    });
}
// <-- Плавающая шапка (одна на странице)

// форматирование цены для вывода
function formatPriceNumber(price)
{
    if (!price) {
        return '';
    }
    price = parseFloat(price);
    if (isNaN(parseFloat(price))) {
        return '';
    }
    var priceComponents = ('' + (Math.round(price * 100) / 100).toFixed(2)).split('.');
    if (priceComponents[0].length > 3) {
        priceComponents[0] = priceComponents[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, '&nbsp');
    }
    if ((priceComponents[1] || '').length < 2) {
        priceComponents[1] = priceComponents[1] || '';
        priceComponents[1] += new Array(2 - priceComponents[1].length + 1).join('0');
    }
    return priceComponents.join(',');
}
// вывод результата загрузки файла с офертами
function addResultPlatformProduct(
    idp, platform, countUpdate,
    countAdd, countEmptyOffer, emptyOfferContent,
    countErrorCode, errorCodeContent
) {
    var content = '';
    if (countUpdate > 0) {
        content += '<div class="UploadLog__item">'
            + 'Для <b>' + countUpdate + '</b> товаров обновлён номер ' + (platform == 'vendor_portal' ? 'оферты' : 'ТРУ')
            + '</div>';
    }
    if (countAdd > 0) {
        content += '<div class="UploadLog__item">'
            + 'Для <b>' + countAdd + '</b> товаров добавлен номер ' + (platform == 'vendor_portal' ? 'оферты' : 'ТРУ')
            + '</div>';
    }
    if (countEmptyOffer > 0) {
        content += '<div class="UploadLog__item">'
            + '<span class="UploadLog__itemTitle">'
            + 'Для <b>' + countEmptyOffer + '</b> товаров не указан номер ' + (platform == 'vendor_portal' ? 'оферты: ' : 'ТРУ: ')
            + '</span>'
            + '<span class="UploadLog__itemContent">'
            + emptyOfferContent
            + '</span>'
            + '</div>';
    }
    if (countErrorCode > 0) {
        content += '<div class="UploadLog__item">'
            + '<span class="UploadLog__itemTitle">'
            + 'Указано <b>' + countErrorCode + '</b> некорректных кодов: '
            + '</span>'
            + '<span class="UploadLog__itemContent">'
            + errorCodeContent
            + '</span>'
            + '</div>';
    }
    $('.js-uploadLogProductPlatform[data-idp=' + idp + '][data-platform=' + platform + ']').html(content);
}
// вывод результата загрузки файла с офертами

// Тип-тип незавершенный товар в корзине клиента
function initTipFullBasket() {
    if (!$('.js-tipFullBasket').length) {
        return;
    }

    $('.js-tipFullBasket').tipTip({
        maxWidth: 150,
        edgeOffset: 3,
        theme: 'white'
    });
}
// ~ Тип-тип незавершенный товар в корзине клиента

// UI Spoiler -->
function initSpoiler() {
    if (!$('.js-spoiler').length) {
        return;
    }
    $('.js-spoiler').spoiler();
}
// <-- UI Spoiler

// UI Ричселект -->
function initRichSelect() {
    var richSelect = $('.js-richSelect');
    if (!richSelect.length) {
        return;
    }
    richSelect.richSelect2();
}
// <-- UI Ричселект

// плавное открытие/закрытие вкладок в карточке клиента при работе по ajax
function slideFoldingAjaxClientCard(obj) {
    // имитация открытия/закрытия
    if (obj.is('.js-foldingClientAjax') && obj.data('clicked') != 'y') {
        $(obj).data('clicked', 'y');
        var parent = obj.closest('.js-foldingParent');
        if (parent.length) {
            var dataClass = parent.attr('data-folding-class');
            if (dataClass && dataClass.length) {
                var info = parent.children('.js-foldingContent');
                if (info.length) {
                    parent.toggleClass(dataClass);
                    info.stop(true, true).slideToggle(300);
                }
            }
        }
    }
}
//~ плавное открытие/закрытие вкладок в карточке клиента при работе по ajax

function organizePromo(obj, formData) {
    if (!formData) {
        formData = new FormData();
    }
    var typeSort = $(obj).data('type')
    formData.append('action', 'getSort');
    formData.append('typeSort', typeSort);
    $.ajax({
        url: document.location.href,
        type: 'POST',
        data: formData,
        processData: false,
        contentType: false,
        cache: false,
        dataType: 'json',
        success: function (data) {
            if (data['result'] != null && data['result'].length > 0) {
                $.fancybox({
                    content: data['result'],
                    padding: 0,
                    showCloseButton: false,
                    onComplete: function(){
                        var sortableList = $('.js-sortableList');
                        sortableList.on('click', '.js-spoilerTrigger', function(e){
                            e.preventDefault();
                            e.stopPropagation();
                            var obj = $(this).closest('.Spoiler');
                            if (!obj.hasClass('Spoiler--open')) {
                                obj.addClass('Spoiler--open')
                                    .find('.Spoiler__content')
                                    .stop().slideToggle(200);
                            } else {
                                obj.removeClass('Spoiler--open')
                                    .find('.Spoiler__content')
                                    .stop().slideToggle(200);
                            }
                        });
                        if (sortableList.length > 0) {
                            sortableList.sortable({
                                items : '> div',
                                axis : 'y',
                                containment : 'div#fancybox-wrap .FancyModal__content',
                                scroll: true,
                                scrollSensitivity: 10,
                                scrollSpeed: 10,
                                tolerance: 'pointer',
                                cancel: '.Item--disabled',
                                'start' : function(event, ui) {
                                    ui.item.addClass('Item--sorting');
                                    $('.Items').css('overflow', 'hidden');
                                },
                                'stop' : function(event, ui) {
                                    ui.item.removeClass('Item--sorting');
                                    $('.Items').css('overflow', '');
                                },
                                // Если current element height > last element height и нужно передвинуть элемент в конец
                                'beforeStop': function(event, ui) {
                                    var lastElemTop = $(this).find('.Item:last').position().top;
                                    var currElemTop = ui.position.top;
                                    var currElemHeight = ui.item.height();
                                    if (currElemTop + currElemHeight * 2 > lastElemTop) {
                                        $(this).find('.Item:last').insertBefore(ui.item);
                                    }
                                }
                            });
                            var resortPromo = $('.js-resortPromo');
                            if (resortPromo.length > 0) {
                                resortPromo.on('click', function(){
                                    var button = $(this);
                                    button.addClass('Spinner--active');
                                    if (typeSort === 'list') {
                                        $.ajax({
                                            url: document.location.href,
                                            type: 'POST',
                                            data: {
                                                action: 'resort',
                                                element_id: $('.js-sortableList').sortable('toArray')
                                            },
                                            dataType: 'json',
                                            success: function (data) {
                                                if (data['result'] != null && data['result'].length > 0) {
                                                    $.fancybox.close();
                                                    document.location.reload();
                                                } else {
                                                    alert('Не удалось изменить порядок');
                                                }
                                            },
                                            complete: function () {
                                                button.removeClass('Spinner--active');
                                            }
                                        });
                                    } else {
                                        var prevElementSort = 0;
                                        var nextElementSort = 0;
                                        if (
                                            sortableList.find('.js-elementEdit').prev().length
                                            && sortableList.find('.js-elementEdit').next().length
                                        ) {
                                            prevElementSort = parseInt(sortableList.find('.js-elementEdit').prev().data('sort'));
                                            nextElementSort = parseInt(sortableList.find('.js-elementEdit').next().data('sort'));
                                        } else if (sortableList.find('.js-elementEdit').next().length) {
                                            nextElementSort = parseInt(sortableList.find('.js-elementEdit').next().data('sort'));
                                        } else if (sortableList.find('.js-elementEdit').prev().length) {
                                            prevElementSort = parseInt(sortableList.find('.js-elementEdit').prev().data('sort'));
                                            nextElementSort = prevElementSort + 1000;
                                        }
                                        var elementEditSort = prevElementSort + Math.round((nextElementSort - prevElementSort) / 2);
                                        button.removeClass('Spinner--active');
                                        $.fancybox.close();
                                        if ($(obj).closest('.Form__field').find('.Form__error').length) {
                                            $(obj).closest('.Form__field').find('.Form__error').remove();
                                        }
                                        var blockSort = $('.js-blockSort');
                                        blockSort.show();
                                        blockSort.find('.Form__value').text('Индекс сортировки — ' + elementEditSort);
                                        blockSort.find('input').val(elementEditSort);
                                    }
                                });
                            }
                        }
                    }
                });
            } else {
                alert('Не удалось задать параметры фильтра');
            }
        }
    });

}
