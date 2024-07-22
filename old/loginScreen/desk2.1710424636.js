//проверка возможности скачать заказ
function isGetOrder(orderID, url, button)
{
    $(button).addClass('Spinner--active');
    $.ajax({
        url: document.location.href,
        type: 'POST',
        data: {
            ID: orderID,
            isGetExcelOrderID: true
        },
        dataType: 'json',
        success: function(result) {
            if (result['success']) {
                document.location.href = url;
            } else {
                $.fancybox({content: 'Заказ уже обрабатывается другим менеджером.'
                        + '<br>Обновите страницу, чтобы увидеть ответственного.'});
            }
        },
        complete: function () {
            $(button).removeClass('Spinner--active');
        }
    });
    return false;
}

//функция ругательства на незаполненный логин 1с
function ErrorLogin1C()
{
    alert("Ошибка! У Вас не заполнено поле Логин 1С на сайте.\n"
        + "Поставьте задачу на корпоративном портале.\n"
        + "Название задачи: Установить логин 1С на сайте\n"
        + "Ответственный: дежурный менеджер корпоративного портала\n\n"
        + "К задаче обязательно приложите скриншот 1С с Вашим логином 1С!");
}

//функция удаляет контакт
function ContactRemove(obj, contactID)
{
    var send = {};
    send['action'] = 'ContactRemove';
    send['contactID'] = contactID;
    if (contactID <= 0) {
        alert('Ошибка удаления контакта');
        return false;
    }
    if (confirm('Вы уверены, что хотите удалить черновик?')) {
        $.ajax({
            url: '/ajax/desk/contacts.php',
            type: 'POST',
            data: send,
            dataType: 'json',
            success: function(result) {
                if (result['result'] != null && result['result'] > 0) {
                    $.fancybox.close();
                    document.location.reload();
                } else if (result['error'] != null && result['error'].length > 0) {
                    alert(result['error']);
                } else {
                    alert(result);
                }
            }
        });
    }
    return false;
}

var fancyboxStartPos = -1;
//функция показывает окно просмотра/добавления/редактирования контакта
function ContactForm(objSend, obj)
{
    //формируем данные
    if (!objSend) {
        objSend = {};
    }
    if (!objSend['action']) {
        objSend['action'] = 'ContactForm';
    }
    var contactsPagination = $('.js-contactsPagination');
    if (contactsPagination.length > 0 && !!objSend.ID) {
        var bPaginate = false;
        var prevContacId = 0;
        var nextContactId = 0;
        var cntContacts = 0;
        for (var i = 0, ilen = contactsPagination.length; i < ilen; i++) {
            var curContactId = parseInt($(contactsPagination[i]).attr('data-contact-id'));
            if (curContactId > 0) {
                cntContacts++;
                if (curContactId === parseInt(objSend.ID)) {
                    bPaginate = true;
                    objSend['PAGINATE_CURRENT'] = cntContacts;
                } else if (bPaginate && nextContactId <= 0) {
                    nextContactId = curContactId;
                } else if (!bPaginate) {
                    prevContacId = curContactId;
                }
            }
        }
        if (bPaginate) {
            objSend['PAGINATE_COUNT'] = cntContacts;
            objSend['PAGINATE_PREV'] = prevContacId;
            objSend['PAGINATE_NEXT'] = nextContactId;
        }
    }

    if (obj) {
        //проверка обязательных полей
        if (objSend['SAVE']
            || (obj.find('.js-ContactTopicChange').is('.js-ContactRequired')
                && obj.find('.js-ContactTopicChange').val().length <= 0)) {
            var isError = false;
            obj.find('.error').removeClass('error').next('.Form__error').remove();
            obj.find('.js-ContactRequired:visible:not([disabled=disabled])').each(function(){
                if ($.trim($(this).val()).length <= 0) {
                    isError = true;
                    $(this).addClass('error')
                        .after('<span class="Form__error">Заполните поле «'
                            + obj.find('label[for=' + $(this).attr('id') + ']').html()
                            + '»</span>');
                    setAutoCorrection($(this));
                }
            });
            // проверка графика работы
            if (deskKorClientSchedule && !deskKorClientSchedule.formValidate(obj.find('.Schedule input:enabled'))) {
                isError = true;
            }
            // проверка номера телефона
            if (!checkFormFieldPhone(obj.find('.js-phoneMask'))) {
                isError = true;
            }
            // проверка адреса КЛ
            if (obj.find('#UF_ADDRESS').is(':checked')) {
                var $addressInput = obj.find('input[name="UF_ADDRESS"]');
                if ($addressInput.length) {
                    $.ajax({
                        url: '/ajax/validate.php',
                        type: 'POST',
                        data: {
                            action: 'address',
                            value: $addressInput.val(),
                            isFullFormat: true
                        },
                        async: false,
                        cache: false,
                        dataType: 'json',
                        success: function(result) {
                            if (result.error) {
                                setFormFieldError($addressInput, result.error);
                                isError = true;
                            } else if (result.cleaned) {
                                $addressInput.val(result.cleaned);
                            }
                        }
                    });
                }
            }
            // Запрет на создание контакта при отсутствии изменений при типе "Описание клиента"
            var inputTopicID = obj.find('input[name=UF_TOPIC]');
            var inputName = obj.find('input[name=UF_NAME]');
            var inputComment = obj.find('textarea[name=UF_COMMENT]');
            if (inputTopicID.length > 0 && inputTopicID.val() == '27'
                && ((inputName.length > 0 && inputName.val().length < 2)
                    && (inputComment.length > 0 && inputComment.length < 1))
            ) {
                ShowTipTipError(obj.find('.js-ContactSave'), 'Для сохранения контакта<br />измените хотя бы одно поле', 'top');
                isError = true;
            }
            if (isError) {
                obj.find('.error:first').focus();
                obj.find('.js-ContactSaveDraft, .js-ContactSaveReason, .js-ContactSave').removeClass('Spinner--active').attr('disabled', false);
                return false;
            }
        }

        //добавляем поля формы в данные для отправки
        obj.find('input[type=hidden], input:visible, select:visible, textarea:visible')
            .filter(':not([disabled=disabled])').each(function(){
            var name = $(this).attr('name');
            if (name) {
                if ($(this).is('[type=checkbox]') && $(this).attr('data-value')) {
                    var curVal = $(this).is(':checked') ? 1 : 0;
                    if (parseInt($(this).attr('data-value')) !== curVal) {
                        objSend[name] = curVal;
                    }
                } else if ((!$(this).is('[type=radio]')
                    && !$(this).is('[type=checkbox]'))
                    || $(this).is(':checked')) {
                    objSend[name] = $(this).val();
                }
            }
        });
        if (objSend['SAVE'] !== undefined
            && $('body').children('.js-CPTemp').children(':last').length > 0) {
            objSend['CALC'] = {};
            objSend['CALC']['SAVE'] = 1;

            //добавляем поля формы в данные для отправки
            $('body').children('.js-CPTemp').children(':last').find('input, select, textarea')
                .filter(':not([disabled=disabled])').each(function(){
                var name = $(this).attr('name');
                if (name) {
                    if ((!$(this).is('[type=radio]')
                        && !$(this).is('[type=checkbox]'))
                        || $(this).is(':checked')) {
                        objSend['CALC'][name] = $(this).val();
                    }
                }
            });
        }
    } else {
        fancyboxStartPos = -1;
    }

    $.ajax({
        url: '/ajax/desk/contacts.php',
        type: 'POST',
        data: objSend,
        dataType: 'json',
        success: function(result) {
            if (result['result'] != null) {
                if (objSend['MEET'] > 0) {
                    if (objSend['SAVE'] > 0 && !('REASON' in objSend)) {
                        $('.js-ContactSave').addClass('Spinner--active');
                        var objMeet = {
                            'UF_CLIENT': objSend['UF_LOGIN'] ? objSend['UF_LOGIN'] : 0,
                            'UF_CONTACT': result['result']
                        };
                        if (objSend['ROUTE'] > 0) {
                            objMeet['UF_ROUTE'] = objSend['ROUTE'];
                        }
                        GetCoordsForEvent(function(position){
                            var message = 'Конец встречи с клиентом';
                            CreateGeoEvent(message, position, objMeet, function(){
                                $.fancybox.close();
                                document.location.reload();
                            });
                        }, function(){
                            var message = 'Конец встречи с клиентом';
                            CreateGeoEvent(message, false, objMeet, function(){
                                $.fancybox.close();
                                document.location.reload();
                            });
                        });
                        return false;
                    } else {

                        $.fancybox.close();
                        document.location.reload();
                    }
                } else {
                    $.fancybox.close();
                    document.location.reload();
                }
            } else if (result['error'] != null) {
                obj.find('.js-ContactSaveDraft, .js-ContactSaveReason, .js-ContactSave').removeClass('Spinner--active').attr('disabled', false);
                alert(result['error']);
            } else if (result['error_button'] != null) {
                obj.find('.js-ContactSaveDraft, .js-ContactSaveReason, .js-ContactSave').removeClass('Spinner--active').attr('disabled', false);
                ShowTipTipError(obj.find('.js-ContactSave'), result['error_button'], 'top');
            } else if (result['html'] != null) {
                var objHtml = $(result['html']);
                objHtml.find('.tipTip, .tipTipMove, .js-tipOnClick').each(function(){
                    setTipTip($(this));
                });
                objHtml.find('.js-ContactSaveDraft').click(function(){
                    $(this).addClass('Spinner--active').attr('disabled', true);
                    var bcPlacedRadio = $('#fancybox-content .js-bcPlacedItem:not(.Blocked)');
                    var blockedTriggerBC = $('#fancybox-content .js-BlockedTriggerBC:not(.Blocked)');
                    var saveDraftCallback = function () {
                        var objSave = {SAVE: 0};
                        if (objSend['MEET'] > 0) {
                            objSave['MEET'] = 1;
                        }
                        if (objSend['ROUTE'] > 0) {
                            objSave['ROUTE'] = objSend['ROUTE'];
                        }
                        ContactForm(objSave, objHtml);
                    };
                    if (bcPlacedRadio.length && blockedTriggerBC.length) {
                        var bcPlacedChecked = bcPlacedRadio.filter(':checked');
                        if (bcPlacedChecked.length) {
                            var field = $('#fancybox-content [name=UF_BUSINESS_CENTER]');
                            if (field.length) {
                                field.remove();
                            }
                            if (bcPlacedChecked.is('.js-bcPlacedNot') || bcPlacedChecked.is('.js-bcPlacedNew')) {
                                bcPlacedChecked.after('<input type="hidden" name="UF_BUSINESS_CENTER" value="Нет">');
                            } else if (bcPlacedChecked.is('.js-bcPlacedList')) {
                                var bcList = $('#fancybox-content .js-bcList');
                                if (bcList.length) {
                                    var bcListInput = bcList.find('[name=bc]');
                                    var bcListValue = parseInt(bcListInput.val());
                                    if (bcListValue > 0) {
                                        var bcListValueName = bcList.find('.js-selectFilterOption[data-value="'
                                            + bcListValue
                                            + '"]').attr('data-name');
                                        bcPlacedChecked.after('<input type="hidden" name="UF_BUSINESS_CENTER" value="'
                                            + bcListValueName
                                            + '">');
                                    }
                                }
                            }
                        }
                    } else {
                        var field = $('#fancybox-content [name=UF_BUSINESS_CENTER]');
                        if (field.length) {
                            field.remove();
                        }
                    }
                    saveDraftCallback();
                    return false;
                });
                objHtml.find('.js-ContactSaveReason').click(function(){
                    $(this).addClass('Spinner--active').attr('disabled', true);
                    var objSave = {SAVE: 1, REASON: 1};
                    if (objSend['MEET'] > 0) {
                        objSave['MEET'] = 1;
                    }
                    if (objSend['ROUTE'] > 0) {
                        objSave['ROUTE'] = objSend['ROUTE'];
                    }
                    ContactForm(objSave, objHtml);
                    return false;
                });
                if (objHtml.find('.js-clientScheduleNoBreakTime').is(':checked')) {
                    objHtml.find('.js-clientScheduleNoBreakTime').parent().siblings('.Schedule__countGroup').addClass('Blocked');
                }
                objHtml.find('.js-ContactSave').click(function(){
                    var buttonSave = $(this);
                    buttonSave.addClass('Spinner--active').attr('disabled', true);
                    var saveCallback = function () {
                        var objSave = {SAVE: 1};
                        if (objSend['MEET'] > 0) {
                            objSave['MEET'] = 1;
                        }
                        if (objSend['ROUTE'] > 0) {
                            objSave['ROUTE'] = objSend['ROUTE'];
                        }
                        ContactForm(objSave, objHtml);
                    };
                    var bSave = true;
                    var bcPlacedRadio = $('#fancybox-content .js-bcPlacedItem:not(.Blocked)');
                    var blockedTriggerBC = $('#fancybox-content .js-BlockedTriggerBC:not(.Blocked)');
                    if (bcPlacedRadio.length && blockedTriggerBC.length) {
                        var bcPlacedChecked = bcPlacedRadio.filter(':checked');
                        if (bcPlacedChecked.length) {
                            var field = $('#fancybox-content [name=UF_BUSINESS_CENTER]');
                            if (field.length) {
                                field.remove();
                            }
                            if (bcPlacedChecked.is('.js-bcPlacedNot')) {
                                bcPlacedChecked.after('<input type="hidden" name="UF_BUSINESS_CENTER" value="Нет">');
                            } else if (bcPlacedChecked.is('.js-bcPlacedList')) {
                                var bcList = $('#fancybox-content .js-bcList');
                                if (bcList.length) {
                                    var bcListInput = bcList.find('[name=bc]');
                                    var bcListValue = parseInt(bcListInput.val());
                                    if (bcListValue > 0) {
                                        var bcListValueName = bcList.find('.js-selectFilterOption[data-value="'
                                            + bcListValue
                                            + '"]').attr('data-name');
                                        bcPlacedChecked.after('<input type="hidden" name="UF_BUSINESS_CENTER" value="'
                                            + bcListValueName
                                            + '">');
                                    } else {
                                        bcList.addClass('RichSelect--error').nextAll('.Form__error').remove();
                                        bcList.after('<div class="Form__error">Выберите бизнес-центр</div>');
                                        bcListInput.one('change', function () {
                                            bcList.removeClass('RichSelect--error').nextAll('.Form__error').remove();
                                        });
                                        buttonSave.removeClass('Spinner--active').attr('disabled', false);
                                        bSave = false;
                                    }
                                }
                            } else if (bcPlacedChecked.is('.js-bcPlacedNew')) {
                                var bcNameAutocomplete = $('#fancybox-content .js-bcNameAutocomplete');
                                var bcAddressAutocomplete = $('#fancybox-content .js-bcAddressAutocomplete');
                                bcNameAutocomplete.add(bcAddressAutocomplete).each(function () {
                                    var bcAutocomplete = $(this);
                                    if ($.trim(bcAutocomplete.find('.js-autocompleteAjaxSearchInput').val()).length <= 0) {
                                        bcAutocomplete.nextAll('.Form__error').remove();
                                        bcAutocomplete.find('.js-autocompleteAjaxSearchInput').addClass('error')
                                            .one('change', function() {
                                                $(this).removeClass('error').closest('.js-autocompleteAjax')
                                                    .nextAll('.Form__error').remove();
                                            });
                                        bcAutocomplete.after('<div class="Form__error">Заполните поле</div>');
                                        buttonSave.removeClass('Spinner--active').attr('disabled', false);
                                        bSave = false;
                                    }
                                });
                                if (bSave) {
                                    bSave = false;
                                    $.ajax({
                                        'type': 'POST',
                                        'url': '/ajax/desk/business_center.php',
                                        'dataType': 'json',
                                        'cache': false,
                                        'data': {
                                            action: 'createBusinessCenter',
                                            department: $('#fancybox-content [name=UF_IDP]').val(),
                                            client: $('#fancybox-content [name=UF_LOGIN]').val(),
                                            UF_NAME: bcNameAutocomplete.find('.js-autocompleteAjaxSearchInput').val(),
                                            UF_ADDRESS: bcAddressAutocomplete.find('.js-autocompleteAjaxSearchInput').val()
                                        },
                                        'success': function(data) {
                                            var addressInput = bcAddressAutocomplete.find('.js-autocompleteAjaxSearchInput');
                                            if (data.cleaned) {
                                                addressInput.val(data.cleaned);
                                            }
                                            if (data.success) {
                                                bcPlacedChecked.after('<input type="hidden" name="UF_BUSINESS_CENTER" value="'
                                                    + data.success
                                                    + '">');
                                                saveCallback();
                                            } else if (data.error) {
                                                setFormFieldError(addressInput, data.error, bcAddressAutocomplete);
                                                buttonSave.removeClass('Spinner--active').attr('disabled', false);
                                            }
                                        }
                                    });
                                }
                            }
                        }
                    } else {
                        var field = $('#fancybox-content [name=UF_BUSINESS_CENTER]');
                        if (field.length) {
                            field.remove();
                        }
                    }
                    if (bSave) {
                        saveCallback();
                    }
                    return false;
                });
                objHtml.find('.js-ContactCalc').click(function(){
                    ContactCalcForm(objHtml);
                    return false;
                });

                $.fancybox({
                    content: objHtml,
                    centerOnScroll: false,
                    padding: 0,
                    modal: (! objHtml.is('.Contact.Contact--defined')),
                    showCloseButton: false,
                    onStart: function () {
                        if (fancyboxStartPos >= 0) {
                            $('html, body').scrollTop(fancyboxStartPos);
                        }
                    },
                    onComplete: function () {
                        initTipOnHover();
                        initPhoneMask();
                        if (fancyboxStartPos < 0) {
                            fancyboxStartPos = $(window).scrollTop();
                        }
                        if ($('#fancybox-content .js-paginateContacts').length > 0) {
                            initSwipe($('#fancybox-content')[0], {});
                        }
                        if ($('#fancybox-content .js-autocompleteAjax').length) {
                            initAutocompleteInterface();
                        }
                        if ($('#fancybox-content .js-selectFilter').length) {
                            initFilterInterface();
                            $('#fancybox-content .RichSelect--selectResponsible')
                                .removeClass('RichSelect--selectResponsible');
                        }
                        var bcLabel = $('.js-ContactInactiveRows:checked, ' +
                            '.js-ContactInactiveRowsBC:checked, ' +
                            '.js-ContactInactiveRowsTime:checked'
                        );
                        var inputName = $('#fancybox-content [name=UF_NAME]');
                        if (
                            bcLabel.length
                            && inputName.length
                            && $.trim(inputName.val()) === ''
                        ) {
                            var change = 'Изменено: ' + bcLabel.closest('.js-Inactive').find('.js-BlockedTrigger').text();
                            inputName.val(change)
                                .parents('.js-ContactNameBlock').find('.js-ContactNameInline').html(change);
                        }
                    }
                });
            } else {
                obj.find('.js-ContactSaveDraft, .js-ContactSaveReason, .js-ContactSave').removeClass('Spinner--active').attr('disabled', false);
                alert('Ошибка при выполнении запроса');
            }
            if (typeof(deskKorBusinessCenter) !== 'undefined'
                && typeof(deskKorBusinessCenter.onBusinessCenterDisable) === 'function') {
                deskKorBusinessCenter.onBusinessCenterDisable();
            }
        }
    });

    return false;
}


