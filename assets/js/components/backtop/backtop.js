(function ($) {

    $.fn.backtop = function (options) {
        var defaults = { animationTime: 300, scrollTopIndex: 100 },
            settings = $.extend({}, defaults, options),
            $backToTop = $('<div class="back-to-top" id="back-top-component" style="display:none;"><span class="icon"></span></div>'),
            $html = $('html, body');

        $('body').append($backToTop);

        $(window).on('scroll', function () {
            if ($(this).scrollTop() > settings.scrollTopIndex) {
                $backToTop.fadeIn();
            } else {
                $backToTop.fadeOut();
            }
        });

        $backToTop.on(
            'click.backtop',
            function ()
            {
                $html.animate({ scrollTop: 0 }, settings.animationTime);
            });
    };

}(jQuery));