// ajax-взаимодействие со страницей
var ajaxInterface = {
    selector: '[data-ajax-interface]',
    init: function () {
        var ajaxSendElements = $(ajaxInterface.selector);
        if (ajaxSendElements.length > 0) {
            ajaxSendElements.each(function () {
                ajaxInterface.initAjaxInterface($(this));
            });
        }
    },
    getEvent: function(obj) {
        return obj.attr('data-ajax-event') || 'click';
    },
    // навешивание обработчика события
    initAjaxInterface: function (obj) {
        if (obj.attr('data-ajax-interface') > 1) {
            return;
        }
        obj.attr('data-ajax-interface', 2);
        var event = ajaxInterface.getEvent(obj);
        obj.on(event, function () {
            ajaxInterface.trigger($(this));
        });
    },
    // объект для тип-типа
    getTip: function(obj) {
        return obj.attr('data-ajax-tip') && $(obj.attr('data-ajax-tip')) || obj;
    },
    // блок, обновляемый по ajax
    getBlock: function(obj) {
        return obj.attr('data-ajax-block') && $(obj.attr('data-ajax-block')) || obj;
    },
    // данные отправляемые по ajax
    getAjaxData: function(obj) {
        return obj.attr('data-ajax-send') && JSON.parse(obj.attr('data-ajax-send')) || (new FormData());
    },
    // обработчик события
    trigger: function (obj) {
        if (obj.attr('data-no-ajax')) {
            return;
        }
        var tipTipObj = ajaxInterface.getTip(obj);
        // колбэки по умолчанию
        var defaults = {
            guard: function(ajaxSendCallback) {
                if (typeof (ajaxSendCallback) === 'function') {
                    ajaxSendCallback();
                }
            },
            init: function (obj) {
                obj.addClass('Spinner--active').attr('disabled', true);
                ajaxInterface.getBlock(obj).addClass('js-ajaxBlockWaiting');
                return {};
            },
            success: function (result) {
                if (typeof (result) === 'string') {
                    result = JSON.parse(result);
                }
                if (result['error']) {
                    ShowTipTipError(tipTipObj, result['error']);
                }
                if (result['block']) {
                    var waitingBlock = $('.js-ajaxBlockWaiting');
                    if (waitingBlock.length > 0) {
                        waitingBlock.html(result['block']);
                        $('.js-ajaxContentBlock').trigger('js-ajaxContentReady');
                    }
                }
                if (result['fancybox']) {
                    $.fancybox({
                        content: result['fancybox'],
                        padding: 0,
                        showCloseButton: false,
                        onComplete: function () {
                            ajaxInterface.init();
                            initFileList($('#fancybox-content .js-TipTip_upload'));
                        }
                    });
                }
                if (result['script']) {
                    eval(result['script']);
                }
                if (result['html']) {
                    var win = window.open('about:blank');
                    win.document.open();
                    win.document.write(result['html']);
                    win.document.close();
                }
                if (result['reload']) {
                    window.location.reload();
                }
                if (result['url']) {
                    window.location.href = result['url'];
                }
            },
            complete: function () {
                if (obj.is('.Spinner--active')) {
                    obj.removeClass('Spinner--active').attr('disabled', false);
                } else if (obj.parent().find('.Spinner--active').length > 0) {
                    obj.parent().find('.Spinner--active').removeClass('Spinner--active');
                }
                var waitingBlock = $('.js-ajaxBlockWaiting');
                if (waitingBlock.length > 0) {
                    waitingBlock.removeClass('js-ajaxBlockWaiting');
                }
                if (obj.attr('data-class-upload')) {
                    var dataClassUpload = $('.' + obj.attr('data-class-upload'));
                    if (dataClassUpload.length > 0) {
                        dataClassUpload.removeClass(obj.attr('data-class-upload'));
                    }
                }
            }
        };
        // вспомогательная функция, переопределение колбэка
        var checkFunction = function (type) {
            var curFunction = obj.attr('data-ajax-' + type);
            if (curFunction) {
                eval('curFunction=' + curFunction + ';');
            }
            if (!curFunction || typeof (curFunction) !== 'function') {
                curFunction = defaults[type];
            }
            return curFunction;
        };
        var ajaxCallback = function(){
            try {
                var ajaxData = ajaxInterface.getAjaxData(obj);
                var ajaxSuccess = checkFunction('success');
                var ajaxComplete = checkFunction('complete');
                var ajaxInit = checkFunction('init');
                var extendObj = {};
                // вызов колбэка init, он должен возвращать объект, который вмержится в результирующий объект опций для ajax
                if (typeof (ajaxInit) === 'function') {
                    extendObj = ajaxInit.call(obj, obj, ajaxData, ajaxSuccess, ajaxComplete);
                    if (typeof (extendObj) !== 'object') {
                        extendObj = {};
                    }
                }
                // отправка ajax
                if (obj.prop('ajaxInterfaceSend')) {
                    obj.prop('ajaxInterfaceSend').abort();
                }
                obj.prop('ajaxInterfaceSend', $.ajax($.extend({
                    'type': 'POST',
                    'data': ajaxData,
                    'processData': !('append' in ajaxData),
                    'contentType': 'append' in ajaxData ? false : 'application/x-www-form-urlencoded',
                    'cache': false,
                    'dataType': 'append' in ajaxData ? 'html' : 'json',
                    'success': ajaxSuccess,
                    'complete': ajaxComplete
                }, extendObj)));
            } catch (e) {
                ShowTipTipError(tipTipObj, e.message || 'Возникла ошибка');
            }
        };
        var ajaxGuard = checkFunction('guard');
        if (typeof (ajaxGuard) === 'function') {
            ajaxGuard.call(obj, ajaxCallback);
        } else {
            ajaxCallback();
        }
    }
};
// колбэк init при отправке ajax для поля типа file
function ajaxInitFile(obj, ajaxData) {
    var dataSend = new FormData();
    var fileList = $(obj)[0].files;
    if (
        obj.attr('data-types')
        && !(new RegExp('\.(' + obj.attr('data-types') + ')$', 'i')).test(fileList[0].name)
    ) {
        if (obj.attr('data-types-error-text')) {
            throw new Error(obj.attr('data-types-error-text'));
        } else {
            throw new Error('Недопустимый формат файла');
        }
    }
    var spinner = $(obj).parent().find('.Spinner');
    if (spinner.length > 0) {
        spinner.parent().addClass('Spinner--active');
    }
    if (obj.attr('data-class-upload')) {
        var upload = $(obj).closest('.Upload');
        if (upload.length) {
            upload.addClass(obj.attr('data-class-upload'));
        }
    }

    if (ajaxData && typeof (ajaxData) === 'object') {
        for (var key in ajaxData) {
            if (ajaxData.hasOwnProperty(key)) {
                dataSend.append(key, ajaxData[key]);
            }
        }
    }
    dataSend.append($(obj).attr('name'), fileList[0], fileList[0].name);
    return {
        'data': dataSend,
        'processData': false,
        'contentType': false,
        'cache': false,
        'dataType': 'html'
    };
}
// колбэк init отправки ajax для форм
function ajaxInitForm(obj, ajaxData) {
    var dataSend = new FormData();
    var ajaxForm = obj.attr('data-ajax-form');
    if (!ajaxForm) {
        ajaxForm = obj.parents('form');
    } else {
        ajaxForm = $(ajaxForm);
    }
    ajaxForm.find('input[type=hidden], input:visible:not([type=checkbox]), input[type=checkbox]:checked,'
        + ' select:visible, textarea:visible, input[type=file]')
        .filter(':not([disabled=disabled])').each(function () {
        var name = $(this).attr('name');
        if (name) {
            if ($(this).is('input[type=file]')) {
                $.each(this.files, function(key, value) {
                    dataSend.append(name, value);
                });
            } else {
                dataSend.append(name, $(this).val());
            }
            dataSend.append(name, $(this).val());
        }
    });
    if (ajaxData && typeof (ajaxData) === 'object') {
        for (var key in ajaxData) {
            if (ajaxData.hasOwnProperty(key)) {
                dataSend.append(key, ajaxData[key]);
            }
        }
    }
    var spinner = obj.find('.Spinner');
    if (spinner.length > 0) {
        obj.addClass('Spinner--active');
    }
    var ajaxBlock = obj.attr('data-ajax-block');
    if (!ajaxBlock) {
        ajaxBlock = obj;
    } else {
        ajaxBlock = $(ajaxBlock);
    }
    ajaxBlock.addClass('js-ajaxBlockWaiting');
    var returnObj = {
        'data': dataSend,
        'processData': false,
        'contentType': false,
        'cache': false,
        'dataType': 'html'
    };
    if (obj.attr('data-ajax-url')) {
        returnObj.url = obj.attr('data-ajax-url');
    }
    return returnObj;
}
// колбэк init для ajax-переключения вкладок
function ajaxInitTabs(obj) {
    var tabID = obj.attr('data-tab-id');
    if (tabID) {
        var tabContent = $('.TabContent2[data-tab-id="' + tabID + '"]');
        if (tabContent.length > 0) {
            tabContent.addClass('js-ajaxBlockWaiting');
        }
    }
    obj.attr('data-no-ajax', 1);
    return {};
}
$(document).ready(function () {
    ajaxInterface.init();
    $('.js-ajaxContentBlock').on('js-ajaxContentReady', function () {
        ajaxInterface.init();
    });
});

