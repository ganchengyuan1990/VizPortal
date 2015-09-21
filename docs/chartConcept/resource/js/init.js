require(['resource/js/contentGenerator'], function(contentGenerator) {
  "use strict"

  // -------navFirst-------
  var navFirst = (function($root) {
    var $root = $root,
      $childElements = [],
      model = [],

      _data2Dom,
      bind, modifyDom, getChildElement;

    _data2Dom = function() {
      $root.empty();
      $childElements = [];

      model.forEach(function(d) {
        var element = $('<li class="navFirst-item"></li>');

        $childElements.push(element);
        $root.append(element);
      });
    };

    bind = function(data) {
      model = data;
      _data2Dom();
    };

    modifyDom = function(callback) {
      var length = $childElements.length,
        i, element, datum;

      for (i = 0; i < length; i++) {
        element = $childElements[i];
        datum = model[i];

        callback(element.get(0), datum);
      }
    };

    getChildElement = function() {
      return $childElements;
    };

    return {
      bind: bind,
      modifyDom: modifyDom,
      getChildElement: getChildElement
    };
  })($('#navBar-first'));


  // ------navSecond-------
  var navSecond = (function($root) {
    var $root = $root,
      $childElements = [],
      model = [],
      _data2Dom,

      bind, modifyDom;

    _data2Dom = function() {
      $root.empty();
      $childElements = [];

      if (model.length > 0) {
        $root.removeClass("navBar-second-hidden");
        model.forEach(function(d) {
          var element = $('<li class="navSecond-item"></li>');

          $childElements.push(element);
          $root.append(element);
        });
      } else {
        $root.addClass("navBar-second-hidden");
      }
    };

    bind = function(data) {
      model = data;
      _data2Dom();
    };

    modifyDom = function(callback) {
      var length = $childElements.length,
        i, element, datum;

      for (i = 0; i < length; i++) {
        element = $childElements[i];
        datum = model[i];

        callback(element.get(0), datum);
      }
    };

    return {
      bind: bind,
      modifyDom: modifyDom
    };
  })($("#navBar-second"));

  var sectionsContainer = (function($root) {
    var $root = $root,
      $childElements = [],
      model = [],
      _data2Dom,

      bind, modifyDom, getChildren, getRoot;

    _data2Dom = function() {
      $root.empty();
      $childElements = [];
      model.forEach(function(d) {
        var $section = $('<section class="sectionsContainer-item"></section>');

        $childElements.push($section);
        $root.append($section);
      });
    };

    bind = function(data) {
      model = data;
      _data2Dom();
    };

    modifyDom = function(callback) {
      var length = $childElements.length,
        i, element, datum;

      for (i = 0; i < length; i++) {
        element = $childElements[i];
        datum = model[i];

        callback(element.get(0), datum);
      }
    };
    getChildren = function() {
      return $childElements;
    };

    getRoot = function() {
      return $root;
    };


    return {
      bind: bind,
      modifyDom: modifyDom,
      getChildren: getChildren,
      getRoot: getRoot
    }
  })($("#sections-container"));

  //parse data from json file
  $.getJSON('resource/js/navData.json', function(data) {
      var navData = data;
      navFirst.bind(navData);
      navFirst.modifyDom(function(element, d) {
        $(element).empty();
        $(element).append('<a>' + d.id + '</a>')
        $(element).click(function() {
          $(element).addClass("clicked");
          $(element).siblings().removeClass("clicked");

          navSecond.bind(d.subLevel);
          navSecond.modifyDom(function(element, d) {
            var a = $('<a id="' + d.id.replace(/\ |\&/g, "") + '">' + d.id + '</a>');

            a.click(function(event) {
              var id = event.currentTarget.getAttribute("id");
              contentGenerator.aListener(id);
            });

            $(element).append(a);
          });

          var currentLevel = d.id;
          sectionsContainer.bind(d.subLevel);

          if (sectionsContainer.getChildren().length === 0) {
            contentGenerator[currentLevel][currentLevel](sectionsContainer.getRoot().get(0));
          }

          sectionsContainer.modifyDom(function(element, d, clickDom) {
            contentGenerator[currentLevel][d.id](element, d);
          })

          $("#sections-container a").bind("click", function(event) {
            if (event.target.href.indexOf('#') === -1 && event.target.getAttribute('href') && event.target.getAttribute('href').charAt(0) === '/') {
              event.preventDefault();
              parent._switchPage(event.target.href);
            }
          });
          
        })
      });
      navFirst.getChildElement()[0].trigger("click");
      contentGenerator.createSIcon();
    })
    .done(function() {
      console.log("get navData successfully!");
    })
    .fail(function() {
      console.log("can't find proper navData!");
    });

});