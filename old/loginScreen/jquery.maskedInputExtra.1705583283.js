/*
 * jQuery Masked Input Extra Plugin
 * Является оболочкой для jQuery Masked Input Plugin с готовым пресетом масок
 *
 * Версия 1.0
 *
 * Copyright (c) 2022, officemag.ru
 */

(function ($) {
    // маска телефона
    $.fn.maskPhone = function (params) {
        var defaults = {
            autoclear: false,
            completed: function() {}
        };
        params = $.extend({}, defaults, params);

        // получить текст маски телефона
        function _getPhoneMaskText(countryCode, cityCodeLength, fullLength) {
            var digitFiller = '9';
            var digitSeparator = '-';
            var pos;
            var cityCode = '';
            var phone = '';

            for (pos = 0; pos < cityCodeLength; pos++) {
                cityCode += digitFiller;
            }
            for (pos = 0; pos < (fullLength - cityCodeLength); pos++) {
                if (pos === 2 || pos === 4 || pos === 7) {
                    phone = digitSeparator + phone;
                }
                phone = digitFiller + phone;
            }
            return '+' + countryCode + ' (' + cityCode + ') ' + phone;
        }

        // обновить маску телефона
        function _updatePhoneMask(objInput) {
            var maskParam = {
                countryCode: 7,
                cityCodeRegExp: '^\\+7(3(0(1(2|[34].|5[03])|2(2|[34].|5[^0489]|6[1-6]))|3(6(22)?)|4(1(23?|3[^157]|4[157]|5[^6]|6[1-46])|2(4[^247]?|5.|6[^347]|7[^0]|9[^059])?|3(4[^08]|5[05-8]?|6[^6]|7[0-7]|8[^12]|9[1478]?)?|5(19|2|3[1357]|4[1-7]|5[^289]|61?)|6(2|38?|43|6[789]?|7[^39]?)|7(1[^1]|3[19]?|[4-7].|8[0-9]|9[^039])?|9(3[2468]|40?|6|9[23467]?)?)|5(1(11|3[^7]|[45].|6[^2]|7[12]|9)?|2(3.|4[^6]|5[12367])?|3(3.|4[^03]|5[^03]|6[1-8]|79?)?)|6(5(2|4|5.|6[^8]))|8(1(41|[567].)?|2(2|4[^08]|5.)|3(4[^24]|[56].|7[123])?|4(3|4[^0]|5[1-69]|6[34]?|7[1-5])?|5(1.|2|3[^8]|4|[5679].)|8(22|4.))|9(0(2|3[1-6]|4[124-7])|1(3[^0]|[4-7].|9[^2347]?)?|4(22|3[2-9]|4[1-5]|5[02])|5(3[05-9]?|4[^7]|5[^569]?|6.|73)?))|4(0(1(4[1-5]|5[^4]|6[1-4])?)|1(1(3[1-8]|4[0-57]|[56].)?|3(4[1-8])?|5(3[1-7]|4[2-7])?|6(2|3[46-9]|4[^0]|5[1-68]))|2(1(2|3[578]|4[^058]|5[13-6]|7)|3(3[14579]|4[4-79]?|5[^038]|6[12356]?|7[1-7])?|4(3[1-7]|4[1-467]|5[2-5])?|6(32|6[356])?|7(22|3[2-9]))|7(1(2|3[1-7]|[45].)?|2(2|3[1-8]|4[1-8]|5|6[123])|3(4[^9]|5[02-7]|6[1-7]|7[^3789]|9[1456])?|4(2|6[^0]|7[1-8])|5(2|3[1-7]|4[1-68]|5[^0]))|8(1(2|[34].|5[35]|6[567])?|2(2|3.|4[2469]|5[^2469]|6[^0]|7[1-6])|3(2|3[^7]|4.|5[1-68])|4(3[^0]|4[^0]|5[1-7])?|5(2|3[^07]|4[2-79]|5)|6(4[^1]|6[2-7]|7[2-9])?|7(2|3[1-6]|4[1-6]|5[1-6]|6[^0459]))|9(1(2|3[^4]|4[1-8]|5[1-8])?|2(2|3[1-8]|4[1-8]|54)|3(3[^0258]|4[^028]|5[1-7])?|4([34].|5[0-3])?|5|6(2[^35]?|3[^39]|4[0-7]?|5[^59]|6[^058]|7[^148]?)?|8(31?|[567])?|9))|7(0[^3469]|1(0(2|3.|4[023]|63)|1(2|3.|4[0-5])|2(2|3[^2])|3(2|3[^08]|4[0-356])|4(2|3[^28]|4[0-58]|5[1-6])|5(2|3[1-8]|4[1-46])|6(2|3[^4]|4[^9]|51|61)|72|8(23?|3[^05]|4[015]|7))|2(1(2|3[178]?|4[46-9]|5[346])|2(2|3[0679]|46|5[1267])|3(2|3.|4[^9]|5[13])|4(2|3[^049])|5(2|3.|4[^359]|61)|6(22?|3[^0]|4[0-4])|7(2|5[27]|7.)?|8(2|3[^0]|4[0-3])|9(2|3[^0369]))|47|5[01]|6[0-4]|7[15-8])|8(0.|1(1(3[^0]|4.|5[0-3])?|2|3(6[^0]|7[^7])?|4(3[^258]|5[^3])?|5(3[^4]|5[^07])?|6(5[^0]|6.)?|7(3[23789]|4.|5[^0])?|8(2|3[^5]|4[0138]?|5.))|2(0|1(3.|4[^378]|51|6)?)|3(1(3[04689]?|4[^1236]|5.|6[^9]|7.|9[0-7])?|3([34].|5[^6]|6[^0]|75)?|4(3[^05]|4[^0]|5[^0259])?|5(2|[34].|57)|6(3[^0]|4[1345])?)|4(1(2|4[^9]|5.|6[^06])?|2(2|3[^6]|4.|5[345])|3(4[^039]|6[^3]|7[^2]|96)?|4(3|4[2-7]|5[2-8]|6[1-8]|7[2-9]|9[2-5])?|5(2|3|4[^167]|5[^369]|6[^9]|7[3-9]|9[12356])?|6(3[59]|4[678]?|5[^9]|6[^2589]|7[0-7])?|7(3[1-6]|4[1-7])?|8(62)?)|5(1(2|4.|7[12])|5(2|3|49|5[^034]?|6[39]|7[23]|9[2-5]))|6(1(3[^469]|[456].|7|9[12356])?|22?|3(4[^36]?|5.?|6[^26]?|7.|8[2-9]|9[13-7]?)?|5(4.|5[^1]|6[035])?|6(3.)?|7(3[^0])?|92)|7(1(2|3[^0489]|4[^0489]|5[456]|64)|2([34].|5[^13]|6.|7[1-69])?|3|7(2|7[^456])|8(7[^12])?|9(3[24578]?|51|6[14])?)|93)|9..)',
                cityCodeDefaultLength: 3,
                fullLength: 10
            };
            var match = objInput.val().replace(/[^\+\d]+/g, '').match(new RegExp(maskParam.cityCodeRegExp));
            var cityCodeLength = !!match ? match[1].length : maskParam.cityCodeDefaultLength;
            if (!objInput.attr('placeholder')) {
                objInput.attr('placeholder', '+' + maskParam.countryCode);
            }
            if (cityCodeLength !== objInput.data('cityCodeLength')
                && (typeof objInput[0].setSelectionRange !== 'undefined' || !objInput.data('cityCodeLength'))
            ) {
                objInput
                    .mask(_getPhoneMaskText(maskParam.countryCode, cityCodeLength, maskParam.fullLength), {
                        autoclear: params.autoclear,
                        completed: params.completed
                    });
                // вернуть курсор
                var selStart = (typeof objInput[0].selectionStart !== 'undefined' && objInput.val().length) ? objInput[0].selectionStart : 0;
                var selStartLast = objInput.data('selStart');
                if (typeof objInput[0].setSelectionRange !== 'undefined') {
                    if ((selStart - selStartLast) > Math.abs(1)) {
                        objInput[0].setSelectionRange(selStartLast, selStartLast);
                    }
                }
                objInput.data('cityCodeLength', cityCodeLength);
            }
        }

        // инициализация маски телефона
        if ('mask' in $) {
            this
                .filter(function() {
                    return $(this).data('maskInited') !== true;
                })
                .data('maskInited', true)
                .on('keydown', function() {
                    var selStart = (typeof this.selectionStart !== 'undefined' && $(this).val().length) ? this.selectionStart : 0;
                    $(this).data('selStart', selStart);
                })
                .on('keyup', function() {
                    _updatePhoneMask($(this));
                });
            this.each(function() {
                _updatePhoneMask($(this));
            });
        } else {
            console.error('Masked Input Plugin is required');
        }

        return this;
    };

    // маска даты
    $.fn.maskDate = function (params) {
        var defaults = {
            autoclear: true,
            completed: function() {
                var value = $(this).val();
                var day = parseInt(value.substr(0, 2));
                var month = parseInt(value.substr(3, 2));
                var year = parseInt(value.substr(6, 4));
                var dateTrue = new Date((year < 2010 ? 2010 : (year > 2100 ? 2100 : year)), month, day);
                if (dateTrue.getDate() !== day || dateTrue.getMonth() !== month || dateTrue.getFullYear() !== year) {
                    $(this).val(
                        ('0' + dateTrue.getDate()).slice(-2) + '.' +
                        ('0' + dateTrue.getMonth()).slice(-2) + '.' +
                        ('0' + dateTrue.getFullYear()).slice(-4)
                    );
                }
            }
        };
        params = $.extend({}, defaults, params);

        // инициализация маски даты
        if ('mask' in $) {
            this.mask('99.99.9999', params);
        } else {
            console.error('Masked Input Plugin is required');
        }

        return this;
    };

}(jQuery));
