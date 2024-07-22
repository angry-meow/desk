//обработка по событию ready
$(document).ready(function () {
    if ($('.js-tipOnComment').length && initTipOfComments != undefined) {
        initTipOfComments();
    }
    //закрытие фэнсибокса
    $(document).on('click', '.js-closeFancybox', function (e) {
        e.preventDefault();
        $.fancybox.close();
    });
    //~закрытие фэнсибокса

    //закрытие фэнсибокса
    if ($('.js-fancyboxViewInfo').length > 0) {
        $.fancybox({
            content: $('.js-fancyboxViewInfo').html(),
            padding: 0,
            showCloseButton: false
        });
    }
    //~закрытие фэнсибокса

    //ограничение на ввод текста в числовых полях
    $(document).on('keyup', 'input[data-max], input[data-min]', function (e) {
        var valueOfButton = e.key;
        var valueOfField = $(this).val();
        var maxValue = $(this).attr('data-max');
        var minValue = $(this).attr('data-min');
        if (e.ctrlKey || e.altKey || e.metaKey) {
            // сочетания со специальными клавишами не блокируются
            return;
        }
        if (valueOfButton >= 0 && valueOfButton <= 9) {
            if (maxValue && parseInt(valueOfField) > parseInt(maxValue)) {
                if (!$(this).is('.js-notRewrite')) {
                    $(this).val(maxValue);
                }
                return false;
            }
            if (minValue && parseInt(valueOfField) < parseInt(minValue)) {
                if (!$(this).is('.js-notRewrite')) {
                    $(this).val(minValue);
                }
                return false;
            }
        } else if (valueOfButton !== 'Backspace') {
            $(this).val(valueOfField.replace(/\D/g, ''));
        }
    });
    //~ограничение на ввод текста в числовых полях

    //ограничитель на ввод текста, только числа
    $(document).on('keypress', '.js-inputFloat', function (e) {
		if ((e.which < 48 || e.which > 58)
            && e.which !== 0
            && e.which !== 8
            && e.which !== 32
            && e.which !== 44
            && e.which !== 46) {
            return false;
        }
    });
    //~ограничитель на ввод текста, только числа



    //календарь
    if ($('.js-dateInput').length > 0) {
        InitDatePicker();
    }
    //~календарь

    //подсказка о статусе рассылок
    if ($('.js-tipOnHover, .js-tipLastComments').length) {
        initTipOnHover();
    }
    //~подсказка о статусе рассылок

    //подключаем tipTip
    $(document).on('mouseenter', '.js-tipTip', function() {
        if (!$(this).data().tipTip) {
            $(this).tipTip({
                resetPaddingContent: $(this).attr('data-reset-padding') === 'true',
                defaultPosition: $(this).attr('data-position') ? $(this).attr('data-position') : 'top',
                theme: 'white',
                delay: 100,
                delayHide: $(this).attr('data-delayHide') ? parseInt($(this).attr('data-delayHide')) : 0,
                fadeIn: 0,
                fadeOut: 200,
                edgeOffset: $(this).attr('data-edge-offset') ? parseInt($(this).attr('data-edge-offset')) : 5,
                maxWidth: $(this).attr('data-width') ? parseInt($(this).attr('data-width')) : 'auto',
                cssClass: $(this).attr('data-class') ? $(this).attr('data-class') : ''
            });
            $(this).mouseenter();
        }
    });
    $(document).on('click', '.js-tipTipClick', function (e) {
        e.preventDefault();
        if (!$(this).data().tipTip) {
            var defaultPosion = 'bottom';
            var curPosition = $(this).attr('data-default-position');
            if (curPosition && curPosition.length > 0) {
                defaultPosion = curPosition;
            }
            var edgeOffset = $(this).attr('data-edge-offset');
            $(this).tipTip({
                activation: 'click',
                resetPaddingContent: $(this).attr('data-reset-padding') === 'true'
                    || !!$(this).hasClass('js-isResetPadding'),
                defaultPosition: defaultPosion,
                theme: 'white',
                edgeOffset: edgeOffset ? parseInt(edgeOffset) : 0,
                maxWidth: $(this).attr('data-width')
                    ? parseInt($(this).attr('data-width')) : 'auto',
                keepAlive: true,
                hideOnClick: true,
                container: $(this).parents('#fancybox-wrap').length
                    ? '#fancybox-wrap' : ''
            }).tipTip('show');
        }
    });
    //~тип по клику


    //прелоад на кнопках, проверка формы при отправке
    $('.js-checkFormSend').on('submit', function (e) {
        var objForm = $(this);
        if (objForm.prop('js-isBlockForm')) {
            return false;
        }
        objForm.prop('js-isBlockForm', 1);
        var objButton = $(e.originalEvent.explicitOriginalTarget).filter('button');
        objButton.attr('disabled', 'disabled');
        if (!objButton.hasClass('js-checkFormSendButtonNoCheck')) {
            objForm.find('.js-checkFormSendButton').remove();
            if (CheckFormRequired(objForm)) {
                if (objButton.children('.Spinner').length) {
                    objButton.addClass('Spinner--active');
                }
                objButton.after('<input type="hidden" class="js-checkFormSendButton" name="'
                    + objButton.attr('name') + '" value="' + objButton.attr('value') + '" />');
                return true;
            }
            objButton.attr('disabled', false);
            objForm.prop('js-isBlockForm', 0);
            return false;
        }
        return true;
    });
    //~прелоад на кнопках, проверка формы при отправке


    //блок контента с обновлением по ajax
    window.ajaxBlock = $('.js-ajaxContentBlock');
    if (window.ajaxBlock.length > 0) {
        //триггер ajax после обновления страницы
        window.ajaxBlock.on('js-ajaxContentReady', function () {
            //переход по ссылкам из span и других элементов
            var fakeHref = $('[data-fake-href]');
            if (fakeHref.length > 0) {
                fakeHref.on('click', function (e) {
                    e.preventDefault();
                    var href = $(this).attr('data-fake-href');
                    if (href.length > 0) {
                        document.location.href = href;
                    }
                    return false;
                });
            }
            //~переход по ссылкам из span и других элементов

            //календарь
            if ($('.js-dateInput').length > 0) {
                InitDatePicker();
            }
            //~календарь

            // Смена кол-ва элементов на странице
            if ($('.js-onChangeSelect').length && $('.js-controlPanelPagination').length) {
                $(document).on('change', '.js-onChangeSelect', InitCountElementPage);
            }

            //типТипы
            var tipOnHover = $('.js-tipOnHover, .js-tipLastComments');
            if (tipOnHover.length > 0) {
                initTipOnHover();
            }
            if ($('.js-tipOnComment').length) {
                initTipOfComments();
            }
            //~типТипы

            // Тип-тип незавершенный товар в корзине клиента
            initTipFullBasket();
            // ~Тип-тип незавершенный товар в корзине клиента

            // UI Spoiler -->
            initSpoiler();
            // <-- UI Spoiler
        });
        //~триггер ajax после обновления страницы

        //ссылки ajax
        window.ajaxBlock.on('click', '.js-ajaxLink', function () {
            var objSend = $(this).attr('data-obj');
            var objLink = $(this).attr('data-link');
            if (objSend.length > 0) {
                eval('objSend = ' + objSend + ';');
                var callback = $(this).attr('data-callback');
                if (callback.length > 0) {
                    eval('callback = ' + callback + ';');
                }
                var url = (objLink !== undefined) ? objLink : '';
                if (callback && typeof (callback) === 'function') {
                    ReloadAjaxContent(url, objSend, true, callback);
                } else {
                    ReloadAjaxContent(url, objSend, true);
                }
            }
            return false;
        });

    }
    //~блок контента с обновлением по ajax

    // интервал дат в фильтре
    $(document).on('change', '.js-filterPeriodInput', function() {
        var millisecondsInDay = 86400000;
        var daysLimit = $(this).attr('data-days-limit');
        var $inputFrom = $(this).is('.js-filterPeriodInputFrom')
            ? $(this)
            : $(this).closest('.filter').find('.js-filterPeriodInputFrom');
        var $inputTo = $(this).is('.js-filterPeriodInputTo')
            ? $(this)
            : $(this).closest('.filter').find('.js-filterPeriodInputTo');
        if (!daysLimit || !$inputFrom.length || !$inputTo.length || !$inputFrom.val() || !$inputTo.val()) {
            return true;
        }
        var dateFrom = new Date(Date.parse($inputFrom.val().split('.').reverse().join('-')));
        var dateTo = new Date(Date.parse($inputTo.val().split('.').reverse().join('-')));
        var exactDateFrom = null;
        var exactdateTo = null;
        var amountMonth = 12;
        if (daysLimit == 90) {
            amountMonth = 3;
        }
        var exactDaysLimit = 365;
        if ($(this).is('.js-filterPeriodInputFrom') && amountMonth !== 12) {
            // точный рассчет конечной даты (Периода в календаре) на основе data-days-limit
            exactDateFrom = new Date(Date.parse($inputFrom.val().split('.').reverse().join('-')));
            exactdateTo = exactDateFrom.setMonth(exactDateFrom.getMonth() + amountMonth);
            exactDaysLimit = (exactdateTo - dateFrom - millisecondsInDay) / millisecondsInDay;
        }
        if ($(this).is('.js-filterPeriodInputTo') && amountMonth !== 12) {
            // точный рассчет начальной даты (Периода в календаре) на основе data-days-limit
            exactdateTo = new Date(Date.parse($inputTo.val().split('.').reverse().join('-')));
            exactDateFrom = exactdateTo.setMonth(exactdateTo.getMonth() - amountMonth);
            exactDaysLimit = (dateTo - exactDateFrom) / millisecondsInDay;
        }
        if ((dateTo < dateFrom) || (dateTo - dateFrom) > (exactDaysLimit * millisecondsInDay)) {
            if ($(this).is($inputFrom)) {
                $inputTo.datepicker('setDate', new Date(dateFrom.getTime() + (exactDaysLimit * millisecondsInDay)));
            } else if ($(this).is($inputTo)) {
                $inputFrom.datepicker('setDate', new Date(dateTo.getTime() - (exactDaysLimit * millisecondsInDay)));
            }
        }
    });

    //копирование ссылок
    $(document).on('click', '.js-pagesCopy', function () {
        var dataText = $(this).attr('data-copy-text');
        if (dataText.length > 0) {
            var browserError = copyToMemory(dataText);
            if (browserError) {
                alert(browserError);
            } else if (!$(this).is('.TipTip__active')) {
                window.whiteTipTip = $(this);
                $(window.whiteTipTip).tipTip({
                    'activation': 'manual',
                    'defaultPosition': 'top',
                    'content': 'Ссылка скопирована',
                    'theme': 'white',
                    'delay': 100,
                    'fadeIn': 0,
                    'fadeOut': 200,
                    'maxWidth': 340
                }).tipTip('show');
                window.setTimeout(function () {
                    if ($(window.whiteTipTip).length > 0) {
                        $(window.whiteTipTip).tipTip('hide').tipTip('destroy');
                    }
                }, 1000);
            }
        }
    });
    //~копирование ссылок


    //переход по ссылкам из span и других элементов
    var dataFakeHref = $('[data-fake-href]');
    if (dataFakeHref.length > 0) {
        dataFakeHref.on('click', function (e) {
            e.preventDefault();
            var href = $(this).attr('data-fake-href');
            if (href.length > 0) {
                document.location.href = href;
            }
            return false;
        });
    }
    //~переход по ссылкам из span и других элементов

    //блок для загрузки файлов
    initFileList($('.js-TipTip_upload'));
    //~блок для загрузки файлов

    // мультиселект
    initRichSelectOld();
    initPlaquesPlaques();
    window.ajaxBlock.on('js-ajaxContentReady', function () {
        initPlaquesPlaques();
    });

    //скрытие недоступных значений для связанного мультиселектора
    $(document).on('change', '.js-filterObjectSubject .js-multiselect input, .js-filterObjectSubject select', function () {
        var obj = $(this).closest('.js-filterObjectSubject');
        if (obj.data('subject')) {
            var subject = $(obj.data('subject'));
            var cahngeAll = obj.data('subject-change-all') == 1;
            var arSearch = [[],[]];
            if ($(this).is('select')) {
                obj.find('option').each(function(){
                    if ($(this).is(':selected')) {
                        if ($(this).val().indexOf('|') >= 0) {
                            var arCodes = $(this).val().split('|');
                            for (var i = 0, ilen = arCodes.length; i < ilen; i++) {
                                arSearch[0].push('.js-filterSubject-' + arCodes[i]);
                            }
                        } else {
                            if ($.trim($(this).val()) === '' && $(this).text() === 'Все') {
                                var allOptions = $(this).siblings('option');
                                if (allOptions.length > 0) {
                                    allOptions.each(function () {
                                        if ($(this).val().indexOf('|') >= 0) {
                                            var arCodes = $(this).val().split('|');
                                            for (var i = 0, ilen = arCodes.length; i < ilen; i++) {
                                                arSearch[0].push('.js-filterSubject-' + arCodes[i]);
                                            }
                                        } else {
                                            arSearch[0].push('.js-filterSubject-' + $(this).val());
                                        }
                                    });
                                }
                            } else {
                                arSearch[0].push('.js-filterSubject-' + $(this).val());
                            }
                        }
                    } else if ($(this).val().indexOf('|') >= 0) {
                        var arCodesJ = $(this).val().split('|');
                        for (var j = 0, jlen = arCodesJ.length; j < jlen; j++) {
                            arSearch[1].push('.js-filterSubject-' + arCodesJ[j]);
                        }
                    } else {
                        arSearch[1].push('.js-filterSubject-' + $(this).val());
                    }
                });
            } else {
                obj.find('.js-multiselect input').each(function(){
                    if ($(this).prop('checked')) {
                        arSearch[0].push('.js-filterSubject-' + $(this).val());
                    } else {
                        arSearch[1].push('.js-filterSubject-' + $(this).val());
                    }
                });
            }
            var valueShow = subject.find(arSearch[0].join(', '));
            valueShow.addClass('js-multiselectVisible');
            var bHiddenSeparate = subject.find('.js-filterSeparate:not(:checked)').length > 0;
            if (bHiddenSeparate) {
                valueShow.filter(':not(.js-filterSeparateHide)').show();
                valueShow.filter('.js-filterSeparateHide:not(.RichSelect__option--active)').hide();
            } else {
                valueShow.show();
            }
            if (!subject.hasClass('js-multiselectNon')) {
                selectItem(bHiddenSeparate ? valueShow.filter(':not(.js-filterSeparateHide)') : valueShow);
                if (bHiddenSeparate) {
                    unselectItem(valueShow.filter('.js-filterSeparateHide'));
                }
            }

            var valueHide = subject.find(arSearch[1].join(', '))
                .not(arSearch[0].join(', '));
            valueHide.removeClass('js-multiselectVisible').hide();
            unselectItem(valueHide);

            subject.each(function(){
                if (cahngeAll) {
                    $(this).find('.js-multiselectAll input:last').prop('checked', true).change();
                } else {
                    $(this).find('.js-multiselect input:last').change();
                }
            });
        }
    });

    //TODO OLD работа с вкладками
    $(document).on('click', '.Tab', function(e){
        var tab = $(this);
        //радио-инпуты
        if (tab.find('a[href="#"]').length > 0) {
            e.preventDefault();
        }
        // игнорируем нажатия на активной вкладке
        if (tab.hasClass('Tab--active')) {
            return;
        }
        var tabs = tab.closest('.Tab__list');
        if (tabs.attr('data-tabs-id')) {
            var content = $('.TabContent__wrapper[data-tabs-id="' + tabs.attr('data-tabs-id') + '"]').eq(0);
            var target = content.find('.TabContent[data-tab-id="' + tab.data('tab-id') + '"]');
        } else {
            var target = $('.TabContent[data-tab-id="' + tab.data('tab-id') + '"]');
            if (!target.length) {
                return;
            }
            var content = target.closest('.TabContent__wrapper');
        }
        // анимируем, если нужно
        if (content.data('tab-animate')) {
            content.animate({'height': target.height()}, 300, function(){
                content.css('height', '');
            });
        }
        // переключаем вкладку
        var tabParent = tab.closest('.Tabs').children('.Tab__wrapper');
        if (tabParent.length > 0) {
            tabParent.find('.Tab--active').removeClass('Tab--active');
        } else {
            tab.siblings('.Tab--active').removeClass('Tab--active');
        }
        tab.addClass('Tab--active');
        // переключение содержимое вкладок
        target.show().addClass('TabContent2--active').siblings('.TabContent2--active').hide().removeClass('TabContent2--active');
    });
    //~работа с вкладками

    // Табы
    initTabs();
    initTabsAnimate();
    window.ajaxBlock.on('js-ajaxContentReady', initTabs);
    window.ajaxBlock.on('js-ajaxContentReady', initTabsAnimate);
    // ~ Табы

    // выпадающие списки
    initDropdown();
    window.ajaxBlock.on('js-ajaxContentReady', initDropdown);

    //скачивание файла ajax'ом
    if ($('.js-getReportAjax').length > 0) {
        window.ajaxBlock.on('click', '.js-getReportAjax', function() {
            GetReportAjax($(this));
            return false;
        });
    }
    //~скачивание файла ajax'ом

    //увеличенное фото товара
    var photoPreviewTrigger = $('.photoPreviewTrigger');
    if (photoPreviewTrigger.length > 0) {
        $(document).on('mouseenter', photoPreviewTrigger.selector, function(e) {
            var obj = $(this);
            var preview = $('#photoPreview');
            if (!preview.length) {
                preview = $('<div id="photoPreview"><img src="" alt="" /></div>');
                $('body').append(preview);
            }

            preview.children('img').attr('src', obj.data('photo-preview-src'));
            preview.css('top',(e.pageY + 15) + 'px')
                .css('left',(e.pageX + 15) + 'px')
                .fadeIn('fast');
            obj.on('mousemove.preview', function(e) {
                preview.css('top',(e.pageY + 15) + 'px')
                    .css('left',(e.pageX + 15) + 'px');
            });
        }).on('mouseleave', photoPreviewTrigger.selector, function() {
            $(this).off('mousemove.preview');
            $('#photoPreview').hide();
        });
    }
    //~увеличенное фото товара


    // Статистика поисковых запросов: сравнение алгоритмов -->
    if ($('.js-comparePeriods:first, .js-compareAlgorythms:first').length == 2) {
        setAjaxContentCallback(function() {
            var checkboxLastPeriod = $('.js-comparePeriods'),
                checkboxCompareAlgorythms = $('.js-compareAlgorythms'),
                selectAlgorythm2 = $('.js-algorythm2');
            if (selectAlgorythm2.length > 0) {
                // Блокирование списка выбора второго алгоритма
                checkboxCompareAlgorythms.change(function() {
                    if ($(this).prop('checked')) {
                        checkboxLastPeriod.prop('checked', false).closest('.filter')
                            .addClass('Blocked');
                        selectAlgorythm2.removeAttr("disabled");
                    } else {
                        selectAlgorythm2.prop('checked', false);
                        checkboxLastPeriod.closest('.filter').removeClass('Blocked');
                        selectAlgorythm2.attr("disabled","disabled");
                    }
                });
                checkboxCompareAlgorythms.change();
            }
            // Статистика поисковых запросов: сравнение периодов -->
            checkboxLastPeriod.change(function() {
                if ($(this).prop('checked')) {
                    checkboxCompareAlgorythms.prop('checked', false).closest('.filter')
                        .addClass('Blocked');
                } else {
                    checkboxCompareAlgorythms.closest('.filter').removeClass('Blocked');
                }
            });
            checkboxLastPeriod.change();
            // <-- Статистика поисковых запросов: сравнение периодов
        });
    }

    // Исключение пунктов из второго селектора взависимости от выбора в первом селекторе
    if ($('.js-algorythm1').length > 0 && $('.js-algorythm2').length > 0) {
        setAjaxContentCallback( function(){
            $('.js-algorythm1').change(function() {
                $('.js-algorythm2').find('option').show().prop('disabled', false)
                    .end().find('[value="' + $(this).val() + '"]').hide()
                    .prop('disabled', true).attr('selected', false);
            });
            $('.js-algorythm1').change();
        });
    }
    // <-- Статистика поисковых запросов: сравнение алгоритмов

    // Выравнивание высоты для Items с горизонтальным скроллом(показатели поп подразделениям)
    if ($('.ScrollableTable__fixed + .ScrollableTable__scrollable').length || $('.js-statDetail').length){
        setAjaxContentCallback(function(){
            var ItemsFixed = $('.ScrollableTable__fixed .Items__list .Item');
            var ItemsScrollable = $('.ScrollableTable__fixed + .ScrollableTable__scrollable .Items__list .Item');

            for (var i = 0; i < ItemsFixed.length; i++) {
                if(ItemsFixed.eq(i).height() > ItemsScrollable.eq(i).height()){
                    ItemsScrollable.eq(i).height(ItemsFixed.eq(i).height() + 1);
                    ItemsFixed.eq(i).height(ItemsFixed.eq(i).height() + 1);
                } else {
                    ItemsFixed.eq(i).height(ItemsScrollable.eq(i).height() + 1);
                    ItemsScrollable.eq(i).height(ItemsScrollable.eq(i).height() + 1);
                }
            }

            var ItemsFixedHeader = $('.ScrollableTable__fixed .Items__header');
            var ItemsScrollableHeader = $('.ScrollableTable__scrollable .Items__header');

            if(ItemsFixedHeader.height() > ItemsScrollableHeader.height()){
                ItemsScrollableHeader.height(ItemsFixedHeader.height()+1);
                ItemsFixedHeader.height(ItemsFixedHeader.height()+1);
            } else {
                ItemsFixedHeader.height(ItemsScrollableHeader.height()+1);
                ItemsScrollableHeader.height(ItemsScrollableHeader.height()+1);
            }
        });
    }
    // ~ Выравнивание высоты для Items с горизонтальным скроллом

    if ($('.js-items-floatableHeader').length || $('.js-statDetail').length){
        setAjaxContentCallback(function(){
            initFloatingHeader();
        });
    }
    // scrollbox(Показатели по подразделениям)
    if ($('.js-scrollbox').length || $('.js-statDetail').length){
        setAjaxContentCallback(function(){
            $('.js-scrollbox').each(function () {
                if(!$(this).closest('.js-floatingHeader').length){
                    $(this).scrollbox({
                        wrapWithTable: true
                    });
                }
            });
        });

        var fnHorizontalScrollBox = function (){
            // Добавление тени при горизонтальном скролле
            var jScrollBlock = $('.Scrollbox');
            $('.ScrollableTable__fixed').toggleClass('ScrollableTable__fixed--hasScrolled', jScrollBlock.scrollLeft() != 0);
            if (jScrollBlock.length){
                $('.js-floatingHeader .Items__list').css({
                    marginLeft: -jScrollBlock.scrollLeft()
                });
            }
        };
        $(document).on("scrollbox.scroll", function() {
            fnHorizontalScrollBox();
        });
        $(document).on("scrollbox.resize", function() {
            fnHorizontalScrollBox();
            $('.FloatingHeader').each(function () {
                $(this).css('left', $(this).closest('.Items').offset().left);
            });
        });
    }

    if ($('.ScrollableTable__fixed').length || $('.js-statDetail').length){
        var blockHeader, blockItemsList, cloneHeader;
        setAjaxContentCallback(function(){
            blockHeader = $('.ScrollableTable__fixed .Items__header');
            blockItemsList = $('.ScrollableTable__fixed .Items__list');
            cloneHeader = blockHeader.clone().hide();

            cloneHeader.find('.Item__box').css('height', blockHeader.height());
            cloneHeader.addClass('Items__header--floating').appendTo(blockHeader.parent());
        });

        var fnBlockHeaderScroll = function() {
            if (blockItemsList.length) {
                if(blockItemsList.offset().top < $(document).scrollTop()){
                    $('.Items__header--floating').fadeIn(200);
                } else {
                    $('.Items__header--floating').fadeOut(200);
                }
            }
        };

        $(document).on('scroll', function () {
            fnBlockHeaderScroll();
        });

    }
// ~ scrollbox(Показатели по подразделениям)

    //страница редактирования промостраницы
    if ($('.js-pagesEditForm').length > 0) {
        InitPromoEditPage();
    }
    //~страница редактирования промостраницы

    //успешное сохранение промостраницы
    var fancySuccess = $('.js-fancySuccess');
    if (fancySuccess.length > 0) {
        var content = fancySuccess.html();
        $.fancybox({
            content: content,
            padding: 0,
            showCloseButton: false
        });
        fancySuccess.remove();
    }
    //~успешное сохранение промостраницы

    // управление баннерами
    if ($('.js-bannerEditPage').length > 0) {
        // кнопка "Добавить баннер"
        $('.js-addBanner').click(function() {
            HideTipTipError();
            var tab = $('.TabContent2--active');
            tab.find('.js-noBanners').hide();
            var banner = tab.find('.Banner--empty');
            banner.addClass('Banner--editing');
            openBannerEditor(banner);
        });
        // редактирование блока
        $(document).on('click', '.js-editBanner', function() {
            HideTipTipError();
            var cloneBanner = $(this).clone();
            $(this).addClass('js-hiddenBanner').hide().after(cloneBanner);
            openBannerEditor(cloneBanner);
        });
        // отмена редактирования блока
        $(document).on('click', '.js-bannerEditor-close', function() {
            closeBannerEditor();
        });
        // изменение кода товара
        $(document).on('input', '.js-bannerEditor-productCode', function() {
            var filtered = $(this).val().replace(/[^0-9]/g, '').substr(0, 6);
            $(this).val(filtered);
            if (filtered.length === 6) {
                var field = $(this).closest('.Form__field');
                field.addClass('Form__field--loading').removeClass('Form__field--error');
                $.ajax({
                    url: document.location.href,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'product',
                        code: filtered,
                        main_page: $('.Banner--editing').is('.Banner--mainpage') ? 1 : 0
                    },
                    success: function (result) {
                        if (result['success'] != null) {
                            var editor = $('.js-bannerEditorBlock');
                            var currentBanner = $('.Banner--editing');
                            if (currentBanner.is('.Banner--empty')) {
                                var tab = $('.TabContent2--active');
                                var template = tab.find('.Banner--template');
                                currentBanner.removeClass('Banner--editing');
                                currentBanner = $(template).clone().removeClass('Banner--template').addClass('Banner--editing js-tempRemove');
                                template.after(currentBanner);
                            }
                            currentBanner.find('.Banner__label').html(result['name']);
                            $('.js-bannerEditor-productName').val(unEscapeHtml(result['name']));
                            currentBanner.find('.Banner__code').html(filtered);
                            currentBanner.find('img').attr('src', result['photo']);
                            currentBanner.find('.Banner__price, .Banner__buttonWrapper').remove();
                            currentBanner.find('.Banner__label').after(result['price']);
                            if (currentBanner.find('.Banner__price').length > 0) {
                                editor.find('.js-bannerEditor-productPrice').val(currentBanner.find('.Banner__price').attr('data-val'));
                            }
                            if (currentBanner.find('img').length > 0) {
                                editor.find('.js-bannerEditor-productPhoto').val(currentBanner.find('img').attr('src'));
                            }
                        } else if (result['error'] != null) {
                            field.addClass('Form__field--error');
                            field.find('.Form__error').html(result['error']);
                        }
                    },
                    complete: function () {
                        field.removeClass('Form__field--loading');
                    }
                });
            }
        });
        // изменение названия баннера
        $(document).on('input', '.js-bannerEditor-productName', function() {
            $('.Banner--editing').find('.Banner__label').html($(this).val());
        });
        // сохранение блока
        $(document).on('click', '.js-bannerEditor-save', function() {
            var button = $(this);
            var editor = button.closest('.js-bannerEditorBlock');
            var productCode = editor.find('.js-bannerEditor-productCode').val();
            if (productCode.length === 6) {
                button.addClass('Spinner--active').attr('disabled', true);
                var editing = $('.Banner--editing');
                $.ajax({
                    url: document.location.href,
                    type: 'POST',
                    dataType: 'json',
                    data: {
                        action: 'save',
                        code: productCode,
                        name: editor.find('.js-bannerEditor-productName').val(),
                        type: $('.TabContent2--active').attr('data-tab-id'),
                        banner_id: editing.attr('data-banner-id')
                    },
                    success: function (result) {
                        if (result['success'] != null) {
                            var hiddenBanner = $('.js-hiddenBanner');
                            if (hiddenBanner.length > 0) {
                                hiddenBanner.html(editing.html());
                            } else {
                                editing.attr('data-banner-id', result['success']);
                            }
                            editing.removeClass('js-tempRemove');
                            closeBannerEditor();
                        } else if (result['error'] != null) {
                            editor.find('.Form__field:first').addClass('Form__field--error');
                            editor.find('.Form__error').html(result['error']);
                        }
                    },
                    complete: function () {
                        button.removeClass('Spinner--active').attr('disabled', false);
                    }
                });
            } else {
                editor.find('.Form__field:first').addClass('Form__field--error');
                editor.find('.Form__error').html('Товар с таким кодом не найден');
            }
        });
        // удаление блока
        $(document).on('click', '.js-removeBanner', function(e) {
            e.stopPropagation();
            HideTipTipError();
            var banner = $(this).closest('.Banner');
            $.fancybox({
                'content': '<div class="FancyModal FancyModal--dialog FancyModal--confirm">' +
                '<h2 class="FancyModal__header">Вы уверены?</h2>' +
                '<div class="FancyModal__content"></div>' +
                '<div class="FancyModal__control">' +
                '<button class="btn btnMain js-confirm" data-banner-id="'
                + banner.attr('data-banner-id')
                + '">Удалить</button>' +
                '<button class="btn btnMain btnOutline js-closeFancybox">Отмена</button>' +
                '</div>' +
                '</div>',
                'closeClick' : true,
                'showCloseButton' : false,
                'padding': 0,
                onComplete: function() {
                    $('#fancybox-content .js-confirm').click(function() {
                        var button = $(this);
                        $.ajax({
                            url: document.location.href,
                            type: 'POST',
                            dataType: 'json',
                            data: {
                                action: 'remove',
                                banner_id: button.attr('data-banner-id')
                            },
                            complete: function () {
                                $('.Banner[data-banner-id="' + button.attr('data-banner-id') + '"]').remove();
                                var tab = $('.TabContent2--active');
                                if (!tab.find('.Banner:visible').length) {
                                    tab.find('.js-noBanners').show();
                                }
                                $.fancybox.close();
                            }
                        });
                    });
                }
            });
        });
        // загрузка файла
        var addFromExcel = $('.js-addFromExcel');
        if (addFromExcel.length > 0) {
            addFromExcel.on('click', function (e) {
                if ($('.js-importBanners').length <= 0) {
                    $(this).parents('.Upload__label')
                        .prepend('<input name="xls" class="Upload__field js-importBanners" type="file">');
                }
            });
            $(document).on('change', '.js-importBanners', function () {
                var fileList = $(this)[0].files;
                var field = $(this);
                var upload = field.closest('.Upload');
                var triggerUpload = upload.find('.js-addFromExcel');
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
                            if (result['success']) {
                                upload.tipTip({
                                    activation: 'manual',
                                    theme: 'white',
                                    content: _ending(result['success'], ['Загружен', 'Загружено', 'Загружено'])
                                    + ' <b>'
                                    + result['success']
                                    + '</b> '
                                    + _ending(result['success'], ['товар', 'товара', 'товаров']),
                                    defaultPosition: 'right',
                                    edgeOffset: 5
                                }).tipTip('show');
                                window.setTimeout(function () {
                                    HideTipTipError();
                                }, 2000);
                                var tab = $('.TabContent2--active');
                                tab.find('.js-editBanner:visible').remove();
                                tab.find('.js-noBanners').hide();
                                var template = tab.find('.Banner--template');
                                var productList = result['product'];
                                for (var i = productList.length; i > 0; i--) {
                                    var curProduct = productList[(i - 1)];
                                    var currentBanner = $(template).clone().removeClass('Banner--template').addClass('js-tempRemove');
                                    template.after(currentBanner);
                                    if (curProduct['name']) {
                                        currentBanner.find('.Banner__label').html(curProduct['name']);
                                    }
                                    if (curProduct['code']) {
                                        currentBanner.find('.Banner__code').html(curProduct['code']);
                                    }
                                    if (curProduct['photo']) {
                                        currentBanner.find('img').attr('src', curProduct['photo']);
                                    }
                                    if (curProduct['price']) {
                                        currentBanner.find('.Banner__price, .Banner__buttonWrapper').remove();
                                        currentBanner.find('.Banner__label').after(curProduct['price']);
                                    }
                                }
                            } else if (result['error']) {
                                ShowTipTipError(
                                    triggerUpload,
                                    result['error'] + '.<br>Баннеры не были загружены.'
                                );
                            }
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
    // ~управление баннерами

    // Отмечаем все чекбоксы в формах выбора (договора/грузополучателя)
    $(document).on('change', '.js-allItemsDesk', function () {
        if ($(this).prop('checked') === true) {
            $(this).closest('.FancyModal').find('input[type="checkbox"]').prop('checked', true);
        } else {
            $(this).closest('.FancyModal').find('input[type="checkbox"]').prop('checked', false);
        }
    });

    // Проверяем отмечены ли все чекбоксы в формах выбора (договора/грузополучателя), если да то отмечаем (Любой из доступных)
    $(document).on('change', '.js-chooseItemDesk', function () {
        var checkboxes = $(this).closest('.FancyModal').find($('.js-chooseItemDesk:not(:checked)'));
        if (checkboxes.length === 1 && checkboxes.hasClass('js-allItemsDesk')) {
            checkboxes.prop('checked', true);
        } else if (checkboxes.length > 0) {
            $(this).closest('.FancyModal').find('.js-allItemsDesk').prop('checked', false);
        }
    });


    // Тип-тип незавершенный товар в корзине клиента
    initTipFullBasket();
    // ~Тип-тип незавершенный товар в корзине клиента
    // UI Ричселект -->
    initRichSelect();
    // <-- UI Ричселект

    // UI Spoiler -->
    initSpoiler();
    // <-- UI Spoiler

    //обработка ajax-ссылок
    if ($('.js-ajaxContentBlock').length) {
        $('.js-ajaxContentBlock .js-ajaxContentLink').find('a').on('click', function() {
            if ($(this).attr('href')) {
                ReloadAjaxContent($(this).attr('href'), {}, true);

                slideFoldingAjaxClientCard($(this));
                return false;
            }
        });
        window.ajaxBlock.on('js-ajaxContentReady', function() {
            $('.js-ajaxContentBlock .js-ajaxContentLink').find('a').on('click', function() {
                if ($(this).attr('href')) {
                    ReloadAjaxContent($(this).attr('href'), {}, true);

                    slideFoldingAjaxClientCard($(this));
                    return false;
                }
            });
            if (typeof initAjaxSelect === 'function') {
                initAjaxSelect();
            }
            if (typeof initAjaxFancyError === 'function') {
                initAjaxFancyError();
            }
        });
        //обработка ajax-форм
        if ($('.js-ajaxContentForm').length) {
            SubmitOnEvent(false, 'click', 'button:not(.js-noajax)', '.js-ajaxContentForm');
            $(document).on('keypress', 'input', function(e) {
                if (e.keyCode == 13) {
                    e.preventDefault();
                    var parentForm = $(this).closest('form');
                    if (parentForm.length <= 0) {
                        parentForm = $(this).closest('.js-ajaxContentForm');
                    }
                    if (parentForm.length) {
                        parentForm.find('.filter--alignBottom > button, .filter--alignBottom > input[type=button], button[type=submit]').first().click();
                    }
                }
            });
        }
    }
    //~обработка ajax-ссылок

    // Кнопка "Наверх" -->
    $('.js-backTop').backTop();
    // <-- Кнопка "Наверх"

    // обработка полей с ошибками
    setAjaxContentCallback(function () {
        var errorInputs = $('input.error, textarea.error');
        if (errorInputs.length) {
            errorInputs.each(function () {
                setAutoCorrection($(this));
            });
        }
    });
});
//~обработка по событию ready
