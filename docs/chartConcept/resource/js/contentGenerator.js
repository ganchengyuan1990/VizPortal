define(['resource/js/main'], function (content) {
    var generalModule = (function () {
      var Terminology;

      Terminology = function (element, d) {
          content.Generator.createInfoChartModuleObj(d.id, element);
      };

      return {
        Terminology: Terminology
      };
    })();

    var trellis = (function () {
      var RowAndColumn, Example;

      RowAndColumn = function (element, d) {
          content.Generator.createInfoChartTrellisObj(d.id, element);
      };

      Example = function (element, d) {
          content.Generator.createInfoChartTrellisObj(d.id, element);
      };

      return {
        "Rows and Columns": RowAndColumn,
        Example: Example
      };
    })();

    var dataBindings = (function () {
      var Plot_Area_Feeding_Zone, Category_Value_Axis_Feeding_Zone, Color_Feeding_Zone;

      Plot_Area_Feeding_Zone = function (element, d) {
          content.Generator.createInfoChartDataBindingsObj(d.id, element);
      };

      Category_Value_Axis_Feeding_Zone = function (element, d) {
          content.Generator.createInfoChartDataBindingsObj(d.id, element);
      };

      Color_Feeding_Zone = function (element, d) {
          content.Generator.createInfoChartDataBindingsObj(d.id, element);
      };

      trellis_Feeding_zone = function (element, d) {
          content.Generator.createInfoChartDataBindingsObj(d.id, element);
      };

      Example = function (element, d) {
          content.Generator.createInfoChartDataBindingsObj(d.id, element);
      };

      return {
        "Plot Area Feeding Zone": Plot_Area_Feeding_Zone,
        "Category & Value Axis Feeding Zone": Category_Value_Axis_Feeding_Zone,
        "Color Feeding Zone":Color_Feeding_Zone,
        "Trellis Feeding Zone": trellis_Feeding_zone,
        Example: Example
      };
    })();

    var interaction = (function () {
      var Zooming_Pan_Scrollable_Selection;

      Zooming_Pan_Scrollable_Selection = function (element, d) {
          content.Generator.createInfoChartInteractionObj(d.id, element);
      };

      return {
        "Zooming & Pan & Scrollable & Selection": Zooming_Pan_Scrollable_Selection,
      };
    })();

    var theme = (function () {
      var Template, Color_palette;

      Template = function (element, d) {
          content.Generator.createInfoChartThemeObj(d.id, element);
      };

      Color_palette = function (element, d) {
          content.Generator.createInfoChartThemeObj(d.id, element);
      };

      return {
        Template: Template,
        "Color palette": Color_palette
      };
    })();

    var aListener = function(id){
        content.Generator.locate(id);
        this.handlers = {};

    };

    var publisher = {
        subscribers : {
            any : []    // 事件类型： 订阅者
        },

        subscribe : function(fn, type) {
            type = type || 'any';
            if (typeof this.subscribers[type] === 'undefined') {
                this.subscribers[type] = [];
            }
            this.subscribers[type].push(fn);
        },
    };

    var createSIcon = function(){
        content.Generator.createToTopIcon();
    };

    var description = (function () {
    var description = function (element) {
      $element = $(element);
      $div = $('<div class="description-container"></div>');
      $div.append("<p>Welcome to Emprise CVOM Charts. Constructed entirely in JavaScript the days of annoying plugin downloads and browser security warnings are gone. With genuine ease of use and complete customization Emprise CVOM Charts provides you with the tools you need to publish your data quickly and in a variety of formats. With its wide range of interactive features, simple and straightforward implementation, and unparalleled functionality, Emprise CVOM Charts is the clear first choice for all your charting needs. Here's a quick sampling of just some of the features included:</p>");
      $div.append('<h3 class="description-h3">Interactive</h3>');
      $div.append('<p>Features such as Hints, Mouse Tracking, Mouse Events, Key Tracking and Events, Zooming, Scrolling, and Crosshairs raise interactivity and user experience in web charting to a new level.</p>');
      $div.append('<h3 class="description-h3">Axis Scaling</h3>');
      $div.append("<p>There's no need to determine your data range before hand. CVOM Charts will calculate and scale automatically to fit whatever data it is presented with.</p>");
      $div.append('<h3 class="description-h3">Auto Zooming, Scrolling</h3>');
      $div.append("<p>Too much data and not enough screen real estate? Show it all. Let your end users zoom in on the pieces they're most interested in. Axis locking for single axis zoom, scrolling and automatic axis scaling are all included.</p>");
      $div.append('<h3 class="description-h3">Stackable Series</h3>');
      $div.append("<p>Multiple chart series can be stacked and combined to fit many charting needs.</p>");
      $div.append('<h3 class="description-h3">Multiple Series Types</h3>');
      $div.append("<p>Line, Area, Scatter, Pie, Bar and Function series are just the beginning. New series are just a few lines of JavaScript code.</p>");
      $div.append('<h3 class="description-h3">Compatible</h3>');
      $div.append('<p>Built with compatibility in mind and tested on all major browsers, you can be assured your charts will function consistently for the broadest range of end users. See the full list of compatible browsers on our <a href="#" target="_self">System Requirements page</a>.</p>');
      $div.append('<h3 class="description-h3">Customizable</h3>');
      $div.append("<p>Every aspect of the charting display can be configured and customized through well-documented properties and methods. Want to do more than just change the color of the background? Need a series type which doesn't already exist? CVOM Charts is fully customizable and extendable to provide the greatest flexibility and integration for existing site designs and needs.</p>");
      $div.append('<h3 class="description-h3">Feeding Zone</h3>');
      $div.append("<p>To ease UI design of data binding, there is a zone area with coordinates and sizes for each chart element which accepts bindings to indicate the applicable area and its acceptable bindings.</p>");
      $element.append($div);
    };

    return {
      description: description
    };
  })();

    return {
    "general Module": generalModule,
    trellis: trellis,
    "data Bindings": dataBindings,
    interaction: interaction,
    theme: theme,
    aListener:aListener,
    createSIcon:createSIcon,
    description: description
  }

});


