//обработка по событию ready
$(document).ready(function(){
    $('.js-ajaxContentBlock').on('js-ajaxContentReady', function (){
        if($('.checkYesFile').length) {
            document.location.href = $('.checkYesFile').attr('href');
        }
        if($('.checkNoFile').length) {
            $.fancybox({
                'content': $('.checkNoFile').html(),
                'padding': 0,
                'showCloseButton': false
            });
        }
    });
    //автоматическая проверка новых записей
    var checkNewValues = $('.js-CheckNewValue');
    if (checkNewValues.length) {
        checkNewValues.each(function() {
            var checkNewValue = $(this);
            var dataSend = {
                action: checkNewValue.attr('data-action') ? checkNewValue.attr('data-action') : 'CheckNewValue',
                value: checkNewValue.attr('data-value')
            };
            if (checkNewValue.attr('data-form-id')) {
                dataSend.form_id = checkNewValue.attr('data-form-id');
            }
            if (checkNewValue.attr('data-ticket-types')) {
                dataSend.ticket_types = checkNewValue.attr('data-ticket-types');
            }
            //новых заказов со времени последнего обновления страницы
            window.setInterval(function() {
                $.ajax({
                    url: checkNewValue.data('url') ? checkNewValue.data('url') : document.location.href,
                    type: 'POST',
                    data: dataSend,
                    dataType: 'json',
                    success: function(result) {
                        if (result.success && result.success.length) {
                            checkNewValue.html(result.success).slideDown();
                        } else if (checkNewValue.is(':visible')) {
                            checkNewValue.hide();
                        }
                    }
                });
            }, checkNewValue.data('time') ? checkNewValue.data('time') : 60000);
        });
    }
    //~автоматическая проверка новых записей

    //подгрузка статистики по заказам
    var orderLoadStat = $('.js-orderLoadStat');
    if (orderLoadStat.length) {
        orderLoadStat.parents('.js-ajaxContentBlock').on('click', '.js-orderLoadStat', function(e) {
            e.stopPropagation();
            var obj = $(this).closest('.Spoiler');
            if (!obj.hasClass('Spoiler--open')
                && obj.find('.Spoiler__content .Specs').length === 0) {
                obj.addClass('Spoiler--loading');
                $.ajax({
                    url: window.location.href,
                    type: 'POST',
                    data: {
                        getStat: 'Y'
                    },
                    dataType: 'json',
                    success: function(result) {
                        if (result.error) {
                            alert(result.error);
                        } else if (result.html) {
                            obj.find('.Spoiler__content').html(result.html);
                            obj.removeClass('Spoiler--loading')
                                .addClass('Spoiler--open')
                                .find('.Spoiler__content')
                                .stop().slideToggle(200);
                            initTipOnHover();
                        }
                    }
                });
            } else {
                obj.toggleClass('Spoiler--open')
                    .find('.Spoiler__content')
                    .stop().slideToggle(200);
            }
        });
    }
    //~подгрузка статистики по заказам

	//проверка на непустоту при отправке
    var setCommentBlock = $('.js-setComment');
	if (setCommentBlock.length) {
        setCommentBlock.on('click', function(e){
			e.preventDefault();

            if ($(this).find('.Spinner').length) {
                //если внутри есть прелоадер
                if ($(this).parents('form').find('.js-commentText').val().length) {
                    //активируем прелоадер
                    $(this).addClass('Spinner--active');
                    $(this).attr('disabled', 'disabled');
                }
            }

			CheckAndSubmit(this, $(this).parents('form').find('.js-commentText'));
		});
	}
	//проверка на непустоту при отправке

    // Установить период через который тикет закроется автоматически
    var buttonWaitAnswer = $('.js-waitReplyUser');
    if (buttonWaitAnswer.length) {
        buttonWaitAnswer.on('click', function(e){
            e.preventDefault();
            var isEnable = !$(this).hasClass('js-Toggleable--on');
            var content = $(this).find('.Toggleable__content');
            $(this).toggleClass('js-Toggleable--on', isEnable);
            if (content.length) {
                content.text($(this).data(isEnable ? 'on' : 'off'));
            }
            var waitField = $('[name="wait_reply_user"]');
            waitField.val(isEnable ? 'Y' : 'N');
            CheckAndSubmit(this, waitField);
        });
    }
    // ~ Установить период через который тикет закроется автоматически

    // Загрузка фенсибокса в карточке товара
    if ($('.js-regularPurchaseActive').length) {
        $('.js-regularPurchaseActive').click();
    }

    //установка ответственного
    if ($('.js-ticketSetResponsible').length) {
        $(document).on('click', '.js-ticketSetResponsible', function() {
            var ticketID = $(this).attr('data-ticket-id');
            var respID = $(this).attr('data-resp-id');
            var data = {
                ticketID: ticketID,
                respID: respID,
                ajax: 'Y'
            };
            var _this = $(this);
            var Responsible = _this.text();
            var oldName = $('span.feedbackEmployee__nameValue').text();

            $('.Spinner').addClass('Spinner--active');
            $('.feedbackEmployee__img').addClass('feedbackEmployee__img--hide');
            $('.feedbackEmployee__nameValue').text(Responsible).closest('.feedbackEmployee__name').tipTip('hide');

            if ($(this).is('[data-idp-code]')) {
                data.idp = $(this).attr('data-idp-code');
            }

            $.ajax({
                url: document.location.href,
                type: 'POST',
                data: data,
                dataType: 'json',
                success: function(result) {
                    if (result.success) {
                        document.location.reload();
                    }
                    else {
                        $('.Spinner').removeClass('Spinner--active');
                        $('.feedbackEmployee__img--hide').removeClass('feedbackEmployee__img--hide');
                        //возвращаем прежнее имя
                        $('.feedbackEmployee__nameValue').text(oldName);
                    }
                }
            });
        });
    }
    //~установка ответственного

	//нажатие "Это спам"
    var feedbackSpam = $('.js-feedbackSpam');
	if (feedbackSpam.length) {
        feedbackSpam.on('click', function(){
			var ticketID = $(this).attr('data-ticket-id');
			$.ajax({
				url: document.location.href,
				type: 'POST',
				data: {
					ticketID: ticketID,
					ajax: 'Y',
					set_spam: 'Y'
				},
				dataType: 'json',
				success: function(result) {
					if (result.success) {
                        document.location.reload();
					}
				}
			});
		});
	}
	//~нажатие "Это спам"


    //отзывы
    if ($('.js-reviewEditPage').length) {
        //написать комментарий
        window.ajaxBlock.on('click', '.js-deskReviewWriteButton', function(){
            $('.js-toggleReview').toggle();
        });
        //свернуть форму
        window.ajaxBlock.on('click', '.js-deskReviewCancel', function(){
            $('.js-toggleReview').toggle();
            return false;
        });
        //написать комментарий и опубликовать
        window.ajaxBlock.on('click', '.js-deskReviewWritePublishButton, .js-deskReviewPublishButton', function(){
            $(this).addClass('Spinner--active').attr('disabled', true);
            var data = {};
            data.publish = 'Y';
            data.ID = $('.js-reviewResultId').val();
            if ($(this).is('.js-deskReviewWritePublishButton')) {
                var comment = $('.js-deskReviewWriteComment');
                if (comment.length && comment.val() !== '') {
                    data.resp_comment = comment.val();
                }
                var commentOrder = $('.js-deskReviewWriteCommentOrder');
                if (commentOrder.length && commentOrder.val() !== '') {
                    data.resp_comment_order = commentOrder.val();
                }
                var commentDelivery = $('.js-deskReviewWriteCommentDelivery');
                if (commentDelivery.length && commentDelivery.val() !== '') {
                    data.resp_comment_delivery = commentDelivery.val();
                }
            }
            ReloadAjaxContent(window.location.href, data, true);
        });
        //перевод в обращения
        window.ajaxBlock.on('click', '.js-deskReviewToTicket', function(){
            $(this).addClass('Spinner--active').attr('disabled', true);
            var data = {};
            data.ticket = 'Y';
            data.ID = $('.js-reviewResultId').val();
            ReloadAjaxContent(window.location.href, data, true);
        });
        //отклонить
        window.ajaxBlock.on('click', '.js-deskReviewToDisable', function(){
            $(this).addClass('Spinner--active').attr('disabled', true);
            var data = {};
            data.ID = $('.js-reviewResultId').val();
            data.disable = 'Y';
            ReloadAjaxContent(window.location.href, data, true);
        });
        //удалить комментарий сотрудника
        window.ajaxBlock.on('click', '.js-deskReviewRemoveComment', function(){
            $(this).attr('disabled', true);
            var data = {};
            data.ID = $('.js-reviewResultId').val();
            data.remove = 'Y';
            ReloadAjaxContent(window.location.href, data, true);
            return false;
        });
        //редактировать комментарий сотрудника
        window.ajaxBlock.on('click', '.js-deskReviewReWrite', function(){
            $('.js-toggleReview').toggle();
            var comment = $('.js-deskReviewWriteComment');
            if (comment.length) {
                comment.val($('.js-deskReviewReWriteText').html().replace(/<br>/ig, '\n'));
            }
            var commentOrder = $('.js-deskReviewWriteCommentOrder');
            if (commentOrder.length) {
                commentOrder.val($('.js-deskReviewReWriteTextOrder').html().replace(/<br>/ig, '\n'));
            }
            var commentDelivery = $('.js-deskReviewWriteCommentDelivery');
            if (commentDelivery.length) {
                commentDelivery.val($('.js-deskReviewReWriteTextDelivery').html().replace(/<br>/ig, '\n'));
            }
            return false;
        });
    }
    //~отзывы

    // загрузка xls файла в КП
    if ($('.js-CommercialOffers__fromExcel').length) {
        var addFromExcel = $('.js-addFromExcel');
        if (addFromExcel.length) {
            addFromExcel.on('click', function() {
                if ($('.js-importKP').length <= 0) {
                    $(this).parents('.Upload__label')
                        .prepend('<input name="xls" class="Upload__field js-importKP" type="file">');
                }
            });
            $(document).on('change', '.js-importKP', function() {
                var fileList = $(this)[0].files;
                var field = $(this);
                var upload = field.closest('.Upload');
                var triggerUpload = upload.find('.js-addFromExcel');
                if (!/\.xlsx?$/i.test(fileList[0].name)) {
                    ShowTipTipError(triggerUpload, 'КП не удалось сформировать.<br>Неверный формат файла');
                    $(field).remove();
                } else if ((fileList[0].size / 1048576).toFixed(0) >= 10) {
                    ShowTipTipError(triggerUpload, 'Недопустимый размер файла.<br>Максимальный размер: 10 Мбайт');
                    $(field).remove();
                } else {
                    triggerUpload.addClass('Spinner--active').attr('disabled', true);
                    upload.addClass('Upload--disabled');
                    var dataObj = new FormData();
                    dataObj.append('action', 'upload');
                    dataObj.append('type', $('.TabContent2--active').attr('data-tab-id'));
                    dataObj.append(
                        field.attr('name'),
                        fileList[0],
                        fileList[0].name
                    );
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
                        dataType: 'json',
                        success: function(result) {
                            if (result.success) {
                                document.location.href = '/desk/clients/commercial_offers/detail.php?ID=' + result.success;
                            } else if (result.error) {
                                ShowTipTipError(
                                    triggerUpload,
                                    result.error = 'КП не удалось сформировать.' + result.error
                                );
                            }
                        },
                        complete: function() {
                            triggerUpload.removeClass('Spinner--active').attr('disabled', false);
                            upload.removeClass('Upload--disabled');
                            upload.find('.js-importKP').remove();
                        }
                    });
                }
            });
        }
    }
    //~загрузка xls файла в КП

    // Смена кол-ва элементов на странице
    if ($('.js-onChangeSelect').length && $('.js-controlPanelPagination').length) {
        $(document).on('change', '.js-onChangeSelect', InitCountElementPage);
    }

    //инструмент статистики поисковой выдачи
    if ($('.js-searchChangesDetail').length) {
        var throttledSearchChangesScrollPosition = throttle(searchChangesScrollPosition, 100);
        // Инициализация
        (function searchChangesInit() {
            var checkedDates = $('.js-searchDates:checked').length;
            searchChangesSetWidths(checkedDates);
        })();

        // Горизонтальный скролл
        $('.js-scrollWidthTable').on('scroll', function() {
            $('.js-scrollMargin').css({
                marginLeft: -this.scrollLeft + 22 + 'px'
            });
        });
        // Чтобы отловить момент, когда нужно фиксировать горизонтальную прокрутку
        $(document).on('scroll', function() {
            // Заторможенный вариант функции, для плавности можно использовать обычную
            throttledSearchChangesScrollPosition();
        });
        // Обработчик щелчков по чекбоксам
        window.ajaxBlock.on('change', '.js-searchDates', function() {
            $(this).parent().toggleClass('SearchChangesDates__item--selected');
            var checkedDates = $('.js-searchDates:checked').length;
            var buttons = $('.js-submitSearchXls, .js-submitSearchDates');
            if (checkedDates < 2) {
                buttons.attr('disabled', true);
            } else {
                buttons.attr('disabled', false);
            }
        });
        // Обновление таблицы
        window.ajaxBlock.on('click', '.js-submitSearchDates', function(){
            var button = $(this);
            var table = $('.js-Table');
            if (button.hasClass('Spinner--active')) {
                return;
            }
            button.addClass('Spinner--active');
            table.addClass('Items--loading');
            $('.js-datesHidden').val(JSON.stringify($('.js-searchDates').serializeArray()));
            SubmitOnEvent(false, '', '', '.js-ajaxContentForm', function(){
                var checkedDates = $('.js-searchDates:checked').length;
                searchChangesSetWidths(checkedDates);
                // Горизонтальный скролл
                $('.js-scrollWidthTable').on('scroll', function() {
                    $('.js-scrollMargin').css({
                        marginLeft: -this.scrollLeft + 22 + 'px'
                    });
                });
            });
        });
        //скачивание отчета на детальной странице
        window.ajaxBlock.on('click', '.js-submitSearchXlsx', function(){
            $(this).addClass('Spinner--active').attr('disabled', true);
            var jSubmitSearchXlsxLinkDates =  window.ajaxBlock.find('.js-ajaxContentForm input[name="dates"]');
            jSubmitSearchXlsxLinkDates.attr('disabled', true);
            var submitSearchXlsxLink = decodeURIComponent(
                window.ajaxBlock.find('.js-ajaxContentForm').serialize()
                + '&set_filter=Y'
            );
            jSubmitSearchXlsxLinkDates.removeAttr('disabled');
            generateClientReport(
                {'download': 'Y', 'dates' : jSubmitSearchXlsxLinkDates.val()},
                $(this),
                false,
                document.location.pathname + '?' + submitSearchXlsxLink
            );
        });
    }

    if ($('.js-searchChangesList').length) {
        //скачивание отчета в списке
        window.ajaxBlock.on('click', '.js-searchStatListExcel', function(){
            $(this).addClass('Spinner--active').attr('disabled', true);
            var dataObj = {
                'download': $(this).is('.js-Freq') ? 'frequency' : 'Y'
            };
            var searchStatListExcelLink = decodeURIComponent(
                window.ajaxBlock.find('.js-ajaxContentForm').serialize()
                + '&set_filter=Y'
            );
            generateClientReport(dataObj, $(this), false, document.location.pathname + '?' + searchStatListExcelLink);
        });
    }
    //~инструмент статистики поисковой выдачи
    if ($('.js-downloadExcelReportOkb').length) {
        window.ajaxBlock.on('click', '.js-downloadExcelReportOkb', function(){
            $(this).addClass('Spinner--active').attr('disabled', true);
            var dataObj = {
                'download': $(this).is('.js-makeExcel') ? 'makeExcel' : 'makeDb'
            };
            var reportOkbExcelLink = decodeURIComponent(
                window.ajaxBlock.find('.js-ajaxContentForm').serialize()
            );
            reportOkbExcelLink = reportOkbExcelLink.replace(/\+/g, encodeURIComponent('+'));
            generateClientReport(dataObj, $(this), false, document.location.pathname + '?' + reportOkbExcelLink);
        });
    }
    //new contacts
    if ($('.js-contactsListPage').length) {
        //checkbox "С учетом связанных"
        window.ajaxBlock.on('change', '.js-contactsJournal-code', function(){
            if ($(this).val().length) {
                $('.js-contactsJournal-relatedClients').removeClass('Blocked');
            } else {
                $('.js-contactsJournal-relatedClients').addClass('Blocked').find('input[type="checkbox"]').prop('checked', false);
            }
        });
    }
    //~new contacts
    //создание карточки клиента - new
    if ($('.NewClientCardRequest').length) {
        var formClientNew = $('.CRMNewClient__form');
        var selectVal = $('.js-contactSubject').val();
        var fnFocusFieldError = function() {
            var firstErrorBlock = formClientNew.find('.Form__error:visible:first').parent().parent();
            if (firstErrorBlock.length) {
                var destination = firstErrorBlock.offset().top;
                $('html, body').animate(
                    {
                        scrollTop: destination,
                        complete: function() {
                            firstErrorBlock.find('input[type=text].error, textarea.error').first().focus();
                        }
                    },
                    500
                );
            }
        };
        tableShow(selectVal);
        //проверка email при создании/редактировании карточки клиента
        initInputMailCheck();
        // фокусировка на поле с ошибкой
        fnFocusFieldError();
        // запомнить кнопку отправки
        formClientNew.find('[type="submit"]').on('click', function() {
            $(this).parents(formClientNew).data('initiator', this);
        });

        //отправка формы
        window.ajaxBlock.on('submit', formClientNew, function() {
            //проверка формы заявки
            var objForm = $(this);
            var bReturn = true;
            var buttonSubmit = $($(this).data('initiator'));
            $(this).data('initiator', null);

            if (!buttonSubmit.length) {
                return true;
            }

            if (!buttonSubmit.is('.js-FormClientNewSubmitDraft')) {
                //проверка емэйла с ожиданием отработки аякса
                var objEmail = $('.js-checkEmail');
                if (objEmail.length && objEmail.val().length
                    && !objEmail.prop('checkEmail')) {
                    CheckEmail(objEmail, function() {
                        objForm.submit();
                    });
                    bReturn = false;
                }
                if (!CheckFormRequired(objForm)) {
                    bReturn = false;
                }
                // проверка графика работы
                if (deskKorClientSchedule && !deskKorClientSchedule.formValidate(objForm.find('.Schedule:not(.Blocked) input'))) {
                    bReturn = false;
                }
                if (!checkFormFieldPhone(objForm.find('.js-phoneMask'))) {
                    bReturn = false;
                }

                var saveCallback = function () {
                    objForm.submit();
                };

                var bcPlacedChecked = objForm.find('.js-bcPlacedItem:checked');
                var subordinationCardCheck = objForm.find('.js-subordinationCard').is(':checked');
                if (bcPlacedChecked.length && !subordinationCardCheck) {
                    var field = objForm.find('[name=UF_BUSINESS_CENTER]');
                    if (field.length) {
                        field.remove();
                    }
                    if (bcPlacedChecked.is('.js-bcPlacedNot')) {
                        bcPlacedChecked.after('<input type="hidden" name="UF_BUSINESS_CENTER" value="Нет">');
                    } else if (bcPlacedChecked.is('.js-bcPlacedList')) {
                        var bcList = objForm.find('.js-bcList');
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
                                bReturn = false;
                                fnFocusFieldError();
                            }
                        }
                    } else if (bcPlacedChecked.is('.js-bcPlacedNew')) {
                        var bcNameAutocomplete = objForm.find('.js-bcNameAutocomplete');
                        var bcAddressAutocomplete = objForm.find('.js-bcAddressAutocomplete');
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
                                bReturn = false;
                            }
                        });
                        if (bReturn) {
                            buttonSubmit.addClass('Spinner--active').attr('disabled', true);
                            $.ajax({
                                'type': 'POST',
                                'url': '/ajax/desk/business_center.php',
                                'dataType': 'json',
                                'async' : false,
                                'cache': false,
                                'data': {
                                    action: 'createBusinessCenter',
                                    department: objForm.find('[name=IDP_CODE]').val(),
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
                                        buttonSubmit.removeClass('Spinner--active').attr('disabled', false);
                                        bReturn = false;
                                        fnFocusFieldError();
                                    }
                                }
                            });
                        } else {
                            fnFocusFieldError();
                        }
                    }
                } else {
                    var bc = objForm.find('[name=UF_BUSINESS_CENTER]');
                    if (bc.length) {
                        if (subordinationCardCheck) {
                            bc.val('Нет');
                        } else {
                            bc.remove();
                        }
                    }
                }
            }
            if (bReturn) {
                removeHiddenBlocks();
                buttonSubmit.addClass('Spinner--active');
            }
            return bReturn;
        });
        //~проверка заполнения карточки на создание клиента

        // подчиненная карточка
        var subordinationCard = $('.js-subordinationCard');
        if (subordinationCard.length) {
            var clientForm = subordinationCard.closest('form');
            subordinationCard.on('change', function(){
                window.lastPotentialValue = 0;
                if (clientForm.find('#UF_POTENTIAL').length) {
                    window.lastPotentialValue = parseInt(clientForm.find('#UF_POTENTIAL').val());
                }
                clientForm.find('.js-subordinationTrigger').trigger(
                    $(this).is(':checked') ? 'subordinationSet' : 'subordinationUnset'
                );
            });
            clientForm.on('subordinationSet', '.js-rowCalculator', function(){
                var button = $(this).find('.js-calculatePurchasingPotential');
                if (button.length) {
                    button.addClass('Blocked').each(function(){
                        this.onclick = function() {
                            ContactCalcForm($(this).closest('form'));
                        };
                    });
                    if (window.lastPotentialValue > 0) {
                        button.tipTip({
                            maxWidth: '250px',
                            defaultPosition: 'right',
                            theme: 'white',
                            edgeOffset: 6,
                            content: 'Значения, полученные из калькулятора потенциала, удалены',
                            activation: 'manual'
                        }).tipTip('show');
                        window.setTimeout(function() {
                            button.tipTip('destroy');
                        }, 3000);
                    }
                    clientForm.find('.js-CPTemp').remove();
                }
            })
            .on('subordinationSet', '.js-rowCountStaff', function(){
                var input = $(this).find('input');
                if (input.length) {
                    var inputVal = input.val();
                    var autotestAttr = input.attr('data-test-element');
                    input.closest('td').html(
                        '<input'
                        + (autotestAttr ? ' data-test-element="' + autotestAttr + '"' : '')
                        + ' type="text" class="Form__input js-ContactRequired js-FormRequired"'
                        + ' id="UF_COUNT_STAFF" name="UF_COUNT_STAFF" style="width: 145px;" maxlength="4" data-max="9999"'
                        + ' value="' + inputVal + '" />'
                    );
                }
            })
            .on('subordinationSet', '.js-rowBusinessType', function(){
                var input = $(this).find('input, select');
                var typesList = $(this).find('.js-businessTypeList');
                if (input.length && typesList.length) {
                    var inputVal = input.val();
                    var autotestAttr = input.attr('data-test-element');
                    var selectHtml = '<select'
                        + (autotestAttr ? ' data-test-element="' + autotestAttr + '"' : '')
                        + ' class="Form__input js-ContactRequired js-FormRequired" name="UF_BUSINESS_TYPE_" id="UF_BUSINESS_TYPE">'
                        + ' <option value="">Выбрать</option>';
                    typesList.children().each(function() {
                        var currentCode = $(this).attr('data-code');
                        var currentName = $(this).attr('data-name');
                        if (currentCode && currentName) {
                            selectHtml += '<option value="'
                                + currentCode
                                + '"'
                                + (parseInt(inputVal) === parseInt(currentCode) ? ' selected="selected"' : '')
                                + '>'
                                + currentName
                                + '</option>';
                        }
                    });
                    selectHtml += ' </select>';
                    input.closest('td').html(selectHtml);
                }
            })
            .on('subordinationSet', '.js-rowPotential', function() {
                var input = $(this).find('input');
                if (input.length) {
                    input.val('0').next('.js-labelContact').html('0');
                }
            })
            .on('subordinationSet', '.js-rowStatus2', function() {
                var input = $(this).find('input, select');
                if (input.length) {
                    var inputVal = input.val();
                    var autotestAttr = input.attr('data-test-element');
                    input.closest('td').html(
                        '<input'
                        + (autotestAttr ? ' data-test-element="' + autotestAttr + '"' : '')
                        + ' type="hidden" id="UF_STATUS2" name="UF_STATUS2" value="Не определен" data-prev-value="'
                        + inputVal
                        + '" /> '
                        + '<strong>Не определен</strong>'
                    );
                }
            })
            .on('subordinationSet', '.js-rowComment', function() {
                var label = $(this).find('label');
                var input = $(this).find('textarea');
                if (input.length && label.length) {
                    label.addClass('fieldRequired');
                    input.addClass('js-ContactRequired js-FormRequired');
                }
            })
            .on('subordinationUnset', '.js-rowCalculator', function(){
                var button = $(this).find('.js-calculatePurchasingPotential.Blocked');
                if (button.length) {
                    button.removeClass('Blocked');
                }
            })
            .on('subordinationUnset', '.js-rowStatus2', function(){
                var input = $(this).find('input');
                if (input.length) {
                    var inputVal = input.attr('data-prev-value');
                    if (inputVal && inputVal.length) {
                        var autotestAttr = input.attr('data-test-element');
                        input.closest('td').html(
                            '<select'
                            + (autotestAttr ? ' data-test-element="' + autotestAttr + '"' : '')
                            + ' id="UF_STATUS2" name="UF_STATUS2" class="Form__input"> '
                            + '<option value="Мелкий"'
                            + (inputVal === 'Мелкий' ? ' selected="selected"' : '')
                            + '>Мелкий</option>'
                            + '<option value="Средний"'
                            + (inputVal === 'Средний' ? ' selected="selected"' : '')
                            + '>Средний</option>'
                            + ' </select>'
                        );
                    }
                }
            })
            .on('subordinationUnset', '.js-rowComment', function(){
                var label = $(this).find('label');
                var input = $(this).find('textarea');
                if (input.length && label.length) {
                    label.removeClass('fieldRequired');
                    input.removeClass('js-ContactRequired js-FormRequired error')
                        .nextAll('.Form__error').remove();
                }
            })

            .on('click', '.js-noneffective', function() {
                if ($(this).find('input[type="checkbox"]').is(':checked')) {
                    $('input[name="UF_NONEFFECTIVE"]').val(1);
                } else {
                    $('input[name="UF_NONEFFECTIVE"]').val(0);
                }
            });

            subordinationCard.trigger('change');
        }
        $('.js-contactSubject').on('change', function() {
            var contactNoneffective = $('.js-themeNewContact').find('.js-noneffectiveDisplay');
            var selectVal = $('.js-contactSubject').val();
            tableShow(selectVal);
            if (selectVal == '22') {
                contactNoneffective.show();
                if ($('.js-noneffective').length == 0) {
                    $('input[name="UF_NONEFFECTIVE"]').val(1);
                }
            } else {
                contactNoneffective.hide();
                if ($('.js-noneffective').length == 0) {
                    $('input[name="UF_NONEFFECTIVE"]').val(0);
                }
            }
        });
        $('.js-idpSelectedNewClient').on('change', function() {
            var idp = $(this).find('option:selected').val();
            if (idp !== '') {
                $('[name="IDP_CODE"]').val(idp);
                if (idp === 'dmd' || idp === 'spb') {
                    $('[data-idp]').attr('data-idp', idp);
                } else {
                    $('[data-idp]').attr('data-idp', 'other');

                }
            }
        });
        //~подчиненная карточка
    }
    //~создание карточки клиента - new

    //переключение вариантов статуса
    if ($('.js-statusChanger').length) {
        initStatusChanger();
    }
    if ($('.js-switchRequestStatus-submit').length) {
        $(document).on('click', '.js-switchRequestStatus-submit', function(){
            var selected = false, notEmpty = false;
            var objList = $(this).parents('.js-statusTip').find('form');
            objList.find('.Form__field--checked').each(function(){
                if ($(this).find('input[type=radio]:checked').length) {
                    if ($(this).find('input[type=text], textarea').length
                        && $(this).find('input[type=text], textarea').val().length <= 0) {
                        notEmpty = $(this).find('input[type=text], textarea');
                    }
                    selected = true;
                }
            });
            if (!selected) {
                alert('Выберите новый статус');
                return false;
            }
            if (notEmpty.length) {
                var errorText = 'Заполните обязательное поле';
                if (notEmpty.attr('placeholder')) {
                    errorText = 'Заполните поле "' + notEmpty.attr('placeholder') + '"';
                }
                notEmpty.addClass('error').focus();
                if (notEmpty.next('.Form__error').length) {
                    notEmpty.next('.Form__error').html(errorText).show();
                } else {
                    notEmpty.after('<div class="Form__error" style="display: block;">' + errorText + '</div>');
                }
                setAutoCorrection(notEmpty);
                return false;
            }
            $(this).addClass('Spinner--active').attr('disabled', true);
            objList.find('.js-additionalStatusInput').filter(':not(:visible)').remove();
            objList.submit();
        });
    }
    if ($('.js-switchRequestStatus-cancel').length) {
        $(document).on('click', '.js-switchRequestStatus-cancel', function(){
            HideTipTipError();
        });
    }
    if ($('.js-switchRequestStatus-ajax').length) {
        $(document).on('click', '.js-switchRequestStatus-ajax', function(){
            var selected = false, notEmpty = false;
            var objResult = $(this).data('id');
            var posAttrId = $(this).data('id').lastIndexOf('_');
            var idTickets = objResult.substr(objResult.length - posAttrId);
            var objList = $(this).parents('.js-statusTip').find('form');
            if (objList.find('.Form__field--checked').length) {
                objList.find('.Form__field--checked').each(function(){
                    if ($(this).find('input[type=radio]:checked').length) {
                        if ($(this).find('input[type=text], textarea')
                                .filter(':not(.js-inputNotRequired)').length
                            && $(this).find('input[type=text], textarea')
                                .filter(':not(.js-inputNotRequired)')
                                .val().length <= 0) {
                            notEmpty = $(this).find('input[type=text], textarea');
                        }
                        selected = true;
                    }
                });
            } else if (objList.find('select').val().length) {
                selected = true;
            }
            if (!selected) {
                alert('Выберите новый статус');
                return false;
            }
            if (notEmpty.length) {
                var errorText = 'Заполните обязательное поле';
                if (notEmpty.attr('placeholder')) {
                    errorText = 'Заполните поле "' + notEmpty.attr('placeholder') + '"';
                }
                notEmpty.addClass('error').focus();
                if (notEmpty.next('.Form__error').length) {
                    notEmpty.next('.Form__error').html(errorText).show();
                } else {
                    notEmpty.after('<div class="Form__error" style="display: block;">' + errorText + '</div>');
                }
                setAutoCorrection(notEmpty);
                return false;
            }

            var objSend = {};
			objList.find('input, select, textarea:visible')
                .filter(':not([disabled=disabled])').each(function(){
                var name = $(this).attr('name');
                if (name) {
                    if ((!$(this).is('[type=radio]')
                        && !$(this).is('[type=checkbox]'))
                        || $(this).is(':checked')) {
                        objSend[name] = $(this).val();
                    }
                }
            });

            $(this).addClass('Spinner--active').attr('disabled', true);
            $.ajax({
                url: document.location.href,
                type: 'POST',
                data: objSend,
                dataType: 'json',
                success: function(result) {
                    $(this).removeClass('Spinner--active').attr('disabled', false);
                    HideTipTipError();
                    if (result.error) {
                        alert(result.error);
                    } else if (result.result) {
                        $('#' + objResult).html(result.result);
                        // меняем жирность текста взависимости от статуса
                        if (result.result.indexOf('js-tipTipClick">Принята') !== -1) {
                            $('#' + idTickets).addClass('Item--accepted');
                        } else if ($('#' + idTickets).hasClass('Item--accepted')) {
                            $('#' + idTickets).removeClass('Item--accepted');
                        }
                        if (result.script && result.script.length) {
                            eval(result.script.replace(/\r\n/g, "<br>"));
                        }
                        initTipOnHover();
                    }
                }
            });
        });
    }
    //~переключение вариантов статуса

    //отчет "График контактов ОКБ"
    if ($('.js-RichSelectTwoLevels').length) {
        //мультиселект двухуровневый
        window.ajaxBlock.on('change', '.js-multiselectGroup input', function(){
            var status = $(this).prop('checked');
            var select = $(this).parents('.js-RichSelect');
            var idData = $(this).attr('data-id');
            var curItem = $(this).parents('.js-multiselectGroup');
            if (status) {
                selectItem(curItem);
            } else {
                unselectItem(curItem);
            }
            select.find('.js-level2:visible').each(function(){
                if ($(this).attr('data-id') === idData) {
                    if (status) {
                        selectItem($(this));
                    } else {
                        unselectItem($(this));
                    }
                }
            });
            getMultiSelected(select);
        });
        //выбор/удаление заголовочных пунктов
        window.ajaxBlock.on('change', '.js-level2 input', function(){
            var select = $(this).parents('.js-RichSelect');
            var curItem = $(this).parents('.js-level2');
            var id = curItem.attr('data-id');
            var checked = select.find('.js-level2.js-multiselectVisible[data-id="' + id + '"] input:checked').length;
            var allItems = select.find('.js-level2.js-multiselectVisible[data-id="' + id + '"]').length;
            if (checked === allItems) {
                selectItem(select.find('.js-multiselectGroup[data-id="' + id + '"]'));
            } else {
                unselectItem(select.find('.js-multiselectGroup[data-id="' + id + '"]'));
            }
        });
        //показ/скрытие заголовочных пунктов
        window.ajaxBlock.on('click', '.js-RichSelectTwoLevels:not(.RichSelect--active) .js-multiselectTrigger', function(){
            $(this).parents('.js-RichSelect').find('.js-multiselectGroup').hide();
            window.setTimeout(function(){
                var select = $('.js-RichSelect.RichSelect--active');
                if (select.length) {
                    var groups = select.find('.js-multiselectGroup');
                    groups.each(function(){
                        var id = $(this).attr('data-id');
                        var curItems = select.find('.js-multiselectVisible.js-level2[data-id="' + id + '"]').length;
                        if (curItems > 0) {
                            $(this).show();
                        }
                    });
                }
            }, 50);
        });
        //блокировка кнопки "Скачать отчет"
        $('.js-showingGraph').on('click change mousemove', function(){
            var buttonLoad = $(this).find('.js-generateReport');
            if (buttonLoad.length) {
                var parentForm = buttonLoad.parents('.js-switchingBlock');
                if (
                    parentForm.find('.js-RichSelectGraphOkb .js-multiselect.RichSelect__option--active').length
                    && (
                        parentForm.find('.js-RichSelectTwoLevels .js-multiselect.RichSelect__option--active').length
                        || parentForm.find('.js-RichSelectGraphRespOkb .js-multiselect.RichSelect__option--active').length
                    )
                ) {
                    buttonLoad.removeClass('Blocked');
                } else {
                    buttonLoad.addClass('Blocked');
                }
            }
        });
    }

    //изменение периода
    window.ajaxBlock.on('change', '.js-dateGraph', function(){
        var curDate = $(this).val().split('.', 3);
        var month = +curDate[1] > 9 ? '10' : '0' + (Math.ceil(+curDate[1] / 3) * 3 - 2);
        $('.js-dateGraphPrev').val('01.' + month + '.' + curDate[2]);
    });

    //сброс формы на дефолтные значения
    window.ajaxBlock.on('click', '.js-reportResetButton', function(e){
        e.preventDefault();
        var form = $(this).parents('.js-switchingBlock');
        if (form.length) {
            var dateInput = form.find('.js-dateGraph');
            if (dateInput.length) {
                var defVal = dateInput.attr('data-def-value');
                if (defVal && defVal.length) {
                    dateInput.val(defVal).change();
                }
            }
            form.find('.js-RichSelect').each(function(){
                var idpRich = $(this);
                var defIdpVal = idpRich.attr('data-def-value');
                if (defIdpVal && defIdpVal.length) {
                    idpRich.find('.js-multiselect').each(function(){
                        if ($(this).find('input').val() === defIdpVal) {
                            selectItem($(this));
                        } else {
                            unselectItem($(this));
                        }
                    });
                    idpRich.find('input:first').change();
                }
            });
            var nonSelect = form.find('.js-multiselectNon');
            if (nonSelect.length) {
                unselectItem(nonSelect.find('.js-multiselect, .js-multiselectAll, .js-multiselectGroup'));
                getMultiSelected(nonSelect);
            }
        }
        return false;
    });
    //~отчет "График контактов ОКБ"

	//поисковая статистика - скачивание xls
	if ($('.js-searchStatListLoadXLS').length) {
		window.ajaxTimeoutXls = false;
        window.ajaxBlock.on('click', '.js-searchStatListLoadXLS', function(){
			if (window.ajaxTimeoutXls) {
				return false;
			}
			$('.js-searchStatListLoadXLS').addClass('Spinner--active');
            var searchStatListLoadXLSLink = decodeURIComponent(
                window.ajaxBlock.find('form:first').serialize()
                + '&set_filter=Y'
            );
            var searchStatListLoadXLSData = new FormData();
            searchStatListLoadXLSData.append('download', 'start');
			window.ajaxTimeoutXls = true;
			$.ajax({
                url: window.location.pathname + '?' + searchStatListLoadXLSLink,
				type: 'POST',
				data: searchStatListLoadXLSData,
				cache: false,
				dataType: 'json',
				processData: false,
				contentType: false,
				success: function(result) {
					window.ajaxTimeoutXls = false;
					$('.js-searchStatListLoadXLS').removeClass('Spinner--active');
					if (result.success != null && result.success.length) {
                        document.location.href = result.success;
					} else if (result.error != null && result.error.length) {
						alert(result.error);
					} else {
						alert('Ошибка при выполнении запроса');
					}
				}
			});
		});
	}
	//~поисковая статистика - скачивание xls

	//функционал контактов
	//скрытие/показ полей в зависимости от способа
	$(document).on('keyup change blur', '.js-Contact .js-ContactMethodChange', function(e){
		var methodID = parseInt($(this).val());
		var contactWrap = $(this).parents('.js-Contact');
		var objTopic = contactWrap.find('.js-ContactTopicChange');
		objTopic.removeAttr('disabled');
		objTopic.nextAll('input[name="' + objTopic.attr('name') + '"]').remove();
		var taskDone = contactWrap.find('.js-ContactTaskDone');
		var emptyScheduleNotify = contactWrap.find('.js-ScheduleEmptyNotify');
        if (methodID === 7) {
            objTopic
                .val(22)
                .data('isContactMethodNoChange', true)
                .change()
                .data('isContactMethodNoChange', false);
			objTopic.attr('disabled', 'disabled');
			objTopic.after('<input type="hidden" name="' + objTopic.attr('name') + '" value="' + objTopic.val() + '">');
		}
		if (taskDone.length) {
            taskDone.toggle(methodID === 9 && ['24', '28', '36'].indexOf(objTopic.val()) >= 0);
        }
        emptyScheduleNotify.toggle(methodID === 9);
        if (e.type === 'change') {
            objTopic.removeClass('js-ContactTopicSchema');
        }
	});
	//~скрытие/показ полей в зависимости от способа

	//скрытие/показ полей в зависимости от темы
	$(document).on('keyup change blur', '.js-Contact .js-ContactTopicChange', function(){
		var topicID = $(this).val();
		var contactBlock = $(this).parents('.js-Contact');
		var curSelected = $(this).children(':selected').text();
        contactBlock.find('.js-ContactTF-All').hide();
		if (topicID && topicID.length) {
            contactBlock.find('.js-ContactTF-' + topicID).show();
		}
		if ($('.js-bOkb').length <= 0) {
            contactBlock.find('.js-ContactTaskDone').hide();
            if (curSelected.indexOf('Контакты с') >= 0
                && parseInt(contactBlock.find('.js-ContactMethodChange').val()) === 9) {
                contactBlock.find('.js-ContactTaskDone').show();
            }
            contactBlock.find('.js-ContactNoneffective').toggle(curSelected === 'Другое');
		}
		if ($(this).is('.js-ContactTopicSchema')) {
			var defaultMethod = ($(this).is('.js-ContactTopicMeet')
                || ($('.js-ContactTopicOkb').length && curSelected === 'Создание учетной записи'))
                ? 'Встреча' : 'Звонок';
			switch (curSelected) {
                case 'Интерес к товару и условиям':
                case 'Заказ товара':
                    contactBlock.find('#UF_METHOD option').each(function(){
                        if ($(this).text() === 'Звонок') {
                            $(this).parent().val($(this).val());
                        }
                    });
                    contactBlock.find('input[name=UF_TYPE]').each(function(){
                        if ($.trim($(this).parent().text()) === 'Входящий') {
                            $(this).prop('checked', true);
                        }
                    });
                    break;

                case 'Заказ каталога':
                    contactBlock.find('#UF_METHOD option').each(function(){
                        if ($(this).text() === 'Встреча') {
                            $(this).parent().val($(this).val());
                        }
                    });
                    contactBlock.find('input[name=UF_TYPE]').each(function(){
                        if ($.trim($(this).parent().text()) === 'Исходящий') {
                            $(this).prop('checked', true);
                        }
                    });
                    break;

                case 'Другое':
                    if (!$(this).data('isContactMethodNoChange')) {
                        contactBlock.find('.js-ContactMethodChange').val(defaultMethod === 'Звонок' ? 6 : 9);
                    }
                    break;

                default:
                    contactBlock.find('#UF_METHOD option').each(function(){
                        if ($(this).text() === defaultMethod) {
                            $(this).parent().val($(this).val());
                        }
                    });
                    contactBlock.find('input[name=UF_TYPE]').each(function(){
                        if ($.trim($(this).parent().text()) === 'Исходящий') {
                            $(this).prop('checked', true);
                        }
                    });
                    break;
            }
		}
        if ($(this).is('.js-ContactTopicMeet')) {
            if (curSelected !== 'Другое') {
                contactBlock.find('.js-ContactNoneffective').hide();
            } else {
                contactBlock.find('.js-ContactNoneffective').show();
            }
        } else if ($(this).is('.js-ContactTopicRealOkb')) {
            if (curSelected === 'Предложения по ассортименту') {
                contactBlock.find('.js-ContactNoneffective').hide();
            } else {
                contactBlock.find('.js-ContactNoneffective').show();
            }
        } else if ($(this).is('.js-ContactTopicOkb')) {
			if (curSelected === 'Задача от руководителя') {
				$('.js-ContactNameBlock').hide();
                contactBlock.find('.js-ContactNoneffective').show();
				$('.js-ContactTipTask').hide();
			} else {
				$('.js-ContactNameBlock').show();
				if (curSelected !== 'Другое') {
                    contactBlock.find('.js-ContactNoneffective').hide();
				}
				$('.js-ContactTipTask').show();
			}
		} else if ($(this).is('.js-ContactTopicManager')) {
            contactBlock.find('.js-ContactNoneffective').show();
        } else if ($(this).is('.js-ContactTopicCur')) {
            contactBlock.find('.js-ContactNoneffective').hide();
        }
        fieldAutosize.process(contactBlock.find('textarea').toArray());
	});
	//~скрытие/показ полей в зависимости от темы

	//копирование темы в цель
	$(document).on('click', '.js-Contact .js-ContactCopyNameTrigger', function(){
		$(this).parents('.js-Contact').find('[name=UF_NEXT_CONTACT]').val($(this).parents('.js-Contact').find('.js-ContactCopyNameText').text());
		$(this).removeClass('js-ContactCopyNameTrigger pseudoLink').text('Скопировано в цели на следующий контакт');
	});
	//~копирование темы в цель
	//~функционал контактов

	//Передвижения ТП
	if ($('.js-geoEventsPage').length) {
		InitGeoPage();
        window.ajaxBlock.on('js-ajaxContentReady', InitGeoPage);
	}
	//~Передвижения ТП

	//скачивание отчета
	window.ajaxTimeoutXls = false;
	window.ajaxBlock.on('click', '.js-getExcel', function(){
		if (window.ajaxTimeoutXls) {
			return false;
		}
		$('.js-getExcel').addClass('Spinner--active');
		var send = new FormData();
		send.append('download', 'start');
		window.ajaxTimeoutXls = true;
		$.ajax({
			url: window.location.href,
			type: 'POST',
			data: send,
			cache: false,
			dataType: 'json',
			processData: false,
			contentType: false,
			success: function(result) {
				window.ajaxTimeoutXls = false;
				$('.js-getExcel').removeClass('Spinner--active');
				if (result.success != null && result.success.length) {
					document.location.href = result.success;
				} else if (result.error != null && result.error.length) {
					alert(result.error);
				} else {
					alert('Ошибка при выполнении запроса');
				}
			}
		});
	});
	//скачивание отчета

	//~Передвижения ТП

	// Работа с отчетами /desk/clients/report/
    $('.js-generateReport').click(function() {
        var objSend = {};
        var button = $(this);
        objSend.action = button.data('name');
        $('.js-switchingBlock:visible').find('select:visible, input:visible:not([type=checkbox]), '
            + '.js-multiselectVisible input:checked, input[type=hidden], .js-checkboxSingle:checked, '
            + '.js-multiselectAllWithName:checked').each(function(){
            var name = $(this).attr('name');
            var value = $(this).val();
            if (name && (value || $(this).is('.js-multiselectAllWithName'))) {
                var isArray = false;
                if (name.indexOf('[]') > 0) {
                    isArray = true;
                    name = name.replace('[]', '');
                }
                if (isArray) {
                    if (!objSend[name]) {
                        objSend[name] = [];
                    }
                    objSend[name].push(value);
                } else {
                    objSend[name] = value;
                }
            }
        });
        button.addClass('Spinner--active');
        if (objSend.action === 'ContactAssortment') {
            $(document).trigger({
                type: 'gaEvent',
                paramCategory: 'Reports',
                paramAction: 'downloadWantingGoods',
                paramLabel: objSend['DATE_FROM'] + ' - ' + objSend['DATE_TO']
            });
        }
        generateClientReport(objSend, button, true);
    });

    // переключение отчетов
    $('.js-switchingReports').change(function() {
		var currentOption = $(this).find("option:selected");
        var classNameForShowing = currentOption.attr('data-block');
        var wrapperSpinner = currentOption.parents('.SpinnerWrapper');
        var reports = $('.ReportsList__item');

        wrapperSpinner.addClass('Spinner--active');
        reports.siblings().addClass('Blocked');

		//скрываем все отчеты
		$(".js-switchingBlock").removeClass("ReportsList__item--active");

        //показываем выбранный отчет
		$("." + classNameForShowing).addClass("ReportsList__item--active");
        wrapperSpinner.removeClass('Spinner--active');
        reports.siblings().removeClass('Blocked');

    });


    //форма сброса пароля для пользователя
    var accountResetPassword = $('.js-accountResetPassword');
    if (accountResetPassword.length) {
        accountResetPassword.click(function(){
            var objClick = $(this);
            objClick.addClass('Spinner--active');
            //отправляем запрос
            $.ajax({
                url: document.location.href,
                type: 'POST',
                data: {
                    action: 'resetPassword'
                },
                cache: false,
                dataType: 'json',
                success: function(result) {
                    objClick.removeClass('Spinner--active');
                    if (result['error']) {
                        alert(result['error']);
                    } else if (result['LINK']) {
                        if (!objClick.data().tipTip) {
                            objClick.tipTip({
                                activation: 'click',
                                defaultPosition: 'bottom',
                                theme: 'white',
                                maxWidth: objClick.attr('data-width') ? parseInt(objClick.attr('data-width')) : 'auto',
                                keepAlive: true,
                                hideOnClick: true,
                                container: objClick.parents('#fancybox-wrap').length ? '#fancybox-wrap' : ''
                            }).tipTip('show');
                        }
                        objClick.tipTip('show');
                        $('.js-accountResetPasswordLink input').val(result['LINK']);
                    } else {
                        alert('Произошла неизвестная ошибка');
                    }
                },
                error: function() {
                    objClick.removeClass('Spinner--active');
                    alert('Произошла неизвестная ошибка');
                    document.location.reload();
                }
            });
            return false;
        });

        //копирование ссылки
        $(document).on('click', '.js-accountResetPasswordLink button', function(){
            var text = $(this).parents('.js-accountResetPasswordLink').find('input').val();
            var copyError = copyToMemory(text);
            if (copyError) {
                alert(copyError);
            } else {
                var info = $(this).next();
                info.show();
                window.setTimeout(function(){
                    info.hide();
                }, 1000);
            }
        });
    }
    //~форма сброса пароля для пользователя

    //геоположение
    if ($('.js-needGeoPosition').length) {
        window.geoFirstTry = false;
        GetGeoPosition(function(position){
            if (position && position.coords.length && position.timestamp) {
                window.currentPagePosition = position;
            }
        });
    }
    //~геоположение

    // управление подписчиками
    var subscribersSubmit = $('#js-subscribersSubmit');
    if (subscribersSubmit.length) {
        SubmitOnEvent(window.ajaxBlock, 'click', '#js-subscribersSubmit', '.js-ajaxForm', function(){
            var tipWidget = $('.js-tipWidget');
            if (tipWidget.length) {
                tipWidget.tipTip({
                    'activation': 'manual',
                    'defaultPosition': 'top',
                    'content': 'Сохранено',
                    'theme': 'white',
                    'delay': 100,
                    'fadeIn': 0,
                    'fadeOut': 200,
                    'maxWidth': 340
                }).tipTip('show');
                window.setTimeout(function(){
                    $('.js-tipWidget').tipTip('hide').tipTip('destroy');
                }, 1000);
            }
        });
    }
    //~ управление подписчиками

    //сворачивание информации
    window.ajaxBlock.on('click', '.js-spoilerTrigger', function(e){
        e.preventDefault();
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
    //~сворачивание информации

    // КП ОКТ
    if ($('.js-CPContent').length > 0) {
        // планируемые встречи
        initPlannedMeetingInterface();
    }

    // карточка клиента ОКТ
    if ($('#js-clientDetailPage').length) {
        // планируемые встречи
        initPlannedMeetingInterface();

        // прямое открытие контакта
        if ($('.js-contactJustClick').length) {
            window.setTimeout(function(){
                var elem = $('.js-contactJustClick');
                if (elem.length) {
                    var contID = elem.attr('data-contact');
                    if (contID.length) {
                        ContactForm({ID: contID});
                    }
                }
            }, 500);
        }
        //~ прямое открытие контакта

        // блокировка/разблокировка потенциала
        if ($('.js-calculator-Block').length) {
            window.ajaxBlock.on('click', '.js-calculator-Block', function(e) {
                var lock = $(this);
                if (lock.is('.js-calcNoLogin')) {
                    e.preventDefault();
                    ErrorLogin1C();
                    return false;
                }
                var client = lock.attr('data-client');
                var bClosed = lock.hasClass('Lock--closed');
                lock.removeClass('Lock--opened Lock--closed').addClass('Lock--loading');
                if (!lock.is('.js-calculatorAdmin')) {
                    lock.removeClass('js-calculator-Block');
                }
                if (client && client.length) {
                    if (window.ajaxSendCalculatorBlock) {
                        window.ajaxSendCalculatorBlock.abort();
                    }
                    window.ajaxSendCalculatorBlock = $.ajax({
                        url: document.location.href,
                        type: 'POST',
                        data: {
                            'action' : 'BlockPotential',
                            'client' : client
                        },
                        dataType: 'json',
                        success: function() {
                            if (bClosed) {
                                lock.find('.Lock__label').text('Изменение не требует согласования');
                                lock.addClass('Lock--opened').removeClass('Lock--closed');
                            } else {
                                lock.find('.Lock__label').text('Изменение требует согласования');
                                lock.addClass('Lock--closed').removeClass('Lock--opened');
                            }
                            if (!lock.is('.js-calculatorAdmin')) {
                                lock.addClass('Lock--immutable');
                            }
                            $('.js-calcApproved').each(function(){
                                $(this).nextAll('.js-calculated, .js-calc-client').text($(this).text());
                            });
                            $('.js-onConcord, .js-calcApproved, .js-calcApprovedHeader').remove();
                            $('.js-calcToggle').toggle();
                        },
                        complete: function() {
                            lock.removeClass('Lock--loading');
                        }
                    });
                } else {
                    lock.removeClass('Lock--loading');
                    lock.addClass(bClosed ? 'Lock--closed' : 'Lock--opened');
                }
            });
            $('.js-calculator-Block').hover(function() {
                var target = $(this);
                var label = target.find('.Lock__label');
                if (!target.hasClass('Lock--loading')) {
                    if (target.hasClass('Lock--closed')) {
                        label.text('Разрешить изменение без согласования');
                    } else {
                        label.text('Запретить изменение без согласования');
                    }
                }
            },
            function() {
                var target = $(this);
                var label = target.find('.Lock__label');
                if (!target.hasClass('Lock--loading')) {
                    if (target.hasClass('Lock--closed')) {
                        label.text('Изменение требует согласования');
                    } else {
                        label.text('Изменение не требует согласования');
                    }
                }
            });
        }
        //~ блокировка/разблокировка потенциала

        // согласование потенциала
        if ($('.js-concordPotential').length) {
            window.ajaxBlock.on('click', '.js-concordPotential', function(e){
                var button = $(this);
                if (button.is('.js-calcNoLogin')) {
                    e.preventDefault();
                    ErrorLogin1C();
                    return false;
                }
                button.attr('disabled', true);
                var potID = button.attr('data-potential');
                if (potID && potID.length) {
                    $.ajax({
                        url: document.location.href,
                        type: 'POST',
                        data: {
                            'action' : 'ConcordPotential',
                            'potential' : potID
                        },
                        dataType: 'json',
                        success: function(result) {
                            if (result.error != null) {
                                alert(result.error);
                            } else {
                                $('.js-onConcord, .js-calcApproved, .js-calcApprovedHeader').remove();
                            }
                        },
                        complete: function() {
                            if (button.length) {
                                button.attr('disabled', false);
                            }
                        }
                    });
                }
            });
        }
        //~ согласование потенциала

        // добавление/удаления участия в бонусной программе
        $(document).on('click', '.js-clientBonusChange', function() {
            var button = $(this);
            button.addClass('Spinner--active').attr('disabled', true);
            $.ajax({
                url: document.location.href,
                type: 'POST',
                data: {
                    'action' : 'ClientBonusChange',
                    'value' : button.val()
                },
                dataType: 'json',
                success: function(result) {
                    if (result['error'] != null) {
                        alert(result['error']);
                    }
                    if (result['html']) {
                        var htmlBlock = $(result['html']);
                        $('.js-clientBonusInfo').html(htmlBlock.html());
                    }
                },
                complete: function() {
                    if (button.length > 0) {
                        button.removeClass('Spinner--active').attr('disabled', false);
                    }
                }
            });
        });
        $(document).on('click', '.js-clientBonusConfirm', function() {
            if ($('.js-clientBonusConfirmFancybox').length) {
                $.fancybox({
                    content: $('.js-clientBonusConfirmFancybox').html(),
                    padding: 0,
                    showCloseButton: false
                });
            }
        });
        //~ добавление/удаления участия в бонусной программе

        // проверка цены по договору на код товара
        $(document).on('click', '.js-checkItemPrice button', function(){
            var button = $(this);
            var obj = $(this).closest('.js-checkItemPrice');
            var item = obj.find('input');
            var contract = obj.attr('data-contract');
            obj.nextAll('.ContractCheck__wrapper').remove();
            if (item.val().length == 6) {
                button.addClass('Spinner--active');
                $.ajax({
                    url: document.location.href,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'getItemPriceForContract',
                        contract: contract,
                        item: item.val()
                    },
                    success: function(result) {
                        if (result.price != null) {
                            obj.after(result.price);
                        } else if (result.error != null) {
                            alert(result.error);
                        } else {
                            alert('Ошибка обработки запроса');
                        }
                    },
                    complete: function() {
                        button.removeClass('Spinner--active');
                    }
                });
            } else {
                alert('Введен неверный код товара');
            }
        });
        //~ проверка цены по договору на код товара

        //функционал контактов
        //скрытие/показ доп текста для чекбокса "Неиспользуемый клиент"
        $(document).on('change', '.js-Contact input[name=UF_DO_NOT_USE]', function(){
            var subText = ', <span class="importantText importantText--highlight">комментарий к&nbsp;контакту обязателен</span>';
            var commentField = $(this).parents('.js-Contact').find('[name=UF_COMMENT]');
            if ($(this).prop('checked') != $(this).attr('data-value')) {
                $(this).next().html($(this).next().html() + subText);
                commentField.focus();
                commentField.addClass('js-ContactRequired');
                commentField.siblings('.Form__title').find('.Form__label').addClass('fieldRequired');
            } else {
                $(this).next().html($(this).next().html().toString().replace(subText, ''));
                commentField.removeClass('js-ContactRequired');
                commentField.siblings('.Form__title').find('.Form__label').removeClass('fieldRequired');
            }
            deskKorBusinessCenter.onBusinessCenterDisable();
        });
        //~скрытие/показ доп текста для чекбокса "Неиспользуемый клиент"

        //затенение и отключение всех инпутов по галочке
        $(document).on('change', '.js-Inactive .Form__title input[type=checkbox]:not(.ErrorDetails__checkbox):not(.js-ContactInactiveRowsBC)', function(){
            var triggerElements = $(this).is('#js-ContactInactivePotential')
                ? $(this).parents('.js-ContactInactiveRowsStatus2')
                : $(this).parents('.js-Inactive');
            triggerElements
                .find('input:not([type=checkbox]), select, textarea, button, input.js-clientScheduleNoBreakTime')
                .attr('disabled', $(this).prop('checked') ? null : 'disabled').toggleClass('Blocked', !$(this).prop('checked'));
            triggerElements
                .find('.TextCounter__controls')
                .toggleClass('Blocked', !$(this).prop('checked'));
        });
        //~затенение и отключение всех инпутов по галочке

        //затенение и отключение всех инпутов по галочке
        $(document).on('change', '.js-Inactive .Form__title input[type=checkbox]:not(.ErrorDetails__checkbox):not(.js-ContactInactiveRowsBC)', function(){
            var triggerElements = $(this).is('#js-ContactInactivePotential')
                                  ? $(this).parents('.js-ContactInactiveRowsStatus2')
                                  : $(this).parents('.js-Inactive');
            var withoutBreak = triggerElements.find('.js-clientScheduleNoBreakTime').is(':checked');
            triggerElements
                .find('input:not([type=checkbox]), select, textarea, button')
                .attr('disabled', $(this).prop('checked') && !withoutBreak ? null : 'disabled');

            triggerElements
                .find('.Schedule__checkbox, .TextCounter__controls')
                .toggleClass('Blocked', !$(this).prop('checked'));
            triggerElements
                .find('.TextCounter__controls')
                .toggleClass('Blocked', !$(this).prop('checked') || withoutBreak);
        });
        //~затенение и отключение всех инпутов по галочке

        //зависимость активности чекбоксов График работы КЛПР и Перерыв КЛПР
        $(document).on('change', '#js-opening_time_title', function() {
            if ($(this).prop('checked') != $('#js-break_time_title').prop('checked')) {
                $('#js-break_time_title').trigger('click');
            }
        });
        $(document).on('change', '#js-break_time_title', function() {
            if ($(this).prop('checked') != $('#js-opening_time_title').prop('checked')) {
                $('#js-opening_time_title').trigger('click');
            }
        });

        //отключение возможности выбора бизнесс-центра по галочке
        $(document).on('change', '.js-ContactInactiveRowsBC', function() {
            var bcPlaced = $('.js-bcPlaced');
            var bcGroup = bcPlaced.find('.js-BlockedTriggerBC');
            var bcRichSelect = bcPlaced.find('.RichSelect');
            var bcName = bcPlaced.find('.js-bcNameAutocomplete .js-autocompleteAjaxSearchInput');
            var bcAddress = bcPlaced.find('.js-bcAddressAutocomplete .js-autocompleteAjaxSearchInput');
            var inactiveRows = bcPlaced.find('.js-ContactInactiveRowsBC').is(':checked');
            var isSubordinationCard = $('.js-subordinationCard').is(':checked');
            var isNotUse = $('.js-Contact input[name=UF_DO_NOT_USE]').is(':checked');
            var bcLabel = bcPlaced.find('.Form__label');
            if (!inactiveRows
                || isSubordinationCard
                || isNotUse) {
                bcLabel.addClass('Blocked');
                bcGroup.addClass('Blocked');
                bcRichSelect.addClass('RichSelect--disabled');
                bcName.prop( "disabled", true );
                bcAddress.prop( "disabled", true );
            } else {
                bcLabel.removeClass('Blocked');
                bcGroup.removeClass('Blocked');
                bcRichSelect.removeClass('RichSelect--disabled');
                bcName.prop( "disabled", false );
                bcAddress.prop( "disabled", false );
            }
        });
        //~отключение возможности выбора бизнесс-центра по галочке

        //затенение и отключение всех инпутов по галочке
        $(document).on('change', '.js-Inactive .js_titleBC input[type=checkbox]:not(.ErrorDetails__checkbox):not(.js-ContactInactiveRowsTime):not(.js-ContactInactiveRowsBC)', function(){
            var triggerElements = $(this).is('#js-ContactInactivePotential')
                                  ? $(this).parents('.js-ContactInactiveRowsStatus2')
                                  : $(this).parents('.js-Inactive');
            triggerElements
                .find('.js-BlockedTrigger')
                .toggleClass('Blocked', !$(this).prop('checked'));
            triggerElements
                .find('.js-BlockedTriggerBC')
                .toggleClass('Blocked', !$(this).prop('checked'))
                .parent()
                .find('.js-autocompleteAjaxSearchInput')
                .attr('disabled', $(this).prop('checked') ? null : 'disabled');
            triggerElements
                .find('.js-multiselectNon')
                .toggleClass('RichSelect--disabled', !$(this).prop('checked'))
            ;
        });
        //~затенение и отключение всех инпутов по галочке

        //изменение цели в зависимости от переключателей
        $(document).on('change', '.js-ContactInactiveRows, ' +
            '.js-ContactInactiveRowsTime, ' +
            '.js-ContactInactiveRowsBC, ' +
            '.js-ContactInactiveStatus2, ' +
            '#js-ContactInactivePotential, ' +
            'input[name=UF_DO_NOT_USE], ' +
            'input[name=UF_BUDGET], ' +
            '.js-Inactive textarea, ' +
            '.js-Inactive :radio, ' +
            '#js-ContactInactiveStatus2',
            function(){
            var change = '';
            var obj = $(this).parents('.js-Contact');

            obj.find('.js-ContactInactiveRowsBase input:checked').each(function(){
                if ($(this).hasClass('js-clientScheduleNoBreakTime') || $(this).hasClass('js-bcPlacedItem')) {
                    return true;
                }
                if (change.length) {
                    change += ', ';
                }
                change += $(this).parent().find('.Form__label').text();
            });

            obj.find('.js-ContactInactiveRowsBase .js-Inactive').each(function(){
                //если левая часть содержит checkbox пропустим ее
                if ( $('.Form__title:has(:checkbox)', this).length ) {
                    return true;
                }
                //если правая часть содержит disabled пропустим ее
                if ($('input[type=text]:eq(0):disabled, textarea:eq(0):disabled, .js-BlockedTriggerBC.Blocked', this).length) {
                    return true;
                }
                if (change.length) {
                    change += ', ';
                }
                change += $(this).find('label.js-BlockedTrigger.Form__label').text();
            });

            obj.find('.js-ContactInactiveStatus2:checked').each(function(){
                if (change.length) {
                    change += ', ';
                }
                change += $(this).parents('.Form__field').find('.Form__label').text();
            });
            obj.find('#js-ContactInactivePotential:checked').each(function(){
                if (change.length) {
                    change += ', ';
                }
                change += 'Потенциал закупок';
            });

            obj.find('input[name=UF_DO_NOT_USE]').each(function(){
                if ($(this).prop('checked') != $(this).attr('data-value')) {
                    if (change.length) {
                        change += ', ';
                    }
                    change += 'Неиспользуемый';
                }
            });
            obj.find('input[name=UF_BUDGET]').each(function(){
                if ($(this).prop('checked') != $(this).attr('data-value')) {
                    if (change.length) {
                        change += ', ';
                    }
                    change += 'Бюджетник';
                }
            });
            if (change.length) {
                change = 'Изменено: ' + change;
            }
            obj.find('[name=UF_NAME]').val(change)
                .parents('.js-ContactNameBlock').find('.js-ContactNameInline').html(change);
        });
        //~изменение цели в зависимости от переключателей
        //~функционал контактов

        //проверка email при создании/редактировании карточки клиента
        initInputMailCheck();

        //пользователь уверен, что email правильный
        $(document).on('change', '.ErrorDetails__checkbox', function(){
            $(this).parents('.ErrorDetails').prevAll('.js-checkEmail')
                .toggleClass('error', !$('.ErrorDetails__checkbox').prop('checked'));
        });
        //~пользователь уверен, что email правильный

        //обработка уведомления о задолженности
        $(document).on('click', '.js-debtsGetFormSend', function() {
            debtsGetFormSend($(this), {
                action: 'GetFormSend',
                client: $(this).data('client')
            });
            return false;
        });
        //~обработка уведомления о задолженности
    }
    //~ карточка клиента ОКТ


    // функционал работы с файлами карточки клиента ОКТ
    if ($('.js-tabHeaderFiles').length) {
        // Вызов ТипТипа для файла карточка клиента(окт)
        $(document).on('click', '.js-getInfoFilesOkt', function(e) {
            e.preventDefault();
            var tipTrigger = $(this),
                data = $('.js-OktFileAbility').html(),
                fileId = $(this).closest('.Item').find('input[type=checkbox]').val();
            setParamsDescFile(fileId);
            tipTrigger.tipTip({
                content: data,
                activation: 'manual',
                maxWidth: '360px',
                defaultPosition: 'bottom',
                theme: 'white',
                afterEnter: function() {
                    $('body').on('click.tipOnClickHide', function(e) {
                        e.preventDefault();
                        if ($(e.target).closest('.TipTip').length) {
                            if ($(e.target).closest('.js-moreInfoFile').length) {

                                $.fancybox({
                                    content: $('.js-descClientFile').html(),
                                    showCloseButton : false,
                                    padding: 0
                                });
                            } else if ($(e.target).closest('.js-removeFile').length) {
                                tipTrigger.tipTip('hide').tipTip('destroy');

                                if (confirm('Вы действительно хотите удалить 1 файл?')) {
                                    deleteFilesClientsOKT(
                                        $('.OktFileAbilities').find('.js-moreInfoFile').attr('data-id'),
                                        this
                                    );
                                }
                            } else {
                                return;
                            }
                        }
                        tipTrigger.tipTip('hide').tipTip('destroy');
                        $('body').off('click.tipOnClickHide');
                    });
                }
            }).tipTip('show');
        });

        // создание ссылки на скачивание файла
        $(document).on('mouseover', '.js-getInfoFilesOkt', function() {
            var fileId = $(this).closest('.Item').find('input[type=checkbox]').val();
            $('.OktFileAbilities').find('.js-moreInfoFile')
                .attr('data-id', fileId).end()
                .find('.js-downloadClientFile')
                .attr('href', window.location.href + '&filesIds=' + fileId + '&download_file=Y');
        });

        // скачивание файлов в карточке клиента ОКТ
        $('body').on('click', '.js-downloadOneFile', function() {
            if (confirm('Вы действительно хотите скачать 1 файл?')) {
                document.location.href = $(this).attr('href');
            } else {
                return false;
            }
        });
        $('body').on('click', '.js-downloadManyFiles', function() {
            var countFiles = $('.Items')
                .find('input[type=checkbox]:checked:not([name=all])').length;
            if (countFiles > 0) {
                if (confirm('Вы действительно хотите скачать ' + countFiles + ' ' + _ending(countFiles, ['файл', 'файла', 'файлов']) + '?')) {
                    document.location.href = $(this).attr('href');
                } else {
                    return false;
                }
            } else {
                return false;
            }
        });
        // ~ скачивание файлов в карточке клиента ОКТ

        // Окно с подробной информацией о файле
        $(document).on('click', '.js-moreInfoFile', function(e) {
            e.preventDefault();
            var fileId = $(this).data('id');
            setParamsDescFile(fileId);
            $.fancybox({
                content: $('.js-descClientFile').html(),
                showCloseButton : false,
                padding: 0
            });
        });

        // массовое удаление файлов в карточке клиентов
        $(document).on('click', '.Form .js-removeFile', function() {
            var countFiles = 0;
            var arrIds = $('.Items').find('input[type=checkbox]:not([name=all])').map(function() {
                if (this.checked) {
                    countFiles++;
                    return $(this).val();
                }
            }).get();
            if (countFiles > 0) {
                if (confirm('Вы действительно хотите удалить ' + countFiles + ' файлов?')) {
                    deleteFilesClientsOKT(arrIds, this);
                    $('input[name=all]').prop('checked', false);
                }
            }
        });

        // удаление файлов в карточке клиентов (из модального окна)
        $('body').on('click', '.FancyModal__submit.js-deleteFile', function() {
            if (confirm('Вы действительно хотите удалить 1 файл?')) {
                deleteFilesClientsOKT($(this).attr('data-id'), this);
            }
        });

        // Вызов ТипТипа для загрузки файлов (карточка клиента(окт))
        $(document).on('click', '.js-uploadOktFiles', function() {
            // очистка инпута загрузки файлов
            var inputFileOkt = $('.Upload__field');
            inputFileOkt.value = '';
            if(!/safari/i.test(navigator.userAgent)) {
                inputFileOkt.type = '';
                inputFileOkt.type = 'file';
            }
            $(this).find('.Upload__field').on('change', showUploadFiles);
        });
        if ($('.FancyModal--OktUploadFiles').length) {
            // удаление файла из выбора
            $('body').on('click', '.FancyModal--OktUploadFiles .File', function(e) {
                e.preventDefault();
                $(this).closest('.FilesItem').detach();
                checkCountFilesClientOkt();
                if(!$('.Files').children('.FilesItem').length) {
                    $.fancybox.close();
                }
            });

            // закрытие модального окна
            $('body').on('click', '.FancyModal .FancyModal__cancel', function() {
                $(this).addClass('js-closeFancybox');
            });
        }

        // выделение всех чекбоксов на вкладке "Файлы" (Клиенты ОКТ)
        $('body').on('change', '.js-checkBoxAll', function() {
            $(this)
                .closest('.Items--filesOkt')
                .find('.js-inputCheckboxFiles')
                .prop('checked', this.checked)
                .closest('.Item')
                .toggleClass('Item--active', this.checked);
        });
        $('body').on('change', '.js-inputCheckboxFiles:not(.js-checkBoxAll)', function() {
            var checkBoxAll = $('.Items--filesOkt .js-checkBoxAll');
            checkBoxAll.prop('checked', !checkBoxAll.prop('checked'));
            $(this).each(function() {
                $(this).closest('.Item').toggleClass('Item--active', ($(this).prop('checked')));
            });
            var checkAll = !$('.Items--filesOkt').find('.js-inputCheckboxFiles:not(:checked)').length;
            checkBoxAll.prop('checked', checkAll);
        });
        // ~ выделение всех чекбоксов на вкладке "Файлы" (Клиенты ОКТ)
    }
    //~ функционал работы с файлами карточки клиента ОКТ

    // отчет о проработке клиентов
    if ($('.js-showingClientKpi').length) {
        // календарь по кварталам в отчетах
        if ($('.js-selectPeriodBlock').length) {
            // появление виджета
            $(document).on('click', '.js-selectPeriod', function(e){
                e.stopPropagation();
                if ($(e.target).parents('.js-selectPeriodPopup').length) {
                    return;
                }
                var selectBlock = $(this).closest('.js-selectPeriodBlock');
                if (!selectBlock.is('.chooseDateRange--active')) {
                    // выбор периода на основании дат из инпутов
                    var startDate = $('#js-kpiDateFrom').val();
                    var endDate = $('#js-kpiDateTo').val();
                    if (startDate.length && endDate.length) {
                        var quarterItems = $('.SelectPeriodWindow__quarter');
                        quarterItems.removeClass('SelectPeriodWindow__quarter--selected');
                        var bFound = false;
                        for (var i = 0, ilen = quarterItems.length; i < ilen; i++) {
                            var curDateStart = $(quarterItems[i]).attr('data-start-date');
                            if (
                                curDateStart
                                && curDateStart.length
                                && startDate === curDateStart
                            ) {
                                bFound = true;
                            }
                            if (bFound) {
                                $(quarterItems[i]).addClass('SelectPeriodWindow__quarter--selected');
                                var curDateEnd = $(quarterItems[i]).attr('data-end-date');
                                if (
                                    curDateEnd
                                    && curDateEnd.length
                                    && endDate === curDateEnd
                                ) {
                                    break;
                                }
                            }
                        }
                    }
                    $('.js-choosePeriod').attr('disabled', false);
                    $('.js-quarterErrorText').hide();
                }
                selectBlock.toggleClass('chooseDateRange--active');
                return false;
            });
            // подсвечивание кварталов в календаре
            var quarters = $('.SelectPeriodWindow__quarter');
            $(document).on('mouseenter', '.SelectPeriodWindow__quarter', function() {
                $('.SelectPeriodWindow__quarter--highlighted').removeClass('SelectPeriodWindow__quarter--highlighted');
                if ($(this).parents('.js-Quarter').length) {
                    $(this).addClass('SelectPeriodWindow__quarter--highlighted');
                } else {
                    var year = $(this).closest('.SelectPeriodWindow__year').index();
                    var quarter = $(this).index();
                    var index = year * 4 + quarter;
                    var items = $();
                    for (var i = index; i >= Math.max(0, index - 4); i--) {
                        items = items.add(quarters.eq(i));
                    }
                    items.addClass('SelectPeriodWindow__quarter--highlighted');
                }
            });
            // выбор периода в календаре
            $(document).on('click', '.SelectPeriodWindow__quarter', function() {
                $('.SelectPeriodWindow__quarter--selected')
                    .removeClass('SelectPeriodWindow__quarter--selected');
                $('.SelectPeriodWindow__quarter--highlighted')
                    .removeClass('SelectPeriodWindow__quarter--highlighted')
                    .addClass('SelectPeriodWindow__quarter--selected');
                if ($('.SelectPeriodWindow__quarter--selected.js-quarterError').length) {
                    $('.js-choosePeriod').attr('disabled', true);
                    $('.js-quarterErrorText').show();
                } else {
                    $('.js-choosePeriod').attr('disabled', false);
                    $('.js-quarterErrorText').hide();
                }
            });
            // увод курсора с виджета
            $(document).on('mouseleave', '.SelectPeriodWindow__calendar', function() {
                $('.SelectPeriodWindow__quarter--highlighted').removeClass('SelectPeriodWindow__quarter--highlighted');
            });
            // прокрутка календаря влево и вправо
            var scroll = Math.max($('.SelectPeriodWindow__year').length - 3, 0);
            $('.SelectPeriodWindow__switchLeft, .SelectPeriodWindow__switchRight').click(function() {
                var years = $('.SelectPeriodWindow__year');
                if (years.length === 3) {
                    return;
                }
                if ($(this).is('.SelectPeriodWindow__switchRight')) {
                    if (scroll === years.length - 3) {
                        return;
                    }
                    scroll++;
                } else {
                    if (scroll === 0) {
                        return;
                    }
                    scroll--;
                }
                years.first().animate({
                    marginLeft: -scroll * 33.33 + '%'
                });
            });
            // смена вида отчета
            $(document).on('change', '.js-reportType', function(){
                var startDate = $('#js-kpiDateFrom');
                var endDate = $('#js-kpiDateTo');
                var lifeCycle = $('.js-lifeCycleClients');
                lifeCycle.hide();
                if ($(this).val().indexOf('quarter') >= 0) {
                    $('.js-selectPeriodPopup').addClass('js-Quarter');
                    if (startDate.length && endDate.length) {
                        var endDefValue = endDate.attr('data-def-value');
                        startDate.val(startDate.attr('data-def-value').substr(0, 5) + endDefValue.substr(endDefValue.lastIndexOf('.')));
                        endDate.val(endDefValue);
                    }
                    if ($(this).val() === 'quarter_detailed') {
                        lifeCycle.show();
                        var lifeCycleSelect = lifeCycle.find('.js-lifeCycle');
                        lifeCycleSelect.val(lifeCycleSelect.children().first().val());
                    }
                } else {
                    $('.js-selectPeriodPopup').removeClass('js-Quarter');
                    if (startDate.length && endDate.length) {
                        startDate.val(startDate.attr('data-def-value'));
                        endDate.val(endDate.attr('data-def-value'));
                    }
                }
            });
            // закрытие виджета
            $('.js-cancelPeriodChoise').click(function(e) {
                e.stopPropagation();
                $(this).closest('.chooseDateRange').removeClass('chooseDateRange--active');
            });
            // сохранение периода
            $('.js-choosePeriod').click(function(e) {
                e.stopPropagation();
                var startDate = $('#js-kpiDateFrom');
                var endDate = $('#js-kpiDateTo');
                if (startDate.length && endDate.length) {
                    var quarterItems = $('.SelectPeriodWindow__quarter--selected');
                    if (quarterItems.length) {
                        startDate.val(quarterItems.first().attr('data-start-date'));
                        endDate.val(quarterItems.last().attr('data-end-date'));
                    }
                }
                $(this).closest('.chooseDateRange').removeClass('chooseDateRange--active');
            });
        }
        //~ календарь по кварталам в отчетах

        // загрузка файла
        var addFromExcelError = $('.js-addFromExcelError');
        if (addFromExcelError.length) {
            addFromExcelError.on('click', function() {
                if ($('.js-loadClientsFromExcel').length <= 0) {
                    $(this).parents('.Upload__label')
                        .prepend('<input name="kpiload" class="Upload__field js-loadClientsFromExcel" type="file">');
                }
            });
            $(document).on('change', '.js-loadClientsFromExcel', function() {
                var fileList = $(this)[0].files;
                var field = $(this);
                var upload = field.closest('.Upload');
                var triggerUpload = upload.find('.js-addFromExcelError');
                if (!/\.xlsx?$/i.test(fileList[0].name)) {
                    ShowTipTipError(triggerUpload, 'Неверный формат файла');
                    $(field).remove();
                } else if ((fileList[0].size / 1048576).toFixed(0) >= 10) {
                    ShowTipTipError(triggerUpload, 'Недопустимый размер файла.<br>Максимальный размер: 10 Мбайт');
                    $(field).remove();
                } else {
                    triggerUpload.addClass('Spinner--active').attr('disabled', true);
                    upload.addClass('Upload--disabled');
                    var dataObj = new FormData();
                    dataObj.append('action', 'kpiupload');
                    dataObj.append('idp', $('.js-idpKpi select').val());
                    dataObj.append(
                        field.attr('name'),
                        fileList[0],
                        fileList[0].name
                    );
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
                        dataType: 'json',
                        success: function(result) {
                            if (result['success']) {
                                var found = result['found'];
                                var notFound = result['not_found'];
                                var wrongIdp = result['wrong_idp'];
                                var repeat = 0;
                                if (result['repeat'] && result['repeat'].length) {
                                    repeat = result['repeat'].split('###').length;
                                }
                                var total = result['total'];
                                var block = $('.js-onlyClientsBlock');
                                block.find('.AddFromExcel__log').removeClass('d-n');
                                if (
                                    (notFound && notFound.length)
                                    || (wrongIdp && wrongIdp.length)
                                ) {
                                    var wrongCodesHtml = [];
                                    if (notFound && notFound.length) {
                                        block.find('.AddFromExcel__notFound').html('Не найдено кодов: <b>'
                                            + notFound.split('###').length + '</b>');
                                        wrongCodesHtml.push('<b>Неверные коды:</b>'
                                            + '<div class="AddFromExcel__wrongCodesList">'
                                            + notFound.split('###').join(', ')
                                            + '</div>');

                                    }
                                    if (wrongIdp && wrongIdp.length) {
                                        wrongCodesHtml.push('<b>Не соответствуют установленному подразделению:</b>'
                                            + '<div class="AddFromExcel__wrongCodesList">'
                                            + wrongIdp.split('###').join(', ')
                                            + '</div>');
                                    }
                                    if (wrongCodesHtml.length) {
                                        block.find('.AddFromExcel__wrongCodes').html(wrongCodesHtml.join(''));
                                    }
                                } else {
                                    block.find('.AddFromExcel__notFound').html('');
                                    block.find('.AddFromExcel__wrongCodes').html('');
                                }
                                var countAdd = 0;
                                for (var i = 0, ilen = found.length; i < ilen; i++) {
                                    var curClient = found[i].split('###');
                                    if (curClient[0] && curClient[1]) {
                                        var res = addClientToList(curClient[0], curClient[1]);
                                        if (res === 'success') {
                                            countAdd++;
                                        } else if (res === 'repeat') {
                                            repeat++;
                                        }
                                    }
                                }
                                if (repeat > 0) {
                                    block.find('.AddFromExcel__doubles').html(
                                        'Повтор в файле или уже есть в списке: <b>'
                                        + repeat
                                        + '</b>'
                                    );
                                } else {
                                    block.find('.AddFromExcel__doubles').html('');
                                }
                                if (total > 0) {
                                    block.find('.AddFromExcel__added').html(
                                        'Добавлено из файла <b>'
                                        + countAdd
                                        + '</b> кодов из <b>'
                                        + total
                                        + '</b>'
                                    );
                                } else {
                                    block.find('.AddFromExcel__added').html('');
                                }
                            } else if (result['error']) {
                                ShowTipTipError(
                                    triggerUpload,
                                    '<h4 style="margin: 0 0 .4em">Ошибка</h4>' + result['error']
                                );
                            }
                        },
                        complete: function() {
                            triggerUpload.removeClass('Spinner--active').attr('disabled', false);
                            upload.removeClass('Upload--disabled');
                        }
                    });
                }
            });
        }
        //~загрузка файла

        // снятие галки "Только по клиентам"
        $('.js-onlyClients').change(function(){
            var block = $('.js-onlyClientsBlock');
            block.toggle();
            if (block.find('.Item--record').length <= 0) {
                block.find('.Items__header, .js-removeList').hide();
            }
            if (!$(this).is(':checked')) {
                clearClientsListKpi();
            }
        });

        // Показ селекта сотрудников СРК
        if ($('.js-reportSrk').length > 0) {
            $(document).on('change', '.js-reportSrk > select', function() {
                if ($(this).val() === 'only_srk') {
                    $('.js-employeeSrk').show();
                    $('.js-RichSelectTpId').addClass('RichSelect--disabled');
                } else {
                    $('.js-employeeSrk').hide();
                    $('.js-RichSelectTpId').removeClass('RichSelect--disabled');
                }
            });
        }
        $(document).on('change', '.js-idpKpi > select', function () {
            var erpStores = $('.js-erpStores').val();
            var currentStore = $(this).val();
            var inputReportSrk = $('.js-reportSrk');
            var inputEmployeeSrk = $('.js-employeeSrk');
            var isErp = false;
            if (currentStore.indexOf('|', 0)) {
                var currentStores = currentStore.split('|');
                $.each(currentStores, function(index, store){
                    if (erpStores.indexOf(store, 0) !== -1) {
                        isErp = true;
                    }
                });
            }
            if (currentStore.length > 0) {
                inputReportSrk.show();
                if (inputReportSrk.find('select').val() === 'only_srk') {
                    $('.js-RichSelectTpId').addClass('RichSelect--disabled');
                    inputEmployeeSrk.show();
                } else {
                    inputEmployeeSrk.hide();
                }
            } else {
                inputReportSrk.hide();
                inputEmployeeSrk.hide();
                $('.js-RichSelectTpId').removeClass('RichSelect--disabled');
            }
        });

        if ($('.js-idpKpi').length) {
            $(document).on('change', '.js-idpKpi select', function(){
                var onlyClients = $('.js-onlyClients');
                if (onlyClients.length) {
                    if ($(this).val().length <= 0) {
                        onlyClients.parents('.filter').addClass('Blocked');
                        onlyClients = onlyClients.filter(':checked');
                        if (onlyClients.length) {
                            onlyClients.prop('checked', false);
                            onlyClients.trigger('change');
                        }
                    } else {
                        onlyClients.parents('.filter').removeClass('Blocked');
                    }
                }
            });
        }
        //~снятие галки "Только по клиентам"

        // удаление клиентов из списка
        $('.js-removeList').click(function() {
            clearClientsListKpi();
        });
        $(document).on('click', '.js-removeClient', function(){
            var block = $(this).closest('.js-onlyClientsBlock');
            var item = $(this).closest('.Item');
            item.remove();
            var records = block.find('.Item--record');
            if (records.length <= 0) {
                block.find('.Items__header, .js-removeList').hide();
            } else {
                for (var i = 0, ilen = records.length; i < ilen; i++) {
                    $(records[i]).find('.Item__box--number').text(i + 1);
                }
            }
            block.find('.AddFromExcel__log').addClass('d-n')
                .find('.AddFromExcel__doubles, .AddFromExcel__added, .AddFromExcel__notFound, .AddFromExcel__wrongCodes').html('');
        });
        //~ удаление клиентов из списка

        // добавление клиента по коду
        $('.js-clientCode').change(function(){
            var block = $(this).closest('.js-onlyClientsBlock');
            block.find('.js-clientAdditionError').html('');
            if ($.trim($(this).val()) != '') {
                var numberVal = $.trim($(this).val()).replace(/[^А-Я0-9-]/g, '');
                if (numberVal != $.trim($(this).val())) {
                    block.find('.js-clientAdditionError').html('Неверный код клиента');
                } else {
                    var bRepeat = false;
                    block.find('.Item--record .Item__box--code').each(function(){
                        if ($(this).text() === numberVal) {
                            bRepeat = true;
                            block.find('.js-clientAdditionError').html('Клиент уже присутствует в списке');
                        }
                    });
                    if (!bRepeat) {
                        if (window.ajaxSend) {
                            window.ajaxSend.abort();
                        }
                        window.ajaxSend = $.ajax({
                            url: document.location.pathname,
                            type: 'POST',
                            data: {
                                'action': 'clientcode',
                                'code': numberVal,
                                'idp': $('.js-idpKpi select').val()
                            },
                            cache: false,
                            dataType: 'json',
                            success: function(result) {
                                if (result['success']) {
                                    var curClient = result['success'].split('###');
                                    if (curClient[0] && curClient[1]) {
                                        var res = addClientToList(curClient[0], curClient[1]);
                                        if (res === 'repeat') {
                                            block.find('.js-clientAdditionError').html('Клиент уже присутствует в списке');
                                        } else if (res === 'success') {
                                            block.find('.js-clientCode').val('');
                                        }
                                    }
                                } else if (result['error_idp']) {
                                    block.find('.js-clientAdditionError')
                                        .html('Код клиента не соответствует установленному подразделению');
                                } else if (result['error']) {
                                    block.find('.js-clientAdditionError').html('Неверный код клиента');
                                } else if (result['error_not_used']) {
                                    block.find('.js-clientAdditionError').html('Неиспользуемый клиент');
                                }
                            }
                        });
                    }
                }
            }
        });
        //~ добавление клиента по коду

        // сброс формы
        $('.js-resetButton').click(function(){
            var onlyClients = $('.js-onlyClients');
            if (onlyClients.length) {
                onlyClients.parents('.filter').removeClass('Blocked');
                onlyClients = onlyClients.filter(':checked');
                if (onlyClients.length) {
                    onlyClients.prop('checked', false);
                    onlyClients.change();
                }
            }
            var idpSelect = $('.js-idpKpi');
            if (idpSelect.length) {
                idpSelect = idpSelect.find('select');
                if (idpSelect.length) {
                    var defValue = idpSelect.attr('data-def-value');
                    if (defValue && defValue.length) {
                        idpSelect.val(defValue).change();
                    }
                }
            }
            var typeSelect = $('.js-reportType');
            if (typeSelect.length) {
                typeSelect.val('year').change();
            }
            var multiselect = $('.js-RichSelectTpKpi, .js-RichSelectStatus2Kpi');
            if (multiselect.length) {
                multiselect.each(function(){
                    var selectElement = $(this);
                    unselectItem(selectElement.find('.js-multiselectAll'));
                    if (selectElement.is('.js-RichSelectStatus2Kpi')) {
                        selectElement.find('.js-multiselect').each(function(){
                           var inputValue = $(this).find('input').val();
                           if (['Средний', 'Мелкий'].indexOf(inputValue) >= 0) {
                               unselectItem($(this));
                           } else {
                               selectItem($(this));
                           }
                        });
                        getMultiSelected(selectElement);
                    } else {
                        selectElement.find('.js-multiselectAll input').change();
                    }
                });
            }
        });
        //~ сброс формы
    }
    //~ отчет о проработке клиентов

    //отчет ОКБ
    var okbFilterBlock = $('.js-okbFilterBlock').parents('.js-ajaxContentBlock');
    if (okbFilterBlock.length) {
        okbFilterBlock.on('change', '.js-RichSelectTwoLevels input', function() {
            var richSelect = $(this).parents('.js-RichSelectTwoLevels');
            var currentItem = $(this);
            var separateInput = richSelect.find('.js-filterSeparate:not(:checked)');
            richSelect.find('.js-multiselectGroup').each(function() {
                if ($(this).find(':checked').length && $(this).find(currentItem).length <= 0) {
                    var subItems = richSelect.find('.js-multiselect[data-id="' + $(this).attr('data-id') + '"].js-multiselectVisible input');
                    if (separateInput.length) {
                        subItems = subItems.filter(':not(.js-filterSeparateHide input)');
                    }
                    if (subItems.length <= 0 || subItems.length > subItems.filter(':checked').length) {
                        unselectItem($(this));
                    }
                }
            });
            if ($(this).parents('.js-RichSelect__option').length) {
                if ($(this).is(':checked')) {
                    selectItem($(this).parents('.js-RichSelect__option'));
                } else {
                    unselectItem($(this).parents('.js-RichSelect__option'));
                }
            }
            getMultiSelected(richSelect);
        });
        okbFilterBlock.on('change', 'input, select', function() {
            var eventSource = $(this);
            window.setTimeout(function() {
                var filterBlock = $('.filters');
                if (filterBlock.length <= 0) {
                    return;
                }
                var blockedClass = 'Blocked';
                var event = filterBlock.find('.js-okbEvent');
                var makeReport = filterBlock.find('.js-makeReport');
                var dbButton = filterBlock.find('.js-downloadExcelDB');
                var responsible = filterBlock.find('.js-RichSelectResponsible');
                var responsibleObk = filterBlock.find('.js-RichSelectResponsibleOkb');
                var status2 = filterBlock.find('.js-okbStatus2');
                var status1 = filterBlock.find('.js-okbStatus1');
                var stateEmployee = filterBlock.find('.js-stateEmployee');
                var contactsStatus = filterBlock.find('.js-contactsStatus');
                var isEventChange = eventSource.is('.js-okbEvent');
                var makeBlocked = status2.find('.js-multiselect input:checked').length <= 0 || isEventChange;
                var blockStateEmployeeAndContactsStatus = false;
                var arStatus1 = [];
                var status1Unset = false;
                if (event.length) {
                    if (event.val().length) {
                        switch (event.val()) {
                            case 'A':
                                blockStateEmployeeAndContactsStatus = true;
                            case 'D':
                                arStatus1 = ['реальный_1', 'реальный_NEW'];
                                makeBlocked = makeBlocked
                                    || (responsible.find('input:checked').length <= 0
                                        && responsibleObk.find('input:checked').length <= 0);
                                break;
                            case 'B':
                                arStatus1 = ['потенциальный_NEW'];
                                makeBlocked = makeBlocked
                                    || (responsible.find('.js-multiselectGroup input:checked, .js-level2 input:checked').length <= 0
                                        && responsibleObk.find('input:checked').length <= 0);
                                break;
                            case 'C':
                            case 'E':
                                arStatus1 = ['реальный_1', 'реальный_NEW', 'реальный_OLD-', 'реальный_OLD+'];
                                makeBlocked = makeBlocked
                                    || (responsible.find('input:checked').length <= 0
                                        && responsibleObk.find('input:checked').length <= 0);
                                break;
                            case 'F':
                                status1Unset = isEventChange;
                                makeBlocked = makeBlocked
                                    || status1.find('.js-multiselect input:checked').length <= 0
                                    || (responsible.find('input:checked').length <= 0
                                        && responsibleObk.find('input:checked').length <= 0);
                                break;
                            case 'G':
                                arStatus1 = ['потенциальный_NEW', 'потенциальный_OLD', 'реальный_1',
                                    'реальный_NEW', 'реальный_OLD-', 'реальный_OLD+', 'потерянный_NEW',
                                    'потерянный_OLD'];
                                makeBlocked = makeBlocked
                                    || (responsible.find('input:checked').length <= 0
                                        && responsibleObk.find('input:checked').length <= 0);
                                blockStateEmployeeAndContactsStatus = true;
                                break;
                        }
                        if (status1.length) {
                            if (arStatus1.length) {
                                status1.find('.RichSelect__option').each(function() {
                                    var currentVal = $(this).find('input').val();
                                    if (currentVal.length && arStatus1.indexOf(currentVal) >= 0) {
                                        selectItem($(this));
                                    } else {
                                        unselectItem($(this));
                                    }
                                });
                                status1.find('.RichSelect__options').addClass('RichSelect__options--disabled');
                            } else {
                                status1.find('.RichSelect__options').removeClass('RichSelect__options--disabled');
                                if (status1Unset) {
                                    status1.find('.RichSelect__option').each(function() {
                                        unselectItem($(this));
                                    });
                                }
                            }
                            getMultiSelected(status1);
                        }
                    } else {
                        makeBlocked = true;
                    }
                }
                if (blockStateEmployeeAndContactsStatus) {
                    stateEmployee.children('option:first').prop('selected', true);
                    contactsStatus.children('option:first').prop('selected', true);
                }
                makeReport.toggleClass(blockedClass, makeBlocked);
                stateEmployee.toggleClass(blockedClass, blockStateEmployeeAndContactsStatus);
                contactsStatus.toggleClass(blockedClass, blockStateEmployeeAndContactsStatus);
                if (status2.length && dbButton.length) {
                    if (isEventChange) {
                        status2.find('.RichSelect__option').each(function() {
                            unselectItem($(this));
                        });
                        getMultiSelected(status2);
                    }
                    dbButton.toggleClass(blockedClass, (status2.find('.js-multiselect input:checked').length <= 0));
                }
                filterBlock.find('.js-clearFilterReport').removeClass(blockedClass);

            }, 100);
        });
        // пользовательская функция, выполняется после загрузки формы
        setAjaxContentCallback(function(){
            okbFilterBlock.find('.js-RichSelect .RichSelect__option--active .RichSelect__input').each(function( index ) {
                $(this).change();
            });
            okbFilterBlock.find('.js-RichSelectResponsible .js-multiselect input:last').change();
        });
    }
    //~отчет ОКБ

    // отчет по каналам привлечения
    var uploadXls = $('.js-UploadInput');
    if (uploadXls.length) {
        uploadXls.on('change', function(){
            var name = $(this).val();
            if (!/\.xlsx?/.test(name)) {
                alert('Ошибка! Это должен быть xls или xlsx файл');
            } else {
                $(this).parents('form').submit();
            }
        });
    }
    //~отчет по каналам привлечения

    // скачивание списка страниц канала привлечения Seo
    var downloadSeoPage = $('.js-downloadSeoPage');
    if (downloadSeoPage.length) {
        $(document).on('click', '.js-downloadSeoPage', function(){
            downloadSeoPage.addClass('Spinner--active').attr('disabled', true);
            if (window.ajaxSend) {
                window.ajaxSend.abort();
            }

            window.ajaxSend = $.ajax({
                url: document.location.pathname,
                type: 'POST',
                data: {
                    'downloadSeoPage': '1'
                },
                cache: false,
                dataType: 'json',
                success: function(result) {
                    if (result['result'] != null) {
                        document.location.href = result['result'];
                    }
                },
                complete: function() {
                    downloadSeoPage.removeClass('Spinner--active').attr('disabled', false);
                }
            });
        });
    }
    //~ скачивание списка страниц канала привлечения Seo

    // "успей купить выгодно"
    if ($('#js-actionsManualPage').length) {
        // загрузка файла
        var addActionsFromExcel = $('.js-addFromExcel');
        if (addActionsFromExcel.length) {
            addActionsFromExcel.on('click', function() {
                if ($('.js-importActions').length <= 0) {
                    $(this).parents('.Upload__label')
                        .prepend('<input name="xls" class="Upload__field js-importActions" type="file">');
                }
            });
            $(document).on('change', '.js-importActions', function() {
                var fileList = $(this)[0].files;
                var field = $(this);
                var upload = field.closest('.Upload');
                var triggerUpload = upload.find('.js-addFromExcel');
                if (!/\.xlsx?$/i.test(fileList[0].name)) {
                    showUploadInfo(['Неверный формат файла']);
                    $(field).remove();
                } else if ((fileList[0].size / 1048576).toFixed(0) >= 10) {
                    showUploadInfo(['Недопустимый размер файла.<br>Максимальный размер: 10 Мбайт']);
                    $(field).remove();
                } else {
                    hideUploadInfo();
                    triggerUpload.addClass('Spinner--active').attr('disabled', true);
                    upload.addClass('Upload--disabled');
                    var dataObj = new FormData();
                    dataObj.append('action', 'upload');
                    dataObj.append(
                        field.attr('name'),
                        fileList[0],
                        fileList[0].name
                    );
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
                        dataType: 'json',
                        success: function(result) {
                            showUploadInfo(result['error'], result['success']);
                        },
                        complete: function() {
                            triggerUpload.removeClass('Spinner--active').attr('disabled', false);
                            upload.removeClass('Upload--disabled');
                            upload.find('.js-importBanners').remove();
                        }
                    });
                }
            });
        }
        //~загрузка файла
    }
    //~ "успей купить выгодно"

    // привязка к организации в учетных записях
    var linkUserClient = $('.js-userClientCode');
    if (linkUserClient.length) {
        linkUserClient.on('click', function() {
            var button = $(this);
            var userClientBlock = button.parents('.js-userClientCodeBlock');
            if (userClientBlock.length) {
                var inputElement = userClientBlock.find('input');
                if (inputElement.length) {
                    inputElement.removeClass('error');
                    userClientBlock.find('.Update__error').remove();
                    if ($.trim(inputElement.val()) === '') {
                        return false;
                    }
                    button.addClass('Spinner--active').attr('disabled', true);
                    $.ajax({
                        url: document.location.href,
                        type: 'POST',
                        data: {
                            'action': 'clientcode',
                            'code': inputElement.val()
                        },
                        cache: false,
                        dataType: 'json',
                        success: function(result) {
                            if (result['success']) {
                                window.location.reload();
                            } else if (result['error']) {
                                inputElement.addClass('error');
                                userClientBlock.find('.Update__results').append('<div class="Update__error">'
                                    + result['error']
                                    + '</div>');
                                userClientBlock.find('.Update__results').slideDown();
                            }
                        },
                        complete: function() {
                            button.removeClass('Spinner--active').attr('disabled', false);
                        }
                    });
                }
            }
        });
    }
    //~привязка к организации в учетных записях

    //Деактивация учётной записи
    $(document).on('click', '.js-deactivateAccount', function() {
        var fio = $('.Specs__content[data-fio="1"]');
        var email = $('.Specs__content[data-email="1"]');
        var content = $('<div class="FancyModal FancyModal--deactivateAccount">'
            + '<h2 class="FancyModal__header">Деактивация учётной записи</h2> <div class="FancyModal__content">'
            + 'Вы точно хотите деактивировать учётную запись<br><b>'
            + fio.text()
            + '</b> (' + email.text() + ')?'
            + '</div> <div class="FancyModal__control">'
            + '<button class="btn btnError js-deactivateAccountAccept">Деактивировать<span class="Spinner"></span></button>'
            + '<button class="btn btnMain btnOutline FancyModal__cancel" onclick="$.fancybox.close()">Отмена</button></div></div>');
        $.fancybox({
            'content': content,
            'padding': 0,
            'showCloseButton': false
        });
        content.on('click', '.js-deactivateAccountAccept', function() {
            var fancy = $('#fancybox-content');
            fancy.find('.js-deactivateAccountAccept').addClass('Spinner--active');
            $.ajax({
                url: document.location.href,
                type: 'POST',
                data: {
                    action: 'deactivate'
                },
                dataType: 'json',
                cache: false,
                success: function(result) {
                    $.fancybox({
                        'content': '<div class="FancyModal FancyModal--trouble">'
                            + '<div class="FancyModalSuccess">'
                            + '<div class="FancyModal__header">'
                            + result['deactivation']
                            + '</div>'
                            + '<button class="btnMain btnOutline FancyModal__cancel" type="reset" onclick="document.location.reload();">Закрыть</button>'
                            + '</div> </div>',
                        'padding': 0,
                        'showCloseButton': false,
                        onClosed: function () {
                            document.location.reload();
                        }
                    });
                },
                error: function() {
                    alert('Произошла неизвестная ошибка');
                    document.location.reload();
                }
            });
        });
    });
    //~Деактивация учётной записи

    // Активация учетной записи
    $(document).on('click', '.js-activateAccount', function() {
        var fio = $('.Specs__content[data-fio="1"]');
        var email = $('.Specs__content[data-email="1"]');
        var content = $('<div class="FancyModal FancyModal--activateAccount">'
            + '<h2 class="FancyModal__header">Активация учётной записи</h2> <div class="FancyModal__content">'
            + 'Вы точно хотите активировать учётную запись<br><b>'
            + fio.text()
            + '</b> (' + email.text() + ')?'
            + '</div> <div class="FancyModal__control">'
            + '<button class="btn btnMain js-activateAccountAccept">Активировать<span class="Spinner"></span></button>'
            + '<button class="btn btnMain btnOutline FancyModal__cancel" onclick="$.fancybox.close()">Отмена</button></div></div>');
        $.fancybox({
            'content': content,
            'padding': 0,
            'showCloseButton': false
        });
        content.on('click', '.js-activateAccountAccept', function() {
            var fancy = $('#fancybox-content');
            fancy.find('.js-activateAccountAccept').addClass('Spinner--active');
            $.ajax({
                url: document.location.href,
                type: 'POST',
                data: {
                    action: 'activate'
                },
                dataType: 'json',
                cache: false,
                success: function(result) {
                    $.fancybox({
                        'content': '<div class="FancyModal FancyModal--trouble">'
                            + '<div class="FancyModalSuccess">'
                            + '<div class="FancyModal__header">'
                            + result['activation']
                            + '</div>'
                            + '<button class="btnMain btnOutline FancyModal__cancel" type="reset" onclick="document.location.reload();">Закрыть</button>'
                            + '</div> </div>',
                        'padding': 0,
                        'showCloseButton': false,
                        onClosed: function () {
                            document.location.reload();
                        }
                    });
                },
                error: function() {
                    alert('Произошла неизвестная ошибка');
                    document.location.reload();
                }
            });
        });
    });
    //~Активация учетной записи

    // радио-батон перевязка заказов пользователя в учетных записях
    $(document).on('change', '.js-orderRadio', function() {
        var isAdmin = ($(this).val() === 'admin');
        $('.js-disableAuxWhenUnchecked')
            .find('.OrdersOwner__title')
            .toggleClass('Blocked', !isAdmin)
            .parent()
            .find('.Form__fieldAux input, select')
            .attr('disabled', !isAdmin);
    });
    // ~радио-батон перевязка заказов пользователя в учетных записях

    // список тестов за выбранный период в статистике поиска
    var spoilerTriggerSearchStatTests = $('.js-spoilerTriggerSearchStatTests');
    if (spoilerTriggerSearchStatTests.length) {
        $(document).on('click', '.js-spoilerTriggerSearchStatTests', function() {
            var button = $(this);
            var block = button.closest('.Spoiler');
            if (button.attr('data-send')) {
                block.toggleClass('Spoiler--open')
                    .removeClass('Spoiler--loading')
                    .find('.Spoiler__content')
                    .stop()
                    .slideToggle(200);
            } else {
                var dateFrom = button.attr('data-from');
                var dateTo = button.attr('data-to');
                if (!dateFrom || !dateTo) {
                    return;
                }
                block.addClass('Spoiler--loading');
                button.removeClass('js-spoilerTriggerSearchStatTests');
                $.ajax({
                    url: '/ajax/desk/stat_search.php',
                    type: 'POST',
                    data: {
                        'action': 'AbTest',
                        'DATE_FROM': dateFrom,
                        'DATE_TO': dateTo
                    },
                    cache: false,
                    dataType: 'json',
                    success: function(result) {
                        if (result.result) {
                            block.after(result.result);
                            block.remove();
                        } else if (result.error) {
                            alert(result.error);
                        }
                    },
                    complete: function() {
                        if (button.length) {
                            button.addClass('js-spoilerTriggerSearchStatTests');
                        }
                        if (block.length) {
                            block.removeClass('Spoiler--loading');
                        }
                    }
                });
            }
        });
    }
    //~ список тестов за выбранный период в статистике поиска

    //территории
    var deleteTerritory = $('.js-deleteTerritory');
    if (deleteTerritory.length) {
        deleteTerritory.on('click', function(e) {
            var oldAgentID = $('input[name="old_agent_id"]').val();
            if (oldAgentID != null && oldAgentID > 0) {
                e.preventDefault();
                $.fancybox({
                    'content': '<div class="FancyModal FancyModal--removeTerritories">' +
                        '<h2 class="FancyModal__header">Удаление территории</h2> <div class="FancyModal__content">' +
                        'Чтобы получить возможность удалить территорию, удалите связь данной территории с торговым агентом.' +
                        '</div> <div class="FancyModal__control">' +
                        '<button class="btnMain btnOutline FancyModal__cancel js-closeFancybox">Закрыть</button></div></div>',
                    'padding': 0,
                    'showCloseButton': false
                });
            } else {
                var oldTerritoryName = '';
                var oldTerritory = $('input[name="old_territory_name"]');
                if (oldTerritory.val() != null) {
                    oldTerritoryName = oldTerritory.val();
                }
                $.fancybox({
                    'content': '<div class="FancyModal FancyModal--removeTerritories">' +
                        '<h2 class="FancyModal__header">Удаление территории</h2> <div class="FancyModal__content">' +
                        'Внимание! Маршруты, привязанные к данной территории (если таковые есть) будут ' +
                        'безвозвратно удалены. Вы действительно желаете удалить территорию ' +
                        oldTerritoryName +
                        '?</div> <div class="FancyModal__control">' +
                        '<button class="btn btnMain js-confirm">Удалить</button>' +
                        '<button class="btnMain btnOutline FancyModal__cancel js-closeFancybox">Отмена</button></div></div>',
                    'padding': 0,
                    'showCloseButton': false,
                    onComplete: function() {
                        $('#fancybox-content .js-confirm').on('click', function() {
                            $('#territories_form')
                                .append('<input type="hidden" name="btn_territory_del" value="Y">')
                                .submit();
                        });
                    }
                });
            }
            return false;
        });
    }
    //~территории

    // товары-индикаторы
    if ($('#js-kviPageItems').length) {
        initKviPage();
        window.ajaxBlock.on('js-ajaxContentReady', function () {
            initKviPage();
        });
    }
    if ($('.js-kviSpecialFilter input').length) {
        $(document).on('change', '.js-kviSpecialFilter input', function() {
            if ($(this).prop('checked')) {
                $('select[name=PROPERTY_ACTIVE_IDP]').addClass('Blocked').attr('disabled', true);
            } else {
                $('select[name=PROPERTY_ACTIVE_IDP]').removeClass('Blocked').attr('disabled', false);
            }
        });
        $('.js-kviSpecialFilter input').change();
        window.ajaxBlock.on('js-ajaxContentReady', function () {
            $('.js-kviSpecialFilter input').change();
        });
    }
    //~товары-индикаторы


    //блок с номерами телефонов
    $(document).on('js-eventPhoneRemoveButtonToggle', '.js-phoneItem', function() {
        var wrap = $(this).parent();
        var canShow = (wrap.find('.js-phoneItem').length > 1);
        wrap.find('.js-phoneRemoveButtonWrap').toggle(canShow);
    });
    $(document).on('click', '.js-phoneAppendButton', function(){
        var phoneLast = $(this).parents('.js-phoneItem').parent().find('.js-phoneItem').last();
        var phone = phoneLast.clone();
        var tmp = 0;
        phone.find('input').each(function(){
            var name = $(this).attr('name');
            if (name.indexOf('[') >= 0) {
                name = name.substring(name.indexOf('[') + 1);
                name = name.substring(0, name.indexOf(']'));
                if (parseInt(name)) {
                    tmp = parseInt(name);
                }
            }
        });
        phone.find('input, textarea').each(function() {
            $(this).val('').attr('name', $(this).attr('name').replace('[' + tmp + ']', '[' + (tmp + 1) + ']'));
        });
        phone.find('.Form__error').remove();
        phone.find('.error').removeClass('error');
        phone.find('[data-error-text]').removeAttr('data-error-text');
        initPhoneMask(phone.find('.js-phoneMask'));
        phoneLast
            .after(phone)
            .trigger('js-eventPhoneRemoveButtonToggle');
        phone.find('input').first().focus();
        $(this).parent('.js-phoneAppendButtonWrap').remove();
    });
    $(document)
        .on('click', '.js-phoneItem .js-phoneRemoveButton', function() {
            var phonesBlock = $(this).parents('.js-phoneItem').parent();
            var addPhoneButton = phonesBlock.find('.js-phoneAppendButtonWrap').detach();
            $(this).parents('.js-phoneItem').remove();
            var lastPhoneItem = phonesBlock.find('.js-phoneItem').last();
            addPhoneButton.appendTo(lastPhoneItem);
            setTimeout(function() {
                    lastPhoneItem.trigger('js-eventPhoneRemoveButtonToggle');
                },
                50
            );

        });
    //~блок с номерами телефонов

    //показ информации о клиенте
    window.ajaxBlock.on('click', '.js-showPartnerInfo', function(){
        var erpId = $(this).attr('data-erp-id');
        if (erpId && erpId.length) {
            $.ajax({
                url: '/ajax/desk/client_info.php',
                type: 'POST',
                data: {
                    action: 'getInfoPartner',
                    erp_id: erpId
                },
                dataType: 'json',
                success: function(result) {
                    if (result['html'] && result['html'].length) {
                        $.fancybox({
                            content: result['html'],
                            padding: 0,
                            showCloseButton: false
                        });
                    }
                }
            });
        }
    });
    //~показ информации о клиенте

    //переход по клику на строку
    $('.js-clickLink').each(function(){
        if ($(this).find('.js-clickLinkUrl').length) {
            var url = $(this).find('.js-clickLinkUrl').val();
            $(this).find('.js-clickLinkTrigger').click(function(){
                window.location.href = url;
            });
        }
    });
    //~переход по клику на строку

    // аккордеон
    $(document).on('click', '.js-folding', function(e){
        e.stopPropagation();
        var parent = $(this).closest('.js-foldingParent');
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
    });
    //~ аккордеон

    // группа чекбоксов с переключением класса
    if ($('.js-checkedList').length) {
        $(document).on('change', '.js-checkedCheck', function() {
            var parentSelector = $(this).attr('data-parent');
            var classToggle = $(this).attr('data-class');
            if (parentSelector && classToggle) {
                var parent = $(this).closest(parentSelector);
                if (parent.length) {
                    parent.toggleClass(classToggle);
                }
            }
            var checkList = $(this).closest('.js-checkedList');
            if (checkList.length) {
                var allChecked = checkList.find('.js-checkedCheckAll');
                allChecked.prop('indeterminate', false);
                if (checkList.find('.js-checkedCheck:checked').length) {
                    if (checkList.find('.js-checkedCheck').length === checkList.find('.js-checkedCheck:checked').length) {
                        allChecked.prop('checked', true);
                    } else {
                        allChecked.prop('indeterminate', true);
                    }
                } else {
                    allChecked.prop('checked', false);
                }
            }
        });
        $(document).on('change', '.js-checkedCheckAll', function() {
            var checkList = $(this).closest('.js-checkedList');
            var bChecked = $(this).is(':checked');
            if (checkList.length) {
                var selector = '.js-checkedCheck';
                if (bChecked) {
                    selector += ':not(:checked)';
                } else {
                    selector += ':checked';
                }
                checkList.find(selector).each(function(){
                    $(this).prop('checked', bChecked);
                    var parentSelector = $(this).attr('data-parent');
                    var classToggle = $(this).attr('data-class');
                    if (parentSelector && classToggle) {
                        var parent = $(this).closest(parentSelector);
                        if (parent.length) {
                            parent.toggleClass(classToggle);
                        }
                    }
                });
            }
        });
    }
    // ~ группа чекбоксов с переключением класса

    // страница "Обмен с внешними сервисами"
    if ($('.js-ymlPage').length) {
        $('.js-ymlDateFrom').on('change', function(){
            var date = $(this).val();
            var dateTo = $(this).closest('.filter').find('.js-ymlDateTo');
            if (date.length && dateTo.length) {
                var fromDate = date.split('.').reverse().join('-');
                if (fromDate.length) {
                    var minDate = new Date(Date.parse(fromDate));
                    var setDate = new Date(Date.parse(fromDate));
                    minDate.setDate(minDate.getDate() + 1);
                    $(dateTo).datepicker('option', 'minDate', minDate);
                    setDate.setDate(setDate.getDate() + 90);
                    $(dateTo).datepicker('setDate', setDate);
                    dateTo.nextAll('.ui-datepicker-trigger').addClass('btn date');
                }
            }
        });
    }

    // служебные комментарии в сообщениях о ненайденных товарах
    if ($('.js-missedGoodsRespComments').length) {
        $(document).on('click', '.js-missedGoodsRespComments', function(){
            var commentText = $('#js-missedGoodsRespCommentsComment').val();
            if (commentText && commentText.length) {
                $(this).addClass('Spinner--active').attr('disabled', true);
                ReloadAjaxContent(document.location.href, {'resp_comment': commentText});
            } else {
                ShowTipTipError($(this), 'Введите текст комментария');
            }
        });
    }
    //~ служебные комментарии в сообщениях о ненайденных товарах
    if ($('.js-CommentSend').length) {
        $('.js-tipMaxLength').keyup(function(){
            var count = $(this).val().length; // кол-во уже введенных символов
            if (count > 500) {
                $(this).tipTip({
                    activation: 'manual',
                    defaultPosition: 'right',
                    theme: 'white',
                    maxWidth: 160,
                    edgeOffset: 5,
                    content: 'Введено максимальное количество символов'
                }).tipTip('show');
                $(this).val($(this).val().substring(0, 500));
                window.setTimeout(function () {
                    $(document).one('click', function () {
                        HideTipTipError();
                    });
                }, 300);
            }

        });
        $(document).on('click', '.js-CommentSend', function (e) {
            var blockText = $(this).parents().find('textarea#comment');
            if (blockText.val().length > 0) {
                var dataSend = {
                    action: 'sendComment',
                    comment: blockText.val()
                };
                $('.Spinner').addClass('Spinner--active');
                $.ajax({
                    url: document.location.href,
                    type: 'POST',
                    data: dataSend,
                    dataType: 'json',
                    success: function (result) {
                        if (result['comment'] != undefined
                            && result['user'] != undefined
                            && result['time'] != undefined) {
                            blockText.parents().find('.Form').before('<div class="Reply__container">\n' +
                                '<div class="ReplyInfo">\n' +
                                '<span class="ReplyInfo__author">' + result['user'] + '</span><span class="ReplyInfo__date">' + result['time'] + '</span>\n' +
                                '</div>\n' +
                                '<div class="ReplyText">' + result['comment'] + '</div>\n' +
                                '</div>');
                            blockText.val('');
                            $('.Spinner').removeClass('Spinner--active');
                            if ($('.js-tipMaxLength').tipTip().length > 0) {
                                $('.js-tipMaxLength').tipTip('destroy');
                            }
                        }
                    }
                });
            } else if (blockText.val().length == 0) {
                blockText.parent().find('.Form__error').text('Введите комментарий');
                blockText.addClass('error');
            }
        });
    }

    // инициализация выбора по ajax
    initAjaxSelect();
    // вывод ошибок по ajax
    initAjaxFancyError();
    // маска телефона
    initPhoneMask();

    // взаимодействие с фильтрами
    initFilterInterface();
    window.ajaxBlock.on('js-ajaxContentReady', initFilterInterface);
    // перелистывание контактов
    initContactsPagination();
    window.ajaxBlock.on('js-ajaxContentReady', initContactsPagination);
    // взаимодействие с автодополняемыми полями ввода
    initAutocompleteInterface();
    window.ajaxBlock.on('js-ajaxContentReady', initAutocompleteInterface);

    // навешивание scrollbox на схему иерархии erp партнеров
    $(document).on('click', '.js-tabHeaderRelated', function(){
        $('.js-hierarchyScheme').scrollbox();
    });
    //~навешивание scrollbox на схему иерархии erp партнеров

});
//~обработка по событию ready

