(function( $ ){

  $.fn.oneCarousel = function( options ) {

    /*
     * Создаём настройки по-умолчанию, расширяя их с помощью параметров, которые были переданы
     */

    var defaults = {
      babble: true,
      preview_bubble: false,
      bubble_count: 3,
      moving_images_count: 5,
      left_arrow_value: '',
      right_arrow_value: '',
      autoplay: false,
      timer: 0,
      moving_text: false
    };

    options = $.extend(defaults, options);

    return this.each(function() {

      var self = $(this);
      var babble = options.babble
        , preview_bubble = options.preview_bubble
        , autoplay = options.autoplay
        , bubble_count = options.bubble_count
        , moving_images_count = options.moving_images_count;

      var carousel_element = self.find('.carousel-elem-js')
        , count_slides = $(carousel_element).length
        , count = count_slides-1
        , block_width = 0;


      /*создаём контейнер для карусели*/
      var carousel_container = $('<div>', {
        class: 'carousel-container-js'
      });
      self.append(carousel_container);

      /*
       *наполняем контейнер для карусели элементами:
       * стрелочки,
       * точки для переключения между слайдами,
       * сами блоки для карусели
       */
      var arrows = $('<div>', {
        class: 'arrows-js'
      })
        , arrows_left = $('<div>', {
        class: 'arrow-left-js'
      })
        , arrows_right = $('<div>', {
        class: 'arrow-right-js'
      });

      $(arrows_left).append('<span></span>');
      $(arrows_right).append('<span></span>');
      $(arrows).append(arrows_left, arrows_right).appendTo($(carousel_container));

      /*
       * Наполняем карусельку слайдами
       */
      var container_elements = $('<div>', {
        class: 'container-elements-js'
      })
        , elements = $('<div>', {
        class: 'elements-js'
      });
      $(container_elements).append(elements).appendTo($(carousel_container));

      block_width = $(container_elements).width(); /*ширина контейнера = расстоянию, на которое будут смещаться слайды*/

      $(carousel_element).each(function(indx){
        $(this).appendTo(elements);
        var index = $(this).index();
        $(this).attr('data-num',index);
      });

      /*
       * Текст на стрелочках
       */
      var left_arrow_value = options.left_arrow_value;
      var right_arrow_value = options.right_arrow_value;
      if(left_arrow_value && right_arrow_value) {
        setArrorText(arrows_left, arrows_right, left_arrow_value, right_arrow_value);
      }


      /*
       * Позиционируем элементы карусели подряд друг за другом, начиная с нулевого
       *
       * устанавливаем лефт координаты всех слайдов
       */
      for(i=0; i < count_slides; i++) {
        $(carousel_element).eq(i).css({left: i*block_width+'px'});
      }

      //Преднастройки
      $(carousel_element).eq(0).addClass('active');
      $(arrows_left).addClass('lastSlide');


      /*
       * Проверяем, нужны ли кружки, если да, то создаём их
       */
      if(babble){
        var babbles = $('<div>', {
          class: 'babbles-js'
        });
        $(carousel_container).append(babbles);
        for(i=0; i<count_slides; i++){
          var a_babble = $('<div>', {
            'data-num': i,
            class: 'one-babble-js'
          });
          $(babbles).append(a_babble);
        }

        //Преднастройки для стрелочек
        var one_babble = self.find('.one-babble-js');
        $(one_babble).eq(0).addClass('active');

        // Если нужны превьюшки вместо баблов
        if(preview_bubble) {

          previewBuble(self, carousel_element, arrows_left, arrows_right, babbles, one_babble);

          onClickPreviewBubble(moving_images_count, carousel_element);
          onClickPreviewArrows();

        } else {
          onClickSlideBubble(carousel_element, one_babble, arrows_left, arrows_right);
          clickSlideRightArrow();
          clickSlideLeftArrow();
          doSwipe()
        }
      } else {
        clickSlideRightArrow();
        clickSlideLeftArrow();
        doSwipe()
      }

      /*
       * Создаём функции для работы стрелочек, пузырей и пр.
       */

      /* Функция раскраски баблов */
      function paintBubbles(one_babble, num_attribute){
        $(one_babble).each(function(){
          var num_bubble_attr = $(this).attr('data-num');
          if (num_bubble_attr === num_attribute) {
            $(this).addClass('active');
            return;
          } else if($(this).hasClass('active')) {$(this).removeClass('active');}
        });
      }
      /* Конец Функция раскраски баблов */

      /* Функция обработки нажатий на баблы */
      function onClickSlideBubble(carousel_element, one_babble, arrows_left, arrows_right){
        $(one_babble).each(function(){
          $(this).click(function(){
            var target_babble = $(this);
            /*работа по переключению слайдов*/
            var index_cur_bubble = self.find('.one-babble-js.active').data('num')
              , index_target_bubble = $(target_babble).data('num');

            self.find('.one-babble-js.active').removeClass('active');
            $(target_babble).addClass('active');

            var identificator_vector = index_target_bubble - index_cur_bubble;
            if (identificator_vector === 0){
              return;
            } else {
              $(carousel_element).each(function(){
                var coor = (identificator_vector*block_width)
                  , carousel_coor = parseFloat($(this).css('left'))
                  , coor_px = carousel_coor - coor + 'px';
                $(this).animate({left: coor_px},1000, function(){
                  if($(target_babble).index()===0){
                    $(arrows_left).addClass('lastSlide');
                    $(arrows_right).removeClass('lastSlide');
                  } else if ($(target_babble).index()=== (count)){
                    $(arrows_right).addClass('lastSlide');
                    $(arrows_left).removeClass('lastSlide');
                  } else {
                    $(arrows_right).removeClass('lastSlide');
                    $(arrows_left).removeClass('lastSlide');
                  }
                });
              });
            }
          });
        });
      }
      function onClickPreviewBubble(moving_images_count, carousel_element){
        var n = moving_images_count
          , carousel_width = $(carousel_element).width();
        var moving_block_width = parseFloat(carousel_width/n);
        $(one_babble).each(function(){
          $(this).click(function(){
            if ($('.moving-image-js:animated').size() ) {
              return;
            } else {
              /*работа по переключению слайдов*/
              var index_cur_bubble = self.find('.one-babble-js.active').data('num');
              var index_target_bubble = $(this).data('num');
              if (index_cur_bubble == index_target_bubble) {
                return;
              } else {
                self.find('.one-babble-js.active').removeClass('active');
                $(this).addClass('active');
                var moving_image = $('<div>', {
                  class: 'moving-image-js'
                });

                var img = $(carousel_element)
                  .filter(function(index) {
                    return $(this).data('num') == index_target_bubble;
                  }).find('img');
                $(img).clone().width(carousel_width).appendTo($(moving_image));


                for (var i=0; i<n; i++) {
                  $(moving_image)
                    .clone().appendTo(elements)
                    .width(moving_block_width)
                    .addClass('e-'+i+'-js')
                    .css('left', i*moving_block_width+'px')
                    .find('img').css('marginLeft',-i*moving_block_width+'px');

                    // @TODO: В функцию!!!

                    $('.e-0-js').animate({top: 0}, 500, function(){
                      if($('.e-'+(n-1)+'-js').length) {

                        if ($('.e-'+(n-1)+'-js').position().top == 0) {
                          $('.moving-image-js').each(function(){
                            $(this).remove();
                          });
                        } else {
                          $('.e-1-js').animate({top: 0}, 500, function(){
                            if ($('.e-'+(n-1)+'-js').position().top == 0) {
                              $('.moving-image-js').each(function(){
                                $(this).remove();
                              });
                            } else {
                              $('.e-2-js').animate({top: 0}, 500, function(){
                                if ($('.e-'+(n-1)+'-js').position().top == 0) {
                                  $('.moving-image-js').each(function(){
                                    $(this).remove();
                                  });
                                } else {
                                  $('.e-3-js').animate({top: 0}, 500, function(){
                                    if ($('.e-'+(n-1)+'-js').position().top == 0) {
                                      $('.moving-image-js').each(function(){
                                        $(this).remove();
                                      });
                                    } else {
                                      $('.e-4-js').animate({top: 0}, 500, function(){
                                        //Работа по отображению слайда
                                        $(carousel_element)
                                          .filter(function(index) {
                                            return $(this).data('num') == index_target_bubble;
                                          }).addClass('active');
                                        $(carousel_element)
                                          .not(function(index) {
                                            return $(this).data('num') == index_target_bubble
                                          }).removeClass('active');
                                      })
                                    }
                                  })
                                }
                              })
                            }
                          })
                        }

                      }

                    });


                };

              }
            }
          });
        });
      }

      /* Конец Функция обработки нажатий на баблы */

      /*Функция обработки нажатий стрелочек*/

      function onClickArrow(trueOrFalse){ /*Если тру- то листаем по правой стрелке, если фолс- по левой*/
        var indexEl
          , arrow;

        if(trueOrFalse === true) {
          indexEl = count; /*Последний слайд*/
          arrow = $(arrows_right);
        } else {
          indexEl = 0; /*Первый слайд*/
          arrow = $(arrows_left);
        }

        var first_slide_coor = parseFloat(self.find('.carousel-elem-js.active').css('left'));
        if ((first_slide_coor === 0) && (self.find('.carousel-elem-js.active').index()===indexEl) ) {
          return;
        } else {

          $(carousel_element).each(function(){
            var carousel_coor = parseFloat($(this).css('left'));
            var coor_px;

            if(trueOrFalse === true) {
              coor_px = carousel_coor - block_width + 'px';
            } else {
              coor_px = carousel_coor + block_width + 'px';
            }

            $(this)
              .stop()
              .animate({left: coor_px},1000, function(){
                if (parseFloat($(this).css('left')) === 0){
                  self.find('.carousel-elem-js.active').removeClass('active');
                  $(this).addClass('active');

                  var num_attribute = $(this).data('num');

                  if(babble){
                    paintBubbles(one_babble, num_attribute);
                  }

                  if((parseFloat($(this).css('left')) === 0) && ($(this).index()==indexEl) ){
                    $(arrow).addClass('lastSlide');
                  } else {
                    $(arrows_right).removeClass('lastSlide');
                    $(arrows_left).removeClass('lastSlide');
                  }
                }
              });
          });

        }
      }
      function onClickPreviewArrows() {
        /* конфигурация */
        var bubble_width = $(one_babble).outerWidth(true);

        var imgs = $(babbles).children('div')
          , position = 0
          ;


        $(arrows_right).click(function() {
          if (position <= -bubble_width*(imgs.length-bubble_count)) {
            return false; // уже до упора
          }

          // последнее передвижение вправо может быть не на 3, а на 2 или 1 элемент
          $(arrows_left).removeClass('lastSlide');
          $(arrows_right).removeClass('lastSlide');
          position = Math.max(position-bubble_width*bubble_count, -bubble_width*(imgs.length-bubble_count));
          $(babbles).css('marginLeft',position + 'px');
          if (position <= -bubble_width*(imgs.length-bubble_count)) {
            $(arrows_right).addClass('lastSlide');
          }
          return position;
        });
        $(arrows_left).click(function() {
          if (position >= 0) {
            $(arrows_left).addClass('lastSlide');
            return false;
          } // уже до упора

          // последнее передвижение влево может быть не на 3, а на 2 или 1 элемент
          $(arrows_left).removeClass('lastSlide');
          $(arrows_right).removeClass('lastSlide');
          position = Math.min(position + bubble_width*bubble_count, 0);
          $(babbles).css('marginLeft',position + 'px');
          if (position >= 0) {
            $(arrows_left).addClass('lastSlide');
          }
          return position;
        });

      }
      /*Конец Функция обработки нажатий стрелочек*/


      /* Функции обработки клика по стрелочкам*/
      function clickSlideRightArrow(){
        $(arrows_right).click(function(){
          if (self.find('.carousel-elem-js:animated').size() ) {
            return;
          } else {
            onClickArrow(true);
          }
        });
      }
      function clickSlideLeftArrow(){
        $(arrows_left).click(function(){
          if (self.find('.carousel-elem-js:animated').size() ) {
            return;
          } else {
            onClickArrow(false);
          }
        });
      }
      /* Конец Функции обработки клика по стрелочкам*/

      if(autoplay){
        var autoblay_btns = $('<div>', {
          class: 'autoblay-js'
        });
        var one_autoplay_btn = $('<div>', {
          class: 'autoblay-btn-js'
        });
        $(carousel_container).append(autoblay_btns);
        $(autoblay_btns).append(one_autoplay_btn);
      }

      function previewBuble(self, carousel_element, arrows_left, arrows_right, babbles, one_babble){
        self.addClass('carousel-content-bubble-js');

        $(carousel_element).each(function(){
          $(this).addClass('carousel-preview-elem-js');
        });
        $(arrows_left).addClass('arrow-preview-js');
        $(arrows_right).addClass('arrow-preview-js');

        $(one_babble).each(function(){
          $(this).addClass('one-preview-babble-js');
        });
        for (var i=0; i< $(one_babble).length; i++ ){
          $(carousel_element).eq(i).find('img').clone().appendTo($(one_babble).eq(i));
        }

        $(babbles).wrap("<div class='babbles-container-js'></div>");
        var bubble_width = bubble_count*($(one_babble).outerWidth(true));
        $('.babbles-container-js').width(bubble_width);
      }

      function setArrorText(arrows_left, arrows_right, left_arrow_value, right_arrow_value){
        $(arrows_left).text(left_arrow_value);
        $(arrows_right).text(right_arrow_value);
      }

      /*
       * Swipe
       */

      //@TODO: Проверить работоспособность
      function doSwipe(){
        var start_pageX, start_pageY, end_pageX, end_pageY, delta;

        $(carousel_element).mousedown(function(e){
          console.log('mousedown');
          start_pageX = e.pageX;
          start_pageY = e.pageY;
          return(start_pageX, start_pageY);
        });
        $(carousel_element).mouseup(function(e){
          end_pageX = e.pageX;
          end_pageY = e.pageY;
          delta = end_pageX - start_pageX;
          console.log('mouseup+delta '+delta);
          if (delta > 20){
            onClickArrow(false);
          } else if (delta < -20){
            onClickArrow(true);
          }
        });
      }
      /*
       * Конец Swipe
       */

    });

  };
})( jQuery );






