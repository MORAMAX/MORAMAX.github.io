////////////////////////////////////////////////////////
//  Created by: Army
//  Date: 25/07/2014
//  Description: Image width and height adjuster plugin 
//               to use with UploadServer and unveil.js
//               for responsive sites
//  Prerequisite: Unveil.Js (include file before call)
////////////////////////////////////////////////////////
; (function($) {

    // Plugin definition.
    $.fn.imgAdjuster = function(options) {

        var defaults = {
            maxWidth: 1040     //  The default maximum width of a full screen image
        };

        var settings = $.extend({}, defaults, options);

        var retina = false;
        try {
            retina = window.devicePixelRatio > 1;
        } catch (err) { }
        var dataAttr = retina ? "data-src-retina" : "data-src";
        var imgUrl = '';
        var imgWidth = -1;
        var imgHeight = -1;
        var windowWidth = $(window).width();

        var newImgWidth = -1;
        var newImgHeight = -1;

        var imgWidthPattern = '/upload/(.*?)/.*?$';
        var imgHeightPattern = '/upload/.*?/(.*?)/.*?$';
        var imgUrlSuffix = '';
        var imgUrlSuffixPattern = 'auto(/.+?/.+?)$';

        var imgWidthPatternStandard = '/upload.aspx.*?width=(.*?)&.*?$';
        var imgHeightPatternStandard = '/upload.aspx.*?height=(.*?)&.*?$';
        var imgUrlSuffixPatternStandard = '/upload.aspx.*?crop=(.*?)$';
        return this.each(function () {

            if (windowWidth < settings.maxWidth) {
                var $this = $(this);
                //  Get the original data-src attribute
                imgUrl = $this.attr(dataAttr);
                if (imgUrl != undefined) {
                    //  Get width and height of the image with RegEx
                    var isStandard = false
                    try {
                        imgWidth = parseInt(imgUrl.match(imgWidthPattern)[1]);
                        imgHeight = parseInt(imgUrl.match(imgHeightPattern)[1]);
                        imgUrlSuffix = "&crop=" + imgUrl.match(imgUrlSuffixPattern)[0];
                    } catch (err) {
                        imgWidth = 0;
                        imgHeight = 0;
                        imgUrlSuffix = '';
                    }
                    if (imgWidth == 0) {
                        try {
                            imgWidth = parseInt(imgUrl.match(imgWidthPatternStandard)[1]);
                            imgHeight = parseInt(imgUrl.match(imgHeightPatternStandard)[1]);
                            imgUrlSuffix = imgUrl.match(imgUrlSuffixPatternStandard)[1];
                        } catch (err) {
                            imgWidth = 0;
                            imgHeight = 0;
                            imgUrlSuffix = '';
                        }
                        isStandard = true
                    }
                    //  Calculate new width and height based on window size
                    newImgWidth = parseInt(windowWidth * (retina ? 2 : 1));
                    newImgHeight = parseInt(windowWidth / imgWidth * imgHeight * (retina ? 2 : 1));

                    //  Set new width and height
                    var newImgUrl = '/upload/' + newImgWidth + '/' + newImgHeight + '/' + imgUrlSuffix;
                    if (isStandard) {
                        var newImgUrl = '/upload.aspx?width=' + newImgWidth + '&height=' + newImgHeight + '&crop=' + imgUrlSuffix;
                    }
                    //newImgUrl = imgUrl;
                    $this.attr('src', newImgUrl);
                }
            } else {
                //  Lazy-load image:
                $(this).unveil();
            }
        });
    };
})(jQuery);