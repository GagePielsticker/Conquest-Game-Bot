function ScrollingSpy(settings) {
    this.options = settings;

    var $this = this,
        navbar = $(this.options.navbar);

    this.navbarSticky = function(scrollTop) {
        if (scrollTop >= this.options.offset) {
            navbar.addClass("navbar-sticky")
        } else {
            navbar.removeClass("navbar-sticky")
        }
    };

    this.pricingSticky = function(scrollTop, pricingPlansTop) {
        if (scrollTop >= pricingPlansTop && scrollTop < (pricingPlansTop + $($this.options.pricingStickyElement).height())) {
            setTimeout(function() {
                $($this.options.pricingBasis).addClass('keep-sticky');
            }, 500);
        } else {
            setTimeout(function() {
                $($this.options.pricingBasis).removeClass('keep-sticky');
            }, 500);
        }
    };

    this.initialize = function() {
        var w = $(window);

        w.on("scroll", function() {
            var scrollTop = w.scrollTop();

            $this.navbarSticky(scrollTop);

            if (w.width() <= 768) {
                var pricingPlansTop = $($this.options.pricingBasis).length ? $($this.options.pricingStickyElement).offset().top - $this.options.offset : null;
                if (pricingPlansTop) {
                    $this.pricingSticky(scrollTop, pricingPlansTop);
                }
            }
        });

        this.navbarSticky(w.scrollTop());
        if (w.width() <= 768) {
            this.pricingSticky(w.scrollTop());
        }
    }
}