function tableShow(selectVal) {
    var contactNoneffective = $('.js-tableTheme');
    contactNoneffective.each(function( index, item ) {
        item.style.display = 'none';
    });
    var selectedBlock = $('.js-tableTheme[data-type="' + selectVal + '"]');
    selectedBlock.show();
}

//Проверка формы соглашения/грузополучателя на наличие установленных чекбоксов
function submitAgreementForm(form) {
    var errorText = $(form).attr('data-error-text');
    $(form).find('.js-errorText').remove();
    if ($(form).find('input[type=checkbox]:checked').length > 0) {
        return true;
    } else {
        $(form).find('.FancyModal__content').append('<div class="Form__error js-errorText">' + errorText + '</div>');
        $(form).find('.btnMain').removeClass('Spinner--active');
        return false;
    }
}
//~Проверка формы соглашения/грузополучателя на наличие установленных чекбоксов

//обработка по событию load
$(window).load(function(){
	//отложенная загрузка скрипта yandex maps
	if ($('.js-geoEventsMap').length) {
		var element = document.createElement('script');
		element.type = 'text/javascript';
		element.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU&apikey=2259dfe5-be84-4677-8b62-cbc65c3097e7&load=package.full&onload=initmaps';
		document.body.appendChild(element);
	}
	//~отложенная загрузка скрипта yandex maps

    //Обработчик для формы ContactForm
    $(document).on('click', '.js-ContactForm', function () {
        var obj = $(this).data();
        var objSend = {};
        if (obj !== undefined) {
            for (var prop in obj) {
                if(typeof prop === 'string'){
                    objSend[prop.toUpperCase()] = obj[prop];
                }
            }
        }
        if ($(this).hasClass('js-contactsPagination') && $(this).attr('data-contact-id') !== undefined) {
            objSend = {ID:$(this).data('contact-id')};
        }
        ContactForm(objSend);
    });
    $('.js-ErrorLogin1C').on('click', function () {
        ErrorLogin1C();
    });
    //~Обработчик для формы ContactForm
});
//~обработка по событию load


