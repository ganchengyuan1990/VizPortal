var metadata = (
function () {
    var classdata = [{"name":"VizInstance","kind":"namespace","longname":"sap.viz.api.core.VizInstance","url":"sap.viz.api.core.VizInstance.html","constants":[],"members":[],"methods":["on","size","selection","data","template","properties","css","feeding","feedingZone","propertyZone","update","destroy","toJSON","customizations","off","action","description","bindings","scales"]},{"name":"core","kind":"namespace","longname":"sap.viz.api.core","url":"sap.viz.api.core.html","constants":[],"members":[],"methods":["createViz","destroyViz","exportViz","loadViz"]},{"name":"VERSION","kind":"namespace","longname":"sap.viz.api.VERSION","url":"sap.viz.api.VERSION.html","constants":[],"members":["VERSION"],"methods":[]},{"name":"Viz","kind":"namespace","longname":"sap.viz.api.metadata.Viz","url":"sap.viz.api.metadata.Viz.html","constants":[],"members":[],"methods":["get"]},{"name":"CrosstableDataset","kind":"class","longname":"sap.viz.api.data.CrosstableDataset","url":"sap.viz.api.data.CrosstableDataset.html","constants":[],"members":[],"methods":["data","info"]},{"name":"FlatTableDataset","kind":"class","longname":"sap.viz.api.data.FlatTableDataset","url":"sap.viz.api.data.FlatTableDataset.html","constants":[],"members":[],"methods":["data","metadata","measures","dimensions","table","row","dataInFields","info","toJSON","fromJSON"]},{"name":"Format","kind":"namespace","longname":"sap.viz.api.env.Format","url":"sap.viz.api.env.Format.html","constants":[],"members":[],"methods":["numericFormatter","useDefaultFormatter","format"]},{"name":"Language","kind":"namespace","longname":"sap.viz.api.env.Language","url":"sap.viz.api.env.Language.html","constants":[],"members":[],"methods":["set","get","getErrorMessage"]},{"name":"Locale","kind":"namespace","longname":"sap.viz.api.env.Locale","url":"sap.viz.api.env.Locale.html","constants":[],"members":[],"methods":["set","get"]},{"name":"Resource","kind":"namespace","longname":"sap.viz.api.env.Resource","url":"sap.viz.api.env.Resource.html","constants":[],"members":[],"methods":["path"]},{"name":"Template","kind":"namespace","longname":"sap.viz.api.env.Template","url":"sap.viz.api.env.Template.html","constants":[],"members":[],"methods":["set","get","load"]},{"name":"env","kind":"namespace","longname":"sap.viz.api.env","url":"sap.viz.api.env.html","constants":[],"members":[],"methods":["globalSettings"]},{"name":"Appender","kind":"namespace","longname":"sap.viz.api.log.Appender","url":"sap.viz.api.log.Appender.html","constants":[],"members":["ConsoleAppender","DivAppender","AjaxAppender"],"methods":[]},{"name":"Layout","kind":"namespace","longname":"sap.viz.api.log.Layout","url":"sap.viz.api.log.Layout.html","constants":[],"members":["DefaultLayout","HTMLLayout","XMLLayout","JSONLayout"],"methods":[]},{"name":"Logger","kind":"namespace","longname":"sap.viz.api.log.Logger","url":"sap.viz.api.log.Logger.html","constants":[],"members":["LEVEL.OFF","LEVEL.TRACE","LEVEL.DEBUG","LEVEL.INFO","LEVEL.WARN","LEVEL.ERROR"],"methods":["appenders","level"]},{"name":"Feed","kind":"namespace","longname":"sap.viz.api.manifest.Feed","url":"sap.viz.api.manifest.Feed.html","constants":[],"members":[],"methods":["get"]},{"name":"Module","kind":"namespace","longname":"sap.viz.api.manifest.Module","url":"sap.viz.api.manifest.Module.html","constants":[],"members":[],"methods":["get"]},{"name":"Viz","kind":"namespace","longname":"sap.viz.api.manifest.Viz","url":"sap.viz.api.manifest.Viz.html","constants":[],"members":[],"methods":["get","feedAcceptable"]},{"name":"core","kind":"namespace","longname":"sap.viz.extapi.core","url":"sap.viz.extapi.core.html","constants":[],"members":[],"methods":["registerVizAction","unregisterVizAction","registerBundle"]},{"name":"BaseCustomOverlay","kind":"namespace","longname":"sap.viz.extapi.core.BaseCustomOverlay","url":"sap.viz.extapi.core.BaseCustomOverlay.html","constants":[],"members":[],"methods":["extend"]},{"name":"BaseCustomRenderer","kind":"namespace","longname":"sap.viz.extapi.core.BaseCustomRenderer","url":"sap.viz.extapi.core.BaseCustomRenderer.html","constants":[],"members":[],"methods":["extend"]},{"name":"BaseCustomInteraction","kind":"namespace","longname":"sap.viz.extapi.core.BaseCustomInteraction","url":"sap.viz.extapi.core.BaseCustomInteraction.html","constants":[],"members":[],"methods":["extend"]},{"name":"BaseCustomization","kind":"namespace","longname":"sap.viz.extapi.core.BaseCustomization","url":"sap.viz.extapi.core.BaseCustomization.html","constants":[],"members":[],"methods":["extend"]},{"name":"BaseChart","kind":"namespace","longname":"sap.viz.extapi.core.BaseChart","url":"sap.viz.extapi.core.BaseChart.html","constants":[],"members":[],"methods":["extend"]},{"name":"VERSION","kind":"namespace","longname":"sap.viz.extapi.VERSION","url":"sap.viz.extapi.VERSION.html","constants":[],"members":["VERSION"],"methods":[]},{"name":"component","kind":"namespace","longname":"sap.viz.extapi.component","url":"sap.viz.extapi.component.html","constants":[],"members":[],"methods":[]},{"name":"Title","kind":"namespace","longname":"sap.viz.extapi.component.Title","url":"sap.viz.extapi.component.Title.html","constants":[],"members":["NAME"],"methods":[]},{"name":"ColorLegend","kind":"namespace","longname":"sap.viz.extapi.component.ColorLegend","url":"sap.viz.extapi.component.ColorLegend.html","constants":[],"members":["NAME"],"methods":[]},{"name":"BaseCustomInteraction","kind":"namespace","longname":"BaseCustomInteraction","url":"BaseCustomInteraction.html","constants":[],"members":["id","metadata","triggers"],"methods":["handle","exportToSVGString","container","properties","vizInstanceInfo","reRenderVizInstance"]},{"name":"BaseCustomization","kind":"namespace","longname":"BaseCustomization","url":"BaseCustomization.html","constants":[],"members":["id","chartType","customOverlay","customRenderers","customInteraction"],"methods":[]},{"name":"BaseCustomOverlay","kind":"namespace","longname":"BaseCustomOverlay","url":"BaseCustomOverlay.html","constants":[],"members":["id","metadata"],"methods":["init","overrideProperties","render","destroy","exportToSVGString","container","properties","vizInstanceInfo"]},{"name":"BaseCustomRenderer","kind":"namespace","longname":"BaseCustomRenderer","url":"BaseCustomRenderer.html","constants":[],"members":["id","type","metadata"],"methods":["vizInstanceInfo","render"]},{"name":"CustomInteractionEvents","kind":"namespace","longname":"sap.viz.extapi.customization.constants.CustomInteractionEvents","url":"sap.viz.extapi.customization.constants.CustomInteractionEvents.html","constants":[],"members":["SPACE","TAB","ENTER","RIGHT_ARROW","LEFT_ARROW","UP_ARROW","DOWN_ARROW","WHEEL_MOVE","MOUSE_UP","MOUSE_DOWN","CLICK","HOVER","CONTEXT_MENU","RENDER_COMPLETE","PLOT_SCROLL"],"methods":[]},{"name":"CustomInteractionTargets","kind":"namespace","longname":"sap.viz.extapi.customization.constants.CustomInteractionTargets","url":"sap.viz.extapi.customization.constants.CustomInteractionTargets.html","constants":[],"members":["CHART_ROOT","AXIS_LABEL_ITEM","DATALABEL","DATAPOINT","LEGEND_ITEM","LINES","AXIS_BODY","AXIS_TITLE","CATEGORY_AXIS","LEGEND","CHART_TITLE","VALUE_AXIS","VALUE_AXIS2","PLOT"],"methods":[]},{"name":"CustomRendererTypes","kind":"namespace","longname":"sap.viz.extapi.customization.constants.CustomRendererTypes","url":"sap.viz.extapi.customization.constants.CustomRendererTypes.html","constants":[],"members":["PLOTAREA_MARKERRENDERER","CATEGORYAXIS_LABELRENDERER","PLOTAREA_DATALABEL_RENDERER"],"methods":[]},{"name":"RuleDefintion","kind":"namespace","longname":"RuleDefintion","url":"RuleDefintion.html","constants":[],"members":[],"methods":[]},{"name":"Language","kind":"namespace","longname":"sap.viz.extapi.env.Language","url":"sap.viz.extapi.env.Language.html","constants":[],"members":[],"methods":["get","addListener","removeListener","register","getErrorMessage","getResourceString"]},{"name":"Locale","kind":"namespace","longname":"sap.viz.extapi.env.Locale","url":"sap.viz.extapi.env.Locale.html","constants":[],"members":[],"methods":["get","addListener","removeListener"]},{"name":"Resource","kind":"namespace","longname":"sap.viz.extapi.env.Resource","url":"sap.viz.extapi.env.Resource.html","constants":[],"members":[],"methods":["path"]},{"name":"Template","kind":"namespace","longname":"sap.viz.extapi.env.Template","url":"sap.viz.extapi.env.Template.html","constants":[],"members":[],"methods":["get","current","getPackage","isRegistered","register","addListener","removeListener"]},{"name":"BaseChart","kind":"namespace","longname":"BaseChart","url":"BaseChart.html","constants":[],"members":["metadata"],"methods":["destroy","exportToSVGString","feedingZone","getSelection","init","propertyZone","render","setSelection","updateBuiltInComponents","binding","container","data","dispatchEvent","properties","size"]},{"name":"ColorLegend","kind":"namespace","longname":"ColorLegend","url":"ColorLegend.html","constants":[],"members":["NAME name of the color legend"],"methods":["properties","supportedEvent","addEventListener","removeEventListener"]},{"name":"Title","kind":"namespace","longname":"Title","url":"Title.html","constants":[],"members":["NAME name of the title module"],"methods":["properties"]},{"name":"Flow","kind":"namespace","longname":"sap.viz.extapi.Flow","url":"sap.viz.extapi.Flow.html","constants":[],"members":[],"methods":["createFlow","createElement","registerFlow","unregisterFlow"]},{"name":"Feed","kind":"namespace","longname":"sap.viz.extapi.manifest.Feed","url":"sap.viz.extapi.manifest.Feed.html","constants":[],"members":[],"methods":["register","unregister"]},{"name":"Module","kind":"namespace","longname":"sap.viz.extapi.manifest.Module","url":"sap.viz.extapi.manifest.Module.html","constants":[],"members":[],"methods":["register","unregister"]},{"name":"Viz","kind":"namespace","longname":"sap.viz.extapi.manifest.Viz","url":"sap.viz.extapi.manifest.Viz.html","constants":[],"members":[],"methods":["register","unregister"]},{"name":"Data","kind":"namespace","longname":"sap.viz.extapi.utils.Data","url":"sap.viz.extapi.utils.Data.html","constants":[],"members":[],"methods":["getDataContext"]}];
    var hl = function (label, idx, len) {
        return label.slice(0, idx) + "<span style=\"background-color:yellow\">" + label.substring(idx, idx + len) + "</span>" + label.substring(idx + len);
    };
    var searchFn = function (req, resp) {
        var keyword = req.term.toLowerCase(), len = keyword.length;
        var result = [];
        var i, j, idx;
        for (i in classdata) {
            var item = classdata[i];
            if ((idx = item.name.toLowerCase().indexOf(keyword)) >= 0) {
                var label = hl(item.name, idx, len);
                result.push({label:label, value:item.url});
            }
            for (j in item.methods) {
                var m = item.methods[j];
                if ((idx = m.toLowerCase().indexOf(keyword)) >= 0) {
                    result.push({label:item.name + "." + hl(m, idx, len), value:item.url + "#" + m});
                }
            }
        }
        resp(result);
    };
    var pkgdata = {"name":"root","children":[{"name":"sap","children":[{"name":"viz","children":[{"name":"api","children":[{"name":"data","children":[{"name":"CrosstableDataset","url":"sap.viz.api.data.CrosstableDataset.html","kind":"class"},{"name":"FlatTableDataset","url":"sap.viz.api.data.FlatTableDataset.html","kind":"class"}]},{"name":"core","children":[{"name":"VizInstance","url":"sap.viz.api.core.VizInstance.html","kind":"namespace"}]},{"name":"core","url":"sap.viz.api.core.html","kind":"namespace"},{"name":"VERSION","url":"sap.viz.api.VERSION.html","kind":"namespace"},{"name":"metadata","children":[{"name":"Viz","url":"sap.viz.api.metadata.Viz.html","kind":"namespace"}]},{"name":"env","children":[{"name":"Format","url":"sap.viz.api.env.Format.html","kind":"namespace"},{"name":"Language","url":"sap.viz.api.env.Language.html","kind":"namespace"},{"name":"Locale","url":"sap.viz.api.env.Locale.html","kind":"namespace"},{"name":"Resource","url":"sap.viz.api.env.Resource.html","kind":"namespace"},{"name":"Template","url":"sap.viz.api.env.Template.html","kind":"namespace"}]},{"name":"env","url":"sap.viz.api.env.html","kind":"namespace"},{"name":"log","children":[{"name":"Appender","url":"sap.viz.api.log.Appender.html","kind":"namespace"},{"name":"Layout","url":"sap.viz.api.log.Layout.html","kind":"namespace"},{"name":"Logger","url":"sap.viz.api.log.Logger.html","kind":"namespace"}]},{"name":"manifest","children":[{"name":"Feed","url":"sap.viz.api.manifest.Feed.html","kind":"namespace"},{"name":"Module","url":"sap.viz.api.manifest.Module.html","kind":"namespace"},{"name":"Viz","url":"sap.viz.api.manifest.Viz.html","kind":"namespace"}]}]},{"name":"extapi","children":[{"name":"core","url":"sap.viz.extapi.core.html","kind":"namespace"},{"name":"core.BaseCustomOverlay","url":"sap.viz.extapi.core.BaseCustomOverlay.html","kind":"namespace"},{"name":"core.BaseCustomRenderer","url":"sap.viz.extapi.core.BaseCustomRenderer.html","kind":"namespace"},{"name":"core.BaseCustomInteraction","url":"sap.viz.extapi.core.BaseCustomInteraction.html","kind":"namespace"},{"name":"core.BaseCustomization","url":"sap.viz.extapi.core.BaseCustomization.html","kind":"namespace"},{"name":"core.BaseChart","url":"sap.viz.extapi.core.BaseChart.html","kind":"namespace"},{"name":"VERSION","url":"sap.viz.extapi.VERSION.html","kind":"namespace"},{"name":"component","url":"sap.viz.extapi.component.html","kind":"namespace"},{"name":"component.Title","url":"sap.viz.extapi.component.Title.html","kind":"namespace"},{"name":"component.ColorLegend","url":"sap.viz.extapi.component.ColorLegend.html","kind":"namespace"},{"name":"customization","children":[{"name":"constants","children":[{"name":"CustomInteractionEvents","url":"sap.viz.extapi.customization.constants.CustomInteractionEvents.html","kind":"namespace"},{"name":"CustomInteractionTargets","url":"sap.viz.extapi.customization.constants.CustomInteractionTargets.html","kind":"namespace"},{"name":"CustomRendererTypes","url":"sap.viz.extapi.customization.constants.CustomRendererTypes.html","kind":"namespace"}]}]},{"name":"env","children":[{"name":"Language","url":"sap.viz.extapi.env.Language.html","kind":"namespace"},{"name":"Locale","url":"sap.viz.extapi.env.Locale.html","kind":"namespace"},{"name":"Resource","url":"sap.viz.extapi.env.Resource.html","kind":"namespace"},{"name":"Template","url":"sap.viz.extapi.env.Template.html","kind":"namespace"}]},{"name":"Flow","url":"sap.viz.extapi.Flow.html","kind":"namespace"},{"name":"manifest","children":[{"name":"Feed","url":"sap.viz.extapi.manifest.Feed.html","kind":"namespace"},{"name":"Module","url":"sap.viz.extapi.manifest.Module.html","kind":"namespace"},{"name":"Viz","url":"sap.viz.extapi.manifest.Viz.html","kind":"namespace"}]},{"name":"utils","children":[{"name":"Data","url":"sap.viz.extapi.utils.Data.html","kind":"namespace"}]}]}]}]},{"name":"BaseCustomInteraction","url":"BaseCustomInteraction.html","kind":"namespace"},{"name":"BaseCustomization","url":"BaseCustomization.html","kind":"namespace"},{"name":"BaseCustomOverlay","url":"BaseCustomOverlay.html","kind":"namespace"},{"name":"BaseCustomRenderer","url":"BaseCustomRenderer.html","kind":"namespace"},{"name":"RuleDefintion","url":"RuleDefintion.html","kind":"namespace"},{"name":"BaseChart","url":"BaseChart.html","kind":"namespace"},{"name":"ColorLegend","url":"ColorLegend.html","kind":"namespace"},{"name":"Title","url":"Title.html","kind":"namespace"}]};
    var createNode = function (pnode, data, top) {
        var ident = top ? 0 : 15;
        var node = $("<div/>").text(data.name).appendTo(pnode).css({"margin-left":(ident) + "px", "padding-bottom":"5px"});
        if (data.children && data.children.length) {
            var container = $("<div/>").appendTo(pnode).css("margin-left", (ident) + "px");
            node.text(data.name).attr("class", "tree-package-expand").click(function (e) {
                var t = 200;
                var easing = "blind";
                if (container.css("display") == "none") {
                    container.show(easing, {}, 400);
                    node.text(data.name).attr("class", "tree-package-expand");
                } else {
                    container.hide(easing, {}, 400);
                    node.text(data.name).attr("class", "tree-package-collapse");
                }
                e.stopPropagation();
            });
            for (var i = 0; i < data.children.length; i++) {
                createNode(container, data.children[i]);
            }
        } else {
            if (data.url) {
                console.log(data);
                node.html("<a href=\"" + data.url + "\" class=\"table_content-link tree-" + data.kind + "\">" + data.name + "</a>");
            } else {
                node.text(data.name).attr("class", "tree-package-expand");
            }
            node.click(function (e) {
                e.stopPropagation();
            });
        }
    };
    var createTree = function (pnode) {
        var data = pkgdata;
        for (var i = 0, l = data.children.length; i < l; i++) {
            createNode(pnode, data.children[i], true);
        }
    };
    return {searchDS:searchFn, createTree:createTree};
}
)();