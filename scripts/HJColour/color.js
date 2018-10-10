var color = {
    
    $win: null,
    $base: null,
    $img: null,
    width: 0,
    images: [],
    current: 1,
    
    IMAGE_FOLDER: "/images/Colour/",
                
    init: function() {
        
        color.$win = $(".animating");
        color.$img = color.$win.children("img");
        color.$base = $(".color").children("img");
        color.width = $(".color").width();
        
        // fill the array with images to be used with the animations
        color.images[0] = {image: "Colour_3.jpg", anim: 1 };
        color.images[1] = {image: "Colour_2.jpg", anim: 1 };
        color.images[2] = {image: "Colour_1.jpg", anim: 2 };
        color.images[3] = {image: "Colour_4.jpg", anim: 1 };
        
        //jQuery.fx.interval = 100;
        color.wipeacross_anim();
        
    },
    
    setImageLoc: function() {
    
        color.$img.css({ left: -parseFloat(color.$win.css("left").replace("px", "")) });
    
    },
    
    /* this animation wipes across the widget, then back to the center, then expands to fill the widget */   
    wipeacross_anim: function() {

        // animate from l to r
        color.$win.animate(
            {left: 250}, 
            {duration: 1000,
             easing: "easeInQuart",
             complete: function(){
             
                // animate from r to l
                color.$win.animate(
                    {left: 162 - (color.$win.width() / 2)},
                    {duration: 1100,
                    easing: "easeInOutSine",
                    complete: function() {
                        
                        // animate width expansion
                        color.$win.animate(
                            { left: 0, width: 477 },
                            {duration: 2000,
                            easing: "easeOutQuart",
                            complete: function() {
                                
                                // which animation?
                                var anim;
                                switch(color.images[color.current].anim) {
                                    case 1: 
                                        anim = color.wipeacross_anim;
                                        break;
                                    case 2: 
                                        anim = color.shrinkslide_anim;
                                        break;
                                    default: 
                                        anim = color.wipeacross_anim;
                                        break;
                                }
                                
                                // animation cycle finished, update current animating image and reset windows
                                color.current < color.images.length - 1 ? color.current+=1 : color.current = 0;
                                color.resetWin();
                                
                                // new animation
                                anim();
                                
                            },
                            step: color.setImageLoc}
                        );
                        
                    },
                    step: color.setImageLoc}
                );
                
             },
             step: color.setImageLoc}
        );
        
    },
    
    /* this animation starts full widget, then collapses and slides out to reveal the new image preset to base */
    shrinkslide_anim: function() {
        
        // set the animating image to be the same as the base one, then set it to fill the entire widget
        color.$img.attr({ src: color.$base.attr("src") });
        color.$win.css({ left: 0, width: 477 });
        
        // set the base one to be the new image (we're about to collapse the one above to reveal it)
        color.$base.attr({ src: color.IMAGE_FOLDER + color.images[color.current].image });
        
        // shrink the win down a bit
        color.$win.animate(
            { left: 100, width: 80 },
            {duration: 1000,
            easing: "easeOutQuart",
            complete: function() {
                
                // animate l
                color.$win.animate(
                    { left: -40, width: 30 },
                    {duration: 1000,
                    easing: "linear",
                    complete: function() {
                        
                        // which animation?
                        var anim;
                        switch(color.images[color.current].anim) {
                            case 1: 
                                anim = color.wipeacross_anim;
                                break;
                            case 2: 
                                anim = color.shrinkslide_anim;
                                break;
                            default: 
                                anim = color.wipeacross_anim;
                                break;
                        }
                        
                        // animation cycle finished, update current animating image and reset windows
                        color.current < color.images.length - 1 ? color.current+=1 : color.current = 0;
                        
                        color.$img.attr({ src: color.IMAGE_FOLDER + color.images[color.current].image });
                        color.$win.css({ left: -40, width: 40 });
                        
                        // new animation
                        anim();
                        
                    },
                    step: color.setImageLoc}
                );
                
            },
            step: color.setImageLoc}
        );
        
    },
    
    /* reset the animated 'window' */
    resetWin: function() {
        // now switch the images around and reset the position of the 'window'
        color.$base.attr({ src: color.$img.attr("src") });
        color.$img.attr({ src: color.IMAGE_FOLDER + color.images[color.current].image });
        color.$win.css({ left: -40, width: 40 });
    }
    
};