//функция показывает расчитывает потенциал
function ContactCalcForm(objContact, objSend, obj)
{
    //формируем данные
    if (!objSend) {
        objSend = {};
    }
    if (!objSend['action']) {
        objSend['action'] = 'ContactCalcForm';
    }
    if (objContact) {
        var isErp = objContact.is('.js-calculatePurchasingBlock');
        if (isErp) {
            objSend['IS_ERP'] = 'Y';
            if (!objSend['UF_PARTNER_DOC_ID'] && objContact.find('[name=UF_PARTNER_DOC_ID]')) {
                objSend['UF_PARTNER_DOC_ID'] = objContact.find('[name=UF_PARTNER_DOC_ID]').val();
            }
        } else {
            if (!objSend['UF_CONTACT_ID'] && objContact.find('[name=ID]')) {
                objSend['UF_CONTACT_ID'] = objContact.find('[name=ID]').val();
            }
        }

        if (!objSend['UF_LOGIN'] && objContact.find('[name=UF_LOGIN]')) {
            objSend['UF_LOGIN'] = objContact.find('[name=UF_LOGIN]').val();
        }
        var isNewClient = objContact.is('.CRMNewClient__form')
            || objContact.is('.js-CRMNewClientView')
            || isErp;

        if (isNewClient) {
            if (!obj && objContact.find('.js-CPTemp').children().length > 0) {
                obj = objContact.find('.js-CPTemp').children(':last');
            }
        } else if (!obj && $('body').children('.js-CPTemp').children().length > 0) {
            obj = $('body').children('.js-CPTemp').children(':last');
        }
        // форма калькулятора
        if (obj) {
            obj.find('.js-CP-Calc').removeClass('btnAccent--main').nextAll('.Form__error').remove();
            if (objSend['SAVE']) {
                if (obj.find('[name=UF_POTENTIAL_A]').val() <= 0) {
                    obj.find('.js-CP-Calc').addClass('btnAccent--main').after('<span class="Form__error">Рассчитайте потенциал закупок</span>');
                    return false;
                }
                var isError = false;
                obj.find('.js-ContactRequiredfield--error').each(function(){
                    if ($.trim($(this).val()).length === 0) {
                        isError = true;
                        if ($(this).nextAll('.Form__error').length == 0) {
                            $(this).addClass('error').after('<span class="Form__error">Заполните поле «Комментарий»</span>');
                        }
                    } else {
                        $(this).removeClass('error').nextAll('.Form__error').remove();
                    }
                });
                if (isError) {
                    obj.find('.js-ContactRequiredfield--error.error:first').focus();
                    return false;
                }
                if (isErp) {
                    var employees = objContact.find('[name=UF_EMPLOYEES]');
                    if (employees.length > 0) {
                        var employeesVal = obj.find('.js-CP-UserCount').val();
                        employees.siblings('.js-labelContact, .Form__error').remove();
                        employees.after('<input type="hidden" name="UF_EMPLOYEES" value="'
                            + employeesVal
                            + '"> <span class="js-labelContact">'
                            + employeesVal
                            + '</span>');
                        employees.parents('.Form__field').addClass('Form__field--defined');
                        employees.remove();
                    }
                    var typeActivity = objContact.find('[name=UF_TYPE_ACTIVITY]');
                    if (typeActivity.length > 0) {
                        var typeActivityVal = obj.find('[name=UF_BUSINESS_TYPE]').val();
                        var typeActivityName = obj.find('[name=UF_BUSINESS_TYPE] option:selected').html();
                        typeActivity.siblings('.js-labelContact, .Form__error').remove();
                        typeActivity.after('<input type="hidden" name="UF_TYPE_ACTIVITY" value="'
                            + typeActivityVal
                            + '"> <span class="js-labelContact">'
                            + typeActivityName
                            + '</span>');
                        typeActivity.parents('.Form__field').addClass('Form__field--defined');
                        typeActivity.remove();
                    }
                    var potentialField = objContact.find('[name=UF_POTENTIAL]');
                    if (potentialField.length > 0) {
                        var potentialVal = obj.find('[name=UF_POTENTIAL_U]').val();
                        potentialField.siblings('.js-labelContact, .Form__error').remove();
                        potentialField.after('<input type="hidden" name="UF_POTENTIAL" value="'
                            + potentialVal
                            + '"> <span class="js-labelContact">'
                            + potentialVal
                            + '</span>');
                        potentialField.parents('.Form__field').addClass('Form__field--defined');
                        potentialField.remove();
                    }
                } else {
                    var objUpdate = [
                        {
                            name: 'UF_COUNT_STAFF',
                            val: '.js-CP-UserCount',
                            html: '.js-CP-UserCount'
                        },
                        {
                            name: 'UF_BUSINESS_TYPE',
                            val: '[name=UF_BUSINESS_TYPE]',
                            html: '[name=UF_BUSINESS_TYPE] option:selected'
                        },
                        {
                            name: 'UF_BUSINESS_TYPE_',
                            val: '[name=UF_BUSINESS_TYPE]',
                            html: '[name=UF_BUSINESS_TYPE] option:selected'
                        }
                    ];
                    for (var key in objUpdate) {
                        if (objContact.find('[name=' + objUpdate[key].name + ']').length > 0) {
                            var objInput = objContact.find('[name=' + objUpdate[key].name + ']'),
                                objValue = obj.find(objUpdate[key].val).val()
                                           ? obj.find(objUpdate[key].val).val()
                                           : obj.find(objUpdate[key].val).html();
                            if (objUpdate[key].name === 'UF_COUNT_STAFF') {
                                var objHtmlValue = obj.find(objUpdate[key].val).val();
                            } else {
                                var objHtmlValue = obj.find(objUpdate[key].html).html();
                            }
                            objInput.nextAll('.Form__error').remove();
                            if (objInput.siblings('.js-labelContact').length === 0) {
                                objInput.after('<input type="hidden" value="' + objValue
                                    + '" name="' + objUpdate[key].name
                                    + '" id="' + objUpdate[key].name + '">'
                                    + '<span class="js-labelContact">'
                                    + objHtmlValue + '</span>');
                                objInput.remove();
                                objInput = objContact.find('[name=' + objUpdate[key].name + ']');
                            }
                            objInput.val(objValue)
                                .siblings('.js-labelContact').html(objHtmlValue);
                        }
                    }
                    objContact.find('[name=UF_POTENTIAL]').val(obj.find('[name=UF_POTENTIAL_U]').val())
                        .siblings('.js-labelContact').html(obj.find('[name=UF_POTENTIAL_U]').val());
                }

                if (!isNewClient)  {
                    $('body').children('.js-CPTemp').remove();
                    $('body').append('<div class="js-CPTemp"></div>');
                    $('body').children('.js-CPTemp').hide().append(obj);

                    objContact.show();
                    $.fancybox({
                        content: objContact,
                        centerOnScroll: false,
                        padding: 0,
                        modal: true,
                        onStart: function () {
                            if (fancyboxStartPos >= 0) {
                                $('html, body').scrollTop(fancyboxStartPos);
                            }
                        }
                    });
                } else {
                    var autoStatus2 = [];
                    if (isErp) {
                        autoStatus2 = objContact.parent().find('.js-autoStatus2');
                    } else {
                        autoStatus2 = objContact.find('.js-autoStatus2');
                    }
                    if (autoStatus2.length > 0) {
                        var dataHash = {
                            'dmd': {
                                0: 'Мелкий',
                                3000: 'Средний',
                                20000: 'Крупный',
                                50000: 'VIP',
                                100000: 'Ключевой',
                                200000: 'Стратегический'
                            },
                            'spb': {
                                0: 'Мелкий',
                                2000: 'Средний',
                                15000: 'Крупный',
                                50000: 'VIP',
                                150000: 'Ключевой'
                            },
                            'other': {
                                0: 'Мелкий',
                                2000: 'Средний',
                                10000: 'Крупный',
                                30000: 'VIP',
                                100000: 'Ключевой'
                            }
                        };
                        var statusChannel = {
                            'Мелкий': 'СМБ',
                            'Средний': 'СМБ',
                            'Крупный': 'КБ',
                            'VIP': 'КБ',
                            'Ключевой': 'КБ',
                            'Стратегический': 'ПРЦ'
                        };
                        var currentIdp = autoStatus2.attr('data-idp');
                        if (currentIdp && currentIdp.length > 0 && dataHash[currentIdp]) {
                            var potentialValue = obj.find('[name=UF_POTENTIAL_U]').val();
                            var currentStatus2 = false;
                            for (var keyValue in dataHash[currentIdp]) {
                                if (dataHash[currentIdp].hasOwnProperty(keyValue)) {
                                    if (parseInt(potentialValue) >= parseInt(keyValue)) {
                                        currentStatus2 = dataHash[currentIdp][keyValue];
                                    } else {
                                        break;
                                    }
                                }
                            }
                            if (currentStatus2) {
                                if (isErp) {
                                    var autoStatus2Set = -1;
                                    autoStatus2.find('option').each(function(){
                                        if ($.trim($(this).html()) === currentStatus2) {
                                            autoStatus2Set = $(this).val();
                                        }
                                    });
                                    if (autoStatus2Set >= 0) {
                                        autoStatus2.val(autoStatus2Set).addClass('Blocked');
                                    } else if (
                                        autoStatus2.val() == 'Стратегический'
                                        || (
                                            (autoStatus2.val() == 'Мелкий' || autoStatus2.val() == 'Средний')
                                            &&  statusChannel[currentStatus2] == 'СМБ'
                                        )
                                    ) {

                                    } else {
                                        autoStatus2.siblings('.js-labelContact, .Form__error').remove();
                                        autoStatus2.after('<input class="js-autoStatus2" data-idp="'
                                            + currentIdp
                                            + '" type="hidden" name="UF_POTENTIAL_STATUS" value="'
                                            + currentStatus2
                                            + '"> <span class="js-labelContact CustomerForm__status2">'
                                            + currentStatus2
                                            + '</span>');
                                        autoStatus2.parents('.Form__field').addClass('Form__field--defined');
                                        autoStatus2.remove();
                                    }
                                } else {
                                    autoStatus2.html(
                                        '<input type="hidden" name="UF_STATUS2" value="'
                                        + currentStatus2
                                        + '"><strong>'
                                        + currentStatus2
                                        + '</strong>'
                                    );
                                }
                            }
                        }
                    }
                    objContact.find('.js-CPTemp').remove();
                    objContact.append('<div class="js-CPTemp"></div>');
                    objContact.children('.js-CPTemp').hide().append(obj);
                    $.fancybox.close();
                }
                return false;
            }

            //проверка обязательных полей
            if (objSend['CALC']) {
                var isError = false;
                obj.find('.error').removeClass('error');
                obj.find('.Form__error').remove();
                obj.find('.js-CP-CalcBox .js-ContactRequired:visible:not([disabled=disabled])').each(function(){
                    if ($.trim($(this).val()).length <= 0) {
                        isError = true;
                        if (!$(this).is('select')) {
                            $(this).addClass('error');
                        }
                        $(this).after('<span class="Form__error">Заполните поле «'
                            + obj.find('label[for=' + $(this).attr('id') + '] .field__title').html()
                            + '»</span>');
                        setAutoCorrection($(this));
                    }
                });
                if (isError) {
                    obj.find('.error:first').focus();
                    return false;
                }
            }

            //добавляем поля формы в данные для отправки
            obj.find('input, select, textarea').filter(':not([disabled=disabled])').each(function(){
                var name = $(this).attr('name');
                if (name) {
                    if ((!$(this).is('[type=radio]')
                        && !$(this).is('[type=checkbox]'))
                        || $(this).is(':checked')) {
                        objSend[name] = $(this).val();
                    }
                }
            });
        }
    }

    $.ajax({
        url: '/ajax/desk/contacts.php',
        type: 'POST',
        data: objSend,
        dataType: 'json',
        success: function(result) {
            if (result['error'] != null) {
                alert(result['error']);
            } else if (result['html'] != null) {
                var objHtml = $(result['html']);
                if (!isNewClient && objContact) {
                    $('body').append(objContact);
                    objContact.hide();
                }
                objHtml.find('.js-CP-Calc').click(function(){
                    ContactCalcForm(objContact, {CALC: 1}, objHtml);
                    return false;
                });
                objHtml.find('.js-CP-Save').click(function(){
                    ContactCalcForm(objContact, {SAVE: 1}, objHtml);
                    return false;
                });
                objHtml.find('.js-CP-Cancel').click(function(){
                    if (!isNewClient && objContact) {
                        objContact.show();
                        $.fancybox({
                            content: objContact,
                            centerOnScroll: false,
                            padding: 0,
                            modal: true,
                            onStart: function () {
                                if (fancyboxStartPos >= 0) {
                                    $('html, body').scrollTop(fancyboxStartPos);
                                }
                            }
                        });
                    } else {
                        $.fancybox.close();
                    }
                    return false;
                });
                objHtml.find('[name=UF_STAFF_OFFICE], [name=UF_STAFF_STORE], [name=UF_STAFF_OTHER]').blur(function(){
                    var summ = 0;
                    objHtml.find('[name=UF_STAFF_OFFICE], [name=UF_STAFF_STORE], [name=UF_STAFF_OTHER]').each(function(){
                        if ($(this).val() > 0) {
                            summ += parseInt($(this).val());
                        }
                    });
                    objHtml.find('.js-CP-UserCount').val(summ);
                });
                objHtml.find('.js-CP-CalcBox').find('input, select, textarea').change(function(){
                    objHtml.find('[name=UF_POTENTIAL_A]').val('');
                    objHtml.find('.js-CP-UF_POTENTIAL_A').html('');
                    objHtml.find('[name=UF_POTENTIAL_U]').val('');
                    objHtml.find('.js-CP-UF_POTENTIAL_U').html('');
                });
                objHtml.find('[name=UF_GOODS_OFFICE_U], [name=UF_PAPPER_U],'
                    + ' [name=UF_EQUIPMENT_U], [name=UF_CONSUMABLES_U],'
                    + ' [name=UF_FURNITURE_U], [name=UF_HOUSEHOLD_U],'
                    + ' [name=UF_SCHOOL_U]').each(function(){
                    $(this).attr('data-value', $(this).val());
                }).blur(function(){
                    var lastTd = $(this).parents('tr').find('td:last');
                    if ($(this).attr('data-value') !== $(this).val()) {
                        lastTd.find('input').addClass('js-ContactRequiredfield--error error');
                        if (lastTd.find('.Form__error').length === 0) {
                            lastTd.append('<span class="Form__error">Заполните поле «Комментарий»</span>');
                        }
                        setAutoCorrection(lastTd.find('input'));
                    } else {
                        lastTd.find('input').removeClass('js-ContactRequiredfield--error error');
                        lastTd.find('.Form__error').remove();
                    }

                    var summ = 0;
                    objHtml.find('[name=UF_GOODS_OFFICE_U], [name=UF_PAPPER_U],'
                        + ' [name=UF_EQUIPMENT_U], [name=UF_CONSUMABLES_U],'
                        + ' [name=UF_FURNITURE_U], [name=UF_HOUSEHOLD_U],'
                        + ' [name=UF_SCHOOL_U]').each(function(){
                        if ($(this).val() > 0) {
                            summ += parseInt($(this).val());
                        }
                    });
                    objHtml.find('[name=UF_POTENTIAL_U]').val(summ);
                    objHtml.find('.js-CP-UF_POTENTIAL_U').html(summ);
                });

                $.fancybox({
                    content: objHtml,
                    centerOnScroll: false,
                    padding: 0,
                    modal: !('VIEW' in objSend),
                    showCloseButton: false,
                    onStart: function () {
                        if (fancyboxStartPos >= 0) {
                            $('html, body').scrollTop(fancyboxStartPos);
                        }
                    }
                });
            } else {
                alert('Ошибка при выполнении запроса');
            }
        }
    });

    return false;
}


