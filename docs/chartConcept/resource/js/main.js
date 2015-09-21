define(['resource/js/chartRender'], function (chartRender) {

    /******************utility************************************/
    var utility = {
      isEmptyObj: function(obj) {
        if (!obj)
          return true;
        for (var o in obj) {
          if (obj.hasOwnProperty(o)) {
            return false;
          }
        }
        return true;
      }
      // return utility;
    };
    /********************end of utility *******************/

    /******************Generator************************************/
    var Generator = {
      isIE: function(data) {
          if (data.indexOf("Windows NT") != -1) {
              return true;
          }
          else{ 
              return false;
          }
      },

      isIpad: function(data) {
          if (data.indexOf("iPad") != -1) {
              return true;
          }
          else{ 
              return false;
          }
      },

      handleTextWithCodeTag: function(txt) {
        var CODE_TAG_BEGIN = '<code>';
        if (txt.indexOf(CODE_TAG_BEGIN) >= 0) {
          var txtArray = txt.split(CODE_TAG_BEGIN);
          return txtArray[0] + '<br/> <br/> <span>' + gen.beautifyCodaPara(txtArray[1]) + "</span>";
        }
        return txt;
      },

      beautifyCodaPara: function(txt) {
        return gen.formatToHTML(js_beautify(txt));
      },

      formatToHTML: function(txt) {
        return txt.replace(/\t/g, '&nbsp;&nbsp;&nbsp;&nbsp;').replace(/\n/g, '<br/>').replace(/  /g, '&nbsp;&nbsp;');
      },

      scrollingSpeed: 500,

      returnTop: function() {
          $('body,html').animate({'scrollTop':0}, this.scrollingSpeed);
      },

      //relocate page when click at the new property
      locate: function(property) {
        $("dl.method-content-selected").removeClass("method-content-selected").addClass("method-content");
        var mao = $("dl#" + property);
        mao.removeClass("method-content").addClass("method-content-selected");
        if (mao.length > 0) {
          var pos = mao.offset().top;
          $("html,body").animate({
            scrollTop: pos - $('nav#navBar').height() - $("dl#" + property + " dt").height() + parseInt(mao.css("padding-bottom")) + parseInt(mao.parent().css("margin-bottom")) + parseInt(mao.children('dt').children('h3').css('padding-top')) 
          });
        }
      },

      createTitle: function(element, tag) {
        var h = document.createElement(tag);
        if (tag === 'h1') {
          var span = document.createElement("span");
          h.className = 'classTitle';
          span.innerText = element;
          span.textContent = element;
          h.appendChild(span);
        } else if (tag === 'h2') {
          h.innerText = element;
          h.textContent = element;
          h.className = 'subTitle';
        } else {
          h.innerText = element;
          h.textContent = element;
        }
        return h;
      },

      //put the attribute in the obj into array and order array
      objectIntoArray: function(obj) {
        var array = [];
        for (var o in obj) {
          array.push({
            name: o,
            value: obj[o]
          })
        }
        return array;
      },

      createAnchor: function(holder, id, content) {
        var gen = this;
        var a = document.createElement('a');
        id = id.replace(/\ |\&/g,"");
        a.id = id;
        a.href = "";
        a.onclick = function() {
          gen.locate(this.id);
          return false;
        };
        a.innerText = content;
        a.textContent = content;
        holder.appendChild(a);
      },

      createContainer: function(holder, id, content) {
        var div = document.createElement('div');
        div.className = 'container';
        div.id = id;
        if(content){
          var h3 = document.createElement('h3');
          h3.className = 'subsection-title';
          h3.innerText = content;
          h3.textContent = content;
          div.appendChild(h3);
        }
        holder.appendChild(div);
        return div;
      },

      createMethodContent: function(holder, id, content, classname) {
        var idToDot = id.replace(/_/g, ".");
        var levels = document.createElement('div');
        levels.className = classname;
        holder.appendChild(levels);
        var dl = document.createElement('dl');
        dl.className = classname;
        id = id.replace(/\ |\&/g,"");
        dl.id = id;
        levels.appendChild(dl);
        var dt = document.createElement('dt');
        var h4 = document.createElement('h3');
        h4.className = 'name';
        h4.innerText = idToDot;
        h4.textContent = idToDot;
        dt.appendChild(h4);
        dl.appendChild(dt);
        var dd = document.createElement('dd');
        dd.className = classname;
        dl.appendChild(dd);
        return dd;
      },

      createInfoChartTabDetail: function(key, holder) {
        //create properties
        var divAnchor = this.createContainer($('.fixedContainer')[0], 'anchor-container');
        var divProp = this.createContainer(holder, 'properties-container');
        var property = key.id;
        var KeyArray = this.objectIntoArray(key);
        for (var i = 0; i < KeyArray.length; i++){
          if (KeyArray[i].name === 'id') continue;
          this.createAnchor(divAnchor, KeyArray[i].name, KeyArray[i].name);
          if(i != KeyArray.length-1){
            var text = document.createElement('span');
            text.className = 'separate';
            text.innerText = ' | ';
            text.textContent = ' | ';
            divAnchor.appendChild(text);
          }
          if(property === "theme"){
            this.createInfoChartThemeObj(key[KeyArray[i].name], divProp);
          }
          else if(property === "trellis"){
            this.createInfoChartTrellisObj(KeyArray[i].name, divProp);
          }
          else if(property === "generalModule"){
            this.createInfoChartModuleObj(KeyArray[i].name, divProp);
          }
          else if(property === "dataBindings"){
            this.createInfoChartDataBindingsObj(key[KeyArray[i].name], divProp);
          }
          else if(property === "interaction"){
            this.createInfoChartInteractionObj(KeyArray[i].name, divProp);
          }
        }
      },

      createInfoChartModuleObj: function(module, holder) {
          var moduleDd = this.createMethodContent(holder, module, module, "sketch");
          var svg = document.createElement("embed");
          svg.src = "resource/css/svg/terminology_svg.svg";
          svg.id = "imgContainer";
          moduleDd.appendChild(svg);
          var content = 'When hovering over a series or a point on the chart you can get a tooltip that describes the values on that perticular part of the chart. <br>This modules is available for below charts:<br><a href="/demos/Chart_Sample/Bar & Column/Bar chart/">Bar</a>, <a href="/demos/Chart_Sample/Bar & Column/Column chart/">Column</a>, <a href="/demos/Chart_Sample/Line/Line chart/">Line</a>, <a href="/demos/Chart_Sample/Pie/Pie chart/">Pie</a>, <a href="/demos/Chart_Sample/Bullet/Vertical bullet chart/">Bullet</a>, <a href="/demos/Chart_Sample/Area/Area chart/">Area</a>, <a href="/demos/Chart_Sample/Numeric Point/Numeric Point/">Numeric Point</a>, <a href="/demos/Chart_Sample/Trellis/Trellis Bar Chart/">Trellis</a>, <a href="/demos/Chart_Sample/Marimekko/Marimekko chart/">Marimekko</a>, <a href="/demos/Chart_Sample/Tile/Tree map/">Tile</a>, <a href="/demos/Chart_Sample/Scatter/Scatter plot/">Scatter</a>, <a href="/demos/Chart_Sample/Combination/Combined column chart/">Combination</a>.';
          var content2 = "The legend show the data series in the graph and allows for enabling and disabling one or more series. <br>For more information see the API reference for legend options.";
          var content3 = "The x and y-axis of the chart, can also use multiple axes for different dataseries. Most chart types, like the typical cartesian types line and column, have axes. Polar charts have an x-axis that spans around the perimeter of the chart, and even gauges have a single value axis. Pie charts don't have axes. <br>For more information see the API reference for axes options.";
          var p1 = this.createWords("Tooltip", content, "p1");
          var p2 = this.createWords("Legend", content2, "p2");
          var p3 = this.createWords("Axes", content3, "p3");
          holder.appendChild(p1);
          holder.appendChild(p2);
          holder.appendChild(p3);
      },

      createInfoChartTrellisObj: function(trellis, holder){
        if (trellis === undefined || utility.isEmptyObj(trellis))
          return;
        var trellisDd;  
        if(trellis == "Rows and Columns"){
          trellisDd = this.createMethodContent(holder, trellis, trellis, "sketch");
          var svg = document.createElement("embed");
          svg.src = "resource/css/svg/trellis_svg.svg";
          svg.id = "imgContainer";
          trellisDd.appendChild(svg);
        }
        
        else if(trellis == "Example"){
          trellisDd = this.createMethodContent(holder, trellis, trellis, "demo");
          var demoContainer = document.createElement("div");
          demoContainer.id = "demoContainer";
          trellisDd.appendChild(demoContainer);
          chartRender.trellisChartRender(demoContainer.id);
        }

      },

      createWords: function(title, content, classname){
          var container = document.createElement("div");
          container.className =  classname;
          var t = document.createElement("h3");
          var p = document.createElement("p");
          t.innerHTML = title;
          p.class = "contentsketch";
          p.id = "content" + classname;
          p.innerHTML = content;
          container.appendChild(t);
          container.appendChild(p);
          return container;
      },

      queryFileName: function(filename){
        if(filename.match(/Plot/i) != null){
          return "resource/css/svg/plot_Feeding_zone.svg";
        }
        else if(filename.match(/Category/i) != null){
          return "resource/css/svg/category_Feeding_zone.svg";
        }
        else if(filename.match(/Color/i) != null){
          return "resource/css/svg/color_Feeding_zone.svg";
        }
        else if(filename.match(/Trellis/i) != null){
          return "resource/css/svg/trellis_Feeding_zone.svg";
        }
      },

      createInfoChartDataBindingsObj: function(dataBindings, holder) {
        if (dataBindings === undefined || utility.isEmptyObj(dataBindings))
          return;
        var dataBindingsDd;
        var svg = document.createElement("embed"), svg2 = document.createElement("embed"), svg3 = document.createElement("embed"), svg4 = document.createElement("embed");
        var svgContainer = document.createElement("div");

        if(dataBindings != "Example"){
          dataBindingsDd = this.createMethodContent(holder, dataBindings, dataBindings, "sketch");
          svg.src = this.queryFileName(dataBindings);
          svg.style.width = "100%";
          dataBindingsDd.appendChild(svg);
        }
        else{
          dataBindingsDd = this.createMethodContent(holder, dataBindings, dataBindings, "demo");
          var imgContainer = document.createElement("div");
          imgContainer.className = "demo";
          imgContainer.id = "dataBindingDemo";
          dataBindingsDd.appendChild(imgContainer);
          chartRender.chartZooming(imgContainer.id);
        }
      },

      createInfoChartThemeObj: function(theme, holder) {
        if (theme === undefined || utility.isEmptyObj(theme))
        return;
        var themesDd = this.createMethodContent(holder, theme, theme, "demo");

        if(theme === "Template"){
         //   var themeSelections = ["Default", "Standard", "Flashy", "Empty Ghost", "High Contrast", "Incomplete Ghost", "Standard for Lumira", "High Contrast for Lumira", "Empty Ghost for Lumira", "Incomplete Ghost for Lumira", "Standard for Fiori"];
            var themeSelections = {
                "Standard": "standard_lumira",
                "Flashy": "flashy",
                "High Contrast": "highcontrast_lumira",
                "Blue Crystal": "standard_fiori",
            };
            // var a = JSON.parse(themeSelections);
            var themeSelectionsArray = this.objectIntoArray(themeSelections);
            for (var i = 0; i < themeSelectionsArray.length; i++){
              var itemContainer = document.createElement('div');
              selectionItem = document.createElement('input');
              selectionItem.name = "selectionItem";
              selectionItem.id = "selectionItem" + i;
              var selectionItemName = document.createElement('span');
              selectionItemName.innerHTML = themeSelectionsArray[i].name;
              selectionItem.type = "radio";
              if(i === 0){
                selectionItem.checked = true;
              }
              itemContainer.className = "themeSelections";
              itemContainer.appendChild(selectionItem);
              itemContainer.appendChild(selectionItemName);
              themesDd.appendChild(itemContainer);
              $("#selectionItem" + i).click(function(e) {
                  var content = e.target.parentNode.childNodes[1].innerHTML; 
                  chartRender.simpleChartRender(themeSelections[content]);
              });
            }
            var chartContainer = document.createElement("div");
            chartContainer.id = "chartContainer";
            themesDd.appendChild(chartContainer);
            chartRender.simpleChartRender("standard_lumira");
        }
        else{
          var description = document.createElement("p");
          description.innerHTML = "2 palettes are available for charts: Qualitative, Sequential. Use only one palette in the same chart. Never use colors from different palettes.<br> Colors can be set automatically or manually.<br>" +
                                  "When set automatically, the Chart Component chooses a default palette according to the type of chart (either the qualitative or the sequential) and then assigns color automatically.<br> This is the default behaviour<br>" +
                                  "When set manually, the colors can be assigned either per category (i-e dimension member) or per series (i-e measure) or per data point by using conditions.<br> Use only colors belonging to the same palette.";
          themesDd.appendChild(description);
          var themeSelections = ["Qualitative Color", "Sequential Color"];
          for (var i = 0; i < themeSelections.length; i++){
              var itemContainer = document.createElement('div');
              var selectionItemName = document.createElement('span');
              selectionItemName.innerHTML = themeSelections[i];
              itemContainer.className = "colorSelections";
              var colorImg = document.createElement('img');
              colorImg.id = "colorImg";
              colorImg.src = "resource/css/svg/" + themeSelections[i] + ".svg";
              itemContainer.appendChild(selectionItemName);
              itemContainer.appendChild(colorImg);
              themesDd.appendChild(itemContainer);
              var chartContainer = document.createElement("div");
              chartContainer.id = "colorChartContainer" + i;
              themesDd.appendChild(chartContainer);
              if(i === 0){
                chartRender.simpleChartRender(chartContainer.id, "info/donut");
              }
              else{
                var des = document.createElement("p");
                des.innerHTML = "In sequential color palette, Start and end color are defined by users, and then the colors in-between will be calculated automatically.";
                itemContainer.appendChild(des);
                chartRender.treeMapRender(chartContainer.id);
              }
          }

        }
      },

      createInfoChartInteractionObj: function(interaction, holder) {
          var interactionsDd = this.createMethodContent(holder, interaction, interaction, "demo");
          var chartContainer = document.createElement("div");
          chartContainer.id = "chartContainer" + interaction.replace(/\ |\&/g,"");
          interactionsDd.appendChild(chartContainer);
          chartRender.chartZooming(chartContainer.id);
      },

      createToTopIcon: function(){
        var returntoTop = document.createElement("div");
        returntoTop.className = "returnICon";
        returntoTop.id = "svgToTop";
        var returnICon = document.createElement("img");
        returnICon.src = "../../resources/img/to_top.svg";
        returntoTop.appendChild(returnICon);
        $('body').append(returntoTop);
        $('#svgToTop').click(function(event) {
          Generator.returnTop();
        });   
      },
    };

  return {
    utility: utility,
    Generator:Generator,
  } 
  /********************end of Generator *******************/

});