// отправка kvi-листовки
function ajaxInitKviSend(obj, ajaxData) {
    if (!ajaxData || typeof ajaxData !== 'object') {
        ajaxData = {};
    }
    var form = $('#fancybox-content');
    var listOfItems = $('.js-kviItem:checked');
    if (listOfItems.length <= 0) {
        listOfItems = $('.js-kviItemFlyer');
    }
    ajaxData.XML_ID = [];
    listOfItems.each(function () {
        ajaxData.XML_ID.push($(this).val());
    });
    if (ajaxData.XML_ID.length <= 0) {
        throw new Error('Товары не найдены');
    }
    if (obj.find('.Spinner').length > 0) {
        obj.addClass('Spinner--active').attr('disabled', true);
    }
    ajaxData.EMAIL = form.find('.js-kviEmail').val();
    ajaxData.HEADER = form.find('.js-kviTheme').val();
    ajaxData.TEXT = form.find('.js-kviCustomText').val();
    ajaxData.IS_NEW_CONTENT = form.find('.js-customThemeAndText').prop('checked') ? 1 : 0;
    ajaxData.POTENCIAL_CLIENT = form.find('.js-potencialClient').prop('checked') ? 1 : 0;
    ajaxData.IS_PERSONAL = form.find('.js-kviPersonal').prop('checked') ? 1 : 0;
    ajaxData.idp_filter = $('.js-kviIdpFilter').val();
    return {
        'data': ajaxData,
        'url': 'mail.php'
    };
}
// скачивание xls kvi
function ajaxInitKviXls(obj, ajaxData) {
    if (!ajaxData || typeof ajaxData !== 'object') {
        ajaxData = {};
    }
    var listOfItems = $('.js-kviItem:checked');
    ajaxData.XML_ID = [];
    listOfItems.each(function () {
        ajaxData.XML_ID.push($(this).val());
    });
    if (ajaxData.XML_ID.length <= 0) {
        throw new Error('Выберите товары для выгрузки');
    }
    if (obj.find('.Spinner').length > 0) {
        obj.addClass('Spinner--active').attr('disabled', true);
    }
    return {'data': ajaxData};
}
// генерация Yml выгрузки для портала Березка
function ajaxInitPromoYml(obj, ajaxData) {
    if (!ajaxData || typeof ajaxData !== 'object') {
        ajaxData = {};
    }
    var activeTab = $('.TabContent2--active');
    var dateFrom = activeTab.find('.js-ymlDateFrom');
    if (dateFrom.length > 0) {
        ajaxData.DATE_FROM = dateFrom.val();
    }
    var dateTo = activeTab.find('.js-ymlDateTo');
    if (dateTo.length > 0) {
        ajaxData.DATE_TO = dateTo.val();
    }
    ajaxData.DELIVERY_DAYS = {};
    var bSellerExists = false;
    activeTab.find('.js-ymlCheck:checked').each(function () {
        var curSeller = $(this).closest('.js-ymlRow').find('.js-ymlDays');
        if (curSeller.length > 0) {
            var curSellerValue = curSeller.val();
            if (parseInt(curSellerValue) > 0) {
                bSellerExists = true;
                ajaxData.DELIVERY_DAYS[curSeller.attr('name')] = curSellerValue;
            }
        }
        if ($(this).attr('data-seller-id')) {
            bSellerExists = true;
            ajaxData.DELIVERY_DAYS[$(this).attr('data-seller-id')] = 1;
        }
    });
    if (!bSellerExists) {
        throw new Error('Выберите поставщика');
    }
    var fancyProgress = $('.js-ymlFancyProgress');
    if (fancyProgress.length > 0) {
        $.fancybox({
            padding: 0,
            content: fancyProgress.html(),
            showCloseButton : false,
            onComplete: function () {
                var cancelButton = $('#fancybox-content .js-ymlCancel');
                if (cancelButton.length > 0) {
                    cancelButton.on('click', function (e) {
                        if ($('.TabContent2--active .js-ymlDownload').prop('ajaxInterfaceSend')) {
                            $('.TabContent2--active .js-ymlDownload').prop('ajaxInterfaceSend').abort();
                        }
                        var objSend = {
                            'cancel': 'Y',
                            'ajaxContent': 'Y',
                            'statusCancel': cancelButton.data('cancel'),
                        };
                        $.ajax({
                            url: document.location.href,
                            type: 'POST',
                            dataType: 'json',
                            data: objSend
                        });
                        $.fancybox.close();
                    });
                }
                var progressBar = $('#fancybox-content .js-ymlProgressBar');
                if (progressBar.length > 0) {
                    window.progressBarDownloadInterval = window.setInterval(function () {
                        var progressBar = $('#fancybox-content .js-ymlProgressBar');
                        if (progressBar.length > 0) {
                            $.ajax({
                                url: progressBar.attr('data-progress'),
                                type: 'GET',
                                dataType: 'json',
                                success: function(result) {
                                    if (result['result']) {
                                        var progressVal = parseInt(result['result']);
                                        if (progressVal > parseInt(progressBar.attr('data-value'))) {
                                            progressBar.animate({
                                                'width': progressVal + '%'
                                            }, 500, 'linear', function(){
                                                progressBar.attr('data-value', progressVal)
                                                    .find('.js-ymlProgressBarTitle').html(progressVal + '%');
                                            });
                                        }
                                        if (progressVal >= 100 && result['url']) {
                                            window.clearInterval(window.progressBarDownloadInterval);
                                            $.fancybox.close();
                                            window.location.href = result['url'];
                                        }
                                    }
                                    if (result['error']) {
                                        $.fancybox.close();
                                        ShowTipTipError($('.TabContent2--active .js-ymlDownload'), result['error']);
                                    }
                                }
                            });
                        } else {
                            window.clearInterval(window.progressBarDownloadInterval);
                        }
                    }, 3000);
                }
            }
        });
    }
    return {
        'data': ajaxData,
        'timeout': 300000
    };
}
// загрузка CTE-кодов
function ajaxInitUploadCTE(obj, ajaxData)
{
    var initAjaxResult = ajaxInitFile(obj, ajaxData);
    var fancyProgress = $('.js-cteFancyProgress');
    if (fancyProgress.length > 0) {
        $.fancybox({
            padding: 0,
            content: fancyProgress.html(),
            showCloseButton : false,
            onComplete: function () {
                var progressBar = $('#fancybox-content .js-ymlProgressBar');
                if (progressBar.length > 0) {
                    window.progressBarDownloadInterval = window.setInterval(function () {
                        var progressBar = $('#fancybox-content .js-ymlProgressBar');
                        if (progressBar.length > 0) {
                            $.ajax({
                                url: progressBar.attr('data-progress'),
                                type: 'GET',
                                dataType: 'json',
                                success: function(result) {
                                    if (result['result']) {
                                        var progressVal = parseInt(result['result']);
                                        if (progressVal > parseInt(progressBar.attr('data-value'))) {
                                            progressBar.animate({
                                                'width': progressVal + '%'
                                            }, 500, 'linear', function(){
                                                progressBar.attr('data-value', progressVal)
                                                    .find('.js-ymlProgressBarTitle').html(progressVal + '%');
                                            });
                                        }
                                        if (progressVal >= 100) {
                                            window.clearInterval(window.progressBarDownloadInterval);
                                            $.fancybox.close();
                                            if (result['cnt']) {
                                                window.setTimeout(function(){
                                                    $('.js-uploadForExternalServices .js-uploadTip').tipTip({
                                                        'activation': 'manual',
                                                        'defaultPosition': 'top',
                                                        'content': 'Загружены значения для '
                                                            + result['cnt']
                                                            + _ending(result['cnt'], [' товара', ' товаров', ' товаров']),
                                                        'theme': 'white',
                                                        'delay': 100,
                                                        'fadeIn': 0,
                                                        'fadeOut': 200,
                                                        'maxWidth': 340,
                                                        afterEnter: function () {
                                                            window.setTimeout(function () {
                                                                $(document).one('click', function () {
                                                                    HideTipTipError();
                                                                });
                                                            }, 300);
                                                        }
                                                    }).tipTip('show');
                                                }, 300);
                                            }
                                            if (result['date']) {
                                                if ($('.ClientsFiles__dateTime').length > 0) {
                                                    $('.ClientsFiles__dateTime').html(result['date']);
                                                } else {
                                                    $('.js-downloadCTE').after(
                                                        '<span class="ClientsFiles__dateUpdate">'
                                                        + 'Последнее обновление: <span class="ClientsFiles__dateTime">'
                                                        + result['date']
                                                        + '</span></span>'
                                                    );
                                                }
                                            }
                                            if (result['error']) {
                                                ShowTipTipError(
                                                    $('.js-uploadForExternalServices .js-uploadTip'),
                                                    result['error']
                                                );
                                            }
                                            var fileInput = $('#cte_codes');
                                            if (fileInput.length > 0) {
                                                fileInput.after('<input type="file" name="cte_codes" id="cte_codes" class="Upload__field" '
                                                    + 'data-ajax-interface="1" data-ajax-send="{}" data-ajax-event="change" '
                                                    + 'data-ajax-init="ajaxInitUploadCTE" data-ajax-tip=".js-uploadTip" data-types="xlsx|xls" '
                                                    + 'data-types-error-text="'
                                                    + fileInput.attr('data-types-error-text')
                                                    + '"'
                                                    +'>');
                                                fileInput.remove();
                                                ajaxInterface.init();
                                            }
                                        }
                                    }
                                }
                            });
                        } else {
                            window.clearInterval(window.progressBarDownloadInterval);
                        }
                    }, 1000);
                }
            }
        });
    }
    return initAjaxResult;
}
// просто отправка ajax на url
function ajaxInitPlain(obj) {
    return {'url': $(obj).attr('data-ajax-url')};
}
// вывод результата в fancybox
function ajaxSuccessFancybox(result) {
    if (typeof (result) === 'string') {
        result = JSON.parse(result);
    }
    if (result.html) {
        $.fancybox({
            content: result.html,
            padding: 0,
            onComplete: function () {
                ajaxInterface.init();
                $('.FancyModal').on('click', '.js-spoilerTrigger', function(e){
                    e.stopPropagation();
                    var obj = $(this).closest('.Spoiler');
                    if (!obj.hasClass('Spoiler--open')) {
                        obj.addClass('Spoiler--open')
                            .find('.Spoiler__content:first')
                            .stop().slideToggle(200);
                    } else {
                        obj.removeClass('Spoiler--open')
                            .find('.Spoiler__content:first')
                            .stop().slideToggle(200);
                    }
                });
            }
        });
    } else if (result.error) {
        fancyAlertError(result.error);
    }
}
// валидация полей формы
function ajaxGuardRequiredFields(ajaxCallback)
{
    var callbacks = [];
    if (typeof (ajaxCallback) === 'function') {
        callbacks.push(ajaxCallback);
    }
    var obj = $(this);
    var ajaxForm = obj.attr('data-ajax-form');
    if (!ajaxForm) {
        ajaxForm = obj.parents('form');
    } else {
        ajaxForm = $(ajaxForm);
    }
    var isValid = true;
    ajaxForm.find('.js-fieldRequired').each(function () {
        if ($.trim($(this).val()) === '') {
            isValid = false;
            var errorText = $(this).attr('data-error-text');
            if (!errorText) {
                errorText = 'Поле должно быть заполнено';
            }
            $(this).addClass('error').nextAll('.Form__error').remove();
            $(this).after('<div class="Form__error">' + errorText + '</div>');
            setAutoCorrection($(this));
        }
    });
    ajaxForm.find('[data-validate-callback]').each(function () {
        var currentValidateCallback = $(this).attr('data-validate-callback');
        if (currentValidateCallback) {
            eval('currentValidateCallback=' + currentValidateCallback + ';');
            if (typeof (currentValidateCallback) === 'function') {
                callbacks.push(currentValidateCallback);
            }
        }
    });
    if (ajaxForm.find('.js-fieldRequired.error').length > 0) {
        isValid = false;
    }
    if (isValid) {
        var callbackExecutor = function(callbackArray) {
            if (!callbackArray || !callbackArray.length) {
                return;
            }
            var currentCallback = callbackArray.pop();
            if (typeof (currentCallback) === 'function') {
                currentCallback(function () {
                    callbackExecutor(callbackArray)
                });
            }
        };
        callbackExecutor(callbacks);
    }
}
