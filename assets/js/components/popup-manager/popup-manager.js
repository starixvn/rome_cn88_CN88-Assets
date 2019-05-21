var PopupManager = (function () {
    function PopupManager() {
        var _this = this;
        this.positionPadding = 5;
        this.activePopups = [];
        this.popupOptions = [];
        this.onClosing = null;
        this.popupId = "";
        this.bodyScrollTop = 0;
        // Choose most suitable screen resolution 1920 X 1080
        this.defaultOptions = {
            height: 1000,
            width: 480,
            title: "",
            popupCss: "",
            handlerId: null,
            backdrop: true,
            centerScreen: true
        };
        this.init = function ($, topWindow) {
            _this.$ = $;
            _this.topWindow = topWindow;
        };
        this.leftPosition = function () {
            return _this.positionPadding;
        };
        this.topPosition = function () {
            // top-left main frame
            return 74 + _this.positionPadding;
        };
        this.closeAllPopup = function () {
            _this.topWindow.$('.modal[id^="page-popup-"]').modal("hide");
            _this.activePopups = [];
            _this.popupOptions = [];
        };
        this.close = function () {
            var popUp = _this.activePopups.pop();
            _this.popupOptions.pop();
            if (!popUp) {
                return;
            }
            popUp.find('.modal-body #target').remove();
            popUp.modal("hide");
            if (_this.onClosing && typeof (_this.onClosing) == "function") {
                _this.onClosing();
            }

            var isMobile = _this.isMobile();
            if (isMobile) {
                _this.topWindow.$("body").scrollTop(_this.bodyScrollTop);
            }
        };
        this.setDefaultOptions = function (options) {
            options.centerScreen = options.centerScreen == undefined || options.centerScreen;
            options.left = options.left || _this.leftPosition();
            options.top = options.top || _this.topPosition();
            options.width = options.width || _this.defaultOptions.width;
            options.height = options.height || _this.defaultOptions.height;
            options.title = options.title || _this.defaultOptions.title;
            options.backdrop = options.backdrop == undefined || options.backdrop;
            options.handlerId = options.handlerId || "mainPopup";
        };
        this.calculateWidthHeight = function (options) {
            var realHeight = options.height;
            var maxWidth = _this.topWindow.innerWidth;
            var minHeight = 250;
            var maxHeight = _this.topWindow.innerHeight - options.top - 60;
            maxHeight = Math.max(maxHeight, minHeight);
            var realWidth = Math.min(options.width, maxWidth);
            realHeight = Math.min(realHeight, maxHeight);
            realHeight = Math.max(realHeight, minHeight);
            return {
                width: realWidth,
                height: realHeight
            };
        };
        this.getScrollLeft = function (element) {
            return element.pageXOffset || element.scrollX || element.scrollLeft || _this.$(window).scrollLeft() || 0;
        };
        this.getScrollTop = function (element) {
            return element.pageYOffset || element.scrollY || element.scrollTop || _this.$(window).scrollTop() || 0;
        };
        this.isiOS = function () {
            var isiOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            return isiOS;
        };
        this.isMobile = function () {
            var isiOS = /iPhone|iPod|android/i.test(navigator.userAgent);
            return isiOS;
        };
        this.isSmallDevice = function () {
            var isSmallDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
            return isSmallDevice;
        };
        this.getElementSize = function (element) {
            var style = element[0].style;
            return {
                width: parseInt(style.width.substring(0, style.width.length - 2)),
                height: parseInt(style.height.substring(0, style.height.length - 2))
            };
        };
        this.setIframeInfo = function (iframe, popUp, iframeOptions) {
            iframe.css({
                width: '100%',
                height: '100%',
                left: iframeOptions.left,
                top: iframeOptions.top
            });
            iframe.load(function () {
                _this.updatePopupTitleAfterLoad(popUp, iframe);
                if (_this.isSmallDevice()) {
                    // This will make elements on popup lose focus
                    // Issue: click any point on popup trigger open keyboard/dropdown (default focus elements)
                    iframe.contents().find(':focus').blur();
                }
            });
        };
        this.updatePopupTitleAfterLoad = function (popUp, iframe) {
            var title = popUp.find(".modal-title").html() || "";
            var iframeDocument = iframe.contents();
            var iframeTitle = iframeDocument.find("title").text();
            if (title == "" && iframeTitle != 'Home') {
                popUp.find(".modal-title").html(iframeTitle);
            }
        };
        this.copyTargetForm = function (popUp) {
            var oldTarget = _this.topWindow.main.document.getElementById("target");
            var newTarget = _this.topWindow.$.clone(oldTarget);
            popUp.find("iframe").remove();
            var iframeId = 'edit-setting-frame-' + Math.random().toString(36).substring(7);
            popUp.find('.modal-body').append('<iframe id="popup-iframe" frameborder="0" allowtransparency="yes" marginheight="0" marginwidth="0" scrolling="auto" name="' + iframeId + '"></iframe>');
            popUp.find('.modal-body').append(newTarget);
            newTarget.target = iframeId;
            newTarget.submit();
        };
        this.openPopUpAfterSetIframeSrc = function (popUp, isAutoHeight, options) {
            popUp.on('shown.bs.modal', function () {
                // transform property make objectFlash not show (MacauGames Result)
                popUp.find('.modal-dialog').css({
                    transform: 'none',
                    margin: 0,
                    width: "100%"
                });
                // This will make popup isn't cut its height when its height larger than browser height
                if (isAutoHeight) {
                    popUp.css({ display: 'table' });
                }

                popUp.css({ "padding-right": 0 });

                if (isAutoHeight) {
                    popUp.find(".modal-content .modal-body").css("height", _this.topWindow.$(window).height() - popUp.find(".modal-header").height());
                }


            }).on("hidden.bs.modal", function () {
                popUp.find("iframe").attr("src", "about:blank");
            });
            popUp.modal({ show: true, backdrop: options.backdrop });
            if (options.resizable) {
                var prevPosition = {};
                var prevSize = { width: 0, height: 0 };
                popUp.resizable({
                    minHeight: 100,
                    minWidth: 100,
                    direction: ['right', 'bottom'],
                    start: function () {
                        prevPosition = popUp.offset();
                        prevSize = _this.getElementSize(popUp);
                    },
                    resize: function () {
                        var size = _this.getElementSize(popUp);
                        popUp.find(".ex-modal").css("height", size.height + "px");
                        var headerHeight = 40;
                        var contentBorder = 2;
                        var bodyHeightPadding = 18;
                        popUp.find(".modal-content .modal-body").css("height", (size.height - headerHeight - contentBorder) + "px");
                    },
                    stop: function () {
                        var size = _this.getElementSize(popUp);
                        if (prevSize.width == size.width && prevSize.height == size.height) {
                            return;
                        }
                        prevSize = size;
                        popUp.offset(prevPosition);
                    }
                });
            }
            popUp.find(".icon-close").unbind("click").click(function () {
                _this.close();
                _this.activePopups.pop();
            });
            popUp.tinyDraggable({
                exclude: "a.icon-information-outline.icon-info, button.icon.icon-close.close",
                resizeElement: options.resizable ? ".resizable-handle" : ""
            });
            _this.activePopups.push(popUp);
            _this.popupOptions.push(options);
        };
        this.open = function (options) {
            _this.setDefaultOptions(options);
            var widthHeight = _this.calculateWidthHeight(options);
            var width = widthHeight.width;
            var height = widthHeight.height;
            var popupHeight = height;
            var popupWidth = width;
            var activePopup = _this.topWindow.$("#" + options.handlerId);
            var popupId = options.handlerId;
            if (options.popupCss) {
                activePopup.addClass(options.popupCss);
            }
            _this.popupId = popupId;
            // Calculate body scrolltop to fix issue: focus popup make body scroll to popup position (on device)
            var scrollTop = _this.getScrollTop(window.document.body);
            this.bodyScrollTop = scrollTop;

            var scrollLeft = _this.getScrollLeft(window.document.body);

            // ON iOS: there is scroll issues with popup. We must show popup with auto height
            var isAutoHeight = _this.isMobile();
            var left = options.centerScreen ? _this.$(window).width() / 2 - popupWidth / 2 : options.left + scrollLeft;
            var popupCss = {
                position: "absolute",
                width: popupWidth,
                height: isAutoHeight ? 'auto' : popupHeight,
                left: left < 0 ? 0 : left,
                top: options.top + scrollTop,
                overflow: options.resizable ? "hidden" : undefined,
                "overflow-y": isAutoHeight ? "visible" : undefined,
                "overflow-x": isAutoHeight ? "auto" : undefined
            };
            activePopup.css(popupCss);
            var iframe = activePopup.find("iframe");
            iframe.attr("src", "about:blank");
            activePopup.find(".modal-title").text(options.title);
            if (!isAutoHeight) {
                activePopup.find(".ex-modal").css("height", popupHeight + "px");
            }
            var headerHeight = 40;
            var contentBorder = 2;
            var bodyHeightPadding = 18;
            activePopup.find(".modal-content .modal-body").css("height", isAutoHeight ? 'auto' : (popupHeight - headerHeight - contentBorder) + "px");
            var iframeHeight = popupHeight - headerHeight - contentBorder - bodyHeightPadding;
            _this.setIframeInfo(iframe, activePopup, { height: iframeHeight, left: options.left, top: options.top });
            iframe.attr("src", options.url);
            if (options.url) {
                iframe.attr("src", options.url);
            }
            else {
                _this.copyTargetForm(activePopup);
                iframe = activePopup.find("iframe");
                _this.setIframeInfo(iframe, activePopup, { height: iframeHeight, left: options.left, top: options.top });
            }
            _this.openPopUpAfterSetIframeSrc(activePopup, isAutoHeight, options);

            if (isAutoHeight) {
                _this.topWindow.$(window).on("resize", function () {
                    activePopup.find(".modal-content .modal-body").css("height", _this.topWindow.$(window).height() - activePopup.find(".modal-header").height());
                });

            }
        };
        this.bootboxConfirm = function (title, message, callback, width) {
            if (width === void 0) { width = undefined; }
            var dialog = bootbox.confirm({
                title: title,
                message: message,
                animate: false,
                buttons: {
                    cancel: {
                        //label: "Cancel",
                        className: "btn-cancel"
                    },
                    confirm: {
                        //label: "Submit",
                        className: "btn-submit"
                    }
                },
                callback: function (result) {
                    result && callback();
                }
            });
            width && dialog.find("div.modal-dialog").css("width", width + "px");
        };

        this.bootboxAlert = function (title, message, callback, width, okLabel) {
            if (width === void 0) { width = undefined; }
            var dialog = bootbox.dialog({
                title: title,
                message: message,
                animate: false,
                buttons: {
                    confirm: {
                        label: okLabel || "OK",
                        className: "btn-submit"
                    }
                }
            });
            width && dialog.find("div.modal-dialog").css("width", width + "px");
        };

        this.hasPopupOpen = function () { return _this.activePopups.length > 0; };
        this.revertLatestPopupTitle = function () {
            if (_this.hasPopupOpen()) {
                var latestActivePopup = _this.$(_this.activePopups[_this.activePopups.length - 1]);
                var popupTitle = latestActivePopup.find(".modal-title");
                if (popupTitle.length) {
                    var previousTitle = popupTitle.attr("data-previous-title");
                    var currentTitle = popupTitle.text();
                    popupTitle.text(previousTitle !== currentTitle ? previousTitle : "");
                }
            }
        };
        this.setLatestPopupTitle = function (title) {
            if (_this.hasPopupOpen()) {
                var latestActivePopup = _this.$(_this.activePopups[_this.activePopups.length - 1]);
                var popupTitle = latestActivePopup.find(".modal-title");
                if (popupTitle.length) {
                    var previousTitle = popupTitle.text();
                    popupTitle
                        .attr("data-previous-title", previousTitle)
                        .text(title);
                }
            }
        };
    }

    return PopupManager;
}());

var popupManager = new PopupManager();