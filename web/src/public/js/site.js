/*!
 * Title:   Laapp - HTML App Landing Page
 * Main Javascript file
 * Author:  http://themeforest.net/user/5studiosnet
 * Copyright © 2019 5Studios.net
 * https://5studios.net
 */

(function() {
    'use strict';

    // Avoid `console` errors in browsers that lack a console.
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any code in here.
$(function() {
    'use strict';

    /** navbar reference **/
    var $navbar = $(".main-nav");

    var scrollingSpy = new ScrollingSpy({
        offset: 90,
        navbar: ".main-nav",
        pricingBasis: "#pricing-basis-options",
        pricingStickyElement: ".pricing-plans-options"
    });

    scrollingSpy.initialize();

    /**
     * SCROLLING NAVIGATION
     * Enable smooth transition animation when scrolling
     **/
    $('a.scrollto').on('click', function (event) {
        event.preventDefault();

        var scrollAnimationTime = 1200;
        var target = this.hash;

        $('html, body').stop().animate({
            scrollTop: $(target).offset().top - 45
        }, scrollAnimationTime, 'easeInOutExpo', function () {
            window.location.hash = target;
        });
    });

    /**
     *  NAVBAR SIDE COLLAPSIBLE - On Mobiles
     **/
    $(".navbar-toggler", $navbar).on("click", function() {
        $navbar.toggleClass("navbar-expanded");
    });

    /**
     * PLUGINS INITIALIZATION
     * Bellow this, you can remove the plugins you're not going to use.
     * If you do so, remember to remove the script reference within the HTML.
     **/

    /**
     * Swiper Initialization
     **/
    $('.swiper-container').each(function() {

        var $this = $(this);
        var boolData = {
            breakpoints: $this.data('sw-breakpoints'),
            active_selector: $this.data('sw-active-selector'),
            cover_flow: $this.data('sw-coverflow'),
            auto_play: $this.data('sw-autoplay'),
            loop: $this.data('sw-loop'),
            centered: $this.data('sw-centered-slides'),
            pagination: $this.data('sw-pagination'),
            nav_arrows: $this.data('sw-nav-arrows')
        };

        var breakPoints = boolData.breakpoints || false;
        var auto_play = boolData.auto_play !== undefined ? boolData.auto_play : false;
        var speed = $this.data('sw-speed') || 1100;
        var effect = $this.data('sw-effect') || "slide";
        var showItems = $this.data('sw-show-items') || 1;
        var loop = boolData.loop !== undefined ? boolData.loop : true;
        var centered = boolData.centered !== undefined ? boolData.centered : true;
        var spaceBetween = $this.data('sw-space-between') || (showItems > 1 ? 20 : 0);
        var scrollItems = $this.data('sw-scroll-items') || 1;
        var navigationElement = $this.data('sw-navigation');
        var navigationActiveClass = $this.data('sw-navigation-active') || "active";
        var navigationActiveSelector = boolData.active_selector !== undefined ? boolData.active_selector : false;
        var paginationCss = boolData.pagination !== undefined ? boolData.pagination : '.swiper-pagination';
        var navigationCss = boolData.nav_arrows !== undefined ? boolData.nav_arrows : '.swiper-button';

        var coverflow = boolData.cover_flow ? {
            coverflowEffect: $.extend({
                stretch: 0,
                depth: 0,
                modifier: 1,
                rotate: 0,
                slideShadows: false
            }, boolData.cover_flow)
        } : {};

        var autoplay = auto_play ? {
            autoplay: {
                delay: auto_play,
                disableOnIteration: false
            },
            speed: speed
        } : {};

        var pagination = {};

        if (paginationCss) {
            pagination.pagination = {
                el: paginationCss,
                clickable: true,
                dynamicBullets: true
            };
        }

        if (navigationCss) {
            pagination.navigation = {
                nextEl: navigationCss + '-next',
                prevEl: navigationCss + '-prev'
            }
        }

        var events = {};

        if (navigationElement) {
            events = {
                transitionEnd: function () {
                    if (!navigationElement) return;

                    var $navigationElement = $(navigationElement);

                    if (navigationActiveSelector) {
                        $(navigationActiveSelector + '.' + navigationActiveClass, $navigationElement).removeClass(navigationActiveClass);
                        $('.nav-item:eq(' + swiper.realIndex + ') ' + navigationActiveSelector, $navigationElement).addClass(navigationActiveClass);
                    } else {
                        $('.' + navigationActiveClass, $navigationElement).removeClass(navigationActiveClass);
                        $('.nav-item:eq(' + swiper.realIndex + ')', $navigationElement).addClass(navigationActiveClass);
                    }
                }
            }
        }

        var options = $.extend({
            loop: loop,
            slidesPerGroup: scrollItems,
            spaceBetween: spaceBetween,
            centeredSlides: centered,
            breakpoints: breakPoints,
            slidesPerView: showItems,
            parallax: true,
            effect: effect
        }, pagination, autoplay, coverflow);

        var swiper = new Swiper (this, options);

        for (var e in events) {
            swiper.on(e, events[e]);
        }

        if (navigationElement) {
            $(navigationElement).on('click', '.nav-item', function (evt) {
                evt.preventDefault();

                var $item = $(this);
                var $activeItem = $item;

                if (navigationActiveSelector) {
                    $activeItem = $(navigationActiveSelector, $item);
                }

                if ($activeItem.hasClass(navigationActiveClass)) {
                    return false;
                }

                var index = $item.data('step') || $item.index() + 1;
                swiper.slideTo(index - 1);

                if (navigationActiveSelector) {
                    $item.siblings().each(function() {
                        $(navigationActiveSelector, this).removeClass(navigationActiveClass);
                    });

                    $activeItem.addClass(navigationActiveClass);
                } else {
                    $item.siblings('.'+navigationActiveClass).removeClass(navigationActiveClass);
                    $item.addClass(navigationActiveClass);
                }

                return false;
            });
        }
    });

    /**
     * AOS
     * Cool scrolling animations
     **/
    if ($("[data-aos]").length) {
        AOS.init({
            offset: 100,
            duration: 1500,
            disable: 'mobile'
        });
    }

    /**
     * TILT
     **/
    if($(".tilt").length) {
        $(".tilt").tilt({
            glare: true,
            maxGlare: 0.4
        });
    }

    /**
     * typed.js
     **/
    if ($(".typed").length) {
        var typed = new Typed('.typed', {
            strings: ['Invoicing', 'Subscriptions', 'Mailing', 'Reporting'],
            typeSpeed: 150,
            backDelay: 500,
            backSpeed: 50,
            loop: true
        });
    }

    /**
     * PRICING TABLES
     **/
    $(".pricing-plans").on("change", 'input[name="pricing-basis"]', function() {
        var period = this.value; // can take 'monthly' or 'yearly' as value

        $(".price", $(".pricing-plans")).each(function() {
            // add 'yearly' css class to 'this' if you want to display /yr label for the price when displayed a yearly basis
            // $(this).addClass(period);
            this.innerHTML = $(this).data(period);
        });
    });
});
