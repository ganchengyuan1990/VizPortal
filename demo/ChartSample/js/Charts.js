define(["./SettingPanelGenerator",
        "./UrlRequestGetter",
        "./CodeChartGenerator",
        "./ChartTypeGenerator",
        "./TemplateGenerator",
        "./DataGenerator",
        "./BindingGenerator",
        "./PropertyGenerator"], 
    function(SettingPanelGenerator, UrlRequestGetter, CodeChartGenerator, ChartTypeGenerator, TemplateGenerator, DataGenerator, BindingGenerator, PropertyGenerator) {       
        
        return {
            create: function() {
               
                var codeArea = document.getElementById('code-content');
                var chartPar = {
                    property: {
                        plotArea: {},
                        interaction: {
                            zoom: {}
                        }
                    }
                };
                var urlPar = UrlRequestGetter.getRequest().chartType;
                
                ChartTypeGenerator.generateChartType(urlPar, chartPar, codeArea);
                SettingPanelGenerator.generateSettingPanel(null, chartPar, codeArea);
                DataGenerator.generateData(null, chartPar, codeArea);
                BindingGenerator.generateBinding(null, chartPar, codeArea);
                PropertyGenerator.generateChartOption(null, chartPar, codeArea);
                if(/hichert/ig.test(urlPar)){
                    TemplateGenerator.generateTemplate('hichert', chartPar, codeArea);
                }
                else{
                    TemplateGenerator.generateTemplate(null, chartPar, codeArea);
                }   
            }
        }
});
