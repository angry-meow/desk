/**
 * jQuery UI BackTop
 *
 * Version: 1.0.1
 */

;(function ($) {
    $.widget( 'int.backTop', {
        version: '1.0.0',

        options: {
            prefix: 'BackTop',
            hoverable: true,
            focusable: true,
            duration: 400,
            visibilityHeight: 400,
            target: null,

            // Callbacks
            onClick: null, // .on('backtoponclick', func);
            onShow: null, // .on('backtoponshow', func);
            onHide: null, // .on('backtoponhide', func);
        },

        _getCreateOptions: function () {
            var options = this._super();

            this.classes = {
                trigger: this.options.prefix + '__trigger',
            };

            this.stateClasses = {
                visible: this.options.prefix + '--visible',
            };

            return options;
        },

        _getCreateEventData: function () {
            return this.ui();
        },

        _create: function () {
            this.target = this.options.target || this.window;
            this.trigger = this.element.find( '.' + this.classes.trigger );
            this._setupEvents();
        },

        _scrollToTop: function () {
            $( this.options.target ? this.options.target : 'html, body' ).animate( {
                scrollTop: 0,
            }, this.options.duration );
        },

        _isShow: false,
        _contentScrollingTicking: false,
        _setupEvents: function () {
            this._on( this.trigger, {
                click: function ( event ) {
                    event.preventDefault();
                    if ( this.element.get( 0 ).tagName !== 'A' ) {
                        this._scrollToTop();
                    }
                    this._trigger( 'onClick', event, this.ui() );
                },
            } );

            this._on( this.target, {
                scroll: function ( event ) {
                    var that = this;

                    if ( !that._contentScrollingTicking ) {
                        window.requestAnimationFrame(function() {
                            var isVisible = $( event.target ).scrollTop() > that.options.visibilityHeight;

                            if (that._isShow !== isVisible) {
                                that._isShow = isVisible;
                                that._trigger( isVisible ? 'onShow' : 'onHide', event, that.ui() );
                            }

                            that.element.toggleClass( that.stateClasses.visible, isVisible );
                            that._contentScrollingTicking = false;
                        });
                        that._contentScrollingTicking = true;
                    }
                },
            } );

            if ( this.options.hoverable ) {
                this._hoverable( this.trigger );
            }

            if ( this.options.focusable ) {
                this._focusable( this.trigger );
            }
        },

        ui: function() {
            return {
                element: this.element,
                trigger: this.trigger,
            };
        },
    });
})(jQuery);
