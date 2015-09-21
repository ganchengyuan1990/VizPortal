define(["./DataGenerator", 
        "./BindingGenerator", 
        "./PropertyGenerator", 
        "./TemplateGenerator",
        "./ChartTypeGenerator",
        "./JSONOperator",
        "./../config/templates",
        "./../config/chartSamples"], 
function(DataGenerator, BindingGenerator, PropertyGenerator, TemplateGenerator, ChartTypeGenerator, JSONOperator, template, chartSamples) {
    return {
        generateSettingPanel: function(urlPar, chartPar, codeArea) {
            var chart = JSONOperator.findById(chartSamples, chartPar.stringChartType);
            jQuery.sap.require("sap.ui.layout.VerticalLayout");
            var VBox1 = new sap.ui.layout.VerticalLayout();
            var VBox2 = new sap.ui.layout.VerticalLayout();
            VBox1.addStyleClass("VBox1");
            VBox2.addStyleClass("VBox2");
            var HBox2 = new sap.ui.layout.HorizontalLayout();
            var HBox3 = new sap.ui.layout.HorizontalLayout();
            VBox2.insertContent(HBox2, 1);
            VBox2.insertContent(HBox3, 2);
            HBox2.addStyleClass("HBox2");
            HBox3.addStyleClass("HBox3");
            /*var HBox2 = new sap.ui.layout.HorizontalLayout();
            HBox2.addStyleClass("HBox2");*/
            var Panel1 = new sap.m.Panel({
                headerText: "Settings", /*"Demos / Chart Sample / " + chart.category + " / " + chart.name,*/
                height: "auto",
                content: [VBox1, VBox2]
            }).placeAt("setting");
            Panel1.addStyleClass("panel1");
            if (chart.dataset) {
                var Label1 = new sap.m.Label({
                    text: "Dataset",
                    design: "Bold",
                    width: "4em"
                });
                Label1.addStyleClass("sapUiSmallMarginTopBottom");
                var Radio1_1 = new sap.m.RadioButton({
                    id: "RB1-1",
                    groupName: "dataset",
                    text: "small",
                    width: "4em"
                });
                var Radio1_2 = new sap.m.RadioButton({
                    id: "RB1-2",
                    selected: true,
                    groupName: "dataset",
                    text: "medium",
                    width: "4em"
                });
                var Radio1_3 = new sap.m.RadioButton({
                    id: "RB1-3",
                    groupName: "dataset",
                    text: "large",
                    width: "4em"
                });
                var HBox1_1 = new sap.ui.layout.HorizontalLayout({
                    content: [Label1, Radio1_1, Radio1_2, Radio1_3]
                });
                HBox1_1.addStyleClass("HBox1_1");
                VBox1.insertContent(HBox1_1, 0);
                Radio1_1.attachSelect(function() {
                    DataGenerator.generateData('S', chartPar, codeArea);
                });
                Radio1_2.attachSelect(function() {
                    DataGenerator.generateData('M', chartPar, codeArea);
                });
                Radio1_3.attachSelect(function() {
                    DataGenerator.generateData('L', chartPar, codeArea);
                });
            }
            if (chart.series) {
                var Label2 = new sap.m.Label({
                    text: "Series",
                    design: "Bold",
                    width: "4em"
                });
                Label2.addStyleClass("sapUiSmallMarginTopBottom");
                var Radio2_1 = new sap.m.RadioButton({
                    id: "RB2-1",
                    selected: true,
                    groupName: "series",
                    text: "1 serie",
                    width: "4em"
                });
                var Radio2_2 = new sap.m.RadioButton({
                    id: "RB2-2",
                    groupName: "series",
                    text: "2 series",
                    width: "4em"
                });
                var HBox1_2 = new sap.ui.layout.HorizontalLayout({
                    content: [Label2, Radio2_1, Radio2_2]
                });
                HBox1_2.addStyleClass("HBox1_1");
                VBox1.insertContent(HBox1_2, 1);
                if (chart.series == "grey") {
                    Radio2_1.setEnabled(false);
                    Radio2_2.setEnabled(false);
                }
                Radio2_1.attachSelect(function() {
                    BindingGenerator.generateBinding("one", chartPar, codeArea);
                });
                Radio2_2.attachSelect(function() {
                    BindingGenerator.generateBinding("two", chartPar, codeArea);
                });
            }
            if (chart.dataLabel) {
                var Label3 = new sap.m.Label({
                    text: "Value Label",
                    design: "Bold",
                    width: "7em"
                });
                Label3.addStyleClass("sapUiSmallMarginTopBottom");
                var Switch1 = new sap.m.Switch({
                    id: "SW1",
                    customTextOn:"ON",
                    customTextOff:"OFF",
                    state: true
                });
                if (chart.dataLabel == "grey") {
                    Switch1.setEnabled(false);
                }
                var HBox2_1 = new sap.ui.layout.HorizontalLayout({
                    content: [Label3, Switch1]
                });
                HBox2_1.addStyleClass("RTLSwitch");
                //HBox1_2.insertContent(HBox2_1, 3);
                HBox2.insertContent(HBox2_1, 0);
                Switch1.attachChange(function() {
                    if (this.getState()) {
                        PropertyGenerator.generateChartOption("onDataLabel", chartPar, codeArea);
                    }
                    if (!this.getState()) {
                        PropertyGenerator.generateChartOption("offDataLabel", chartPar, codeArea);
                    }
                });
            }
            var isHichertchart = /hichert/ig.test(chart.name);
            if (chart.title) {
                var Label4 = new sap.m.Label({
                    text: "Title",
                    design: "Bold",
                    width: "3.5em"
                });
                Label4.addStyleClass("sapUiSmallMarginTopBottom");
                var Switch2 = new sap.m.Switch({
                    id: "SW2",
                    customTextOn:"ON",
                    customTextOff:"OFF",
                    //Title default on in Hichert Charts
                    state: isHichertchart? true: false
                });
                var HBox2_2 = new sap.ui.layout.HorizontalLayout({
                    content: [Label4, Switch2]
                });
                HBox2_2.addStyleClass("RTLSwitch");
                HBox2.insertContent(HBox2_2, 1);
                Switch2.attachChange(function() {
                    if (this.getState()) {
                        PropertyGenerator.generateChartOption("onTitle", chartPar, codeArea);
                    }
                    if (!this.getState()) {
                        PropertyGenerator.generateChartOption("offTitle", chartPar, codeArea);
                    }
                })
            }
            if (!isHichertchart) { // all charts has template except Hichert Charts
                var Selection1 = new sap.m.Select();
                HBox3.insertContent(Selection1, 0);
                 var items = [];
                if(chartPar.stringChartType=="info/radar")
                {
                     for (var i = template.length - 1; i >= 0; i--) {
                            if(i!=1)
                            {
                                items[i] = new sap.ui.core.Item({
                                text: template[i].text,
                                key: template[i].key
                                });
                                Selection1.insertItem(items[i]);
                            }
                       }
               }
              else
              {
                   for (var i = template.length - 1; i >= 0; i--) {
                       items[i] = new sap.ui.core.Item({
                            text: template[i].text,
                            key: template[i].key
                        });
                       Selection1.insertItem(items[i]);
                      }
               }
                Selection1.addStyleClass(["RTLSelection", "selectionFont"]);
                Selection1.attachChange(function() {
                    TemplateGenerator.generateTemplate(this.getSelectedKey(), chartPar, codeArea);
                });
            }
            var hasDifferenceMarker = (chart.name == "Hichert Bar")||(chart.name =="Hichert Column");
            if (true) { // all charts has selection mode 
                var Selection2 = new sap.m.Select();
                HBox3.insertContent(Selection2, 1);
                //HBox3.addStyleClass("HBox3");

                //normal charts and hichert charts have different selection modes
                var item2_1 = new sap.ui.core.Item({
                    text: hasDifferenceMarker? "Difference Marker": isHichertchart? "Selection Mode(Exclusive)": "Selection Mode (None)",
                    key: hasDifferenceMarker? "differenceMarker": isHichertchart? "exclusive": "none"
                });
                var item2_2 = new sap.ui.core.Item({
                    text: "Inclusive",
                    key: "inclusive"
                });
                var item2_3 = new sap.ui.core.Item({
                    text: hasDifferenceMarker? "Exclusive" : isHichertchart? "None": "Exclusive",
                    key: hasDifferenceMarker? "Exclusive": isHichertchart? "none": "exclusive"
                });
                Selection2.addStyleClass(["RTLSelection", "selectionFont"]);
                Selection2.insertItem(item2_3); Selection2.insertItem(item2_2); Selection2.insertItem(item2_1);
                Selection2.attachChange(function() {
                    PropertyGenerator.generateChartOption(this.getSelectedKey(), chartPar, codeArea);
                });
            }
            if (chart.stackType) {
                var Label5 = new sap.m.Label({
                    text: "Stacking Type",
                    design: "Bold"
                });
                var Radio3_1 = new sap.m.RadioButton({
                    id: "RB3-1",
                    selected: true,
                    groupName: "stackType",
                    text: "regular",
                    width: "4em"
                });
                var Radio3_2 = new sap.m.RadioButton({
                    id: "RB3-2",
                    groupName: "stackType",
                    text: "100%",
                    width: "4em"
                });
                Label5.addStyleClass("sapUiSmallMarginTopBottom");
                var HBox2_3 = new sap.ui.layout.HorizontalLayout({
                    content: [Label5, Radio3_1, Radio3_2]
                });
                VBox1.insertContent(HBox2_3, 2);
                Radio3_1.attachSelect(function() {
                    if (chartPar.stringChartType.indexOf("bar") != -1) {
                        ChartTypeGenerator.generateChartType("stacked_bar", chartPar, codeArea);
                    } else if (chartPar.stringChartType.indexOf("column") != -1) {
                        ChartTypeGenerator.generateChartType("stacked_column", chartPar, codeArea);
                    } else {
                        ChartTypeGenerator.generateChartType("mekko", chartPar, codeArea);
                    }
                });
                Radio3_2.attachSelect(function() {
                    if (chartPar.stringChartType.indexOf("bar") != -1) {
                        ChartTypeGenerator.generateChartType("100_stacked_bar", chartPar, codeArea);
                    } else if (chartPar.stringChartType.indexOf("column") != -1) {
                        ChartTypeGenerator.generateChartType("100_stacked_column", chartPar, codeArea);
                    } else {
                        ChartTypeGenerator.generateChartType("100_mekko", chartPar, codeArea);
                    }
                });
            }
            if (chart.negValue) {
                var Label6 = new sap.m.Label({
                    text: "Negative Value",
                    design: "Bold",
                    width: "8.5em"
                });
                Label6.addStyleClass("sapUiSmallMarginTopBottom");
                var Switch3 = new sap.m.Switch({
                    id: "SW3",
                    customTextOn:"ON",
                    customTextOff:"OFF",
                    state: false
                });
                var HBox2_4 = new sap.ui.layout.HorizontalLayout({
                    content: [Label6, Switch3]
                });
                HBox2_4.addStyleClass("RTLSwitch");
                HBox2.insertContent(HBox2_4, 3);
                Switch3.attachChange(function() {
                    if (this.getState()) {
                        chartPar.negValue = "show";
                        DataGenerator.generateData(null, chartPar, codeArea);
                    }
                    if (!this.getState()) {
                        chartPar.negValue = null;
                        DataGenerator.generateData(null, chartPar, codeArea);
                    }
                })
            }
            if (chart.direction) {
                var Label7 = new sap.m.Label({
                    text: "Direction",
                    design: "Bold",
                    width: "5em",
                    customTextOff: "All",
                    customTextOn: "CateAxis"
                });
                Label7.addStyleClass("sapUiSmallMarginTopBottom");
                var Switch4 = new sap.m.Switch({
                    id: "SW4",
                    customTextOn:"ON",
                    customTextOff:"OFF",
                    state: false
                });
                var HBox2_5 = new sap.ui.layout.HorizontalLayout({
                    content: [Label7, Switch4]
                });
                HBox2_5.addStyleClass("RTLSwitch");
                HBox2.insertContent(HBox2_5, 3);
                Switch4.attachChange(function() {
                    if (this.getState()) {
                        chartPar.direction = "categoryAxis";
                        PropertyGenerator.generateChartOption(null, chartPar, codeArea);
                    }
                    if (!this.getState()) {
                        chartPar.direction = "all";
                        PropertyGenerator.generateChartOption(null, chartPar, codeArea);
                    }
                })
            }
            if (chart.bulletType) {
                var Selection3 = new sap.m.Select();
                HBox3.insertContent(Selection3, 0);
                //HBox3.addStyleClass("HBox3");
                var item3_1 = new sap.ui.core.Item({
                    text: "Primary Only",
                    key: "primary"
                });
                var item3_2 = new sap.ui.core.Item({
                    text: "Primary with Gap Below",
                    key: "gap_below"
                });
                var item3_3 = new sap.ui.core.Item({
                    text: "Primary with Gap Above",
                    key: "gap_above"
                });
                var item3_4 = new sap.ui.core.Item({
                    text: "Primary + Projected",
                    key: "projected"
                });
                var item3_5 = new sap.ui.core.Item({
                    text: "Primary + Additional",
                    key: "additional"
                });
                var item3_6 = new sap.ui.core.Item({
                    text: "Primary + Additional + Projected",
                    key: "projected_additional"
                });
                Selection3.addStyleClass(["RTLSelection", "selectionFont"]);
                Selection3.insertItem(item3_6); Selection3.insertItem(item3_5); Selection3.insertItem(item3_4); 
                Selection3.insertItem(item3_3); Selection3.insertItem(item3_2); Selection3.insertItem(item3_1);
                Selection3.attachChange(function() {
                    chartPar.bulletType = this.getSelectedKey();
                    if (chartPar.bulletType.indexOf("gap") != -1) {
                        PropertyGenerator.generateChartOption(null, chartPar, codeArea);
                    } else {
                        chartPar.property.plotArea.gap = {
                            visible: false
                        }
                        PropertyGenerator.generateChartOption(null, chartPar, codeArea);
                        BindingGenerator.generateBinding(null, chartPar, codeArea);
                    }
                    
                });
                // bullet chart requires a different responsive layout since it has a longer right panel
                VBox1.removeStyleClass("VBox1"); VBox1.addStyleClass("VBox1_long"); 
                VBox2.removeStyleClass("VBox2"); VBox2.addStyleClass("VBox2_long");
                HBox2.removeStyleClass("HBox2"); HBox2.addStyleClass("HBox2_long");
                HBox3.removeStyleClass("HBox3"); HBox3.addStyleClass("HBox3_long");
                HBox2_1.removeStyleClass("RTLSwitch"); HBox2_1.addStyleClass("RTLSwitch_long");
                Selection1.removeStyleClass("RTLSelection"); Selection1.addStyleClass("RTLSelection_long");
            }
        }
    };
});
