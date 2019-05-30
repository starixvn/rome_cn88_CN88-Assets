(function ($) {

    $.fn.backtop = function (options) {
        var defaults = { animationTime: 300, scrollTopIndex: 100, hideTimeout: 1, mainFrameId: '' },
            settings = $.extend({}, defaults, options);

        RegisterBackTopEvents($(window), $('html, body'), $('body'), settings);

        var iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        if (!iOS && settings.mainFrameId !== '') {
            var mainFrame = $('#' + settings.mainFrameId);

            mainFrame.on('load.backtop', () => {
                var iframeWindow = mainFrame[0].contentWindow || mainFrame[0].contentDocument;

                RegisterBackTopEvents(
                    $(iframeWindow.window),
                    $(iframeWindow.document).find('html, body'), 
                    $(iframeWindow.document).find('body'), settings);
            });
        }
    };


    function RegisterBackTopEvents($window, $html, $body, settings) {
        var timeOutHandler,
            hideTimeout = settings.hideTimeout * 1000,
            $backToTop = $('<div class="back-to-top" id="back-top-component" style="display:none;"><span class="icon"></span></div>');

        $body.append($backToTop);

        $window.on('scroll.backtop', function () {
            clearTimeout(timeOutHandler);
            if ($(this).scrollTop() > settings.scrollTopIndex) {
                $backToTop.fadeIn();

                timeOutHandler = setTimeout(function () { $backToTop.fadeOut(); }, hideTimeout);
            } else {
                $backToTop.fadeOut();
            }
        });

        $backToTop.on(
            'click.backtop',
            function () {
                $html.animate({ scrollTop: 0 }, settings.animationTime);
            });
    }

}(jQuery));