//геолокация
function GetGeoPosition(success, error){
    if (window.geoInterval) {
        clearInterval(window.geoInterval);
    }
    if (window.geoTimeout) {
        clearInterval(window.geoTimeout);
    }
    if (navigator.geolocation && document.location.protocol.indexOf('https') >= 0) {
        window.geoCoords = false;
        window.geoInterval = window.setInterval(function(){
            if (window.geoCoords) {
                if (success && typeof(success) === 'function') {
                    clearInterval(window.geoInterval);
                    clearTimeout(window.geoTimeout);
                    success(window.geoCoords);
                }
            }
        }, 500);
        window.geoTimeout = window.setTimeout(function(){
            clearInterval(window.geoInterval);
            if (window.geoCoords) {
                if (success && typeof(success) === 'function') {
                    success(window.geoCoords);
                    window.geoCoords = false;
                }
            } else if (error && typeof(error) === 'function') {
                error();
            }
        }, !!window.geoFirstTry ? 1000 : 30000);
        //первый раз пробуем определить с высокой точностью
        navigator.geolocation.getCurrentPosition(
            function(position){
                window.geoCoords = position;
            },
            function(){
                //в случае неудачи определяем с низкой точностью
                navigator.geolocation.getCurrentPosition(
                    function(position){
                        window.geoCoords = position;
                    },
                    function(){},
                    {
                        enableHighAccuracy: false,
                        timeout: 30000
                    }
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 30000
            }
        );
    } else {
        if (error && typeof(error) === 'function') {
            error({'code': 4, 'message': 'Ваш браузер не поддерживает геолокацию'});
        }
    }
}

//получение координат для события
function GetCoordsForEvent(success, error) {
    if ($('.js-routeAgent').length > 0 || $('.js-needGeoPosition').length > 0) {
        if (
            window.currentPagePosition !== undefined
            && window.currentPagePosition.timestamp > (new Date().getTime()) - 30000
        ) {
            //не прошло 30 секунд с прошлого определения координат
            if (success && typeof(success) === 'function') {
                success(window.currentPagePosition);
            }
        } else {
            GetGeoPosition(success, error);
        }
    } else {
        success(false);
    }
}

//создание события
function CreateGeoEvent(message, position, obj, callback) {
    if (message && message !== '') {
        var objSend = {
            'EVENT' : 'Y',
            'UF_NAME' : message
        };
        if (obj) {
            objSend = $.extend(objSend, obj);
        }
        if (
            position
            && position.coords
            && position.coords.accuracy
            && (Number(position.coords.accuracy) < 3000)
        ) {
            if (position.coords.accuracy) {
                objSend['ACCURACY'] = position.coords.accuracy;
            }
            if (position.coords.latitude) {
                objSend['LATITUDE'] = position.coords.latitude;
            }
            if (position.coords.longitude) {
                objSend['LONGITUDE'] = position.coords.longitude;
            }
        }
        var routesItemsList = $('.js-routesItemsList');
        if (routesItemsList.length > 0) {
            routesItemsList.addClass('Items--loading');
        }
        if (callback && typeof(callback) === 'function') {
            ReloadAjaxContent('', objSend, true, callback);
        } else {
            ReloadAjaxContent('', objSend, true, deskKorRoutes.initRoutePage);
        }
    }
}

// Табы
function initTabs() {
    var tabs = $('.js-tabs');
    if (!tabs.length) {
        return;
    }

    tabs.tabs({
        anchorHistory: false,
        onActivate: function (e, ui) {

            // Скрытие ТипТипов при переключении табов
            $('.TipTip__active').tipTip('hide');
        }
    });
}
function initTabsAnimate() {
    var tabs = $('.js-tabsAnimate');

    if (!tabs.length) {
        return;
    }

    tabs.tabs({
        anchorHistory: false,
        animation: true
    });
}
// ~ Табы

// выпадающие списки
function initDropdown() {
    $('.Dropdown').each(function() {
        var dropdownParams = {
            onClickListControl: function(event, ui) {
                $(this).trigger('dropdownSelect', ui);
            }
        };
        // не закрывать список
        if ($(this).attr('data-keep-open-selector')) {
            dropdownParams['keepOpenSelector'] = $(this).attr('data-keep-open-selector');
        }
        if ($(this).attr('data-keep-open-target')) {
            dropdownParams['keepOpenTarget'] = $(this).attr('data-keep-open-target');
        }
        // инициализация кнопки
        $(this).find('.Dropdown__trigger').button();
        // инициализация
        $(this)
            .dropdown(dropdownParams)
            .on('dropdownClose', function() {
                $(this)
                    .dropdown('instance')
                    .close();
            })
            .on('dropdownStopChange', function() {
                $(this)
                    .dropdown('instance')
                    .triggerActions('stopChangeTrigger', true);
            })
            .on('dropdownResumeChange', function() {
                $(this)
                    .dropdown('instance')
                    .triggerActions('changeTrigger', true);
            })
            .on('dropdownStartLoading', function() {
                $(this)
                    .find('.Dropdown__trigger')
                    .button('instance')
                    .option('loading', true);
            })
            .on('dropdownStopLoading', function() {
                $(this)
                    .find('.Dropdown__trigger')
                    .button('instance')
                    .option('loading', false);
            });
        })
        .filter('.js-dropdownUnselectable')
        .trigger('dropdownStopChange');
}


//инициализация скриптов после обновления ajax
function InitGeoPage() {
    var geoTpSelect = $('.js-filterObjectSubject-TP > .js-RichSelect');
    if (geoTpSelect.length > 0) {
        geoTpSelect.on('change', '.js-multiselect', function(){
            getRoutesList($(this).parents('.js-RichSelect'));
        });
        getRoutesList(geoTpSelect);
    }
    if (window.ymaps !== undefined) {
        initmaps(window.ymaps);
    }
    var richSelect = $('.js-RichSelect');
    if (richSelect.length > 0) {
        getMultiSelected(richSelect);
    }
}

//конструктор карт
function initmaps(ymaps) {
    // Создание макетов меток
    var icon_Layouts = [];
    var icon_client_Layout = [];
    var geoPoints = $('.js-geoEventsPoints');
    var usedGeoPoints = [];
    //массив направлений для смещения точек
    var correctionGeoPoints = [
        [0.0001, 0],	// вправо
        [0.000075, -0.000037], // вправо вниз
        [0, -0.00005],	// вниз
        [-0.000075, -0.000037], // влево вниз
        [-0.0001, 0],	// влево
        [-0.000075, 0.000037], // влево вверх
        [0, 0.00005],	// вверх
        [0.000075, 0.000037] //вправо вверх
    ];

    var minLongitute = 99.9999;
    var minLatitute = 99.9999;
    var maxLongitute = 0;
    var maxLatitute = 0;
    //точки маршрутов
    window.geoMapRoutes = {};
    geoPoints.each(function(){
        var objPoint = $(this).val();
        if (objPoint.length > 0) {
            eval('objPoint = ' + objPoint + ';');
            if (objPoint['NUMBER'] && objPoint['NUMBER'].length > 0) {
                var numberID = objPoint['NUMBER'];
                icon_Layouts[numberID] = ymaps.templateLayoutFactory.createClass('<div style="background-color: #1782aa; color:#fff; width: 16px; height: 16px; position: absolute; left: -8px; top: -8px; text-align: center; border: 0px solid #fff; border-radius: 8px;">' + numberID + '</div>');
            }
            if (objPoint['AGENT'] && objPoint['AGENT'].length > 0) {
                if (!(!!window.geoMapRoutes[objPoint['AGENT']])) {
                    window.geoMapRoutes[objPoint['AGENT']] = [];
                }
                window.geoMapRoutes[objPoint['AGENT']].push(objPoint);
            }
        }
    });
    var icon_Layouts_empty = ymaps.templateLayoutFactory.createClass('<div style="background-color: #1782aa; color:#fff; width: 16px; height: 16px; position: absolute; left: -8px; top: -8px; text-align: center; border: 0px solid #fff; border-radius: 8px;">&nbsp;</div>');
    //точки клиентов
    window.geoMapClients = [];
    var geoPointsClients = $('.js-geoEventsClients');
    geoPointsClients.each(function(){
        var objPoint = $(this).val();
        if (objPoint.length > 0) {
            eval('objPoint = ' + objPoint + ';');
            if (objPoint['NUMBER'] && objPoint['NUMBER'].length > 0) {
                var numberID = objPoint['NUMBER'];
                icon_client_Layout[numberID] = ymaps.templateLayoutFactory.createClass('<div style="background-color: #e43e3e; color:#fff; width: 24px; height: 24px; position: absolute; left: -12px; top: -12px; text-align: center; border: 0px solid #fff; border-radius: 12px; line-height: 24px;">' + numberID + '</div>');
            }
            if (objPoint['ADDRESS'] && objPoint['ADDRESS'].length > 0) {
                window.geoMapClients.push(objPoint);
            }
        }
    });

    var icon_client_Layout_empty = ymaps.templateLayoutFactory.createClass('<div style="background-color: #e43e3e; color:#fff; width: 24px; height: 24px; position: absolute; left: -12px; top: -12px; text-align: center; border: 0px solid #fff; border-radius: 12px;">&nbsp;</div>');
    // Создание макета балуна
    var MyBalloonLayout = ymaps.templateLayoutFactory.createClass(
        '<div class="Bubble onActive active top">' +
        '<div class="Bubble__content" style="word-break: break-word;">' +
        '$[[options.contentLayout observeSize minWidth=235 maxWidth=235 maxHeight=350]]' +
        '</div>' +
        '</div>',
        {
            /**
             * Строит экземпляр макета на основе шаблона и добавляет его в родительский HTML-элемент.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#build
             * @function
             * @name build
             */
            build: function () {
                this.constructor.superclass.build.call(this);

                this._$element = $('.Bubble', this.getParentElement());
            },
            /**
             * Удаляет содержимое макета из DOM.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/layout.templateBased.Base.xml#clear
             * @function
             * @name clear
             */
            clear: function () {

                this.constructor.superclass.clear.call(this);
            },
            /**
             * Закрывает балун при клике на крестик, кидая событие "userclose" на макете.
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/IBalloonLayout.xml#event-userclose
             * @function
             * @name onCloseClick
             */
            onCloseClick: function (e) {
                e.preventDefault();

                this.events.fire('userclose');
            },
            /**
             * Используется для автопозиционирования (balloonAutoPan).
             * @see https://api.yandex.ru/maps/doc/jsapi/2.1/ref/reference/ILayout.xml#getClientBounds
             * @function
             * @name getShape
             * @returns {Number[][]} Координаты левого верхнего и правого нижнего углов шаблона относительно точки
             *     привязки.
             */
            getShape: function () {
                if(!this._isElement(this._$element)) {
                    return MyBalloonLayout.superclass.getShape.call(this);
                }

                var position = this._$element.position();
                return new ymaps.shape.Rectangle(new ymaps.geometry.pixel.Rectangle([
                    [position.left, position.top], [
                        position.left + this._$element.find('.Bubble__content')[0].offsetWidth,
                        position.top + this._$element.find('.Bubble__content')[0].offsetHeight
                    ]
                ]));
            },
            /**
             * Проверяем наличие элемента (в ИЕ и Опере его еще может не быть).
             * @function
             * @private
             * @name _isElement
             * @param {jQuery} [element] Элемент.
             * @returns {Boolean} Флаг наличия.
             */
            _isElement: function (element) {
                return element && element[0];
            }
        }
    );
    // Создание вложенного макета содержимого балуна.
    var MyBalloonContentLayout = ymaps.templateLayoutFactory.createClass(
        '$[properties.balloonHeader]' +
        '$[properties.balloonContent]'
    );

    //генератор карт
    function generateMaps() {
        //проверка, определена ли карта, и создание новой
        if (window.deskGeoEventsMap !== undefined) {
            delete window.deskGeoEventsMap;
        }
        $('#deskGeoEventsMapElement').html('');
        window.deskGeoEventsMap = new ymaps.Map($('#deskGeoEventsMapElement')[0], {
            center: [51.697198, 39.272664],
            zoom: 12,
            controls: ['zoomControl', 'rulerControl']
        }, {
            avoidFractionalZoom: false,
            autoFitToViewport: 'always',
            maxZoom: 20
        });
        window.deskGeoEventsMap.events.add('click', function (e) {
            if (e.get('target') === window.deskGeoEventsMap) { // Если клик был на карте, а не на геообъекте
                window.deskGeoEventsMap.balloon.close();
            }
        });
        //метки маршрута
        if (window.geoMapRoutes !== undefined) {
            for (var agent in window.geoMapRoutes) {
                if (window.geoMapRoutes.hasOwnProperty(agent) && window.geoMapRoutes[agent].length > 0) {
                    var polyline = [];
                    for (var p = 0; p < window.geoMapRoutes[agent].length; p++) {
                        var arPoint = window.geoMapRoutes[agent][p];
                        if (
                            arPoint['COORDS']
                            && arPoint['COORDS'].length > 0
                            && arPoint['DATE']
                            && arPoint['NAME']
                        ) {
                            var coords = arPoint['COORDS'].split(',', 2);
                            if (coords[0] && coords[1]) {
                                coords = checkUsedCoords([coords[1], coords[0]]);
                                polyline.push(coords);
                                var header = '<div style="box-sizing: border-box; width: 100%; padding: 10px; text-align: left; font-size: 12px; border-bottom: 1px solid #d0d0d0;">' + arPoint['DATE'] + '</div>'
                                    + '<div style="box-sizing: border-box; width: 100%; padding: 10px; text-align: left; font-size: 12px; border-bottom: 1px solid #d0d0d0;">' + arPoint['NAME'] + '</div>';
                                var address = '';
                                if (arPoint['ADDRESS'] && arPoint['ADDRESS'].length > 0) {
                                    address = arPoint['ADDRESS'];
                                } else {
                                    address = coords[0] + ',' + coords[1];
                                }
                                var content = '<div style="box-sizing: border-box; width: 100%; padding: 10px 10px 5px 10px; text-align: left; font-size: 12px;">' + address + '</div>';
                                if (arPoint['ACCURACY'] && arPoint['ACCURACY'].length > 0) {
                                    content += '<div style="box-sizing: border-box; width: 100%; padding: 0px 10px 10px 10px; text-align: left; font-size: 12px; color: #a0a0a0;">' + arPoint['ACCURACY'] + ' м</div>';
                                }
                                if (arPoint['CLIENT_ADDRESS'] && arPoint['CLIENT_ADDRESS'].length > 0) {
                                    content += '<div style="box-sizing: border-box; width: 100%; padding: 10px; text-align: left; font-size: 12px; border-top: 1px solid #d0d0d0;">Адрес КЛ:</div>'
                                        + '<div style="box-sizing: border-box; width: 100%; padding: 0px 10px 10px 10px; text-align: left; font-size: 12px;">' + arPoint['CLIENT_ADDRESS'] + '</div>';
                                }
                                if (
                                    arPoint['NUMBER']
                                    && icon_Layouts[arPoint['NUMBER']]
                                ) {
                                    createRouteMark(coords, window.deskGeoEventsMap, header, content, icon_Layouts[arPoint['NUMBER']]);
                                } else if (icon_Layouts_empty) {
                                    createRouteMark(coords, window.deskGeoEventsMap, header, content, icon_Layouts_empty);
                                }
                            }
                        }
                    }
                    //соединительная линия
                    var myPolyline = new ymaps.Polyline(
                        polyline,
                        {},
                        {
                            strokeWidth: 3,
                            strokeColor: '#1782AA'
                        }
                    );
                    window.deskGeoEventsMap.geoObjects.add(myPolyline);
                }
            }
        }
        //метки клиентов
        if (window.geoMapClients !== undefined) {
            for (var client = 0; client < window.geoMapClients.length; client++) {
                var arPoint = window.geoMapClients[client];
                if (
                    arPoint['ADDRESS']
                    && arPoint['ADDRESS'].length > 0
                    && arPoint['CODE']
                    && arPoint['NAME']
                ) {
                    var header = '<div style="box-sizing: border-box; width: 100%; padding: 10px 10px 5px 10px; text-align: left; font-size: 12px;">' + arPoint['NAME'] + '</div>'
                        + '<div style="box-sizing: border-box; width: 100%; padding: 0 10px 10px 10px; text-align: left; font-size: 12px; color: #a0a0a0; border-bottom: 1px solid #d0d0d0;">' + arPoint['CODE'] + '</div>';
                    if (arPoint['MEET'] && arPoint['MEET'].length > 0) {
                        header += '<div style="box-sizing: border-box; width: 100%; padding: 10px 10px 5px 10px; text-align: left; font-size: 12px;">Последняя встреча</div>'
                            + '<div style="box-sizing: border-box; width: 100%; padding: 0 10px 10px 10px; text-align: left; font-size: 12px; border-bottom: 1px solid #d0d0d0;">' + arPoint['MEET'] + '</div>';
                    }
                    var content = '<div style="box-sizing: border-box; width: 100%; padding: 10px; text-align: left; font-size: 12px;">' + arPoint['ADDRESS'] + '</div>';
                    var idpRegion = arPoint['IDP_REGION'] ? arPoint['IDP_REGION'] : 'Воронежская область';
                    if (
                        arPoint['NUMBER']
                        && icon_client_Layout[arPoint['NUMBER']]
                    ) {
                        createClientMark(arPoint['ADDRESS'], window.deskGeoEventsMap, header, content, idpRegion, icon_client_Layout[arPoint['NUMBER']]);
                    } else if (icon_client_Layout_empty) {
                        createClientMark(arPoint['ADDRESS'], window.deskGeoEventsMap, header, content, idpRegion, icon_client_Layout_empty);
                    }
                }
            }
        }
        window.setTimeout(function(){
            window.deskGeoEventsMap.setBounds([[minLatitute, minLongitute],[maxLatitute, maxLongitute]], { 'zoomMargin': 2, 'checkZoomRange': true });
        }, 1000);
    }

    //генератор меток маршрута
    function createRouteMark(mycoords, map, header, content, icon) {
        if (mycoords.length > 0 && mycoords[0] > 0 && mycoords[1] > 0) {
            var mark = new ymaps.Placemark(mycoords, {
                balloonHeader: header,
                balloonContent: content
            }, {
                balloonShadow: false,
                balloonLayout: MyBalloonLayout,
                balloonContentLayout: MyBalloonContentLayout,
                balloonPanelMaxMapArea: 0,
                hideIconOnBalloonOpen: false,
                // дополнительно смещаем балун, для открытия над иконкой.
                balloonOffset: [-118, 0],
                iconLayout: icon,
                // Описываем фигуру активной области "Полигон".
                iconShape: {
                    type: 'Polygon',
                    coordinates: [
                        // Описание внешнего контура полигона в виде массива координат.
                        [[-8,-8],[8,-8],[8,8],[-8, 8]]
                    ]
                }
            });
            map.geoObjects.add(mark);
            return false;
        }
    }

    //генератор меток клиентов
    function createClientMark(address, map, header, content, idpRegion, icon) {
        var arQuery = address.split(',');
        //первый в адресе - индекс
        if (arQuery[0] && !/[^0-9]/ig.test($.trim(arQuery[0]))) {
            arQuery = address.split(',');
            arQuery.shift();
        }
        var query = arQuery.join(',');
        //подстановка области, для устранения возможных ошибок в определении адреса
        if (query.indexOf('обл') <= 0
            && query.toLowerCase().indexOf('респ') <= 0
            && query.indexOf('край') <= 0
            && query.indexOf('округ') <= 0
            && idpRegion.length > 0) {
            if (idpRegion.toString().indexOf(',') < 0) {
                idpRegion += ', ';
            }
            query = idpRegion + query;
        }
        //определяем местоположение по адресу
        ymaps.geocode(query, {
            results: 1
        }).then(function (res) {
            // получаем координаты
            var coords = res.geoObjects.get(0).geometry.getCoordinates();
            if (coords[0] && coords[1]) {
                coords = checkUsedCoords(coords);
                var mark = new ymaps.Placemark(coords, {
                    balloonHeader: header,
                    balloonContent: content
                }, {
                    balloonShadow: false,
                    balloonLayout: MyBalloonLayout,
                    balloonContentLayout: MyBalloonContentLayout,
                    balloonPanelMaxMapArea: 0,
                    hideIconOnBalloonOpen: false,
                    // дополнительно смещаем балун, для открытия над иконкой.
                    balloonOffset: [-118, 0],
                    iconLayout: icon,
                    // Описываем фигуру активной области "Полигон".
                    iconShape: {
                        type: 'Polygon',
                        coordinates: [
                            // Описание внешнего контура полигона в виде массива координат.
                            [[-12,-12],[12,-12],[12,12],[-12, 12]]
                        ]
                    }
                });
                map.geoObjects.add(mark);
            }
        });
        return true;
    }

    //проверка и смещение метки на карте
    function checkUsedCoords(coords) {
        if (
            coords
            && coords[0]
            && coords[1]
            && usedGeoPoints
        ) {
            var baseCoords = [coords[0], coords[1]];
            var returnCoords = baseCoords;
            var coordsHash = Number(baseCoords[0]).toFixed(5) + '#' + Number(baseCoords[1]).toFixed(5);
            var multiply = 1;
            if (correctionGeoPoints) {
                while (usedGeoPoints.indexOf(coordsHash) >= 0) {
                    for (var i = 0, ilen = correctionGeoPoints.length; i < ilen; i++) {
                        var curCorrection = correctionGeoPoints[i];
                        var curCoords = [baseCoords[0], baseCoords[1]];
                        curCoords[1] = Number(curCoords[1]) + (multiply * Number(curCorrection[0])); //longitude
                        curCoords[0] = Number(curCoords[0]) + (multiply * Number(curCorrection[1])); //latitude
                        if (!(usedGeoPoints.indexOf(Number(curCoords[0]).toFixed(5) + '#' + Number(curCoords[1]).toFixed(5)) >= 0)) {
                            returnCoords = curCoords;
                            coordsHash = Number(curCoords[0]).toFixed(5) + '#' + Number(curCoords[1]).toFixed(5);
                            break;
                        } else if ((ilen - i) === 1) {
                            multiply++;
                        }
                    }
                }
            }
            usedGeoPoints.push(coordsHash);

            if (minLongitute > returnCoords[1]) {
                minLongitute = returnCoords[1];
            }
            if (maxLongitute < returnCoords[1]) {
                maxLongitute = returnCoords[1];
            }
            if (minLatitute > returnCoords[0]) {
                minLatitute = returnCoords[0];
            }
            if (maxLatitute < returnCoords[0]) {
                maxLatitute = returnCoords[0];
            }

            return returnCoords;
        }
        return false;
    }

    //заполняем карты
    generateMaps();

}


//автообновление списка маршрутов
function getRoutesList(select) {
    var routeListSelect = $('.js-filterGeoRoutesList select');
    if (routeListSelect.length <= 0) {
        return;
    }
    if (!!window.getRouteListTimeout) {
        clearTimeout(window.getRouteListTimeout);
    }
    window.getRouteListTimeout = window.setTimeout(function(){
        var allElement = routeListSelect.find('option').first();
        var routeList = routeListSelect.find('option').filter(function(item){
            return !$(item).is(allElement);
        });
        if (select.length > 0 && routeList.length > 0) {
            if (allElement.length > 0) {
                allElement.hide().prop('selected', false);
            }
            routeListSelect.addClass('Blocked');
            var selected = [];
            select.find('.js-multiselect.RichSelect__option--active.js-multiselectVisible').each(function(){
                if (selected.indexOf($(this).find('input').val()) < 0) {
                    selected.push($(this).find('input').val());
                }
            });
            var isSelected = false;
            if (selected.length === 1) {
                var agentLogin = selected[0];
                if (agentLogin && agentLogin.length > 0) {
                    var countRoutes = 0;
                    var routeNumberList = [];
                    var routesData = routeListSelect.attr('data-route-to-agent');
                    if (routesData.length > 0) {
                        routesData.split(';').forEach(function(val, idx, arr){
                            var curRoute = val.split('#');
                            if (curRoute[0] && curRoute[1] && curRoute[1].indexOf(agentLogin) >= 0) {
                                routeNumberList.push(curRoute[0]);
                            }
                        });
                    }
                    routeList.each(function () {
                        if ($(this).attr('value')) {
                            if (routeNumberList.indexOf($(this).attr('value')) >= 0) {
                                $(this).addClass('js-selectVisible').show();
                                countRoutes++;
                                if ($(this).prop('selected')) {
                                    isSelected = true;
                                }
                            } else {
                                $(this).removeClass('js-selectVisible').hide().prop('selected', false);
                            }
                        }
                    });
                    if (countRoutes > 0) {
                        routeListSelect.removeClass('Blocked');
                        if (countRoutes === 1) {
                            isSelected = true;
                            routeListSelect.find('.js-selectVisible').prop('selected', true);
                        }
                    }
                }
            }
            if (!isSelected && allElement.length > 0) {
                allElement.show().prop('selected', true);
            }
        } else if (allElement.length > 0) {
            allElement.show();
        }
    }, 50);
}

//определение мобильного браузера
function isMobile() {
    return navigator.userAgent.match(/Android|BlackBerry|iPhone|iPad|iPod|Opera.Mini|IEMobile/ig);
}

//загрузка файла из скрытого фрейма
function downloadURL(url)
{
    var hiddenIFrameID = 'hiddenDownloader',
        iframe = document.getElementById(hiddenIFrameID);
    if (iframe === null) {
        iframe = document.createElement('iframe');
        iframe.id = hiddenIFrameID;
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }
    iframe.src = url;
}
//загрузка по клику на ссылку с атрибутом download
function downloadDirectLink(url)
{
    var link = $('<a href="' + url + '" style="display: none;" download>&nbsp;</a>');
    $('body').append($(link));
    $(link)[0].click();
    $(link).remove();
}
//скачивание отчетов по клиентам
function generateClientReport(objSend, elementButton, directLink, dUrl) {
    if (elementButton) {
        var urlParams = {};
        if (!!objSend.action) {
            urlParams.action = objSend.action;
        }
        if (!!objSend.date_from) {
            urlParams.date_from = objSend.date_from;
        }
        if (!!objSend.date_to) {
            urlParams.date_to = objSend.date_to;
        }
        $.ajax({
            url: dUrl ? dUrl : ('/ajax/desk/reports.php?' + $.param(urlParams)),
            type: 'POST',
            data: objSend,
            dataType: 'json',
            success: function (result) {
                if (result != null && result['url'] != null) {
                    if (directLink) {
                        downloadDirectLink(result['url']);
                    } else {
                        downloadURL(result['url']);
                    }
                } else if (result != null && result['ERROR'] != null) {
                    if (result['ERROR'] === 'EMPTY_RESULT_REGISTRATION') {
                        ShowTipTipError(elementButton, 'Нет данных за заданный период');
                    } else {
                        alert(result['ERROR']);
                    }
                } else {
                    $(elementButton).after('<p class="crmError crmXLSUploading">Произошла ошибка при выгрузке отчёта, попробуйте ещё раз</p>');
                }
            }, error: function (xhr, str) {
                $(elementButton).after('<p class="crmError crmXLSUploading">Слишком большой массив данных, измените параметры отчета.</p>');
            },
            complete: function () {
                $(elementButton).removeClass('Spinner--active').attr('disabled', false);
            }
        });
    }
}

//подсказка для количества оставшихся символов
function GetLimitedHint(input, hint, errorClass) {
    if ($(input).length > 0 && $(hint).length > 0) {
        if (errorClass) {
            $(hint).removeClass(errorClass);
        }
        var maxCount = $(input).attr('data-max-count');
        if (maxCount > 0) {
            var countVal = $(input).val().length;
            $(hint).html(countVal + ' из ' + maxCount + ' символов');
            if (countVal > maxCount && errorClass) {
                $(hint).addClass(errorClass);
            }
        }
    }
}

//функция определяет ближайшее кратное мин партии для указаного значения
function GetMinPart(a, min_part)
{
    var result = [];
    var val = parseInt(a);
    min_part = parseInt(min_part);
    if (min_part <= 1)
        return;
    if (val <= min_part) {
        result[result.length] = min_part.toString();
    } else  {
        var min_start = min_part * Math.floor(val / min_part);
        var min_end = min_part * Math.ceil(val / min_part);
        result[result.length] = min_start.toString();
        if (min_end !== min_start) {
            result[result.length] = min_end.toString();
        }
    }
    return result;
}

// Тормозилка
function throttle(func, ms) {
    var isThrottled = false,
        savedArgs,
        savedThis;

    function wrapper() {
        if (isThrottled) {
            savedArgs = arguments;
            savedThis = this;
            return;
        }
        func.apply(this, arguments);
        isThrottled = true;
        setTimeout(function() {
            isThrottled = false;
            if (savedArgs) {
                wrapper.apply(savedThis, savedArgs);
                savedArgs = savedThis = null;
            }
        }, ms);
    }
    return wrapper;
}

// Координаты элемента относительно страницы
function getCoords(elem) {
    var box = elem.getBoundingClientRect();
    return {
        top: box.top + pageYOffset,
        left: box.left + pageXOffset
    };
}

// Изменения поисковой выдачи
function searchChangesScrollPosition() {
    // Координата нижней границы экрана (с припуском под скроллбар)
    var screenBottomSidePosition = document.documentElement.clientHeight + window.pageYOffset - 20;
    var scrollProduct = document.querySelector('.js-scrollProducts');
    var tablePosition = getCoords(scrollProduct).top;
    var tableHeight = scrollProduct.clientHeight;

    if (screenBottomSidePosition < tablePosition + tableHeight) {
        $('.js-scrollWidthTable').css({
            position: 'fixed',
            right: (document.documentElement.clientWidth - 898) / 2 + 'px'
        });
    } else {
        $('.js-scrollWidthTable').css({
            position: 'static'
        });
    }
}

// Установка ширины таблицы и скролла
function searchChangesSetWidths(columnsCount) {
    if (columnsCount > 1) {
        var cssWidth = columnsCount * 292 + 'px';
        $('.js-scrollWidth').css('width', cssWidth);
    }
    // Задаём ширину .SearchChanges__productsWrapper
    if (columnsCount === 2) {
        $('.js-scrollWrapper').css('width', '606px');
    } else {
        $('.js-scrollWrapper').css('width', 'auto');
    }
    // Переместить скролл, если нужно
    searchChangesScrollPosition();
    // Скрыть скролл, если 3 колонки или меньше, иначе отобразить
    if (columnsCount <= 3) {
        $('.js-scrollWidthTable').hide();
    } else {
        $('.js-scrollWidthTable').show();
    }
}

//сохранение даты запланированной встречи
function SavePlannedMeetingDate(dateStr, dtpicker, dinput)
{
    if ($(dinput).length > 0) {
        var clientCode = $(dinput).attr('data-client');
        if (clientCode.length > 0) {
            var pBlock = $(dinput).parents('.js-PlannedBlock');
            if (pBlock.length > 0) {
                var button = pBlock.find('.js-PlannedButton');
                if (button.is('.js-PlannedTipChange')) {
                    button = [];
                    if ($('.TipTip__active').length > 0) {
                        button = $('.js-PlannedTipChange:visible');
                    }
                }
                var objSend = {
                    'ajaxContent': 'Y',
                    'PLAN': 'Y',
                    'CLIENT': clientCode,
                    'DATE': dateStr
                };
                if (button.length > 0) {
                    button.addClass('Spinner--active').attr('disabled', true);
                    if (button.attr('data-res') && button.attr('data-res').length > 0) {
                        objSend['PLAN_ID'] = button.attr('data-res');
                    }
                }
                $.ajax({
                    url: '/desk/clients/routes/',
                    type: 'POST',
                    data: objSend,
                    dataType: 'json',
                    success: function(result) {
                        if (result['success'] != null && result['success'].length > 0) {
                            var html = '<a class="RouteMeet__date RouteMeet__date--link js-tipTipClick js-PlannedTip" href="#">' + dateStr +
                                '<div class="TipTip__donor">' +
                                '<div class="RouteMeetChange js-PlannedTipContent">' +
                                '<button data-res="' + result['success'] + '" class="btnMain Spinner--potential js-PlannedTipChange js-PlannedButton">' +
                                '<span class="Spinner"></span>Изменить</button>' +
                                '<button data-res="' + result['success'] + '" class="btnError Spinner--potential js-PlannedTipDelete">' +
                                '<span class="Spinner"></span>Удалить</button></div></div></a>';
                            $('.js-PlannedBlock[data-client="' + objSend.CLIENT + '"]').each(function () {
                                $(this).find('.js-PlannedButton, .js-PlannedTip').remove();
                                $(this).append(html);
                            });
                        } else if (result['error'] != null && result['error'].length > 0) {
                            alert(result['error']);
                        }
                    },
                    complete: function() {
                        if (button.length > 0) {
                            button.removeClass('Spinner--active').attr('disabled', false);
                        }
                        var tipActive = $('.TipTip.TipTip--is-active');
                        if (tipActive.length > 0) {
                            tipActive.remove();
                        }
                    }
                });
            }
        }
    }
}

//событие создания карточки клиента
function SetEventAndSubmit(form) {
    if ($(form).length > 0) {
        GetCoordsForEvent(function(position){
            if (position) {
                if (position.coords.latitude && position.coords.longitude && position.coords.accuracy) {
                    if ($(form).find('[name=GEO_EVENT]').length > 0) {
                        $(form).find('[name=GEO_EVENT]').remove();
                    }
                    var elem = '<input type="hidden" name="GEO_EVENT" value="' + position.coords.longitude + ',' + position.coords.latitude + '#' + position.coords.accuracy + '">';
                    $(form).prepend(elem);
                }
            }
            $(form).submit();
        }, function(){
            if (('geoFirstTry' in window) && window.geoFirstTry) {
                window.geoFirstTry = false;
                $(form).submit();
            } else {
                var contactAddButton = $('.js-contactAddButton');
                if (contactAddButton.length > 0) {
                    ShowTipTipError(contactAddButton, '<h4 style="margin: 0 0 .4em">Не удалось определить ваше местоположение</h4>Через 30 секунд повторите попытку');
                } else {
                    alert('Не удалось определить ваше местоположение. Через 30 секунд повторите попытку');
                }
                window.geoFirstTry = true;
            }
        });
    }
    return false;
}

//функция проверки email на корректность
function CheckEmail(objEmail, callback, shortError = false) {
    if ($(objEmail).length) {
        var mail = $(objEmail).val();
        if (mail !== '' && objEmail.prop('checkEmail') !== mail) {
            $(objEmail).removeClass('error')
                .nextAll('.Form__error, .ErrorDetails').remove();
            objEmail.prop('checkEmail', false);
            if (objEmail.prop('ajaxCheckEmail')) {
                objEmail.prop('ajaxCheckEmail').abort();
            }
            objEmail.prop('ajaxCheckEmail', $.ajax({
                url: '/ajax/validate.php',
                type: 'POST',
                data: {
                    action: 'email',
                    value: mail
                },
                async: false,
                dataType: 'json',
                success: function(result) {
                    if (result['error'] != null) {
                        var html = '';
                        if (shortError) {
                            html += '<div class="Form__error">Некорректный адрес электронной почты</div>'
                        } else {
                            if ($(objEmail).is('.js-erpCheckEmail')) {
                                $(objEmail).closest('.Form__field').addClass('Form__field--error');
                                if (result['error'] === 's') {
                                    html += '<div class="Form__error"> Неверный e-mail. Возможные причины: <ul>'
                                        + '<li>Опечатка (лишний пробел, запятая и т.д.)</li>'
                                        + '<li>Лишнее слово "mailto:" перед адресом</li>'
                                        + '<li>Русские буквы в адресе</li></ul></div>';
                                } else if (result['error'] === 'n') {
                                    html += '<div class="Form__error"> E-mail не существует. Возможные причины: <ul>'
                                        + '<li>Опечатка после знака «@»</li>'
                                        + '<li>Внутренний e-mail компании не доступный для внешнего приема сообщений </li></ul></div>';
                                }
                            } else {
                                if (result['error'] === 's') {
                                    html += '<span class="Form__error">Неверный e-mail. Возможные причины:</span>'
                                        + '<div class="ErrorDetails"><ul class="ErrorDetails__list">'
                                        + '<li class="ErrorDetails__item">Опечатка (лишний пробел, запятая и т.д.)</li>'
                                        + '<li class="ErrorDetails__item">Лишнее слово "mailto:" перед адресом</li>'
                                        + '<li class="ErrorDetails__item">Русские буквы в адресе</li></ul></div>';
                                } else if (result['error'] === 'n') {
                                    html += '<span class="Form__error">E-mail не существует. Возможные причины:</span>'
                                        + '<div class="ErrorDetails"><ul class="ErrorDetails__list">'
                                        + '<li class="ErrorDetails__item">Опечатка после знака «@»</li>'
                                        + '<li class="ErrorDetails__item">Внутренний e-mail компании не доступный для внешнего приема сообщений </li></ul>'
                                        + '<label class="ErrorDetails__controls"><input type="checkbox" class="ErrorDetails__checkbox" /> Уверен, что e-mail заполнен правильно</label></div>';
                                }
                            }
                        }
                        $(objEmail).addClass('error').after(html);
                    }

                    objEmail.prop('checkEmail', mail);//метка что форма уже проверена

                    if (typeof callback === 'function') {
                        callback.call();
                    }
                }
            }));
        } else {
            if (mail === '') {
                objEmail.prop('checkEmail', true);
                $(objEmail).removeClass('error')
                    .nextAll('.Form__error, .ErrorDetails').remove();
            }
            if (typeof callback === 'function') {
                callback.call();
            }
        }
    }
    return false;
}

//функция проверки телефона на корректность
function checkFormFieldPhone($phone) {
    var isValid = true;
    $phone.each(function() {
        var $that = $(this),
            inputVal = $that.val();

        if ($that.prop('disabled')) {
            return true;
        }
        if ($that.is('.js-FormRequired') && !inputVal) {
            unsetFormFieldError($that);
            setFormFieldError($that, 'Обязательное поле');
            isValid = false;
        } else if ($that.is('.js-phoneMaskWithAjaxValidation') && $that.attr('data-error-text')) {
            setFormFieldError($that, $that.attr('data-error-text'));
            isValid = false;
        } else if (inputVal.length > 0
            && (inputVal.replace(/[^0-9]/g,'').length < 11)
        ) {
            setFormFieldError($that, 'Некорректный номер');
            isValid = false;
        }
    });

    return isValid;
}

//функции для работы персональных телефонов
function ClientPersonalPhoneSave(obj, client)
{
    var objForm = $(obj).parents('.js-foldingContent');
    $(obj).addClass('Spinner--active');
    $.ajax({
        url: document.location.href,
        type: 'POST',
        data: {
            'action': 'clientPersonalPhoneSave',
            'client' : client,
            'comment': $.trim(objForm.find('textarea').val())
        },
        dataType: 'json',
        success: function(result) {
            $(obj).removeClass('Spinner--active');
            if (result['error']) {
                alert(result['error']);
            } else {
                objForm.find('.js-clientCardPersonalPhoneValue').html(result['success']);
                if ($.trim(objForm.find('textarea').val()).length === 0) {
                    objForm.find('.js-clientPhoneButton').show();
                    objForm.find('.js-clientPhoneToggle').hide();
                } else {
                    objForm.find('.js-clientPhoneToggle').toggle();
                }
            }
        }
    });
}
function ClientPersonalPhoneEdit(obj, isCancel)
{
    var objForm = $(obj).parents('.js-foldingContent');
    objForm.find('textarea').val(objForm.find('.js-clientCardPersonalPhoneValue').text());
    if ($.trim(objForm.find('textarea').val()).length === 0) {
        objForm.find('.js-clientPhoneToggle').hide();
        if (isCancel) {
            objForm.find('.js-clientPhoneButton').show();
        } else {
            objForm.find('.js-clientPhoneButton').hide();
            objForm.find('.js-clientPhoneForm').show();
        }
    } else {
        objForm.find('.js-clientPhoneToggle').toggle();
    }
}
//обработка заметки в карточке клиента
function AddContactNotice(button) {
    $(button).hide();
    $('.js-clientNoticeEdit').show();
    $('.js-clientNoticeBlock').hide();
}
function CancelContactNotice() {
    if ($('.js-clientNoticeValue').text() !== '') {
        $('.js-clientNoticeToggle').toggle();
    } else {
        $('.js-clientNoticeToggle').hide();
        $('.js-clientNoticeAddButton').show();
    }
}
function EditContactNotice() {
    $('.js-clientNoticeArea').val($('.js-clientNoticeValue').text());
    $('.js-clientNoticeToggle').toggle();
}
function SaveContactNotice(button, client_id) {
    $(button).addClass('Spinner--active');
    var clientNotice = $.trim($('.js-clientNoticeArea').val());
    if (clientNotice !== '') {
        var data = {
            action: 'editClientCardNote',
            notice: clientNotice,
            client_id: client_id
        };
        ChangeNotice(data, function(){
            var editForm = $('.js-clientNoticeEdit');
            var showForm = $('.js-clientNoticeBlock');
            editForm.find('.Spinner--active').removeClass('Spinner--active');
            showForm.find('.js-clientNoticeValue').text(data.notice);
            editForm.hide();
            showForm.show();
        });
    } else {
        alert("Ошибка! Нельзя сохранить пустую заметку.");
        $(button).removeClass('Spinner--active');
    }
}
function DeleteContactNotice(button, client_id) {
    $(button).addClass('Spinner--active');
    var clientName = $(button).attr('data-client-name');
    if (confirm("Удалить заметку для клиента " + clientName + "?")) {
        var data = {
            action: 'editClientCardNote',
            notice: '',
            client_id: client_id
        };
        ChangeNotice(data, function(){
            var clientBlocks = $('.js-clientNoticeToggle');
            clientBlocks.find('.Spinner--active').removeClass('Spinner--active');
            clientBlocks.find('.js-clientNoticeValue').text('');
            clientBlocks.find('.js-clientNoticeArea').val('');
            clientBlocks.hide();
            $('.js-clientNoticeAddButton').show();
        });
    } else {
        $(button).removeClass('Spinner--active');
    }
}
function ChangeNotice(objData, funcSuccess) {
    $.ajax({
        type: "POST",
        data: objData,
        dataType: 'json',
        url: document.location.href,
        success: function(result) {
            if (result['success'] === 'OK') {
                funcSuccess();
            } else {
                if (result['error'] !== '') {
                    alert(result['error']);
                } else {
                    alert("Произошла ошибка!");
                }
                $('.js-clientNoticeToggle').find('.Spinner--active').removeClass('Spinner--active');
            }
        }
    });
}
//~обработка заметки в карточке клиента

//подгрузка отправки уведомления о задолженности
function debtsGetFormSend(button, dataSend)
{
    if (button) {
        button.addClass('Spinner--active').attr('disabled', true);
    }
    $.ajax({
        url: '/ajax/desk/debts.php',
        type: 'POST',
        data: dataSend,
        dataType: 'json',
        success: function(result) {
            button.removeClass('Spinner--active').attr('disabled', false);
            if (result['window']) {
                var objWin = window.open('about:blank');
                with (objWin.document) {
                    open();
                    write(result['window']);
                    close();
                }
            } else if (result['html']) {
                var objHtml = $(result['html']);
                objHtml.find('.js-debtsFormSend, .js-debtsFormView').on('click', function(){
                    debtsGetFormSend($(this), {
                        action: 'FormSend',
                        client: dataSend['client'],
                        email: objHtml.find('.js-valueEmail').val(),
                        personal: objHtml.find('.js-valuePersonal').prop('checked')
                                  ? 1 : 0,
                        theme: objHtml.find('.js-valueSetTheme').prop('checked')
                               ? objHtml.find('.js-valueTheme').val() : '',
                        text: objHtml.find('.js-valueSetTheme').prop('checked')
                              ? objHtml.find('.js-valueText').val() : '',
                        view: $(this).hasClass('js-debtsFormView') ? 1 : 0
                    });
                });
                objHtml.find('.js-valueSetTheme').on('change blur', function(){
                    if ($(this).prop('checked')) {
                        $(this).closest('.Form__field').nextAll('.Form__field--addFields').show();
                    } else {
                        $(this).closest('.Form__field').nextAll('.Form__field--addFields').hide();
                    }
                });
                $.fancybox({
                    content: objHtml,
                    padding: 0,
                    modal: true
                });
            } else {
                alert(result['error']);
            }
        }
    });
}

//инициализация проверки поля email
function initInputMailCheck()
{
    $(document).on('change', '.js-checkEmail', function(){
        CheckEmail($(this), false);
    });
    $(document).on('keypress', '.js-checkEmail', function(){
        $(this).prop('checkEmail', false);//метка что форма еще не проверялась
    });
}

// инициализация переключения статусов
function initStatusChanger()
{
    $(document).on('click', '.js-statusChanger', function(){
        var field = $(this).closest('.Form__field');
        field.siblings().removeClass('Form__field--checked');
        var sibInputs = field.siblings().find('.Form__input');
        if (sibInputs.length > 0) {
            sibInputs.val('');
        }
        field.addClass('Form__field--checked');
        field.find('.Form__input').removeClass('error');
        if (field.find('.Form__dependent').length) {
            field.find('.Form__dependent .Form__input').focus();
        }
    });
}


// Вызов fancybox для загрузки файлов карточки клиента ОКТ
function showUploadFiles()
{
    var files = $('.Upload__field').prop('files'),
        fancyModalClone = $('.FancyModal--OktUploadFiles').clone()
            .addClass('Viewed');

    $.fancybox({
        content: fancyModalClone.attr( "style", "display: block !important;" ),
        padding: 0,
        onComplete: function () {
            var parent = fancyModalClone;
            var maxfilesize = 10000;
            var errorMessageOrsize = '';
            var fileTypeClass = 'other';

            $('.js-sendUploadFiles').removeClass('Blocked');
            $.each( files, function() {
                var fileSize = (this.size/1000).toFixed(0);
                if (!(/\.(doc|docx|rtf|xls|xlsx|txt|pdf|tif|jpg|jpeg|png|wav|mp3|ogg|zip|rar)$/i.test(this.name))) {
                    errorMessageOrsize = '<span class="File__error">Недопустимое расширение файла</span>';
                    $('.js-sendUploadFiles').addClass('Blocked');
                } else if (maxfilesize && (fileSize >= maxfilesize)) {
                    errorMessageOrsize = '<span class="File__error">Размер файла превышает 10Мб</span>';
                    $('.js-sendUploadFiles').addClass('Blocked');
                } else {
                    errorMessageOrsize = '<span class="File__size">' + fileSize + ' Кб</span>';
                }

                if (this.name.match(/\.doc$/i) || this.name.match(/\.docx$/i)) {
                    fileTypeClass = 'doc';
                } else if (this.name.match(/\.xls$/i)) {
                    fileTypeClass = 'xls';
                } else if (this.name.match(/\.pdf$/i)) {
                    fileTypeClass = 'pdf';
                } else if (this.name.match(/\.jpg$/i) || this.name.match(/\.jpeg$/i)) {
                    fileTypeClass = 'jpg';
                } else if (this.name.match(/\.png$/i)) {
                    fileTypeClass = 'png';
                } else {
                    fileTypeClass = 'other';
                }

                parent.find('.Files').append(
                    '<div class="FilesItem"><div class="File File--' + fileTypeClass +
                    ' File--upload"><span class="File__name">' + this.name +
                    '</span>' + errorMessageOrsize +
                    '<span class="File__hint">Удалить</span></div>' +
                    '<div class="FilesItem__description">' +
                    '<input class="Form__input" type="text" name="description" ' +
                    'maxlength="1000" placeholder="Описание..."></div></div>'
                );
            });
            checkCountFilesClientOkt();
        }
    });
}
// ~ Вызов ТипТипа для файла карточка клиента(окт)

// проверка количества файлов в карточке клиента
function checkCountFilesClientOkt()
{
    var maxCountFiles = 20,
        countOldFiles = 0,
        countNewFiles = 0;

    if ($('.js-fileName').length) {
        $('.js-fileName').each(function() {
            countOldFiles++;
        });
    }
    if ($('.FilesItem').length) {
        $('.FilesItem .File--upload').each(function() {
            countNewFiles++;
        });
    }
    if((countOldFiles + countNewFiles) <= maxCountFiles) {
        $('.FancyModal__submit').removeClass('Blocked');
        $('.TipTip__active').tipTip('hide').tipTip('destroy');
    } else {
        $('.FancyModal--OktUploadFiles.Viewed').find('.js-sendUploadFiles')
            .addClass('Blocked').end().tipTip({
            activation: 'manual',
            theme: 'error',
            content: '<h4 style="margin: 0 0 .2em">Ошибка</h4>Загруженных файлов не может быть более '
                + maxCountFiles + '.<br/>При необходимости удалите какой-то уже<br/>загруженный.',
            maxWidth: '360px',
            defaultPosition: 'bottom'
        }).tipTip('show');
    }
}

// сохранение файлов
function storeFilesClientOkt(button)
{
    var listData = [],
        form_data = new FormData(),
        files = $('.Upload__field').prop('files');

    $.each(files, function(key, value) {
        form_data.append(key, value);
    });
    $('.FancyModal--OktUploadFiles').find('.FilesItem').each(function(index) {
        listData[index] = {
            'name': $(this).find('.File__name').text(),
            'description': $(this).find('[name=description]').val()
        };
    });
    form_data.append('list', JSON.stringify(listData));
    form_data.append('action', 'storeFiles');
    $(button).addClass('Spinner--active');
    $.ajax({
        url: document.location.href,
        type: 'POST',
        data: form_data,
        cache: false,
        dataType: 'json',
        processData: false,
        contentType: false,
        success: function(result) {
            $(button).removeClass('Spinner--active');
            if (result['error']) {
                alert(result['error']);
            } else {
                $.fancybox.close();
                if (result['result']) {
                    reloadPageWithParams('&FILES=Y');
                }
            }
        }
    });
}

// перезагрузка страницы c новыми параметрами
function reloadPageWithParams(params) {
    var hrefOld = document.location.href;
    if (hrefOld.indexOf(params) < 0) {
        document.location.href = hrefOld + params;
    } else {
        document.location.href = hrefOld;
    }
}

// удаление файлов из карточки клиента ОКТ
function deleteFilesClientsOKT(listIds, obj)
{
    var form_data = new FormData();
    form_data.append('ids', listIds);
    form_data.append('action', 'deleteFiles');
    $(obj).addClass('Spinner--active');
    $.ajax({
        url: document.location.href,
        dataType: 'json',
        cache: false,
        contentType: false,
        processData: false,
        data: form_data,
        type: 'post',
        success: function(result) {
            $(obj).removeClass('Spinner--active');
            if (result['error']) {
                alert(result['error']);
            } else {
                $.fancybox.close();
                reloadPageWithParams('&FILES=Y');
            }
        }
    });
}
// ~ удаление файлов из карточки клиента ОКТ

// заполняет модальное окно данными о файле
function setParamsDescFile(fileId)
{
    var element = $('.Item__link[data-id=' + fileId + ']'),
        descrition = element.next('.Item__aux').html(),
        filesize = element.attr('data-filesize'),
        filename = element.text(),
        extension = filename.split('.').pop(),
        date = element.closest('.Item').find('.Item__box--date').html(),
        worker = element.closest('.Item').find('.Item__box--worker').html();
    var descClientFile = $('.js-descClientFile');
    descClientFile.find('.File').addClass('File File--' + extension.toLowerCase())
        .children('.File__name').html(filename)
        .next('.File__size').html((filesize / 1000) + ' Кб');
    descClientFile.find('.js-description').html(descrition);
    descClientFile.find('.js-date').html(date);
    descClientFile.find('.js-worker').html(worker);
    $('.Box--aux').find('.js-downloadClientFile')
        .attr('href', window.location.href + '&filesIds=' + fileId + '&download_file=Y')
        .end().find('button').attr('data-id', fileId);
}

function in_array(needle, haystack, strict)
{
    var found = false,
        key;
    strict = !!strict;
    for (key in haystack) {
        if (
            haystack.hasOwnProperty(key)
            && ((strict && haystack[key] === needle) || (!strict && haystack[key] == needle))
        ) {
            found = true;
            break;
        }
    }
    return found;
}

// добавление клиента в таблицу в отчете о проработке клиентов
function addClientToList(clientCode, clientName)
{
    var block = $('.js-onlyClientsBlock');
    var template = block.find('.Item--template');
    if (
        template.length > 0
        && clientCode
        && clientName
    ) {
        var numberCode = clientCode.replace(/[^А-Я0-9-]/g, '');
        var itemRecord = block.find('.Item--record');
        var bRepeat = false;
        block.find('.Item--record .Item__box--code').each(function(){
            if ($(this).text() === numberCode) {
                bRepeat = true;
            }
        });
        if (bRepeat) {
            return 'repeat';
        }
        var clone = template.clone();
        var recordsCount = itemRecord.length;
        clone.removeClass('Item--template').addClass('Item--record');
        clone.find('.Item__box--number').text(+recordsCount + 1);
        clone.find('.Item__box--code').text(numberCode);
        clone.find('.Item__box--client').html(
            '<a target="_blank" href="/desk/clients/okt/detail.php?CODE='
            + clientCode
            + '">'
            + clientName
            + '</a>'
            + '<input type="hidden" name="clients[]" value="'
            + clientCode
            + '">'
        );
        clone.insertBefore(template);
        block.find('.js-removeList, .Items__header').show();
        return 'success';
    }
    return 'fail';
}
//~ добавление клиента в таблицу в отчете о проработке клиентов

// очистка списка клиентов в отчете о проработке клиентов
function clearClientsListKpi()
{
    var block = $('.js-onlyClientsBlock');
    block.find('.Item--record').remove();
    block.find('.Items__header, .js-removeList').hide();
    block.find('.AddFromExcel__doubles, .AddFromExcel__added, .AddFromExcel__notFound, .AddFromExcel__wrongCodes, .js-clientAdditionError').html('');
    block.find('.Spinner--active').removeClass('Spinner--active').attr('disabled', false);
    block.find('.Upload--disabled').removeClass('Upload--disabled');
    block.find('.AddFromExcel__log').addClass('d-n');
    block.find('.js-clientCode').val('');
    if (window.ajaxSend) {
        window.ajaxSend.abort();
    }
}
//~ очистка списка клиентов в отчете о проработке клиентов

// показ информации о загрузке
function showUploadInfo(errorText, successText, errorHeader, statusMessagesBlock) {
    if (!errorText && !successText && !errorHeader) {
        return;
    }
    if (!statusMessagesBlock || !statusMessagesBlock.length) {
        statusMessagesBlock = $('.js-statusMessagesWrapper');
    }
    if (statusMessagesBlock.length) {
        var errorTextHeader = statusMessagesBlock.find('.js-errorTextHeader');
        var errorTextBlock = statusMessagesBlock.find('.js-errorTextBlock');
        if (errorTextHeader.length) {
            if (errorHeader && errorHeader.length) {
                errorTextHeader.html(errorHeader).show();
            } else {
                errorTextHeader.hide();
            }
        }

        if (errorTextBlock.length && errorTextHeader.length) {
            errorTextBlock = $(errorTextBlock[0]);
            errorTextBlock.siblings('.js-errorTextBlock').remove();
            if (errorText && errorText.length) {
                for (var i = 0, ilen = errorText.length; i < ilen; i++) {
                    errorTextBlock.html(errorText[i]).show();
                    if (i < ilen - 1) {
                        errorTextBlock.after(errorTextBlock.clone());
                        errorTextBlock = errorTextBlock.next();
                    }
                }
            } else {
                errorTextBlock.hide();
            }
        }  else if (errorText.length > 0) {
            errorTextBlock.html(errorText).show();
        } else {
            errorTextBlock.hide();
        }
        var successTextBlock = statusMessagesBlock.find('.js-successTextBlock');
        if (successTextBlock.length) {
            if (successText) {
                successTextBlock.html(successText).show();
            } else {
                successTextBlock.hide();
            }
        }
        statusMessagesBlock.slideDown();
    }
}

// скрытие информации о загрузке
function hideUploadInfo(statusMessagesBlock) {
    if (!statusMessagesBlock || !statusMessagesBlock.length) {
        statusMessagesBlock = $('.js-statusMessagesWrapper');
    }
    statusMessagesBlock.hide();
}

//детальная статистика заказов
function createStatLink() {
    $(".js-statOrderDetail").addClass('Spinner--active');
    $.ajax({
        type: "POST",
        data: {
            TIME_CREATE_FROM: $(":text[name='TIME_CREATE_FROM']").val(),
            TIME_CREATE_TO: $(":text[name='TIME_CREATE_TO']").val(),
            set_filter: 'Y'
        },
        url: "sale_stat.php"
    });
    checkTimeout = window.setTimeout(checkStatLinkComplete, 3000);
}

function checkStatLinkComplete() {
    var fileHash =  $('#fileHash').attr('data-hash');
    $.ajax({
        url: document.location.pathname + '?check_status=1&file_hash='+fileHash+'&v=' + (new Date().getTime()),
        success: function(data) {
            var isFinalIteration = true;
            if (data.indexOf("Error: ") === 0) {
                var header = 'Файл не найден'
                var message = 'На выбранный период нет статистики по заказам.<br>Выберите другие даты.';
                var content = '<div class="FancyModal FancyModal--fileNotFound">'
                    + '<h2 class="FancyModal__header">'+ header +'</h2>'
                    + '<div class="FancyModal__content">'
                    + message
                    + '</div><div class="FancyModal__control">'
                    + '<button class="btn btnMain btnOutline FancyModal__cancel js-closeFancybox">Закрыть</button>'
                    + '</div></div>';
                window.clearTimeout(checkTimeout);
                $.fancybox({
                    content: content,
                    showCloseButton: false,
                    hideOnOverlayClick: true,
                    padding: 0
                });
            } else if (data.indexOf("Success: ") === 0) {
                var linkHTML = 'Отчет создан<a class="btnSmallZip" href="' + data.replace("Success: ", "") + '"><span>Скачать отчет</span></a>';
                $("#create_stat_link").html(linkHTML);
                window.clearTimeout(checkTimeout);
                $('#create_stat_link span').trigger('click');
                $('#create_stat_link').hide();
            } else if (data === "Started...") {
                checkTimeout = window.setTimeout(checkStatLinkComplete, 3000);
                isFinalIteration = false;
            } else {
                $("#create_stat_link").html('');
                $.fancybox({content: 'System error'});
            }
            if (isFinalIteration) {
                $(".js-statOrderDetail").removeClass('Spinner--active');
            }
        },
        error: function (objRequest) {
            var header;
            var message;
            var content;
            switch (objRequest.status) {
                case 403:
                    content = 'Доступ запрещен';
                    break;
                case 404:
                    header = 'Файл не найден'
                    message = 'На выбранный период нет статистики по заказам.<br>Выберите другие даты.';
                    content = '<div class="FancyModal FancyModal--fileNotFound">'
                        + '<h2 class="FancyModal__header">'+ header +'</h2>'
                        + '<div class="FancyModal__content">'
                        + message
                        + '</div><div class="FancyModal__control">'
                        + '<button class="btn btnMain btnOutline FancyModal__cancel js-closeFancybox">Закрыть</button>'
                        + '</div></div>';
                    break;
                case 504:
                    content = 'Сервер недоступен';
                    break;
                default:
                    content = 'Error status: ' + status + '\nError message: ' + xmlRequest.responseText;
                    break;
            }
            $.fancybox({content: content,
                showCloseButton: false,
                hideOnOverlayClick: true,
                padding: 0});
            $(".js-statOrderDetail").removeClass('Spinner--active');
        }
    });
}
//товары индикаторы
function initKviPage() {
    var items = $('.js-kviItem');
    var itemAll = $('.js-kviItemAll');
    var itemsFlyer = $('.js-kviItemFlyer');
    var makeKvi = $('#make_kvi');
    var getKviExcel = $('#get_kvi_excel');
    var changeRowClass = function(input, status) {
        if (status) {
            input.parents('.Item').addClass('Item--selected');
        } else {
            input.parents('.Item').removeClass('Item--selected');
        }
    };
    var changeRow = function(input, status) {
        input.prop('checked', status);
        changeRowClass(input, status);
    };
    var changeExcelButton = function(status) {
        getKviExcel.attr('disabled', !status);
    };
    var changeMakeButton = function(status) {
        var title = 'Сформировать ' + (status ? 'свою' : 'стандартную') + ' листовку';
        makeKvi.html(title);
        $('.js-makeKviTitle').html(title);
    };
    itemAll.on('change', function () {
        var status = $(this).prop('checked');
        items.each(function () {
            changeRow($(this), status);
        });
        changeExcelButton(status);
        changeMakeButton(status);
    });
    items.on('change', function() {
        changeRowClass($(this), $(this).prop('checked'));
        var countChecked = items.filter(':checked').length;
        var countFlyer = itemsFlyer.filter(':checked').length;
        changeExcelButton(countChecked > 0);
        changeMakeButton(countChecked > 0 && (countChecked != countFlyer || countFlyer != itemsFlyer.length));
    });
    makeKvi.on('click', function (e) {
        $.fancybox({
            'content': $('.js-fancyKvi').html()
                .replace(new RegExp('data-ajax-interface="2"', 'ig'), 'data-ajax-interface="1"')
                .replace(new RegExp('pseudo-', 'ig'), ''),
            'padding': 0,
            'showCloseButton': false,
            'onComplete': function() {
                $('.js-ajaxContentBlock').trigger('js-ajaxContentReady');
            },
            'onClosed': function() {
                $('.js-customToggle').hide();
            }
        })
    });
}

// планируемые встречи
function initPlannedMeetingInterface() {
    $(document).on('click', '.js-PlannedButton', function(){
        var button = $(this);
        if (button.length > 0) {
            var pBlock = button.parents('.js-PlannedBlock');
            if (pBlock.length <= 0 && $('.TipTip__active').length > 0) {
                pBlock = $('.TipTip__active').parents('.js-PlannedBlock');
            }
            if (pBlock.length > 0 && pBlock.find('.js-datePlannedInput').length > 0) {
                var objInput = pBlock.find('.js-datePlannedInput');
                objInput.datepicker({
                    buttonText: 'Выберите дату',
                    showOn: 'button',
                    dateFormat: objInput.attr('data-format') !== undefined ? objInput.attr('data-format') : 'dd.mm.yy',
                    minDate: objInput.attr('data-date-min') !== undefined ? objInput.attr('data-date-min') : null,
                    maxDate: objInput.attr('data-date-max') !== undefined ? objInput.attr('data-date-max') : null,
                    changeMonth: true,
                    changeYear: true,
                    beforeShowDay: function(date) {
                        var isEnabled = $.datepicker.noWeekends(date)[0];
                        var currentDay = $.datepicker.formatDate('d.mm', date);
                        if (!isEnabled && $(this).attr('data-include-days')) {
                            var includeDays = $(this).attr('data-include-days').split(',');
                            isEnabled = (includeDays.indexOf(currentDay) !== -1);
                        }
                        if (isEnabled && $(this).attr('data-exclude-days')) {
                            var excludeDays = $(this).attr('data-exclude-days').split(',');
                            isEnabled = (excludeDays.indexOf(currentDay) === -1);
                        }
                        return [isEnabled, ''];
                    },
                    onSelect: function(strText, dpk) {
                        var self = this;
                        SavePlannedMeetingDate(strText, dpk, self);
                        $.datepicker._hideDatepicker();
                        $('html').off('click.tipTip').on('click.tipTip', function(e) {
                            $('html').trigger('check.tipTip', [$(e.target)]);
                        });
                    },
                    onClose: function() {
                        $('html').off('click.tipTip').on('click.tipTip', function(e) {
                            $('html').trigger('check.tipTip', [$(e.target)]);
                        });
                    }
                });
                objInput.nextAll('.ui-datepicker-trigger')[0].click();
                $('html').off('click.tipTip');
                window.setTimeout(function(){
                    $('#ui-datepicker-div').css('z-index', '10000');
                },100);
            }
        }
    });
    $(document).on('click', '.js-PlannedTipDelete', function(){
        var button = $(this);
        if (confirm('Удалить запланированную дату?')) {
            var pBlock = button.parents('.js-PlannedBlock');
            if ($('.TipTip__active').length > 0) {
                pBlock = $('.TipTip__active').parents('.js-PlannedBlock');
            }
            if (pBlock.length > 0) {
                var objSend = {
                    'ajaxContent': 'Y',
                    'PLAN': 'Y',
                    'DEL': 'Y'
                };
                button.addClass('Spinner--active').attr('disabled', true);
                if (button.attr('data-res') && button.attr('data-res').length > 0) {
                    objSend['PLAN_ID'] = button.attr('data-res');
                }
                $.ajax({
                    url: '/desk/clients/routes/',
                    type: 'POST',
                    data: objSend,
                    dataType: 'json',
                    success: function(result) {
                        if (result['success'] != null && result['success'].length > 0) {
                            var html = '<button class="btnDropDown Spinner--potential js-PlannedButton">' +
                                '<span class="Spinner"></span>Выбрать дату</button>';
                            $('.js-PlannedBlock[data-client="' + pBlock.attr('data-client') + '"]').each(function () {
                                $(this).find('.js-PlannedButton, .js-PlannedTip').remove();
                                $(this).append(html);
                            });
                        } else if (result['error'] != null && result['error'].length > 0) {
                            alert(result['error']);
                        }
                    },
                    complete: function() {
                        if (button.length > 0) {
                            button.removeClass('Spinner--active').attr('disabled', false);
                        }
                        if ($('.TipTip.TipTip--is-active').length > 0) {
                            $('.TipTip.TipTip--is-active').remove();
                        }
                    }
                });
            }
        }
    });
}
// инициализация взаимодействия с фильтрами
function initFilterInterface() {
    // кастомный селект
    initSelectFilter();
    // поиск по фильтру
    initFilterSearch();
    // разделение фильтра на категории
    initFilterSeparate();
}
//инициализация выпадающего селекта
function initSelectFilter() {
    var selectFilters = $('.js-selectFilter');
    if (selectFilters.length > 0) {
        selectFilters.each(function () {
            var selectFilter = $(this);
            var selectFilterBlock = selectFilter.find('.js-selectFilterBlock');
            var trigger = selectFilter.find('.js-selectFilterTrigger');
            var input = selectFilter.find('.js-selectFilterValue');
            var toggleClass = selectFilter.attr('data-toggle-class');
            var needAnimate = selectFilter.attr('data-animate');
            var open = false;
            var toggleSelect = function() {
                open = !open;
                if (toggleClass) {
                    selectFilter.toggleClass(toggleClass);
                }
                if (needAnimate) {
                    selectFilterBlock.stop().slideToggle(200);
                } else {
                    selectFilterBlock.toggle();
                }
            };
            trigger.on('click', function(e) {
                if (toggleClass && $('.' + toggleClass).length <= 0) {
                    e.stopPropagation();
                }
                toggleSelect();
            });
            $(document).on('click', function (e) {
                var target = $(e.target);
                if (selectFilter.has(target).length <= 0 && open) {
                    toggleSelect();
                }
            });
            // выбор опции
            selectFilterBlock.find('.js-selectFilterOption').on('click', function () {
                $(this).addClass('RichSelect__option--active')
                    .siblings('.RichSelect__option--active').removeClass('RichSelect__option--active');
                if (trigger.length) {
                    trigger.text($(this).attr('data-name'));
                }
                if (input.length && input.val() !== $(this).attr('data-value')) {
                    input.val($(this).attr('data-value')).change();
                }
                if (open) {
                    toggleSelect();
                }
            });
        });
    }
}
//инициализация поиска по значениям фильтра
function initFilterSearch() {
    var filterSearches = $('.js-filterSearch');
    if (filterSearches.length > 0) {
        filterSearches.each(function () {
            var input = $(this);
            var parent = input.closest('.js-filterSearchParent');
            if (parent.length > 0) {
                var items = parent.find('.js-filterSearchItem');
                var hintNotFound = parent.find('.js-filterSearchHint');
                var hintNotFoundClass = '';
                if (hintNotFound.length > 0) {
                    hintNotFoundClass = hintNotFound.attr('data-not-found-class');
                }
                var hideBlock = parent.find('.js-filterSearchHide');
                var searchClass = parent.attr('data-search-class');
                var searchMatchClass = parent.attr('data-search-match-class');
                var separateInput = parent.find('.js-filterSeparate');
                if (items.length > 0) {
                    var notFoundToggle = function (hide) {
                        if (hideBlock.length) {
                            if (hide) {
                                hideBlock.hide();
                            } else {
                                hideBlock.show();
                            }
                        }
                        if (hintNotFound.length) {
                            if (hide) {
                                hintNotFound.addClass(hintNotFoundClass);
                            } else {
                                hintNotFound.removeClass(hintNotFoundClass);
                            }
                        }
                    };
                    var triggerItemsSearch = function() {
                        var val = input.val();
                        var searchItems = items.filter('.js-multiselectVisible');
                        if (separateInput.length > 0) {
                            if (separateInput.is(':checked')) {
                                searchItems.filter('.js-filterSeparateHide').removeAttr('style');
                            } else if (searchItems.filter(':not(.js-filterSeparateHide)').length > 0) {
                                if (searchItems.filter('.js-filterSeparateHide').length > 0) {
                                    searchItems.filter('.js-filterSeparateHide').hide();
                                }
                                searchItems = searchItems.filter(':not(.js-filterSeparateHide)');
                            }
                        }
                        var bFound = false;
                        if ($.trim(val) !== '') {
                            searchItems.removeAttr('style');
                            parent.addClass(searchClass);
                            val = val.replace(/[\/\-\\^$*+?.()|[\]{}]/g, '\\$&');
                            var checkRegex = new RegExp(val, 'i');
                            searchItems.each(function () {
                                var testLabel = $(this).attr('data-search');
                                if (testLabel.length > 0) {
                                    if (checkRegex.test(testLabel)) {
                                        bFound = true;
                                        $(this).addClass(searchMatchClass);
                                    } else {
                                        $(this).removeClass(searchMatchClass);
                                    }
                                }
                            });
                        } else {
                            bFound = true;
                            parent.removeClass(searchClass);
                            searchItems.removeClass(searchMatchClass);
                        }
                        notFoundToggle(!bFound);
                    };
                    // обработка ввода
                    input.on('input', triggerItemsSearch);
                    input.on('keydown', function(e) {
                        if (e.keyCode === 27) {
                            // Escape
                            input.val('');
                            triggerItemsSearch();
                        } else if ([8,45,46].indexOf(e.keyCode) >= 0) {
                            // backspase, delete, insert
                            window.setTimeout(function () {
                                triggerItemsSearch();
                            }, 100);
                        }
                    });
                }
            }
        });
    }
}
//инициализация разделения фильтра на 2 категории
function initFilterSeparate() {
    var filterSeparates = $('.js-filterSeparate');
    if (filterSeparates.length > 0) {
        filterSeparates.each(function () {
            var input = $(this);
            var parent = input.closest('.js-filterSeparateParent');
            var searchInput = parent.find('.js-filterSearch');
            if (parent.length > 0) {
                var items = parent.find('.js-filterSeparateHide');
                var firstCheckbox = parent.find('.js-multiselect input:first');
                input.on('change', function () {
                    var visibleItems = items.filter('.js-multiselectVisible');
                    if (visibleItems.length > 0) {
                        visibleItems.toggle();
                    }
                    if (searchInput.length > 0) {
                        searchInput.trigger('input');
                    }
                    if (firstCheckbox.length > 0) {
                        if (!input.is(':checked')) {
                            unselectItem(items);
                        }
                        firstCheckbox.change();
                    }
                });
            }
        });
    }
}
//проверка формы при сохранении черновика запроса на создание карточки клиента
function checkAddClientDraft(form) {
    if ($(form).length <= 0) {
        return false;
    }
    var result = true;
    $(form).find('.js-draftRequired input').removeClass('error').nextAll('.Form__error').remove();
    $(form).find('.js-draftRequired input').each(function(){
        if ($.trim($(this).val()).length <= 0) {
            $(this).addClass('error');
            setAutoCorrection($(this));
            if ($(this).is('[data-error-text]')) {
                $(this).after('<div class="Form__error">' + $(this).attr('data-error-text') + '</div>');
            } else {
                $(this).after('<div class="Form__error">Заполните обязательное поле</div>');
            }
            result = false;
        }
    });
    if (!result) {
        $(window).scrollTop($(form).find('.js-draftRequired input.error:first').offset().top - 30);
        $(form).find('.js-draftRequired input.error:first').focus();
    } else {
        removeHiddenBlocks();
        $(form).prepend('<input type="hidden" name="draft" value="Y">');
    }
    return result;
}

function removeHiddenBlocks() {
    var contactNoneffective = $('.js-tableTheme');
    contactNoneffective.each(function( index, item ) {
        if (item.style.display == 'none') {
            item.remove()
        }
    });
    contactNoneffective = $('.js-noneffective');
    contactNoneffective.each(function( index, item ) {
        if (item.style.display == 'none') {
            item.remove()
        }
    });
}

// удаление черновика запроса на создание карточки клиента
function deleteClientDraft(resultID) {
    if (!resultID || parseInt(resultID) <= 0) {
        return false;
    }
    $.fancybox({
        content: '<div class="FancyModal FancyModal--removeRequestDraft"> '
            + '<h2 class="FancyModal__header">Удаление</h2> '
            + '<div class="FancyModal__content"> '
            + 'Вы уверены, что хотите удалить черновик? '
            + '</div> '
            + '<fieldset class="FancyModal__control"> '
            + '<button class="btn btnError js-doDeleteResult" data-result-id="'
            + parseInt(resultID)
            + '"><span class="Spinner"></span>Да</button> '
            + '<button class="btn btnMain btnOutline js-closeFancybox">Нет</button> '
            + '</fieldset> </div>',
        padding: 0,
        showCloseButton: false,
        onComplete: function () {
            var submitButton = $('.js-doDeleteResult');
            if (submitButton.length > 0) {
                submitButton.on('click', function (e) {
                    submitButton.addClass('Spinner--active').attr('disabled', true);
                    if (window.sendDeleteResultAjax) {
                        window.sendDeleteResultAjax.abort();
                    }
                    window.sendDeleteResultAjax = $.ajax({
                        url: '/ajax/desk/clientrequest.php',
                        type: 'POST',
                        data: {
                            'action': 'delete',
                            'id': submitButton.attr('data-result-id')
                        },
                        dataType: 'json',
                        success: function(result) {
                            if (result['result']) {
                                $.fancybox.close();
                                document.location.href = '/desk/registration/clientcards/';
                            }
                        },
                        complete: function () {
                            submitButton.removeClass('Spinner--active').attr('disabled', false);
                        }
                    });
                });
            }
        }
    });
}
//инициализация выпадающего селекта
function initAjaxSelect() {
    var ajaxSelects = $('.js-ajaxSelect');
    if (ajaxSelects.length > 0) {
        ajaxSelects.each(function () {
            var ajaxSelect = $(this);
            var ajaxSelectBlock = ajaxSelect.find('.js-ajaxSelectBlock');
            var trigger = ajaxSelect.find('.js-ajaxSelectTrigger');
            var triggerLabel = ajaxSelect.find('.js-ajaxSelectTriggerLabel');
            var input = ajaxSelect.find('.js-ajaxSelectValue');
            var inputLabel = ajaxSelect.find('.js-ajaxSelectHiddenLabel');
            var toggleClass = ajaxSelect.attr('data-toggle-class');
            var needAnimate = ajaxSelect.attr('data-animate');
            var searchInput = ajaxSelect.find('.js-ajaxSelectSearch');
            var resetButton = ajaxSelect.find('.js-ajaxSelectReset');
            var open = false;
            var toggleSelect = function() {
                open = !open;
                if (toggleClass) {
                    ajaxSelect.toggleClass(toggleClass);
                }
                if (needAnimate) {
                    ajaxSelectBlock.stop().slideToggle(200);
                } else {
                    ajaxSelectBlock.toggle();
                }
                if (searchInput.length) {
                    searchInput.val('');
                    if (open) {
                        searchInput.focus();
                    }
                }
            };
            trigger.on('click', function(e) {
                var target = $(e.target);
                if (resetButton.is(target)) {
                    return false;
                }
                if (toggleClass && $('.' + toggleClass).length <= 0) {
                    e.stopPropagation();
                }
                toggleSelect();
            });
            $(document).on('click', function (e) {
                var target = $(e.target);
                if (ajaxSelect.has(target).length <= 0 && open) {
                    toggleSelect();
                }
            });
            // выбор опции
            var chooseOption = function(data) {
                if (data && data.name && data.value) {
                    if (triggerLabel.length) {
                        triggerLabel.text(data.name);
                    }
                    if (inputLabel.length) {
                        inputLabel.val(data.name);
                    }
                    if (input.length && input.val() !== data.value) {
                        input.val(data.value).change();
                    }
                    resetButton.show();
                    toggleSelect();
                }
            };
            ajaxSelectBlock.on('mousedown', '.js-ajaxSelectOption', function () {
                chooseOption({
                    'name': $(this).attr('data-name'),
                    'value': $(this).attr('data-value')
                });
            });
            if (searchInput.length) {
                var cntSymbols = 3;
                if (searchInput.attr('data-min-symbols')) {
                    cntSymbols = searchInput.attr('data-min-symbols');
                }
                searchInput.on('focus', function() {
                    if (!$(this).is('.ui-autocomplete-input')) {
                        var cacheSearch = {};
                        var delay = 400;
                        var url = '';
                        if (searchInput.attr('data-delay')) {
                            delay = searchInput.attr('data-delay');
                        }
                        if (searchInput.attr('data-url')) {
                            url = searchInput.attr('data-url');
                        }
                        var dataSend = null;
                        if (searchInput.attr('data-send')) {
                            try {
                                dataSend = JSON.parse(searchInput.attr('data-send'));
                            } catch (e) {
                                // ignore
                            }
                        }
                        searchInput.autocomplete({
                            'delay': delay,
                            'minLength': cntSymbols,
                            'autoFocus': false,
                            'focus': function(event, ui) {
                                ajaxSelect.find('.js-ajaxSelectOption[data-value="' + ui.item.value + '"]')
                                    .addClass('RichSelect__option--active')
                                    .siblings().removeClass('RichSelect__option--active');
                                return false;
                            },
                            'select': function(event, ui) {
                                chooseOption({
                                    'name': ui.item.label,
                                    'value': ui.item.value
                                });
                                return false;
                            },
                            'source': function(request, response) {
                                if (cacheSearch[request.term.toLowerCase()]) {
                                    response(cacheSearch[request.term]);
                                    return;
                                }
                                if (dataSend && typeof dataSend === 'object') {
                                    request = $.extend(request, dataSend);
                                }
                                $.ajax({
                                    'url': url,
                                    'dataType': 'json',
                                    'data': request,
                                    'success': function (data) {
                                        cacheSearch[request.term.toLowerCase()] = data;
                                        response(data);
                                    }
                                });
                            },
                            'appendTo': ajaxSelect.find('.js-hiddenUI')
                        }).data('ui-autocomplete')._renderMenu = function(ul, items) {
                            var that = this;
                            var visibleUl = ajaxSelect.find('.js-ajaxSelectList');
                            visibleUl.find('.js-ajaxSelectOption').remove();
                            $.each(items, function(index, item) {
                                that._renderItemData(ul, item);
                                visibleUl.append('<div class="RichSelect__option js-ajaxSelectOption" data-value="'
                                    + item.value
                                    + '" data-name="'
                                    + escapeHtml(item.label)
                                    + '">\n'
                                    + item.label
                                    + '</div>');
                            });
                        };
                    }
                });
                var hintNotFound = ajaxSelect.find('.js-filterSearchHint');
                var hintNotFoundClass = '';
                if (hintNotFound.length > 0) {
                    hintNotFoundClass = hintNotFound.attr('data-not-found-class');
                }
                var notFoundToggle = function (hide) {
                    if (hintNotFound.length) {
                        if (hide && searchInput.val().length > cntSymbols) {
                            hintNotFound.addClass(hintNotFoundClass);
                        } else {
                            hintNotFound.removeClass(hintNotFoundClass);
                        }
                    }
                };
                // закрытие меню автокомлита
                searchInput.on('autocompleteclose', function(event, ui) {
                    ajaxSelect.find('.js-ajaxSelectOption').remove();
                    notFoundToggle(true);
                });
                // открытие меню автокомплита
                searchInput.on('autocompleteopen', function(event, ui) {
                    notFoundToggle();
                });
                // обработка результата автокомплита
                searchInput.on('autocompleteresponse', function(event, ui) {
                    if (searchInput.val().length > 0) {
                        notFoundToggle(!ui.content || ui.content.length <= 0);
                    }
                });
                if (resetButton.length) {
                    resetButton.on('mousedown click', function () {
                        var labelVal = 'Не указан';
                        searchInput.val('');
                        if (triggerLabel.length) {
                            if (triggerLabel.attr('data-default')) {
                                labelVal = triggerLabel.attr('data-default');
                            }
                            triggerLabel.text(labelVal);
                        }
                        if (inputLabel.length) {
                            inputLabel.val(labelVal);
                        }
                        if (input.length) {
                            input.val('').change();
                        }
                        resetButton.hide();
                        return false;
                    });
                }
                // инициализация автокомплита
            }
        });
    }
}
// вывод ошибок после ajax
function initAjaxFancyError() {
    var fancyError = $('.js-fancyAjaxError');
    if (fancyError.length > 0) {
        var content = '';
        fancyError.each(function () {
            content += $(this).html();
        });
        fancyError.remove();
        if (content.length > 0) {
            fancyAlertError(content);
        }
    }
}
// пролистывание контактов
function initContactsPagination() {
    var contactsPagination = $('.js-contactsPagination');
    if (contactsPagination.length > 0) {
        $(document).on('click', '.js-paginateContacts', function(){
            var loadingContent = $(this).closest('.Loading');
            if (loadingContent.filter('.Loading--active').length > 0) {
                return;
            }
            var curContactId = $(this).attr('data-contact-id');
            if (curContactId && parseInt(curContactId) > 0) {
                loadingContent.addClass('Loading--active');
                ContactForm({ID: curContactId});
            }
        });
        if (isMobile()) {
            $(document).on('swipe', '#fancybox-content', function(e){
                if (
                    !!e.detail
                    && !!e.detail.dir
                    && ['left', 'right'].indexOf(e.detail.dir) >= 0
                    && $('#fancybox-content .js-paginateContacts').length > 0
                ) {
                    var selector = 'js-paginateContactNext';
                    if (e.detail.dir === 'right') {
                        selector = 'js-paginateContactPrev';
                    }
                    var button = $('#fancybox-content .' + selector);
                    if (button.length > 0) {
                        button.trigger('click');
                    }
                    return false;
                }
            });
        }
        $(document).on('keydown', function(e){
            if (
                $('#fancybox-content .js-paginateContacts').length > 0
                && ['ArrowLeft', 'ArrowRight'].indexOf(e.originalEvent.code) >= 0
            ) {
                var selector = 'js-paginateContactPrev';
                if (e.originalEvent.code === 'ArrowRight') {
                    selector = 'js-paginateContactNext';
                }
                var button = $('#fancybox-content .' + selector);
                if (button.length > 0) {
                    button.trigger('click');
                }
            }
        });
    }
}
// проверка эл.почты в окне создания учетной записи в карточке клиента
function ajaxValidateAccountGenerateEmail(success)
{
    var emailField = $('.js-generateAccountEmail');
    if (!emailField.length) {
        return;
    }
    var email = $.trim(emailField.val());
    if (email === '') {
        emailField.addClass('error').nextAll('.Form__error').remove();
        emailField.after('<div class="Form__error">Поле должно быть заполнено</div>');
        setAutoCorrection(emailField);
    } else {
        if (emailField.prop('ajaxValidateSend')) {
            emailField.prop('ajaxValidateSend').abort();
        }
        emailField.prop('ajaxValidateSend', $.ajax({
            url: '/ajax/desk/account_generate.php',
            type: 'POST',
            data: {
                'action': 'validate_email',
                'UF_EMAIL': email
            },
            dataType: 'json',
            success: function(result) {
                if (result['success']) {
                    emailField.removeClass('error').nextAll('.Form__error').remove();
                    if (typeof (success) === 'function') {
                        success();
                    }
                } else if (result['error']) {
                    emailField.addClass('error').nextAll('.Form__error').remove();
                    emailField.after('<div class="Form__error">' + result['error'] + '</div>');
                    setAutoCorrection(emailField);
                }
            }
        }));
    }
}

// чекбокс "Создать учетную запись ПВС"
function checkboxPvs()
{
    var checkboxPvs = $('.js-generateAccountPvs');
    var emailDesc = $('.js-generateAccountEmailDesc');
    var emailBlock = $('.js-generateAccountEmailBlock');
    var emailTitle = emailBlock.find('.Form__title');
    var comment = $('.js-generateAccountComment');
    var organizationName = comment.attr('data-organization-name');
    var message = $('<div class="Form__aux js-generateAccountEmailDesc">Лучше указывать корпоративный  адрес электронной почты</div>');
    var messageWarning = $('<div class="Message  Message--warning js-generateAccountEmailDescWarning">'
        + '<b>Важно! Не указывать корпоративный адрес электронной почты</b></div>');
    var standartText = 'Уважаемый клиент, для Вашей организации'
        + organizationName
        + ' создан личный кабинет в\xa0интернет-магазине ОФИСМАГ, который позволит Вам:'
        + "\n"
        + '- максимально удобно и\xa0быстро приобретать товары по\xa0индивидуальным ценам;'
        + "\n"
        + '- пользоваться скидками до 30%;'
        + "\n"
        + '- заказывать товары с отсрочкой платежа;'
        + "\n"
        + '- иметь доступ к контактам Вашего персонального менеджера для оперативного обращения.'
        + "\n"
        + 'Для активации личного кабинета нажмите кнопку.';
    var pvsText = 'Уважаемый клиент, для Вашей организации'
        + organizationName
        + ' создана учётная запись ПВС в\xa0интернет-магазине ОФИСМАГ, которая позволит Вам приобретать'
        + ' товары с\xa0максимально выгодными условиями начисления бонусных баллов в\xa0программе "Щедрый Офисмаг!'
        + ' Копите рублики!".'
        + "\n"
        + 'Для активации учетной записи нажмите кнопку.';
    var checkboxUnsetPvsText = 'Уважаемый клиент, для Вашей организации'
        + organizationName
        + ' создана учётная запись в\xa0интернет-магазине ОФИСМАГ, которая позволит Вам:'
        + "\n"
        + '- максимально удобно и\xa0быстро приобретать товары по\xa0индивидуальным ценам;'
        + "\n"
        + '- пользоваться скидками до 30%;'
        + "\n"
        + '- заказывать товары с отсрочкой платежа;'
        + "\n"
        + '- иметь доступ к контактам Вашего персонального менеджера для оперативного обращения.'
        + "\n"
        + 'Для активации учётной записи и\xa0перехода к\xa0покупкам нажмите кнопку.';
    if (checkboxPvs.prop('checked')) {
        emailDesc.remove();
        emailTitle.after(messageWarning);
        if (checkboxPvs.attr('data-account-not-first') === '1') {
            comment.val(pvsText);
        } else {
            comment.val(standartText);
        }
    } else {
        var messageWarningBlock = $('.js-generateAccountEmailDescWarning');
        if (messageWarningBlock.length > 0) {
            messageWarningBlock.remove();
            emailTitle.after(message);
        }
        if (checkboxPvs.attr('data-account-not-first') === '1') {
            comment.val(checkboxUnsetPvsText);
        } else {
            comment.val(standartText);
        }
    }

}

function initAutocompleteInterface()
{
    var autocompletes = $('.js-autocompleteAjax');
    if (autocompletes.length <= 0) {
        return;
    }
    autocompletes.each(function () {
        var block = $(this);
        var input = block.find('.js-autocompleteAjaxSearchInput');
        if (input.autocomplete('instance')) {
            return;
        }
        var cacheSearch = {};
        var minSymbols = input.attr('data-min-symbols') ? input.attr('data-min-symbols') : 2;
        var url = input.attr('data-url') ? input.attr('data-url') : '';
        var additionalDataSend = input.attr('data-send-ajax') ? JSON.parse(input.attr('data-send-ajax')) : {};
        var hiddenValue = block.find('.js-autocompleteHiddenValueField');
        var resetButton = block.find('.js-autocompleteReset');
        var isErrorOnNotFound = block.is('.js-autocompleteErrorOnNotFound');
        var currentSource = null;

        block
            .on('mousedown', '.js-autocompleteReset', function() {
                input.val('');
                input.prop('item-value', false);
                if (hiddenValue.length) {
                    hiddenValue.val('');
                }
                if (isErrorOnNotFound) {
                    input.removeClass('error');
                }
                resetButton.hide();
                input.autocomplete('close');
                input.trigger('autocompletereset');
        });
        input.autocomplete({
            delay: input.attr('data-delay') || 2000,
            minLength: minSymbols,
            autoFocus: false,
            focus: function(event, ui) {
                block
                    .find('.Autocomplete__item')
                    .removeClass('RichSelect__option--active')
                    .filter(function() {
                        return ($(this).val() === ui.item.value);
                    })
                    .addClass('RichSelect__option--active');
                block
                    .find('.ui-state-focus')
                    .removeClass('ui-state-focus');
                return false;
            },
            source: function(request, response) {
                if (cacheSearch[request.term.toLowerCase()]) {
                    currentSource = cacheSearch[request.term.toLowerCase()];
                    if (!currentSource || !currentSource.length) {
                        if (hiddenValue.length) {
                            hiddenValue.val('');
                        }
                        if (isErrorOnNotFound) {
                            input.addClass('error');
                        }
                        input.trigger('autocompletenotfound');
                    } else if (isErrorOnNotFound) {
                        input.removeClass('error');
                        input.trigger('autocompletefound');
                    }
                    response(currentSource);
                } else {
                    block.addClass('Spinner--active');
                    var dataSend = {
                        term: request.term
                    };
                    if (additionalDataSend) {
                        dataSend = $.extend(dataSend, additionalDataSend);
                    }
                    $.ajax({
                        'url': url,
                        'dataType': 'json',
                        'data': dataSend,
                        'success': function(data) {
                            block.removeClass('Spinner--active');
                            cacheSearch[request.term.toLowerCase()] = data;
                            currentSource = data;
                            if (!currentSource || !currentSource.length) {
                                if (hiddenValue.length) {
                                    hiddenValue.val('');
                                }
                                if (isErrorOnNotFound) {
                                    input.addClass('error');
                                }
                                input.trigger('autocompletenotfound');
                            } else if (isErrorOnNotFound) {
                                input.removeClass('error');
                                input.trigger('autocompletefound');
                            }
                            response(data);

                            // статистика
                            if (additionalDataSend.action === 'address') {
                                $(document).trigger({
                                    type: 'gaEvent',
                                    paramCategory: 'DaDataAnalytics',
                                    paramAction: 'NumberRequestsHint',
                                    paramLabel: 'Служебная часть - ' + $('title').text()
                                });
                            }
                        }
                    });
                }
            },
            select: function(event, ui) {
                // Убираем ошибку у поля
                input.trigger('change');
                // автоподстановка ИНН, KПП
                if (ui.item.inn || ui.item.kpp) {
                    // поле название компании (юридическое и рабочее)
                    input
                        .parents('form')
                        .find('.js-autocompleteRelationCompanyName')
                        .not(input)
                        .each(function() {
                            var $that = $(this);
                            var inputValue = $.trim($that.val());
                            if (inputValue === ui.item.value) {
                                return true;
                            }
                            if (!$that.is('.js-autocompleteRelationCompanyNameAlias')
                                || !inputValue
                            ) {
                                $that.val(ui.item.value).trigger('change');
                            }
                        });
                    // поле ИНН
                    if (ui.item.inn && !input.is('.js-autocompleteRelationInn')) {
                        var $inputInn = input.parents('form').find('.js-autocompleteRelationInn');
                        if ($inputInn.length && $.trim($inputInn.val()) !== ui.item.inn) {
                            $inputInn.val(ui.item.inn).trigger('change');
                        }
                    }
                    // поле КПП
                    if (ui.item.kpp) {
                        var $inputKpp = input.parents('form').find('.js-autocompleteRelationKpp');
                        if ($inputKpp.length && $.trim($inputKpp.val()) !== ui.item.kpp) {
                            $inputKpp.val(ui.item.kpp).trigger('change');
                        }
                    }
                    // поле адрес
                    if (ui.item.address) {
                        var $inputAddress = input.parents('form').find('.js-autocompleteRelationAddress');
                        if ($inputAddress.length && $.trim($inputAddress.val()) !== ui.item.address) {
                            $inputAddress.val(ui.item.address).trigger('change');
                        }
                    }
                    // подмена значения из подсказки на нужное
                    if (ui.item.inn && input.is('.js-autocompleteInnInput, .js-autocompleteRelationInn')) {
                        ui.item.value = ui.item.inn;
                        return true;
                    }
                }

                // подмена значения на заголовок
                var jsonItem = ui.item;
                if (currentSource && currentSource.length) {
                    for (var i = 0, ilen = currentSource.length; i < ilen; i++) {
                        var currentItem = currentSource[i];
                        if (
                            currentItem
                            && currentItem.value
                            && $.trim(currentItem.value) === $.trim(ui.item.value)
                        ) {
                            jsonItem = currentItem;
                            break;
                        }
                    }
                }
                input.prop('item-value', JSON.stringify(jsonItem));
                if (hiddenValue.length) {
                    hiddenValue.val(jsonItem.value);
                    ui.item.value = (jsonItem.label || jsonItem.value);
                }
                if (resetButton.length) {
                    resetButton.show();
                }

                // статистика
                if (additionalDataSend.action === 'address') {
                    $(document).trigger({
                        type: 'gaEvent',
                        paramCategory: 'DaDataAnalytics',
                        paramAction: 'ClickHints',
                        paramLabel: 'Служебная часть - ' + $('title').text()
                    });
                }
            },
            open: function (event, ui) {
                block.addClass('Autocomplete--active');
            },
            close: function (event, ui) {
                block.removeClass('Autocomplete--active');
            },
            appendTo: input.parent()
        }).data('ui-autocomplete')._renderItem = function(ul, item) {
            if (!$(ul).is('.Autocomplete')) {
                $(ul).addClass('Autocomplete__list js-autocompleteAjaxList');
            }
            if (!item.value && !item.aux) {
                return true;
            }
            var fnHighlightHtml = function(html) {
                $.each(input.val().split(' '), function(key, value) {
                    value = value.replace(/[\/\-\\^$*+?.()|[]{}]/g, '\\$&');
                    html = html.replace(new RegExp(value, 'ui'), '<b>$&</b>');
                });
                return html;
            }
            var $row = $('<li class="Autocomplete__item">');
            if (item.label || item.value) {
                var $rowHash = $('<div class="Autocomplete__value">').text(item.label || item.value);
                $rowHash.html(fnHighlightHtml($rowHash.html()));
                $row.append($rowHash);
            }
            if (item.aux) {
                var $rowAux = $('<div class="Autocomplete__aux">').text(item.aux);
                $rowAux.html(fnHighlightHtml($rowAux.html()));
                $row.append($rowAux);
            }
            return $row.appendTo(ul);
        };
        if (additionalDataSend.action === 'address') {
            input.focus(function() {
                input.autocomplete('search');
            })
        }
    });
}

// TODO - в оптимизации данное решение нужно "унифицировать" для работы с соответствующими сервисами (вырезать или др.)
// Объект управляет настройками "предельных" дат в календарях форм "Интервал дат"
// (CRM->Отчеты->Статистика по программе лояльности)
var controllerDates = {
    fieldDateFrom: null,
    fieldDateTo: null,

    init: function () {
        var curFieldDateFrom = $('.js-startDateField');
        var curFieldDateTo = $('.js-endDateField');
        if (curFieldDateFrom.length) {
            this.fieldDateFrom = curFieldDateFrom;
        }
        if (curFieldDateTo.length) {
            this.fieldDateTo = curFieldDateTo;
        }
        this.registerListeners();
    },

    initCalenderOnDateFrom: function () {
        controllerDates.fieldDateTo
            .attr('data-date-min', $(this).val())
            .datepicker('destroy');
        InitDatePicker();
    },

    initCalenderOnDateTo: function () {
        controllerDates.fieldDateFrom
            .attr('data-date-max', $(this).val())
            .datepicker('destroy');
        InitDatePicker();
    },

    registerListeners: function () {
        if (this.fieldDateFrom !== null) {
            this.fieldDateFrom.change(this.initCalenderOnDateFrom);
        }
        if (this.fieldDateTo !== null) {
            this.fieldDateTo.change(this.initCalenderOnDateTo);
        }
    }
};

//обработка по событию ready
$(document).ready(function () {
    controllerDates.init();
});

// инициализация всплывающих подсказок для комментариев (CRM->Маршруты и др)
function initTipOfComments() {
    var commentIcons = $('.js-tipOnComment');
    if (!commentIcons.length) {
        return;
    }
    var optionalSettings;
    var defaultSettings = {
        theme: 'white',
        maxWidth: 350,
        hideOnClick: true,
        resetPaddingContent: commentIcons.attr('data-reset-padding') === 'true',
        afterEnter: function() {
            $(this).addClass('CommentTrigger--active');
        },
        afterExit: function() {
            $(this).removeClass('CommentTrigger--active');
        }
    };
    if ('ontouchstart' in window) {
        optionalSettings = {
            activation: 'click',
            keepAlive: true
        };
    } else {
        optionalSettings = {
            delayHide: 300,
            delayHover: 100
        };
    }
    commentIcons.tipTip($.extend(defaultSettings, optionalSettings));
}