
define([], function(){
return {
    "info/hichert_bar": {
        "categoryAxis.axisLine.visible": {
            "defaultValue": true,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.color": {
            "defaultValue": "#6c6c6c",
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "categoryAxis.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Set color of hoverShadow.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.angle": {
            "access": "internal",
            "defaultValue": 90,
            "description": "Set the rotation angle when the axis has only one layer and label rotation is fixed. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number",
            "supportedValues": "0, 30, 45, 60, 90"
        },
        "categoryAxis.label.rotation": {
            "access": "internal",
            "defaultValue": "auto",
            "description": "Set the rotation type when the axis has only one layer. Auto means labels may be horizontal or rotated 45 degrees. Fixed means labels will always be rotated, whenever truncatedLabelRatio is. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "String",
            "supportedValues": "auto, fixed"
        },
        "categoryAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.truncatedLabelRatio": {
            "access": "internal",
            "defaultValue": 0.2,
            "description": "Set the truncated labels radio when there is only one layer. If too many labels need to be truncated, and rotation setting is auto, labels will be rotated. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number"
        },
        "categoryAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis label.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxHeight": {
            "defaultValue": 0.3,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxWidth": {
            "defaultValue": 0.3,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.title.style": {
            "description": "Settings for the axis title style.",
            "isPrefix": true
        },
        "categoryAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.text": {
            "defaultValue": null,
            "description": "Set text of axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis.",
            "supportedValueType": "Boolean"
        },
        "embeddedLegend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.bottomHeight": {
            "defaultValue": null,
            "description": "Set the bottom height of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.topHeight": {
            "defaultValue": null,
            "description": "Set the top height of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "description": "Zone information of possible feeding areas. feedingZoneArray",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Array"
        },
        "general.background.border": {
            "description": "Settings for the background border.",
            "isPrefix": true
        },
        "general.background.border.bottom": {
            "description": "Settings for the background bottom border.",
            "isPrefix": true
        },
        "general.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.left": {
            "description": "Settings for the background left border.",
            "isPrefix": true
        },
        "general.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.right": {
            "description": "Settings for the background right border.",
            "isPrefix": true
        },
        "general.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "general.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "general.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "general.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the chart background.",
            "supportedValueType": "String"
        },
        "general.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "general.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "general.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "general.groupData": {
            "defaultValue": false,
            "description": "Set to respect input dataset order. If more than one dimensions are bound to category axis and groupData is set to true, chart will automatically group data. If groupData is set to false, input dataset order will always be respected. This property will not work once fields domain in dataset metadata is set.",
            "supportedValueType": "Boolean"
        },
        "general.layout.padding": {
            "defaultValue": 24,
            "description": "Set the universal padding value. This single value is applied to all sides of the chart. Individual settings for each edge are also supported.",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingBottom": {
            "defaultValue": null,
            "description": "Set the padding value for the bottom side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingLeft": {
            "defaultValue": null,
            "description": "Set the padding value for the left side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingRight": {
            "defaultValue": null,
            "description": "Set the padding value for the right side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingTop": {
            "defaultValue": null,
            "description": "Set the padding value for the top side",
            "supportedValueType": "PositiveInt"
        },
        "interaction.behaviorType": {
            "defaultValue": "hichertBehavior",
            "description": "Switch the behavior type by behavior ID, instead of using default interaction behavior. The behavior is registered via interaction.add(behavior) API. 'noHoverBehavior' is an embeded value where data points details will be thrown when selecting (different from default behavior, which throw the information when hovering).",
            "readonly": false,
            "serializable": true
        },
        "interaction.decorations": {
            "defaultValue": null,
            "description": "Set decorations relating to interaction. Each item that is an object of {name: 'decoration name', fn: 'decoration callback function'} is a decoration. Currently two decorations are supported: showDetail and hideDetail. These two decorations can be used to create a user-defined tooltip. If these 2 decorations are used, the default tooltip is not used, and the user should implement a custom tooltip. The showDetail decoration is called when the tooltip is shown, and the hideDetail decoration is called when the tooltip is hidden. The arguments of showDetail are one object of {mode: 'tooltip mode', data: 'data of hovering selected data point', position: 'mouse position', container: 'chart container dom element', selectedNumber: 'number of selected data points', isAnchored: 'whether tooltip should keep current position or not'}. 'tooltip mode' is either 'infoMode' or 'actionMode'. Hovering over an unselected data point displays the infoMode tooltip, while hovering over a selected data point displays the actionMode tooltip. 'data' is an array of dimensions and measures, where each item is an object of {name: 'dimension name or measure name', value: 'dimension member or measure value', type: 'literal string of dimension or measure'}. For instance, {name: 'Country', value: 'China', type: 'dimension'}, or {name: 'Profit', value: 159, type: 'measure'}. The arguments of hideDetail are a string representing tooltip mode, i.e. what kind of tooltip should be hidden.",
            "serializable": false,
            "supportedValueType": "Array"
        },
        "interaction.deselected.opacity": {
            "defaultValue": 0.2,
            "description": "Set deselected data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.opacity": {
            "defaultValue": 1,
            "description": "Set hovered data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.hover.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of hovered data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.hover.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width. The max width is 4px.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.noninteractiveMode": {
            "defaultValue": false,
            "description": "Set chart rendering mode. When it's true, chart has no interaction, but selection API can work",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.axisLabelSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking axis label",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.legendSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking legend",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.mode": {
            "defaultValue": "INCLUSIVE",
            "description": "Set the selection mode. If this value is set to 'exclusive' or 'single', only one set of data points can be selected at once. If this value is set to 'inclusive' or 'multiple', multiple sets of data points can be selected at once. If this value is set to 'none', no sets of data points can be selected. The values 'single' and 'multiple' are deprecated; please remove them from your chart.",
            "supportedValueType": "String",
            "supportedValues": "INCLUSIVE, EXCLUSIVE, SINGLE, MULTIPLE, NONE"
        },
        "interaction.selectability.plotLassoSelection": {
            "defaultValue": true,
            "description": "Set whether lasso selection can be used in the plot area. This property doesn't work for Windows Phone",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.plotStdSelection": {
            "defaultValue": true,
            "description": "Set whether selection can be done in the plot area by clicking and tapping",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.selected.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of selected data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "legend.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for colors in the legend. If this value is set to 'glossy', colors are glossy. If this value is set to 'normal', colors are matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "legend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "legend.isScrollable": {
            "defaultValue": false,
            "description": "Set whether the legend is scrollable. If this value is set to 'false', and there is not enough room to show the whole legend, an ellipsis (...) indicates the missing legend items.",
            "supportedValueType": "Boolean"
        },
        "legend.itemMargin": {
            "defaultValue": 0.5,
            "description": "Set color legend item margin ratio. The actual margin value is calculated by multipling height of the legend item marker/text (whichever is larger) by this ratio.",
            "supportedValueType": "Number"
        },
        "legend.label.style": {
            "description": "Settings for label sytle of legend.",
            "isPrefix": true
        },
        "legend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "legend.marker.shape": {
            "defaultValue": "squareWithRadius",
            "description": "Set the default marker sharpe, will not affect lines in combination charts",
            "supportedValueType": "String",
            "supportedValues": "squareWithRadius, square, rectangle"
        },
        "legend.marker.size": {
            "defaultValue": null,
            "description": "Set the color legend marker size in pixel",
            "supportedValueType": "Number"
        },
        "legend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border": {
            "description": "Set the scrollbar border when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border when scrollable legend is on. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border when scrollable legend is on. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the size of scrollbar spacing when scrollable legend is on. The max value is 4 and the min value is 0.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb": {
            "description": "Set the legend scrollbar thumb when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of legend scrollbar thumb when scrollable legend is on",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.track": {
            "description": "Set the legend scrollbar track when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.showFullLabel": {
            "defaultValue": true,
            "description": "If set to true, the legend will not be truncated unless the total width is not enough.",
            "supportedValueType": "Boolean"
        },
        "legend.title.style": {
            "description": "Settings for title style of legend.",
            "isPrefix": true
        },
        "legend.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.text": {
            "defaultValue": null,
            "description": "Set the text of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend title",
            "supportedValueType": "Boolean"
        },
        "legend.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend",
            "supportedValueType": "Boolean"
        },
        "legendGroup.forceToShow": {
            "defaultValue": false,
            "description": "When legend is set to visible, always show it even chart size is small.",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.alignment": {
            "defaultValue": "topLeft",
            "description": "Change legendGroup alignment.",
            "supportedValueType": "String",
            "supportedValues": "topLeft, center"
        },
        "legendGroup.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.position": {
            "defaultValue": "right",
            "description": "Set the position of the legend group area. When it's \"auto\", responsively layout the legend on the right when chart width is no less than the threshold, and at the bottom when it's smaller. The legend group will be put into bottom instead of right.",
            "supportedValueType": "String",
            "supportedValues": "top, bottom, right, left, auto"
        },
        "legendGroup.layout.respectPlotPosition": {
            "defaultValue": true,
            "description": "To align the legend position with plot area (excl. axis area), otherwise legend will align with the chart plot (excl. chart title).",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "plotArea.background.border": {
            "description": "Settings for background border of plotArea.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom": {
            "description": "Settings for bottom of border in background.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "plotArea.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "plotArea.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the plot area background.",
            "supportedValueType": "String"
        },
        "plotArea.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "plotArea.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.background.opacity": {
            "defaultValue": 0.8,
            "description": "Set back ground opacity of data label",
            "supportedValueType": "Number"
        },
        "plotArea.dataLabel.formatString": {
            "defaultValue": null,
            "description": "Set format string of data label. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. Any character in \"MDYHSAmdyhsa#?%0@\" is reserved as a token for format code. Simple samples: \"0.00%\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "plotArea.dataLabel.hideWhenOverlap": {
            "defaultValue": true,
            "description": "Set whether data label is hidden when overlapping.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.position": {
            "defaultValue": "outsideFirst",
            "description": "Set data label display position. 'outsideFirst' means if plot has no space to display data label outside of bar, the data label will be displayed inside.",
            "supportedValueType": "String",
            "supportedValues": "inside,outside,outsideFirst"
        },
        "plotArea.dataLabel.style.color": {
            "defaultValue": null,
            "description": "Set the color of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the data label.",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "plotArea.dataLabel.visible": {
            "defaultValue": true,
            "description": "Set visibility of data label",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPoint.stroke.color": {
            "defaultValue": "#000000",
            "description": "Set data point stroke color",
            "supportedValueType": "String"
        },
        "plotArea.dataPoint.stroke.visible": {
            "defaultValue": false,
            "description": "Set visibility of the data point stroke.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPointSize.max": {
            "defaultValue": 96,
            "description": "Maximum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointSize.min": {
            "defaultValue": 20,
            "description": "Minimum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointStyle": {
            "defaultValue": null,
            "description": "",
            "supportedValueType": "JsonObject"
        },
        "plotArea.dataPointStyleMode": {
            "defaultValue": "override",
            "description": "This property supports two values : 'update' and 'override'. In 'update' mode, only data points which satisfy the input rules of dataPointStyle will change accordingly, and there is no change in the legend. In 'override' mode, data points which satisfy the input rules of dataPointStyle will change accordingly, and the left data points will follow 'others' display style. The legend items will change accordingly as well.",
            "supportedValueType": "String",
            "supportedValues": "update, override"
        },
        "plotArea.defaultOthersStyle.color": {
            "defaultValue": "#000000",
            "description": "Color to be used for datapoints which are not coverd by semantic rules",
            "supportedValueType": "String"
        },
        "plotArea.differenceMarker.enable": {
            "defaultValue": false,
            "description": "Enable or disable difference marker. Only work when 'interaction.selectability.mode' is 'INCLUSIVE' or 'MULTIPLE'",
            "supportedValueType": "Boolean"
        },
        "plotArea.drawingEffect": {
            "defaultValue": "normal",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.gap.barSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between bars for single axis stacked charts or the charts without color binding. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.groupSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between category groups for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.innerGroupSpacing": {
            "defaultValue": 0.125,
            "description": "Set spacing between bars in one category group for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gridline.color": {
            "defaultValue": "#d8d8d8",
            "description": "Set color of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.size": {
            "defaultValue": 1,
            "description": "Set line stroke width of gridline.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.gridline.type": {
            "defaultValue": "line",
            "description": "Set render type of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine": {
            "description": "Customize zero gridline. Only takes effect when there is negative value.",
            "isPrefix": true
        },
        "plotArea.gridline.zeroLine.color": {
            "defaultValue": null,
            "description": "Color used to highlight the zero gridline. By default category axis color will be used.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.zeroLine.highlight": {
            "defaultValue": true,
            "description": "Highlight the zero gridline using the color defined in plotArea.gridline.zeroLine.color. And respect other line styles defined in gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine.unhighlightAxis": {
            "defaultValue": true,
            "description": "When it's true, use gridline's color on category axis.",
            "supportedValueType": "Boolean"
        },
        "plotArea.isFixedDataPointSize": {
            "defaultValue": false,
            "description": "Enable or disable to use fixed datapoint size layout strategy",
            "supportedValueType": "Boolean"
        },
        "plotArea.overlap.offsetPercentage": {
            "defaultValue": 0.5,
            "description": "Settings for the overlap offset percentage.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle": {
            "description": "Set the default style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background": {
            "description": "Set the background of the above and below area of reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background.opacity": {
            "defaultValue": 0.5,
            "description": "Set the background opacity for the above and below area of reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.color": {
            "defaultValue": "#666666",
            "description": "Set the default color of the reference line.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label": {
            "description": "Set the default label style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.label.background": {
            "defaultValue": "#7a7a7a",
            "description": "Set the default color for the label background.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.color": {
            "defaultValue": "#ffffff",
            "description": "Set the default font color for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontFamily": {
            "defaultValue": "\"Open Sans\", Arial, Helvetica, sans-serif",
            "description": "Set the default font family for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontSize": {
            "defaultValue": "12px",
            "description": "Set the default font size for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the default font style for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the default font weight for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.opacity": {
            "defaultValue": 0.8,
            "description": "Set the opacity for the label background.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.size": {
            "defaultValue": 1,
            "description": "Set the default stroke width of the reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.type": {
            "defaultValue": "dotted",
            "description": "Set the default line type of the reference line.",
            "supportedValueType": "String",
            "supportedValues": "line, dotted"
        },
        "plotArea.referenceLine.line": {
            "defaultValue": null,
            "description": "<div style=\"line-height: 16px;\">\n    <div>\n        Set reference line value & style individually. This property can accept an object using value scale name (i.e. valueAxis) as property name, and an object array as property value, in which the object describes the reference line value and style. If there is no style setting within it, the default style will be adopted.\n    </div>\n    <div>\n        The structure of referenceLine is as following:\n    </div>\n    <div style=\"padding-left: 24px\">\n        <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n            valueAxis\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                SupportedType:\n            </span>\n            ObjectArray\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                Description:\n            </span>\n            Lines refers to the primary value scale. Each line should at least contains the value property.\n        </div>\n        <div>\n            The structure of the object in the array is as following:\n        </div>\n        <div style=\"padding-left: 24px; margin-bottom: 4px;\">\n            <div style=\"color: #007dc0; font-weight: normal; line-height: 24px;\">\n                value\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the value of the reference line, which describes the position of the it.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                visible\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Boolean\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                true\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the visibility of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                color\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"#666666\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the color of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                size\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"1\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the stroke width of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                type\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedValue:\n                </span>\n                [\"line\", \"dotted\"]\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"dotted\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the line type of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                aboveColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the above background color for the reference line. Must be set with value property. Example: {valueAxis:{value:100, aboveColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                bottomColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the bottom background color for the reference line. Must be set exclusively in a seperate object without other properties. Example: {valueAxis:{value: 100}, {bottomColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                label\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Object\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the label text & style for the reference line.\n            </div>\n            <div style=\"padding-left: 24px;\">\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    text\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the text of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    visible\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Boolean\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    true\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the visibility of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    background\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"#7a7a7a\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the color for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    opacity\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Number\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"0.8\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the opacity for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    style\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Object\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the style of the font for the label.\n                </div>\n                <div style=\"padding-left: 24px;\">\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        color\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"#666666\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font color for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontSize\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"12px\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font size for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontFamily\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"'Open Sans', Arial, Helvetica, sans-serif\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font family for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontWeight\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"bold\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font weight for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontStyle\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"normal\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font style for the label.\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n",
            "supportedValueType": "RuleObject"
        },
        "plotArea.scrollbar.border": {
            "description": "Set the scrollbar border.",
            "isPrefix": true
        },
        "plotArea.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar spacing. The max value is 4 and the min value is 0.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.thumb": {
            "description": "Set the scrollbar thumb when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.track": {
            "description": "Set the scrollbar track when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when chart is scrollable.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "propertyZone": {
            "defaultValue": null,
            "description": "Zone information of the possible areas that support customization.",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Object"
        },
        "title.alignment": {
            "defaultValue": "center",
            "description": "Set the alignment of the main title",
            "supportedValueType": "String",
            "supportedValues": "left, center, right"
        },
        "title.layout": {
            "description": "Settings for the layout of the title.",
            "isPrefix": true
        },
        "title.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.layout.maxHeight": {
            "defaultValue": 0.2,
            "description": "Set the max height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.style": {
            "description": "Settings for the style of the title.",
            "isPrefix": true
        },
        "title.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontSize": {
            "defaultValue": "16px",
            "description": "Set the font size of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the main title.",
            "supportedValueType": "String"
        },
        "title.text": {
            "defaultValue": null,
            "description": "Set the text of the main title",
            "supportedValueType": "String"
        },
        "title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the main title",
            "supportedValueType": "Boolean"
        },
        "tooltip.background.borderColor": {
            "defaultValue": "#cccccc",
            "description": "Define the background border color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.background.color": {
            "defaultValue": "#ffffff",
            "description": "Define the background color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.formatString": {
            "defaultValue": null,
            "description": "Set the format strings for text in the tooltip. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. The following characters are reserved as tokens for format code: MDYHSAmdyhsa#?%0@.The following is examples : \"0.00\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "tooltip.layinChart": {
            "defaultValue": true,
            "description": "Set whether the tooltip appears in the chart area",
            "supportedValueType": "Boolean"
        },
        "tooltip.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "tooltip.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the tooltip",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisLine": {
            "description": "Settings for the axisLine of the valueAxis.",
            "isPrefix": true
        },
        "valueAxis.axisLine.size": {
            "defaultValue": 1,
            "description": "Set line size of axis.",
            "supportedValueType": "PositiveInt"
        },
        "valueAxis.axisLine.visible": {
            "defaultValue": false,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisTick": {
            "description": "Settings for the valueAxis axisTick.",
            "isPrefix": true
        },
        "valueAxis.axisTick.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis ticks. For mobile, default value will be false.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.color": {
            "defaultValue": null,
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "valueAxis.label": {
            "description": "Settings for the valueAxis label.",
            "isPrefix": true
        },
        "valueAxis.label.formatString": {
            "defaultValue": null,
            "description": "Set format string of value axis. Any character in \"MDYHSAmdyhsau#?%0@\" is reserved as a token for format code. The end \"u\" of format string let value format with SI units, the other format string will explained as Excel format string, The value that bigger than 1e8 or less than 1e-6 and be not 0 format with Exponential style. The following is a simple sample format string for label for axis as \"0.00%\".",
            "supportedValueType": "String"
        },
        "valueAxis.label.style": {
            "description": "Settings for the valueAxis label style.",
            "isPrefix": true
        },
        "valueAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "valueAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of the axis label",
            "supportedValueType": "Boolean"
        },
        "valueAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.title": {
            "description": "Settings for the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.title.style": {
            "description": "Settings for the style of the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.text": {
            "defaultValue": null,
            "description": "Set the text of the axis title",
            "supportedValueType": "String"
        },
        "valueAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the axis",
            "supportedValueType": "Boolean"
        },
        "variance1.axisLine.color": {
            "defaultValue": "#ffffff",
            "description": "Set the color of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance1.axisLine.size": {
            "defaultValue": "1px",
            "description": "Set the width/height of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance1.axisLine.style": {
            "defaultValue": "solid",
            "description": "Set the style of the variance axis line.",
            "supportedValueType": "String",
            "supportedValues": "solid, hatching, nonFill, (null)"
        },
        "variance1.layout.proportion": {
            "defaultValue": 0.25,
            "description": "Decide percentage variance plot proportion, and maximum value is 0.4",
            "supportedValueType": "Number"
        },
        "variance1.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the variance title",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.type": {
            "defaultValue": "absolute",
            "description": "Decide variance plot type",
            "supportedValueType": "String",
            "supportedValues": "absolute, percentage"
        },
        "variance1.visible": {
            "defaultValue": true,
            "description": "Decide whether variance plot is visible or not",
            "supportedValueType": "Boolean"
        },
        "variance2.axisLine.color": {
            "defaultValue": "#ffffff",
            "description": "Set the color of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance2.axisLine.size": {
            "defaultValue": "1px",
            "description": "Set the width/height of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance2.axisLine.style": {
            "defaultValue": "solid",
            "description": "Set the style of the variance axis line.",
            "supportedValueType": "String",
            "supportedValues": "solid, hatching, nonFill, (null)"
        },
        "variance2.layout.proportion": {
            "defaultValue": 0.25,
            "description": "Decide percentage variance plot proportion, and maximum value is 0.4",
            "supportedValueType": "Number"
        },
        "variance2.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the variance title",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.type": {
            "defaultValue": "percentage",
            "description": "Decide variance plot type",
            "supportedValueType": "String",
            "supportedValues": "absolute, percentage"
        },
        "variance2.visible": {
            "defaultValue": true,
            "description": "Decide whether variance plot is visible or not",
            "supportedValueType": "Boolean"
        }
    },
    "info/hichert_column": {
        "categoryAxis.axisLine.visible": {
            "defaultValue": true,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.color": {
            "defaultValue": "#6c6c6c",
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "categoryAxis.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Set color of hoverShadow.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.angle": {
            "access": "internal",
            "defaultValue": 90,
            "description": "Set the rotation angle when the axis has only one layer and label rotation is fixed. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number",
            "supportedValues": "0, 30, 45, 60, 90"
        },
        "categoryAxis.label.rotation": {
            "access": "internal",
            "defaultValue": "auto",
            "description": "Set the rotation type when the axis has only one layer. Auto means labels may be horizontal or rotated 45 degrees. Fixed means labels will always be rotated, whenever truncatedLabelRatio is. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "String",
            "supportedValues": "auto, fixed"
        },
        "categoryAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.truncatedLabelRatio": {
            "access": "internal",
            "defaultValue": 0.2,
            "description": "Set the truncated labels radio when there is only one layer. If too many labels need to be truncated, and rotation setting is auto, labels will be rotated. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number"
        },
        "categoryAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis label.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxHeight": {
            "defaultValue": 0.3,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxWidth": {
            "defaultValue": 0.3,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.title.style": {
            "description": "Settings for the axis title style.",
            "isPrefix": true
        },
        "categoryAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.text": {
            "defaultValue": null,
            "description": "Set text of axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis.",
            "supportedValueType": "Boolean"
        },
        "embeddedLegend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.leftMaxWidth": {
            "defaultValue": null,
            "description": "Set the max left width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.leftWidth": {
            "defaultValue": null,
            "description": "Set the left width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.rightMaxWidth": {
            "defaultValue": null,
            "description": "Set the max right width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.rightWidth": {
            "defaultValue": null,
            "description": "Set the right width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "description": "Zone information of possible feeding areas. feedingZoneArray",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Array"
        },
        "general.background.border": {
            "description": "Settings for the background border.",
            "isPrefix": true
        },
        "general.background.border.bottom": {
            "description": "Settings for the background bottom border.",
            "isPrefix": true
        },
        "general.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.left": {
            "description": "Settings for the background left border.",
            "isPrefix": true
        },
        "general.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.right": {
            "description": "Settings for the background right border.",
            "isPrefix": true
        },
        "general.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "general.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "general.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "general.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the chart background.",
            "supportedValueType": "String"
        },
        "general.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "general.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "general.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "general.groupData": {
            "defaultValue": false,
            "description": "Set to respect input dataset order. If more than one dimensions are bound to category axis and groupData is set to true, chart will automatically group data. If groupData is set to false, input dataset order will always be respected. This property will not work once fields domain in dataset metadata is set.",
            "supportedValueType": "Boolean"
        },
        "general.layout.padding": {
            "defaultValue": 24,
            "description": "Set the universal padding value. This single value is applied to all sides of the chart. Individual settings for each edge are also supported.",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingBottom": {
            "defaultValue": null,
            "description": "Set the padding value for the bottom side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingLeft": {
            "defaultValue": null,
            "description": "Set the padding value for the left side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingRight": {
            "defaultValue": null,
            "description": "Set the padding value for the right side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingTop": {
            "defaultValue": null,
            "description": "Set the padding value for the top side",
            "supportedValueType": "PositiveInt"
        },
        "interaction.behaviorType": {
            "defaultValue": "hichertBehavior",
            "description": "Switch the behavior type by behavior ID, instead of using default interaction behavior. The behavior is registered via interaction.add(behavior) API. 'noHoverBehavior' is an embeded value where data points details will be thrown when selecting (different from default behavior, which throw the information when hovering).",
            "readonly": false,
            "serializable": true
        },
        "interaction.decorations": {
            "defaultValue": null,
            "description": "Set decorations relating to interaction. Each item that is an object of {name: 'decoration name', fn: 'decoration callback function'} is a decoration. Currently two decorations are supported: showDetail and hideDetail. These two decorations can be used to create a user-defined tooltip. If these 2 decorations are used, the default tooltip is not used, and the user should implement a custom tooltip. The showDetail decoration is called when the tooltip is shown, and the hideDetail decoration is called when the tooltip is hidden. The arguments of showDetail are one object of {mode: 'tooltip mode', data: 'data of hovering selected data point', position: 'mouse position', container: 'chart container dom element', selectedNumber: 'number of selected data points', isAnchored: 'whether tooltip should keep current position or not'}. 'tooltip mode' is either 'infoMode' or 'actionMode'. Hovering over an unselected data point displays the infoMode tooltip, while hovering over a selected data point displays the actionMode tooltip. 'data' is an array of dimensions and measures, where each item is an object of {name: 'dimension name or measure name', value: 'dimension member or measure value', type: 'literal string of dimension or measure'}. For instance, {name: 'Country', value: 'China', type: 'dimension'}, or {name: 'Profit', value: 159, type: 'measure'}. The arguments of hideDetail are a string representing tooltip mode, i.e. what kind of tooltip should be hidden.",
            "serializable": false,
            "supportedValueType": "Array"
        },
        "interaction.deselected.opacity": {
            "defaultValue": 0.2,
            "description": "Set deselected data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.opacity": {
            "defaultValue": 1,
            "description": "Set hovered data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.hover.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of hovered data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.hover.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width. The max width is 4px.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.noninteractiveMode": {
            "defaultValue": false,
            "description": "Set chart rendering mode. When it's true, chart has no interaction, but selection API can work",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.axisLabelSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking axis label",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.legendSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking legend",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.mode": {
            "defaultValue": "INCLUSIVE",
            "description": "Set the selection mode. If this value is set to 'exclusive' or 'single', only one set of data points can be selected at once. If this value is set to 'inclusive' or 'multiple', multiple sets of data points can be selected at once. If this value is set to 'none', no sets of data points can be selected. The values 'single' and 'multiple' are deprecated; please remove them from your chart.",
            "supportedValueType": "String",
            "supportedValues": "INCLUSIVE, EXCLUSIVE, SINGLE, MULTIPLE, NONE"
        },
        "interaction.selectability.plotLassoSelection": {
            "defaultValue": true,
            "description": "Set whether lasso selection can be used in the plot area. This property doesn't work for Windows Phone",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.plotStdSelection": {
            "defaultValue": true,
            "description": "Set whether selection can be done in the plot area by clicking and tapping",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.selected.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of selected data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "legend.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for colors in the legend. If this value is set to 'glossy', colors are glossy. If this value is set to 'normal', colors are matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "legend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "legend.isScrollable": {
            "defaultValue": false,
            "description": "Set whether the legend is scrollable. If this value is set to 'false', and there is not enough room to show the whole legend, an ellipsis (...) indicates the missing legend items.",
            "supportedValueType": "Boolean"
        },
        "legend.itemMargin": {
            "defaultValue": 0.5,
            "description": "Set color legend item margin ratio. The actual margin value is calculated by multipling height of the legend item marker/text (whichever is larger) by this ratio.",
            "supportedValueType": "Number"
        },
        "legend.label.style": {
            "description": "Settings for label sytle of legend.",
            "isPrefix": true
        },
        "legend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "legend.marker.shape": {
            "defaultValue": "squareWithRadius",
            "description": "Set the default marker sharpe, will not affect lines in combination charts",
            "supportedValueType": "String",
            "supportedValues": "squareWithRadius, square, rectangle"
        },
        "legend.marker.size": {
            "defaultValue": null,
            "description": "Set the color legend marker size in pixel",
            "supportedValueType": "Number"
        },
        "legend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border": {
            "description": "Set the scrollbar border when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border when scrollable legend is on. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border when scrollable legend is on. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the size of scrollbar spacing when scrollable legend is on. The max value is 4 and the min value is 0.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb": {
            "description": "Set the legend scrollbar thumb when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of legend scrollbar thumb when scrollable legend is on",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.track": {
            "description": "Set the legend scrollbar track when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.showFullLabel": {
            "defaultValue": true,
            "description": "If set to true, the legend will not be truncated unless the total width is not enough.",
            "supportedValueType": "Boolean"
        },
        "legend.title.style": {
            "description": "Settings for title style of legend.",
            "isPrefix": true
        },
        "legend.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.text": {
            "defaultValue": null,
            "description": "Set the text of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend title",
            "supportedValueType": "Boolean"
        },
        "legend.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend",
            "supportedValueType": "Boolean"
        },
        "legendGroup.forceToShow": {
            "defaultValue": false,
            "description": "When legend is set to visible, always show it even chart size is small.",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.alignment": {
            "defaultValue": "topLeft",
            "description": "Change legendGroup alignment.",
            "supportedValueType": "String",
            "supportedValues": "topLeft, center"
        },
        "legendGroup.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.position": {
            "defaultValue": "right",
            "description": "Set the position of the legend group area. When it's \"auto\", responsively layout the legend on the right when chart width is no less than the threshold, and at the bottom when it's smaller. The legend group will be put into bottom instead of right.",
            "supportedValueType": "String",
            "supportedValues": "top, bottom, right, left, auto"
        },
        "legendGroup.layout.respectPlotPosition": {
            "defaultValue": true,
            "description": "To align the legend position with plot area (excl. axis area), otherwise legend will align with the chart plot (excl. chart title).",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "plotArea.background.border": {
            "description": "Settings for background border of plotArea.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom": {
            "description": "Settings for bottom of border in background.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "plotArea.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "plotArea.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the plot area background.",
            "supportedValueType": "String"
        },
        "plotArea.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "plotArea.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.background.opacity": {
            "defaultValue": 0.8,
            "description": "Set back ground opacity of data label",
            "supportedValueType": "Number"
        },
        "plotArea.dataLabel.formatString": {
            "defaultValue": null,
            "description": "Set format string of data label. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. Any character in \"MDYHSAmdyhsa#?%0@\" is reserved as a token for format code. Simple samples: \"0.00%\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "plotArea.dataLabel.hideWhenOverlap": {
            "defaultValue": true,
            "description": "Set whether data label is hidden when overlapping.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.position": {
            "defaultValue": "outsideFirst",
            "description": "Set data label display position. 'outsideFirst' means if plot has no space to display data label outside of bar, the data label will be displayed inside.",
            "supportedValueType": "String",
            "supportedValues": "inside,outside,outsideFirst"
        },
        "plotArea.dataLabel.style.color": {
            "defaultValue": null,
            "description": "Set the color of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the data label.",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "plotArea.dataLabel.visible": {
            "defaultValue": true,
            "description": "Set visibility of data label",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPoint.stroke.color": {
            "defaultValue": "#000000",
            "description": "Set data point stroke color",
            "supportedValueType": "String"
        },
        "plotArea.dataPoint.stroke.visible": {
            "defaultValue": false,
            "description": "Set visibility of the data point stroke.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPointSize.max": {
            "defaultValue": 96,
            "description": "Maximum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointSize.min": {
            "defaultValue": 32,
            "description": "Minimum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointStyle": {
            "defaultValue": null,
            "description": "",
            "supportedValueType": "JsonObject"
        },
        "plotArea.dataPointStyleMode": {
            "defaultValue": "override",
            "description": "This property supports two values : 'update' and 'override'. In 'update' mode, only data points which satisfy the input rules of dataPointStyle will change accordingly, and there is no change in the legend. In 'override' mode, data points which satisfy the input rules of dataPointStyle will change accordingly, and the left data points will follow 'others' display style. The legend items will change accordingly as well.",
            "supportedValueType": "String",
            "supportedValues": "update, override"
        },
        "plotArea.defaultOthersStyle.color": {
            "defaultValue": "#000000",
            "description": "Color to be used for datapoints which are not coverd by semantic rules",
            "supportedValueType": "String"
        },
        "plotArea.differenceMarker.enable": {
            "defaultValue": false,
            "description": "Enable or disable difference marker. Only work when 'interaction.selectability.mode' is 'INCLUSIVE' or 'MULTIPLE'",
            "supportedValueType": "Boolean"
        },
        "plotArea.drawingEffect": {
            "defaultValue": "normal",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.gap.barSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between bars for single axis stacked charts or the charts without color binding. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.groupSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between category groups for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.innerGroupSpacing": {
            "defaultValue": 0.125,
            "description": "Set spacing between bars in one category group for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gridline.color": {
            "defaultValue": "#d8d8d8",
            "description": "Set color of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.size": {
            "defaultValue": 1,
            "description": "Set line stroke width of gridline.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.gridline.type": {
            "defaultValue": "line",
            "description": "Set render type of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine": {
            "description": "Customize zero gridline. Only takes effect when there is negative value.",
            "isPrefix": true
        },
        "plotArea.gridline.zeroLine.color": {
            "defaultValue": null,
            "description": "Color used to highlight the zero gridline. By default category axis color will be used.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.zeroLine.highlight": {
            "defaultValue": true,
            "description": "Highlight the zero gridline using the color defined in plotArea.gridline.zeroLine.color. And respect other line styles defined in gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine.unhighlightAxis": {
            "defaultValue": true,
            "description": "When it's true, use gridline's color on category axis.",
            "supportedValueType": "Boolean"
        },
        "plotArea.isFixedDataPointSize": {
            "defaultValue": false,
            "description": "Enable or disable to use fixed datapoint size layout strategy",
            "supportedValueType": "Boolean"
        },
        "plotArea.overlap.offsetPercentage": {
            "defaultValue": 0.5,
            "description": "Settings for the overlap offset percentage.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle": {
            "description": "Set the default style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background": {
            "description": "Set the background of the above and below area of reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background.opacity": {
            "defaultValue": 0.5,
            "description": "Set the background opacity for the above and below area of reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.color": {
            "defaultValue": "#666666",
            "description": "Set the default color of the reference line.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label": {
            "description": "Set the default label style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.label.background": {
            "defaultValue": "#7a7a7a",
            "description": "Set the default color for the label background.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.color": {
            "defaultValue": "#ffffff",
            "description": "Set the default font color for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontFamily": {
            "defaultValue": "\"Open Sans\", Arial, Helvetica, sans-serif",
            "description": "Set the default font family for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontSize": {
            "defaultValue": "12px",
            "description": "Set the default font size for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the default font style for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the default font weight for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.opacity": {
            "defaultValue": 0.8,
            "description": "Set the opacity for the label background.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.size": {
            "defaultValue": 1,
            "description": "Set the default stroke width of the reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.type": {
            "defaultValue": "dotted",
            "description": "Set the default line type of the reference line.",
            "supportedValueType": "String",
            "supportedValues": "line, dotted"
        },
        "plotArea.referenceLine.line": {
            "defaultValue": null,
            "description": "<div style=\"line-height: 16px;\">\n    <div>\n        Set reference line value & style individually. This property can accept an object using value scale name (i.e. valueAxis) as property name, and an object array as property value, in which the object describes the reference line value and style. If there is no style setting within it, the default style will be adopted.\n    </div>\n    <div>\n        The structure of referenceLine is as following:\n    </div>\n    <div style=\"padding-left: 24px\">\n        <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n            valueAxis\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                SupportedType:\n            </span>\n            ObjectArray\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                Description:\n            </span>\n            Lines refers to the primary value scale. Each line should at least contains the value property.\n        </div>\n        <div>\n            The structure of the object in the array is as following:\n        </div>\n        <div style=\"padding-left: 24px; margin-bottom: 4px;\">\n            <div style=\"color: #007dc0; font-weight: normal; line-height: 24px;\">\n                value\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the value of the reference line, which describes the position of the it.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                visible\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Boolean\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                true\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the visibility of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                color\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"#666666\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the color of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                size\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"1\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the stroke width of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                type\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedValue:\n                </span>\n                [\"line\", \"dotted\"]\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"dotted\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the line type of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                aboveColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the above background color for the reference line. Must be set with value property. Example: {valueAxis:{value:100, aboveColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                bottomColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the bottom background color for the reference line. Must be set exclusively in a seperate object without other properties. Example: {valueAxis:{value: 100}, {bottomColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                label\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Object\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the label text & style for the reference line.\n            </div>\n            <div style=\"padding-left: 24px;\">\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    text\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the text of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    visible\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Boolean\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    true\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the visibility of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    background\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"#7a7a7a\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the color for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    opacity\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Number\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"0.8\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the opacity for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    style\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Object\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the style of the font for the label.\n                </div>\n                <div style=\"padding-left: 24px;\">\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        color\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"#666666\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font color for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontSize\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"12px\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font size for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontFamily\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"'Open Sans', Arial, Helvetica, sans-serif\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font family for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontWeight\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"bold\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font weight for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontStyle\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"normal\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font style for the label.\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n",
            "supportedValueType": "RuleObject"
        },
        "plotArea.scrollbar.border": {
            "description": "Set the scrollbar border.",
            "isPrefix": true
        },
        "plotArea.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar spacing. The max value is 4 and the min value is 0.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.thumb": {
            "description": "Set the scrollbar thumb when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.track": {
            "description": "Set the scrollbar track when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when chart is scrollable.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "propertyZone": {
            "defaultValue": null,
            "description": "Zone information of the possible areas that support customization.",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Object"
        },
        "title.alignment": {
            "defaultValue": "center",
            "description": "Set the alignment of the main title",
            "supportedValueType": "String",
            "supportedValues": "left, center, right"
        },
        "title.layout": {
            "description": "Settings for the layout of the title.",
            "isPrefix": true
        },
        "title.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.layout.maxHeight": {
            "defaultValue": 0.2,
            "description": "Set the max height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.style": {
            "description": "Settings for the style of the title.",
            "isPrefix": true
        },
        "title.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontSize": {
            "defaultValue": "16px",
            "description": "Set the font size of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the main title.",
            "supportedValueType": "String"
        },
        "title.text": {
            "defaultValue": null,
            "description": "Set the text of the main title",
            "supportedValueType": "String"
        },
        "title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the main title",
            "supportedValueType": "Boolean"
        },
        "tooltip.background.borderColor": {
            "defaultValue": "#cccccc",
            "description": "Define the background border color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.background.color": {
            "defaultValue": "#ffffff",
            "description": "Define the background color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.formatString": {
            "defaultValue": null,
            "description": "Set the format strings for text in the tooltip. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. The following characters are reserved as tokens for format code: MDYHSAmdyhsa#?%0@.The following is examples : \"0.00\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "tooltip.layinChart": {
            "defaultValue": true,
            "description": "Set whether the tooltip appears in the chart area",
            "supportedValueType": "Boolean"
        },
        "tooltip.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "tooltip.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the tooltip",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisLine": {
            "description": "Settings for the axisLine of the valueAxis.",
            "isPrefix": true
        },
        "valueAxis.axisLine.size": {
            "defaultValue": 1,
            "description": "Set line size of axis.",
            "supportedValueType": "PositiveInt"
        },
        "valueAxis.axisLine.visible": {
            "defaultValue": false,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisTick": {
            "description": "Settings for the valueAxis axisTick.",
            "isPrefix": true
        },
        "valueAxis.axisTick.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis ticks. For mobile, default value will be false.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.color": {
            "defaultValue": null,
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "valueAxis.label": {
            "description": "Settings for the valueAxis label.",
            "isPrefix": true
        },
        "valueAxis.label.formatString": {
            "defaultValue": null,
            "description": "Set format string of value axis. Any character in \"MDYHSAmdyhsau#?%0@\" is reserved as a token for format code. The end \"u\" of format string let value format with SI units, the other format string will explained as Excel format string, The value that bigger than 1e8 or less than 1e-6 and be not 0 format with Exponential style. The following is a simple sample format string for label for axis as \"0.00%\".",
            "supportedValueType": "String"
        },
        "valueAxis.label.style": {
            "description": "Settings for the valueAxis label style.",
            "isPrefix": true
        },
        "valueAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "valueAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of the axis label",
            "supportedValueType": "Boolean"
        },
        "valueAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.title": {
            "description": "Settings for the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.title.style": {
            "description": "Settings for the style of the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.text": {
            "defaultValue": null,
            "description": "Set the text of the axis title",
            "supportedValueType": "String"
        },
        "valueAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the axis",
            "supportedValueType": "Boolean"
        },
        "variance1.axisLine.color": {
            "defaultValue": "#ffffff",
            "description": "Set the color of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance1.axisLine.size": {
            "defaultValue": "1px",
            "description": "Set the width/height of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance1.axisLine.style": {
            "defaultValue": "solid",
            "description": "Set the style of the variance axis line.",
            "supportedValueType": "String",
            "supportedValues": "solid, hatching, nonFill, (null)"
        },
        "variance1.layout.proportion": {
            "defaultValue": 0.25,
            "description": "Decide percentage variance plot proportion, and maximum value is 0.4",
            "supportedValueType": "Number"
        },
        "variance1.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the variance title",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.type": {
            "defaultValue": "absolute",
            "description": "Decide variance plot type",
            "supportedValueType": "String",
            "supportedValues": "absolute, percentage"
        },
        "variance1.visible": {
            "defaultValue": true,
            "description": "Decide whether variance plot is visible or not",
            "supportedValueType": "Boolean"
        },
        "variance2.axisLine.color": {
            "defaultValue": "#ffffff",
            "description": "Set the color of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance2.axisLine.size": {
            "defaultValue": "1px",
            "description": "Set the width/height of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance2.axisLine.style": {
            "defaultValue": "solid",
            "description": "Set the style of the variance axis line.",
            "supportedValueType": "String",
            "supportedValues": "solid, hatching, nonFill, (null)"
        },
        "variance2.layout.proportion": {
            "defaultValue": 0.25,
            "description": "Decide percentage variance plot proportion, and maximum value is 0.4",
            "supportedValueType": "Number"
        },
        "variance2.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the variance title",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.type": {
            "defaultValue": "percentage",
            "description": "Decide variance plot type",
            "supportedValueType": "String",
            "supportedValues": "absolute, percentage"
        },
        "variance2.visible": {
            "defaultValue": true,
            "description": "Decide whether variance plot is visible or not",
            "supportedValueType": "Boolean"
        }
    },
    "info/hichert_line": {
        "categoryAxis.axisLine.visible": {
            "defaultValue": true,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.color": {
            "defaultValue": "#6c6c6c",
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "categoryAxis.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Set color of hoverShadow.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.angle": {
            "access": "internal",
            "defaultValue": 90,
            "description": "Set the rotation angle when the axis has only one layer and label rotation is fixed. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number",
            "supportedValues": "0, 30, 45, 60, 90"
        },
        "categoryAxis.label.rotation": {
            "access": "internal",
            "defaultValue": "auto",
            "description": "Set the rotation type when the axis has only one layer. Auto means labels may be horizontal or rotated 45 degrees. Fixed means labels will always be rotated, whenever truncatedLabelRatio is. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "String",
            "supportedValues": "auto, fixed"
        },
        "categoryAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.truncatedLabelRatio": {
            "access": "internal",
            "defaultValue": 0.2,
            "description": "Set the truncated labels radio when there is only one layer. If too many labels need to be truncated, and rotation setting is auto, labels will be rotated. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number"
        },
        "categoryAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis label.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxHeight": {
            "defaultValue": 0.3,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxWidth": {
            "defaultValue": 0.3,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.title.style": {
            "description": "Settings for the axis title style.",
            "isPrefix": true
        },
        "categoryAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.text": {
            "defaultValue": null,
            "description": "Set text of axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis.",
            "supportedValueType": "Boolean"
        },
        "embeddedLegend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.maxWidth": {
            "defaultValue": null,
            "description": "Set the max width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.position": {
            "defaultValue": "right",
            "description": "Set the layout position of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.width": {
            "defaultValue": null,
            "description": "Set the width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "description": "Zone information of possible feeding areas. feedingZoneArray",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Array"
        },
        "general.background.border": {
            "description": "Settings for the background border.",
            "isPrefix": true
        },
        "general.background.border.bottom": {
            "description": "Settings for the background bottom border.",
            "isPrefix": true
        },
        "general.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.left": {
            "description": "Settings for the background left border.",
            "isPrefix": true
        },
        "general.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.right": {
            "description": "Settings for the background right border.",
            "isPrefix": true
        },
        "general.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "general.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "general.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "general.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the chart background.",
            "supportedValueType": "String"
        },
        "general.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "general.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "general.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "general.groupData": {
            "defaultValue": false,
            "description": "Set to respect input dataset order. If more than one dimensions are bound to category axis and groupData is set to true, chart will automatically group data. If groupData is set to false, input dataset order will always be respected. This property will not work once fields domain in dataset metadata is set.",
            "supportedValueType": "Boolean"
        },
        "general.layout.padding": {
            "defaultValue": 24,
            "description": "Set the universal padding value. This single value is applied to all sides of the chart. Individual settings for each edge are also supported.",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingBottom": {
            "defaultValue": null,
            "description": "Set the padding value for the bottom side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingLeft": {
            "defaultValue": null,
            "description": "Set the padding value for the left side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingRight": {
            "defaultValue": null,
            "description": "Set the padding value for the right side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingTop": {
            "defaultValue": null,
            "description": "Set the padding value for the top side",
            "supportedValueType": "PositiveInt"
        },
        "interaction.behaviorType": {
            "defaultValue": "hichertBehavior",
            "description": "Switch the behavior type by behavior ID, instead of using default interaction behavior. The behavior is registered via interaction.add(behavior) API. 'noHoverBehavior' is an embeded value where data points details will be thrown when selecting (different from default behavior, which throw the information when hovering).",
            "readonly": false,
            "serializable": true
        },
        "interaction.decorations": {
            "defaultValue": null,
            "description": "Set decorations relating to interaction. Each item that is an object of {name: 'decoration name', fn: 'decoration callback function'} is a decoration. Currently two decorations are supported: showDetail and hideDetail. These two decorations can be used to create a user-defined tooltip. If these 2 decorations are used, the default tooltip is not used, and the user should implement a custom tooltip. The showDetail decoration is called when the tooltip is shown, and the hideDetail decoration is called when the tooltip is hidden. The arguments of showDetail are one object of {mode: 'tooltip mode', data: 'data of hovering selected data point', position: 'mouse position', container: 'chart container dom element', selectedNumber: 'number of selected data points', isAnchored: 'whether tooltip should keep current position or not'}. 'tooltip mode' is either 'infoMode' or 'actionMode'. Hovering over an unselected data point displays the infoMode tooltip, while hovering over a selected data point displays the actionMode tooltip. 'data' is an array of dimensions and measures, where each item is an object of {name: 'dimension name or measure name', value: 'dimension member or measure value', type: 'literal string of dimension or measure'}. For instance, {name: 'Country', value: 'China', type: 'dimension'}, or {name: 'Profit', value: 159, type: 'measure'}. The arguments of hideDetail are a string representing tooltip mode, i.e. what kind of tooltip should be hidden.",
            "serializable": false,
            "supportedValueType": "Array"
        },
        "interaction.deselected.opacity": {
            "defaultValue": 0.2,
            "description": "Set deselected data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.opacity": {
            "defaultValue": 1,
            "description": "Set hovered data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.hover.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of hovered data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.hover.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width. The max width is 4px.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.noninteractiveMode": {
            "defaultValue": false,
            "description": "Set chart rendering mode. When it's true, chart has no interaction, but selection API can work",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.axisLabelSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking axis label",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.legendSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking legend",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.mode": {
            "defaultValue": "INCLUSIVE",
            "description": "Set the selection mode. If this value is set to 'exclusive' or 'single', only one set of data points can be selected at once. If this value is set to 'inclusive' or 'multiple', multiple sets of data points can be selected at once. If this value is set to 'none', no sets of data points can be selected. The values 'single' and 'multiple' are deprecated; please remove them from your chart.",
            "supportedValueType": "String",
            "supportedValues": "INCLUSIVE, EXCLUSIVE, SINGLE, MULTIPLE, NONE"
        },
        "interaction.selectability.plotLassoSelection": {
            "defaultValue": true,
            "description": "Set whether lasso selection can be used in the plot area. This property doesn't work for Windows Phone",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.plotStdSelection": {
            "defaultValue": true,
            "description": "Set whether selection can be done in the plot area by clicking and tapping",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.selected.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of selected data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "legend.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for colors in the legend. If this value is set to 'glossy', colors are glossy. If this value is set to 'normal', colors are matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "legend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "legend.isScrollable": {
            "defaultValue": false,
            "description": "Set whether the legend is scrollable. If this value is set to 'false', and there is not enough room to show the whole legend, an ellipsis (...) indicates the missing legend items.",
            "supportedValueType": "Boolean"
        },
        "legend.itemMargin": {
            "defaultValue": 0.5,
            "description": "Set color legend item margin ratio. The actual margin value is calculated by multipling height of the legend item marker/text (whichever is larger) by this ratio.",
            "supportedValueType": "Number"
        },
        "legend.label.style": {
            "description": "Settings for label sytle of legend.",
            "isPrefix": true
        },
        "legend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "legend.marker.size": {
            "defaultValue": null,
            "description": "Set the color legend marker size in pixel",
            "supportedValueType": "Number"
        },
        "legend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border": {
            "description": "Set the scrollbar border when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border when scrollable legend is on. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border when scrollable legend is on. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the size of scrollbar spacing when scrollable legend is on. The max value is 4 and the min value is 0.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb": {
            "description": "Set the legend scrollbar thumb when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of legend scrollbar thumb when scrollable legend is on",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.track": {
            "description": "Set the legend scrollbar track when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.showFullLabel": {
            "defaultValue": true,
            "description": "If set to true, the legend will not be truncated unless the total width is not enough.",
            "supportedValueType": "Boolean"
        },
        "legend.title.style": {
            "description": "Settings for title style of legend.",
            "isPrefix": true
        },
        "legend.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.text": {
            "defaultValue": null,
            "description": "Set the text of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend title",
            "supportedValueType": "Boolean"
        },
        "legend.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend",
            "supportedValueType": "Boolean"
        },
        "legendGroup.forceToShow": {
            "defaultValue": false,
            "description": "When legend is set to visible, always show it even chart size is small.",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.alignment": {
            "defaultValue": "topLeft",
            "description": "Change legendGroup alignment.",
            "supportedValueType": "String",
            "supportedValues": "topLeft, center"
        },
        "legendGroup.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.position": {
            "defaultValue": "right",
            "description": "Set the position of the legend group area. When it's \"auto\", responsively layout the legend on the right when chart width is no less than the threshold, and at the bottom when it's smaller. The legend group will be put into bottom instead of right.",
            "supportedValueType": "String",
            "supportedValues": "top, bottom, right, left, auto"
        },
        "legendGroup.layout.respectPlotPosition": {
            "defaultValue": true,
            "description": "To align the legend position with plot area (excl. axis area), otherwise legend will align with the chart plot (excl. chart title).",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "plotArea.background.border": {
            "description": "Settings for background border of plotArea.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom": {
            "description": "Settings for bottom of border in background.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "plotArea.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "plotArea.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the plot area background.",
            "supportedValueType": "String"
        },
        "plotArea.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "plotArea.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.background.opacity": {
            "defaultValue": 0.8,
            "description": "Set back ground opacity of data label",
            "supportedValueType": "Number"
        },
        "plotArea.dataLabel.formatString": {
            "defaultValue": null,
            "description": "Set format string of data label. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. Any character in \"MDYHSAmdyhsa#?%0@\" is reserved as a token for format code. Simple samples: \"0.00%\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "plotArea.dataLabel.hideWhenOverlap": {
            "defaultValue": true,
            "description": "Set whether data label is hidden when overlapping.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.position": {
            "defaultValue": null,
            "description": "Set data label display position. 'outsideFirst' means if plot has no space to display data label outside of bar, the data label will be displayed inside.",
            "supportedValueType": "String",
            "supportedValues": "inside,outside,outsideFirst"
        },
        "plotArea.dataLabel.style.color": {
            "defaultValue": null,
            "description": "Set the color of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the data label.",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "plotArea.dataLabel.visible": {
            "defaultValue": true,
            "description": "Set visibility of data label",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPoint.stroke.color": {
            "defaultValue": "#000000",
            "description": "Set data point stroke color",
            "supportedValueType": "String"
        },
        "plotArea.dataPoint.stroke.visible": {
            "defaultValue": false,
            "description": "Set visibility of the data point stroke.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPointStyle": {
            "defaultValue": null,
            "description": "",
            "supportedValueType": "JsonObject"
        },
        "plotArea.dataPointStyleMode": {
            "defaultValue": "override",
            "description": "This property supports two values : 'update' and 'override'. In 'update' mode, only data points which satisfy the input rules of dataPointStyle will change accordingly, and there is no change in the legend. In 'override' mode, data points which satisfy the input rules of dataPointStyle will change accordingly, and the left data points will follow 'others' display style. The legend items will change accordingly as well.",
            "supportedValueType": "String",
            "supportedValues": "update, override"
        },
        "plotArea.defaultOthersStyle.color": {
            "defaultValue": "#000000",
            "description": "Color to be used for datapoints which are not coverd by semantic rules",
            "supportedValueType": "String"
        },
        "plotArea.drawingEffect": {
            "defaultValue": "normal",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.gridline.color": {
            "defaultValue": "#d8d8d8",
            "description": "Set color of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.size": {
            "defaultValue": 1,
            "description": "Set line stroke width of gridline.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.gridline.type": {
            "defaultValue": "line",
            "description": "Set render type of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine": {
            "description": "Customize zero gridline. Only takes effect when there is negative value.",
            "isPrefix": true
        },
        "plotArea.gridline.zeroLine.color": {
            "defaultValue": null,
            "description": "Color used to highlight the zero gridline. By default category axis color will be used.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.zeroLine.highlight": {
            "defaultValue": true,
            "description": "Highlight the zero gridline using the color defined in plotArea.gridline.zeroLine.color. And respect other line styles defined in gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine.unhighlightAxis": {
            "defaultValue": true,
            "description": "When it's true, use gridline's color on category axis.",
            "supportedValueType": "Boolean"
        },
        "plotArea.isFixedDataPointSize": {
            "defaultValue": false,
            "description": "Enable or disable to use fixed datapoint size layout strategy",
            "supportedValueType": "Boolean"
        },
        "plotArea.lineVisible": {
            "defaultValue": true,
            "description": "Set show line or not.",
            "supportedValueType": "Boolean"
        },
        "plotArea.marker.displayMode": {
            "defaultValue": "manual",
            "description": "If it is auto, the line marker will invisible when line chart big data mode is triggerred, even markerVisible property is true. If it is manual, the line marker behavior is same as before.",
            "supportedValueType": "String"
        },
        "plotArea.marker.shape": {
            "defaultValue": "circle",
            "description": "Set the shape of the markers",
            "supportedValueType": "String",
            "supportedValues": "circle, diamond, triangleUp, triangleDown, triangleLeft, triangleRight, cross, intersection"
        },
        "plotArea.marker.size": {
            "defaultValue": 10,
            "description": "Set the marker size for data points, ranging from '4' to '32'. If you enter a value outside that range, the marker size defaults to '6'.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.marker.visible": {
            "defaultValue": true,
            "description": "Set the visibility of the markers",
            "supportedValueType": "Boolean"
        },
        "plotArea.referenceLine.defaultStyle": {
            "description": "Set the default style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background": {
            "description": "Set the background of the above and below area of reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background.opacity": {
            "defaultValue": 0.5,
            "description": "Set the background opacity for the above and below area of reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.color": {
            "defaultValue": "#666666",
            "description": "Set the default color of the reference line.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label": {
            "description": "Set the default label style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.label.background": {
            "defaultValue": "#7a7a7a",
            "description": "Set the default color for the label background.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.color": {
            "defaultValue": "#ffffff",
            "description": "Set the default font color for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontFamily": {
            "defaultValue": "\"Open Sans\", Arial, Helvetica, sans-serif",
            "description": "Set the default font family for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontSize": {
            "defaultValue": "12px",
            "description": "Set the default font size for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the default font style for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the default font weight for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.opacity": {
            "defaultValue": 0.8,
            "description": "Set the opacity for the label background.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.size": {
            "defaultValue": 1,
            "description": "Set the default stroke width of the reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.type": {
            "defaultValue": "dotted",
            "description": "Set the default line type of the reference line.",
            "supportedValueType": "String",
            "supportedValues": "line, dotted"
        },
        "plotArea.referenceLine.line": {
            "defaultValue": null,
            "description": "<div style=\"line-height: 16px;\">\n    <div>\n        Set reference line value & style individually. This property can accept an object using value scale name (i.e. valueAxis) as property name, and an object array as property value, in which the object describes the reference line value and style. If there is no style setting within it, the default style will be adopted.\n    </div>\n    <div>\n        The structure of referenceLine is as following:\n    </div>\n    <div style=\"padding-left: 24px\">\n        <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n            valueAxis\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                SupportedType:\n            </span>\n            ObjectArray\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                Description:\n            </span>\n            Lines refers to the primary value scale. Each line should at least contains the value property.\n        </div>\n        <div>\n            The structure of the object in the array is as following:\n        </div>\n        <div style=\"padding-left: 24px; margin-bottom: 4px;\">\n            <div style=\"color: #007dc0; font-weight: normal; line-height: 24px;\">\n                value\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the value of the reference line, which describes the position of the it.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                visible\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Boolean\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                true\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the visibility of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                color\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"#666666\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the color of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                size\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"1\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the stroke width of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                type\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedValue:\n                </span>\n                [\"line\", \"dotted\"]\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"dotted\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the line type of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                aboveColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the above background color for the reference line. Must be set with value property. Example: {valueAxis:{value:100, aboveColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                bottomColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the bottom background color for the reference line. Must be set exclusively in a seperate object without other properties. Example: {valueAxis:{value: 100}, {bottomColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                label\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Object\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the label text & style for the reference line.\n            </div>\n            <div style=\"padding-left: 24px;\">\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    text\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the text of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    visible\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Boolean\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    true\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the visibility of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    background\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"#7a7a7a\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the color for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    opacity\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Number\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"0.8\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the opacity for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    style\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Object\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the style of the font for the label.\n                </div>\n                <div style=\"padding-left: 24px;\">\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        color\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"#666666\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font color for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontSize\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"12px\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font size for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontFamily\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"'Open Sans', Arial, Helvetica, sans-serif\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font family for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontWeight\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"bold\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font weight for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontStyle\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"normal\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font style for the label.\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n",
            "supportedValueType": "RuleObject"
        },
        "plotArea.scrollbar.border": {
            "description": "Set the scrollbar border.",
            "isPrefix": true
        },
        "plotArea.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar spacing. The max value is 4 and the min value is 0.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.thumb": {
            "description": "Set the scrollbar thumb when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.track": {
            "description": "Set the scrollbar track when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when chart is scrollable.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "propertyZone": {
            "defaultValue": null,
            "description": "Zone information of the possible areas that support customization.",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Object"
        },
        "title.alignment": {
            "defaultValue": "center",
            "description": "Set the alignment of the main title",
            "supportedValueType": "String",
            "supportedValues": "left, center, right"
        },
        "title.layout": {
            "description": "Settings for the layout of the title.",
            "isPrefix": true
        },
        "title.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.layout.maxHeight": {
            "defaultValue": 0.2,
            "description": "Set the max height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.style": {
            "description": "Settings for the style of the title.",
            "isPrefix": true
        },
        "title.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontSize": {
            "defaultValue": "16px",
            "description": "Set the font size of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the main title.",
            "supportedValueType": "String"
        },
        "title.text": {
            "defaultValue": null,
            "description": "Set the text of the main title",
            "supportedValueType": "String"
        },
        "title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the main title",
            "supportedValueType": "Boolean"
        },
        "tooltip.background.borderColor": {
            "defaultValue": "#cccccc",
            "description": "Define the background border color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.background.color": {
            "defaultValue": "#ffffff",
            "description": "Define the background color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.formatString": {
            "defaultValue": null,
            "description": "Set the format strings for text in the tooltip. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. The following characters are reserved as tokens for format code: MDYHSAmdyhsa#?%0@.The following is examples : \"0.00\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "tooltip.layinChart": {
            "defaultValue": true,
            "description": "Set whether the tooltip appears in the chart area",
            "supportedValueType": "Boolean"
        },
        "tooltip.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "tooltip.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the tooltip",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisLine": {
            "description": "Settings for the axisLine of the valueAxis.",
            "isPrefix": true
        },
        "valueAxis.axisLine.size": {
            "defaultValue": 1,
            "description": "Set line size of axis.",
            "supportedValueType": "PositiveInt"
        },
        "valueAxis.axisLine.visible": {
            "defaultValue": false,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisTick": {
            "description": "Settings for the valueAxis axisTick.",
            "isPrefix": true
        },
        "valueAxis.axisTick.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis ticks. For mobile, default value will be false.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.color": {
            "defaultValue": null,
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "valueAxis.label": {
            "description": "Settings for the valueAxis label.",
            "isPrefix": true
        },
        "valueAxis.label.formatString": {
            "defaultValue": null,
            "description": "Set format string of value axis. Any character in \"MDYHSAmdyhsau#?%0@\" is reserved as a token for format code. The end \"u\" of format string let value format with SI units, the other format string will explained as Excel format string, The value that bigger than 1e8 or less than 1e-6 and be not 0 format with Exponential style. The following is a simple sample format string for label for axis as \"0.00%\".",
            "supportedValueType": "String"
        },
        "valueAxis.label.style": {
            "description": "Settings for the valueAxis label style.",
            "isPrefix": true
        },
        "valueAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "valueAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of the axis label",
            "supportedValueType": "Boolean"
        },
        "valueAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.title": {
            "description": "Settings for the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.title.style": {
            "description": "Settings for the style of the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.text": {
            "defaultValue": null,
            "description": "Set the text of the axis title",
            "supportedValueType": "String"
        },
        "valueAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the axis",
            "supportedValueType": "Boolean"
        }
    },
    "info/hichert_stacked_bar": {
        "categoryAxis.axisLine.visible": {
            "defaultValue": true,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.color": {
            "defaultValue": "#6c6c6c",
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "categoryAxis.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Set color of hoverShadow.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.angle": {
            "access": "internal",
            "defaultValue": 90,
            "description": "Set the rotation angle when the axis has only one layer and label rotation is fixed. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number",
            "supportedValues": "0, 30, 45, 60, 90"
        },
        "categoryAxis.label.rotation": {
            "access": "internal",
            "defaultValue": "auto",
            "description": "Set the rotation type when the axis has only one layer. Auto means labels may be horizontal or rotated 45 degrees. Fixed means labels will always be rotated, whenever truncatedLabelRatio is. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "String",
            "supportedValues": "auto, fixed"
        },
        "categoryAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.truncatedLabelRatio": {
            "access": "internal",
            "defaultValue": 0.2,
            "description": "Set the truncated labels radio when there is only one layer. If too many labels need to be truncated, and rotation setting is auto, labels will be rotated. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number"
        },
        "categoryAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis label.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxHeight": {
            "defaultValue": 0.3,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxWidth": {
            "defaultValue": 0.3,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.title.style": {
            "description": "Settings for the axis title style.",
            "isPrefix": true
        },
        "categoryAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.text": {
            "defaultValue": null,
            "description": "Set text of axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis.",
            "supportedValueType": "Boolean"
        },
        "embeddedLegend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.height": {
            "defaultValue": null,
            "description": "Set the height of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.position": {
            "defaultValue": "top",
            "description": "Set the layout position of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "description": "Zone information of possible feeding areas. feedingZoneArray",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Array"
        },
        "general.background.border": {
            "description": "Settings for the background border.",
            "isPrefix": true
        },
        "general.background.border.bottom": {
            "description": "Settings for the background bottom border.",
            "isPrefix": true
        },
        "general.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.left": {
            "description": "Settings for the background left border.",
            "isPrefix": true
        },
        "general.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.right": {
            "description": "Settings for the background right border.",
            "isPrefix": true
        },
        "general.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "general.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "general.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "general.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the chart background.",
            "supportedValueType": "String"
        },
        "general.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "general.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "general.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "general.groupData": {
            "defaultValue": false,
            "description": "Set to respect input dataset order. If more than one dimensions are bound to category axis and groupData is set to true, chart will automatically group data. If groupData is set to false, input dataset order will always be respected. This property will not work once fields domain in dataset metadata is set.",
            "supportedValueType": "Boolean"
        },
        "general.layout.padding": {
            "defaultValue": 24,
            "description": "Set the universal padding value. This single value is applied to all sides of the chart. Individual settings for each edge are also supported.",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingBottom": {
            "defaultValue": null,
            "description": "Set the padding value for the bottom side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingLeft": {
            "defaultValue": null,
            "description": "Set the padding value for the left side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingRight": {
            "defaultValue": null,
            "description": "Set the padding value for the right side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingTop": {
            "defaultValue": null,
            "description": "Set the padding value for the top side",
            "supportedValueType": "PositiveInt"
        },
        "interaction.behaviorType": {
            "defaultValue": "hichertBehavior",
            "description": "Switch the behavior type by behavior ID, instead of using default interaction behavior. The behavior is registered via interaction.add(behavior) API. 'noHoverBehavior' is an embeded value where data points details will be thrown when selecting (different from default behavior, which throw the information when hovering).",
            "readonly": false,
            "serializable": true
        },
        "interaction.decorations": {
            "defaultValue": null,
            "description": "Set decorations relating to interaction. Each item that is an object of {name: 'decoration name', fn: 'decoration callback function'} is a decoration. Currently two decorations are supported: showDetail and hideDetail. These two decorations can be used to create a user-defined tooltip. If these 2 decorations are used, the default tooltip is not used, and the user should implement a custom tooltip. The showDetail decoration is called when the tooltip is shown, and the hideDetail decoration is called when the tooltip is hidden. The arguments of showDetail are one object of {mode: 'tooltip mode', data: 'data of hovering selected data point', position: 'mouse position', container: 'chart container dom element', selectedNumber: 'number of selected data points', isAnchored: 'whether tooltip should keep current position or not'}. 'tooltip mode' is either 'infoMode' or 'actionMode'. Hovering over an unselected data point displays the infoMode tooltip, while hovering over a selected data point displays the actionMode tooltip. 'data' is an array of dimensions and measures, where each item is an object of {name: 'dimension name or measure name', value: 'dimension member or measure value', type: 'literal string of dimension or measure'}. For instance, {name: 'Country', value: 'China', type: 'dimension'}, or {name: 'Profit', value: 159, type: 'measure'}. The arguments of hideDetail are a string representing tooltip mode, i.e. what kind of tooltip should be hidden.",
            "serializable": false,
            "supportedValueType": "Array"
        },
        "interaction.deselected.opacity": {
            "defaultValue": 0.2,
            "description": "Set deselected data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.opacity": {
            "defaultValue": 1,
            "description": "Set hovered data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.hover.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of hovered data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.hover.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width. The max width is 4px.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.noninteractiveMode": {
            "defaultValue": false,
            "description": "Set chart rendering mode. When it's true, chart has no interaction, but selection API can work",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.axisLabelSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking axis label",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.legendSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking legend",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.mode": {
            "defaultValue": "INCLUSIVE",
            "description": "Set the selection mode. If this value is set to 'exclusive' or 'single', only one set of data points can be selected at once. If this value is set to 'inclusive' or 'multiple', multiple sets of data points can be selected at once. If this value is set to 'none', no sets of data points can be selected. The values 'single' and 'multiple' are deprecated; please remove them from your chart.",
            "supportedValueType": "String",
            "supportedValues": "INCLUSIVE, EXCLUSIVE, SINGLE, MULTIPLE, NONE"
        },
        "interaction.selectability.plotLassoSelection": {
            "defaultValue": true,
            "description": "Set whether lasso selection can be used in the plot area. This property doesn't work for Windows Phone",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.plotStdSelection": {
            "defaultValue": true,
            "description": "Set whether selection can be done in the plot area by clicking and tapping",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.selected.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of selected data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "legend.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for colors in the legend. If this value is set to 'glossy', colors are glossy. If this value is set to 'normal', colors are matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "legend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "legend.isScrollable": {
            "defaultValue": false,
            "description": "Set whether the legend is scrollable. If this value is set to 'false', and there is not enough room to show the whole legend, an ellipsis (...) indicates the missing legend items.",
            "supportedValueType": "Boolean"
        },
        "legend.itemMargin": {
            "defaultValue": 0.5,
            "description": "Set color legend item margin ratio. The actual margin value is calculated by multipling height of the legend item marker/text (whichever is larger) by this ratio.",
            "supportedValueType": "Number"
        },
        "legend.label.style": {
            "description": "Settings for label sytle of legend.",
            "isPrefix": true
        },
        "legend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "legend.marker.shape": {
            "defaultValue": "squareWithRadius",
            "description": "Set the default marker sharpe, will not affect lines in combination charts",
            "supportedValueType": "String",
            "supportedValues": "squareWithRadius, square, rectangle"
        },
        "legend.marker.size": {
            "defaultValue": null,
            "description": "Set the color legend marker size in pixel",
            "supportedValueType": "Number"
        },
        "legend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border": {
            "description": "Set the scrollbar border when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border when scrollable legend is on. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border when scrollable legend is on. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the size of scrollbar spacing when scrollable legend is on. The max value is 4 and the min value is 0.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb": {
            "description": "Set the legend scrollbar thumb when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of legend scrollbar thumb when scrollable legend is on",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.track": {
            "description": "Set the legend scrollbar track when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.showFullLabel": {
            "defaultValue": true,
            "description": "If set to true, the legend will not be truncated unless the total width is not enough.",
            "supportedValueType": "Boolean"
        },
        "legend.title.style": {
            "description": "Settings for title style of legend.",
            "isPrefix": true
        },
        "legend.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.text": {
            "defaultValue": null,
            "description": "Set the text of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend title",
            "supportedValueType": "Boolean"
        },
        "legend.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend",
            "supportedValueType": "Boolean"
        },
        "legendGroup.forceToShow": {
            "defaultValue": false,
            "description": "When legend is set to visible, always show it even chart size is small.",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.alignment": {
            "defaultValue": "topLeft",
            "description": "Change legendGroup alignment.",
            "supportedValueType": "String",
            "supportedValues": "topLeft, center"
        },
        "legendGroup.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.position": {
            "defaultValue": "right",
            "description": "Set the position of the legend group area. When it's \"auto\", responsively layout the legend on the right when chart width is no less than the threshold, and at the bottom when it's smaller. The legend group will be put into bottom instead of right.",
            "supportedValueType": "String",
            "supportedValues": "top, bottom, right, left, auto"
        },
        "legendGroup.layout.respectPlotPosition": {
            "defaultValue": true,
            "description": "To align the legend position with plot area (excl. axis area), otherwise legend will align with the chart plot (excl. chart title).",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "plotArea.background.border": {
            "description": "Settings for background border of plotArea.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom": {
            "description": "Settings for bottom of border in background.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "plotArea.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "plotArea.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the plot area background.",
            "supportedValueType": "String"
        },
        "plotArea.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "plotArea.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.background.opacity": {
            "defaultValue": 0.8,
            "description": "Set back ground opacity of data label",
            "supportedValueType": "Number"
        },
        "plotArea.dataLabel.formatString": {
            "defaultValue": null,
            "description": "Set format string of data label. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. Any character in \"MDYHSAmdyhsa#?%0@\" is reserved as a token for format code. Simple samples: \"0.00%\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "plotArea.dataLabel.hideWhenOverlap": {
            "defaultValue": true,
            "description": "Set whether data label is hidden when overlapping.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.position": {
            "defaultValue": "outside",
            "description": "Set data label display position. 'outsideFirst' means if plot has no space to display data label outside of bar, the data label will be displayed inside.",
            "supportedValueType": "String",
            "supportedValues": "inside,outside,outsideFirst"
        },
        "plotArea.dataLabel.showTotal": {
            "defaultValue": true,
            "description": "Set visibility of data label for total value",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.style.color": {
            "defaultValue": null,
            "description": "Set the color of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the data label.",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "plotArea.dataLabel.visible": {
            "defaultValue": true,
            "description": "Set visibility of data label",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPoint.stroke.color": {
            "defaultValue": "#000000",
            "description": "Set data point stroke color",
            "supportedValueType": "String"
        },
        "plotArea.dataPoint.stroke.visible": {
            "defaultValue": false,
            "description": "Set visibility of the data point stroke.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPointSize.max": {
            "defaultValue": 96,
            "description": "Maximum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointSize.min": {
            "defaultValue": 20,
            "description": "Minimum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointStyle": {
            "defaultValue": null,
            "description": "",
            "supportedValueType": "JsonObject"
        },
        "plotArea.dataPointStyleMode": {
            "defaultValue": "override",
            "description": "This property supports two values : 'update' and 'override'. In 'update' mode, only data points which satisfy the input rules of dataPointStyle will change accordingly, and there is no change in the legend. In 'override' mode, data points which satisfy the input rules of dataPointStyle will change accordingly, and the left data points will follow 'others' display style. The legend items will change accordingly as well.",
            "supportedValueType": "String",
            "supportedValues": "update, override"
        },
        "plotArea.defaultOthersStyle.color": {
            "defaultValue": "#000000",
            "description": "Color to be used for datapoints which are not coverd by semantic rules",
            "supportedValueType": "String"
        },
        "plotArea.drawingEffect": {
            "defaultValue": "normal",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.gap.barSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between bars for single axis stacked charts or the charts without color binding. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.groupSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between category groups for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.innerGroupSpacing": {
            "defaultValue": 0.125,
            "description": "Set spacing between bars in one category group for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gridline.color": {
            "defaultValue": "#d8d8d8",
            "description": "Set color of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.size": {
            "defaultValue": 1,
            "description": "Set line stroke width of gridline.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.gridline.type": {
            "defaultValue": "line",
            "description": "Set render type of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine": {
            "description": "Customize zero gridline. Only takes effect when there is negative value.",
            "isPrefix": true
        },
        "plotArea.gridline.zeroLine.color": {
            "defaultValue": null,
            "description": "Color used to highlight the zero gridline. By default category axis color will be used.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.zeroLine.highlight": {
            "defaultValue": true,
            "description": "Highlight the zero gridline using the color defined in plotArea.gridline.zeroLine.color. And respect other line styles defined in gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine.unhighlightAxis": {
            "defaultValue": true,
            "description": "When it's true, use gridline's color on category axis.",
            "supportedValueType": "Boolean"
        },
        "plotArea.isFixedDataPointSize": {
            "defaultValue": false,
            "description": "Enable or disable to use fixed datapoint size layout strategy",
            "supportedValueType": "Boolean"
        },
        "plotArea.referenceLine.defaultStyle": {
            "description": "Set the default style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background": {
            "description": "Set the background of the above and below area of reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background.opacity": {
            "defaultValue": 0.5,
            "description": "Set the background opacity for the above and below area of reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.color": {
            "defaultValue": "#666666",
            "description": "Set the default color of the reference line.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label": {
            "description": "Set the default label style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.label.background": {
            "defaultValue": "#7a7a7a",
            "description": "Set the default color for the label background.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.color": {
            "defaultValue": "#ffffff",
            "description": "Set the default font color for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontFamily": {
            "defaultValue": "\"Open Sans\", Arial, Helvetica, sans-serif",
            "description": "Set the default font family for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontSize": {
            "defaultValue": "12px",
            "description": "Set the default font size for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the default font style for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the default font weight for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.opacity": {
            "defaultValue": 0.8,
            "description": "Set the opacity for the label background.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.size": {
            "defaultValue": 1,
            "description": "Set the default stroke width of the reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.type": {
            "defaultValue": "dotted",
            "description": "Set the default line type of the reference line.",
            "supportedValueType": "String",
            "supportedValues": "line, dotted"
        },
        "plotArea.referenceLine.line": {
            "defaultValue": null,
            "description": "<div style=\"line-height: 16px;\">\n    <div>\n        Set reference line value & style individually. This property can accept an object using value scale name (i.e. valueAxis) as property name, and an object array as property value, in which the object describes the reference line value and style. If there is no style setting within it, the default style will be adopted.\n    </div>\n    <div>\n        The structure of referenceLine is as following:\n    </div>\n    <div style=\"padding-left: 24px\">\n        <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n            valueAxis\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                SupportedType:\n            </span>\n            ObjectArray\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                Description:\n            </span>\n            Lines refers to the primary value scale. Each line should at least contains the value property.\n        </div>\n        <div>\n            The structure of the object in the array is as following:\n        </div>\n        <div style=\"padding-left: 24px; margin-bottom: 4px;\">\n            <div style=\"color: #007dc0; font-weight: normal; line-height: 24px;\">\n                value\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the value of the reference line, which describes the position of the it.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                visible\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Boolean\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                true\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the visibility of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                color\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"#666666\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the color of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                size\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"1\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the stroke width of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                type\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedValue:\n                </span>\n                [\"line\", \"dotted\"]\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"dotted\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the line type of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                aboveColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the above background color for the reference line. Must be set with value property. Example: {valueAxis:{value:100, aboveColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                bottomColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the bottom background color for the reference line. Must be set exclusively in a seperate object without other properties. Example: {valueAxis:{value: 100}, {bottomColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                label\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Object\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the label text & style for the reference line.\n            </div>\n            <div style=\"padding-left: 24px;\">\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    text\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the text of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    visible\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Boolean\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    true\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the visibility of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    background\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"#7a7a7a\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the color for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    opacity\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Number\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"0.8\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the opacity for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    style\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Object\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the style of the font for the label.\n                </div>\n                <div style=\"padding-left: 24px;\">\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        color\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"#666666\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font color for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontSize\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"12px\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font size for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontFamily\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"'Open Sans', Arial, Helvetica, sans-serif\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font family for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontWeight\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"bold\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font weight for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontStyle\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"normal\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font style for the label.\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n",
            "supportedValueType": "RuleObject"
        },
        "plotArea.scrollbar.border": {
            "description": "Set the scrollbar border.",
            "isPrefix": true
        },
        "plotArea.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar spacing. The max value is 4 and the min value is 0.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.thumb": {
            "description": "Set the scrollbar thumb when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.track": {
            "description": "Set the scrollbar track when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when chart is scrollable.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "propertyZone": {
            "defaultValue": null,
            "description": "Zone information of the possible areas that support customization.",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Object"
        },
        "title.alignment": {
            "defaultValue": "center",
            "description": "Set the alignment of the main title",
            "supportedValueType": "String",
            "supportedValues": "left, center, right"
        },
        "title.layout": {
            "description": "Settings for the layout of the title.",
            "isPrefix": true
        },
        "title.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.layout.maxHeight": {
            "defaultValue": 0.2,
            "description": "Set the max height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.style": {
            "description": "Settings for the style of the title.",
            "isPrefix": true
        },
        "title.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontSize": {
            "defaultValue": "16px",
            "description": "Set the font size of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the main title.",
            "supportedValueType": "String"
        },
        "title.text": {
            "defaultValue": null,
            "description": "Set the text of the main title",
            "supportedValueType": "String"
        },
        "title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the main title",
            "supportedValueType": "Boolean"
        },
        "tooltip.background.borderColor": {
            "defaultValue": "#cccccc",
            "description": "Define the background border color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.background.color": {
            "defaultValue": "#ffffff",
            "description": "Define the background color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.formatString": {
            "defaultValue": null,
            "description": "Set the format strings for text in the tooltip. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. The following characters are reserved as tokens for format code: MDYHSAmdyhsa#?%0@.The following is examples : \"0.00\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "tooltip.layinChart": {
            "defaultValue": true,
            "description": "Set whether the tooltip appears in the chart area",
            "supportedValueType": "Boolean"
        },
        "tooltip.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "tooltip.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the tooltip",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisLine": {
            "description": "Settings for the axisLine of the valueAxis.",
            "isPrefix": true
        },
        "valueAxis.axisLine.size": {
            "defaultValue": 1,
            "description": "Set line size of axis.",
            "supportedValueType": "PositiveInt"
        },
        "valueAxis.axisLine.visible": {
            "defaultValue": false,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisTick": {
            "description": "Settings for the valueAxis axisTick.",
            "isPrefix": true
        },
        "valueAxis.axisTick.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis ticks. For mobile, default value will be false.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.color": {
            "defaultValue": null,
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "valueAxis.label": {
            "description": "Settings for the valueAxis label.",
            "isPrefix": true
        },
        "valueAxis.label.formatString": {
            "defaultValue": null,
            "description": "Set format string of value axis. Any character in \"MDYHSAmdyhsau#?%0@\" is reserved as a token for format code. The end \"u\" of format string let value format with SI units, the other format string will explained as Excel format string, The value that bigger than 1e8 or less than 1e-6 and be not 0 format with Exponential style. The following is a simple sample format string for label for axis as \"0.00%\".",
            "supportedValueType": "String"
        },
        "valueAxis.label.style": {
            "description": "Settings for the valueAxis label style.",
            "isPrefix": true
        },
        "valueAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "valueAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of the axis label",
            "supportedValueType": "Boolean"
        },
        "valueAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.title": {
            "description": "Settings for the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.title.style": {
            "description": "Settings for the style of the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.text": {
            "defaultValue": null,
            "description": "Set the text of the axis title",
            "supportedValueType": "String"
        },
        "valueAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the axis",
            "supportedValueType": "Boolean"
        }
    },
    "info/hichert_stacked_column": {
        "categoryAxis.axisLine.visible": {
            "defaultValue": true,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.color": {
            "defaultValue": "#6c6c6c",
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "categoryAxis.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Set color of hoverShadow.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.angle": {
            "access": "internal",
            "defaultValue": 90,
            "description": "Set the rotation angle when the axis has only one layer and label rotation is fixed. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number",
            "supportedValues": "0, 30, 45, 60, 90"
        },
        "categoryAxis.label.rotation": {
            "access": "internal",
            "defaultValue": "auto",
            "description": "Set the rotation type when the axis has only one layer. Auto means labels may be horizontal or rotated 45 degrees. Fixed means labels will always be rotated, whenever truncatedLabelRatio is. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "String",
            "supportedValues": "auto, fixed"
        },
        "categoryAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.truncatedLabelRatio": {
            "access": "internal",
            "defaultValue": 0.2,
            "description": "Set the truncated labels radio when there is only one layer. If too many labels need to be truncated, and rotation setting is auto, labels will be rotated. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number"
        },
        "categoryAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis label.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxHeight": {
            "defaultValue": 0.3,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxWidth": {
            "defaultValue": 0.3,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.title.style": {
            "description": "Settings for the axis title style.",
            "isPrefix": true
        },
        "categoryAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.text": {
            "defaultValue": null,
            "description": "Set text of axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis.",
            "supportedValueType": "Boolean"
        },
        "embeddedLegend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.maxWidth": {
            "defaultValue": null,
            "description": "Set the max width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.position": {
            "defaultValue": "right",
            "description": "Set the layout position of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.width": {
            "defaultValue": null,
            "description": "Set the width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "description": "Zone information of possible feeding areas. feedingZoneArray",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Array"
        },
        "general.background.border": {
            "description": "Settings for the background border.",
            "isPrefix": true
        },
        "general.background.border.bottom": {
            "description": "Settings for the background bottom border.",
            "isPrefix": true
        },
        "general.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.left": {
            "description": "Settings for the background left border.",
            "isPrefix": true
        },
        "general.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.right": {
            "description": "Settings for the background right border.",
            "isPrefix": true
        },
        "general.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "general.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "general.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "general.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the chart background.",
            "supportedValueType": "String"
        },
        "general.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "general.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "general.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "general.groupData": {
            "defaultValue": false,
            "description": "Set to respect input dataset order. If more than one dimensions are bound to category axis and groupData is set to true, chart will automatically group data. If groupData is set to false, input dataset order will always be respected. This property will not work once fields domain in dataset metadata is set.",
            "supportedValueType": "Boolean"
        },
        "general.layout.padding": {
            "defaultValue": 24,
            "description": "Set the universal padding value. This single value is applied to all sides of the chart. Individual settings for each edge are also supported.",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingBottom": {
            "defaultValue": null,
            "description": "Set the padding value for the bottom side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingLeft": {
            "defaultValue": null,
            "description": "Set the padding value for the left side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingRight": {
            "defaultValue": null,
            "description": "Set the padding value for the right side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingTop": {
            "defaultValue": null,
            "description": "Set the padding value for the top side",
            "supportedValueType": "PositiveInt"
        },
        "interaction.behaviorType": {
            "defaultValue": "hichertBehavior",
            "description": "Switch the behavior type by behavior ID, instead of using default interaction behavior. The behavior is registered via interaction.add(behavior) API. 'noHoverBehavior' is an embeded value where data points details will be thrown when selecting (different from default behavior, which throw the information when hovering).",
            "readonly": false,
            "serializable": true
        },
        "interaction.decorations": {
            "defaultValue": null,
            "description": "Set decorations relating to interaction. Each item that is an object of {name: 'decoration name', fn: 'decoration callback function'} is a decoration. Currently two decorations are supported: showDetail and hideDetail. These two decorations can be used to create a user-defined tooltip. If these 2 decorations are used, the default tooltip is not used, and the user should implement a custom tooltip. The showDetail decoration is called when the tooltip is shown, and the hideDetail decoration is called when the tooltip is hidden. The arguments of showDetail are one object of {mode: 'tooltip mode', data: 'data of hovering selected data point', position: 'mouse position', container: 'chart container dom element', selectedNumber: 'number of selected data points', isAnchored: 'whether tooltip should keep current position or not'}. 'tooltip mode' is either 'infoMode' or 'actionMode'. Hovering over an unselected data point displays the infoMode tooltip, while hovering over a selected data point displays the actionMode tooltip. 'data' is an array of dimensions and measures, where each item is an object of {name: 'dimension name or measure name', value: 'dimension member or measure value', type: 'literal string of dimension or measure'}. For instance, {name: 'Country', value: 'China', type: 'dimension'}, or {name: 'Profit', value: 159, type: 'measure'}. The arguments of hideDetail are a string representing tooltip mode, i.e. what kind of tooltip should be hidden.",
            "serializable": false,
            "supportedValueType": "Array"
        },
        "interaction.deselected.opacity": {
            "defaultValue": 0.2,
            "description": "Set deselected data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.opacity": {
            "defaultValue": 1,
            "description": "Set hovered data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.hover.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of hovered data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.hover.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width. The max width is 4px.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.noninteractiveMode": {
            "defaultValue": false,
            "description": "Set chart rendering mode. When it's true, chart has no interaction, but selection API can work",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.axisLabelSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking axis label",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.legendSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking legend",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.mode": {
            "defaultValue": "INCLUSIVE",
            "description": "Set the selection mode. If this value is set to 'exclusive' or 'single', only one set of data points can be selected at once. If this value is set to 'inclusive' or 'multiple', multiple sets of data points can be selected at once. If this value is set to 'none', no sets of data points can be selected. The values 'single' and 'multiple' are deprecated; please remove them from your chart.",
            "supportedValueType": "String",
            "supportedValues": "INCLUSIVE, EXCLUSIVE, SINGLE, MULTIPLE, NONE"
        },
        "interaction.selectability.plotLassoSelection": {
            "defaultValue": true,
            "description": "Set whether lasso selection can be used in the plot area. This property doesn't work for Windows Phone",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.plotStdSelection": {
            "defaultValue": true,
            "description": "Set whether selection can be done in the plot area by clicking and tapping",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.selected.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of selected data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "legend.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for colors in the legend. If this value is set to 'glossy', colors are glossy. If this value is set to 'normal', colors are matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "legend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "legend.isScrollable": {
            "defaultValue": false,
            "description": "Set whether the legend is scrollable. If this value is set to 'false', and there is not enough room to show the whole legend, an ellipsis (...) indicates the missing legend items.",
            "supportedValueType": "Boolean"
        },
        "legend.itemMargin": {
            "defaultValue": 0.5,
            "description": "Set color legend item margin ratio. The actual margin value is calculated by multipling height of the legend item marker/text (whichever is larger) by this ratio.",
            "supportedValueType": "Number"
        },
        "legend.label.style": {
            "description": "Settings for label sytle of legend.",
            "isPrefix": true
        },
        "legend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "legend.marker.shape": {
            "defaultValue": "squareWithRadius",
            "description": "Set the default marker sharpe, will not affect lines in combination charts",
            "supportedValueType": "String",
            "supportedValues": "squareWithRadius, square, rectangle"
        },
        "legend.marker.size": {
            "defaultValue": null,
            "description": "Set the color legend marker size in pixel",
            "supportedValueType": "Number"
        },
        "legend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border": {
            "description": "Set the scrollbar border when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border when scrollable legend is on. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border when scrollable legend is on. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the size of scrollbar spacing when scrollable legend is on. The max value is 4 and the min value is 0.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb": {
            "description": "Set the legend scrollbar thumb when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of legend scrollbar thumb when scrollable legend is on",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.track": {
            "description": "Set the legend scrollbar track when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.showFullLabel": {
            "defaultValue": true,
            "description": "If set to true, the legend will not be truncated unless the total width is not enough.",
            "supportedValueType": "Boolean"
        },
        "legend.title.style": {
            "description": "Settings for title style of legend.",
            "isPrefix": true
        },
        "legend.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.text": {
            "defaultValue": null,
            "description": "Set the text of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend title",
            "supportedValueType": "Boolean"
        },
        "legend.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend",
            "supportedValueType": "Boolean"
        },
        "legendGroup.forceToShow": {
            "defaultValue": false,
            "description": "When legend is set to visible, always show it even chart size is small.",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.alignment": {
            "defaultValue": "topLeft",
            "description": "Change legendGroup alignment.",
            "supportedValueType": "String",
            "supportedValues": "topLeft, center"
        },
        "legendGroup.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.position": {
            "defaultValue": "right",
            "description": "Set the position of the legend group area. When it's \"auto\", responsively layout the legend on the right when chart width is no less than the threshold, and at the bottom when it's smaller. The legend group will be put into bottom instead of right.",
            "supportedValueType": "String",
            "supportedValues": "top, bottom, right, left, auto"
        },
        "legendGroup.layout.respectPlotPosition": {
            "defaultValue": true,
            "description": "To align the legend position with plot area (excl. axis area), otherwise legend will align with the chart plot (excl. chart title).",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "plotArea.background.border": {
            "description": "Settings for background border of plotArea.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom": {
            "description": "Settings for bottom of border in background.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "plotArea.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "plotArea.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the plot area background.",
            "supportedValueType": "String"
        },
        "plotArea.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "plotArea.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.background.opacity": {
            "defaultValue": 0.8,
            "description": "Set back ground opacity of data label",
            "supportedValueType": "Number"
        },
        "plotArea.dataLabel.formatString": {
            "defaultValue": null,
            "description": "Set format string of data label. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. Any character in \"MDYHSAmdyhsa#?%0@\" is reserved as a token for format code. Simple samples: \"0.00%\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "plotArea.dataLabel.hideWhenOverlap": {
            "defaultValue": true,
            "description": "Set whether data label is hidden when overlapping.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.position": {
            "defaultValue": "outside",
            "description": "Set data label display position. 'outsideFirst' means if plot has no space to display data label outside of bar, the data label will be displayed inside.",
            "supportedValueType": "String",
            "supportedValues": "inside,outside,outsideFirst"
        },
        "plotArea.dataLabel.showTotal": {
            "defaultValue": true,
            "description": "Set visibility of data label for total value",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.style.color": {
            "defaultValue": null,
            "description": "Set the color of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the data label.",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "plotArea.dataLabel.visible": {
            "defaultValue": true,
            "description": "Set visibility of data label",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPoint.stroke.color": {
            "defaultValue": "#000000",
            "description": "Set data point stroke color",
            "supportedValueType": "String"
        },
        "plotArea.dataPoint.stroke.visible": {
            "defaultValue": false,
            "description": "Set visibility of the data point stroke.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPointSize.max": {
            "defaultValue": 96,
            "description": "Maximum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointSize.min": {
            "defaultValue": 32,
            "description": "Minimum bar/column size in pixel",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.dataPointStyle": {
            "defaultValue": null,
            "description": "",
            "supportedValueType": "JsonObject"
        },
        "plotArea.dataPointStyleMode": {
            "defaultValue": "override",
            "description": "This property supports two values : 'update' and 'override'. In 'update' mode, only data points which satisfy the input rules of dataPointStyle will change accordingly, and there is no change in the legend. In 'override' mode, data points which satisfy the input rules of dataPointStyle will change accordingly, and the left data points will follow 'others' display style. The legend items will change accordingly as well.",
            "supportedValueType": "String",
            "supportedValues": "update, override"
        },
        "plotArea.defaultOthersStyle.color": {
            "defaultValue": "#000000",
            "description": "Color to be used for datapoints which are not coverd by semantic rules",
            "supportedValueType": "String"
        },
        "plotArea.drawingEffect": {
            "defaultValue": "normal",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.gap.barSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between bars for single axis stacked charts or the charts without color binding. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.groupSpacing": {
            "defaultValue": 1,
            "description": "Set spacing between category groups for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gap.innerGroupSpacing": {
            "defaultValue": 0.125,
            "description": "Set spacing between bars in one category group for charts with multiple colors except single axis stacked charts. It's ratio of bar width.",
            "supportedValueType": "Number"
        },
        "plotArea.gridline.color": {
            "defaultValue": "#d8d8d8",
            "description": "Set color of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.size": {
            "defaultValue": 1,
            "description": "Set line stroke width of gridline.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.gridline.type": {
            "defaultValue": "line",
            "description": "Set render type of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine": {
            "description": "Customize zero gridline. Only takes effect when there is negative value.",
            "isPrefix": true
        },
        "plotArea.gridline.zeroLine.color": {
            "defaultValue": null,
            "description": "Color used to highlight the zero gridline. By default category axis color will be used.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.zeroLine.highlight": {
            "defaultValue": true,
            "description": "Highlight the zero gridline using the color defined in plotArea.gridline.zeroLine.color. And respect other line styles defined in gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine.unhighlightAxis": {
            "defaultValue": true,
            "description": "When it's true, use gridline's color on category axis.",
            "supportedValueType": "Boolean"
        },
        "plotArea.isFixedDataPointSize": {
            "defaultValue": false,
            "description": "Enable or disable to use fixed datapoint size layout strategy",
            "supportedValueType": "Boolean"
        },
        "plotArea.referenceLine.defaultStyle": {
            "description": "Set the default style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background": {
            "description": "Set the background of the above and below area of reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background.opacity": {
            "defaultValue": 0.5,
            "description": "Set the background opacity for the above and below area of reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.color": {
            "defaultValue": "#666666",
            "description": "Set the default color of the reference line.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label": {
            "description": "Set the default label style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.label.background": {
            "defaultValue": "#7a7a7a",
            "description": "Set the default color for the label background.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.color": {
            "defaultValue": "#ffffff",
            "description": "Set the default font color for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontFamily": {
            "defaultValue": "\"Open Sans\", Arial, Helvetica, sans-serif",
            "description": "Set the default font family for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontSize": {
            "defaultValue": "12px",
            "description": "Set the default font size for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the default font style for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the default font weight for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.opacity": {
            "defaultValue": 0.8,
            "description": "Set the opacity for the label background.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.size": {
            "defaultValue": 1,
            "description": "Set the default stroke width of the reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.type": {
            "defaultValue": "dotted",
            "description": "Set the default line type of the reference line.",
            "supportedValueType": "String",
            "supportedValues": "line, dotted"
        },
        "plotArea.referenceLine.line": {
            "defaultValue": null,
            "description": "<div style=\"line-height: 16px;\">\n    <div>\n        Set reference line value & style individually. This property can accept an object using value scale name (i.e. valueAxis) as property name, and an object array as property value, in which the object describes the reference line value and style. If there is no style setting within it, the default style will be adopted.\n    </div>\n    <div>\n        The structure of referenceLine is as following:\n    </div>\n    <div style=\"padding-left: 24px\">\n        <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n            valueAxis\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                SupportedType:\n            </span>\n            ObjectArray\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                Description:\n            </span>\n            Lines refers to the primary value scale. Each line should at least contains the value property.\n        </div>\n        <div>\n            The structure of the object in the array is as following:\n        </div>\n        <div style=\"padding-left: 24px; margin-bottom: 4px;\">\n            <div style=\"color: #007dc0; font-weight: normal; line-height: 24px;\">\n                value\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the value of the reference line, which describes the position of the it.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                visible\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Boolean\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                true\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the visibility of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                color\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"#666666\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the color of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                size\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"1\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the stroke width of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                type\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedValue:\n                </span>\n                [\"line\", \"dotted\"]\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"dotted\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the line type of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                aboveColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the above background color for the reference line. Must be set with value property. Example: {valueAxis:{value:100, aboveColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                bottomColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the bottom background color for the reference line. Must be set exclusively in a seperate object without other properties. Example: {valueAxis:{value: 100}, {bottomColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                label\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Object\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the label text & style for the reference line.\n            </div>\n            <div style=\"padding-left: 24px;\">\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    text\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the text of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    visible\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Boolean\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    true\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the visibility of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    background\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"#7a7a7a\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the color for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    opacity\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Number\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"0.8\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the opacity for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    style\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Object\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the style of the font for the label.\n                </div>\n                <div style=\"padding-left: 24px;\">\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        color\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"#666666\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font color for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontSize\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"12px\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font size for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontFamily\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"'Open Sans', Arial, Helvetica, sans-serif\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font family for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontWeight\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"bold\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font weight for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontStyle\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"normal\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font style for the label.\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n",
            "supportedValueType": "RuleObject"
        },
        "plotArea.scrollbar.border": {
            "description": "Set the scrollbar border.",
            "isPrefix": true
        },
        "plotArea.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar spacing. The max value is 4 and the min value is 0.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.thumb": {
            "description": "Set the scrollbar thumb when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.track": {
            "description": "Set the scrollbar track when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when chart is scrollable.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "propertyZone": {
            "defaultValue": null,
            "description": "Zone information of the possible areas that support customization.",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Object"
        },
        "title.alignment": {
            "defaultValue": "center",
            "description": "Set the alignment of the main title",
            "supportedValueType": "String",
            "supportedValues": "left, center, right"
        },
        "title.layout": {
            "description": "Settings for the layout of the title.",
            "isPrefix": true
        },
        "title.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.layout.maxHeight": {
            "defaultValue": 0.2,
            "description": "Set the max height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.style": {
            "description": "Settings for the style of the title.",
            "isPrefix": true
        },
        "title.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontSize": {
            "defaultValue": "16px",
            "description": "Set the font size of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the main title.",
            "supportedValueType": "String"
        },
        "title.text": {
            "defaultValue": null,
            "description": "Set the text of the main title",
            "supportedValueType": "String"
        },
        "title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the main title",
            "supportedValueType": "Boolean"
        },
        "tooltip.background.borderColor": {
            "defaultValue": "#cccccc",
            "description": "Define the background border color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.background.color": {
            "defaultValue": "#ffffff",
            "description": "Define the background color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.formatString": {
            "defaultValue": null,
            "description": "Set the format strings for text in the tooltip. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. The following characters are reserved as tokens for format code: MDYHSAmdyhsa#?%0@.The following is examples : \"0.00\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "tooltip.layinChart": {
            "defaultValue": true,
            "description": "Set whether the tooltip appears in the chart area",
            "supportedValueType": "Boolean"
        },
        "tooltip.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "tooltip.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the tooltip",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisLine": {
            "description": "Settings for the axisLine of the valueAxis.",
            "isPrefix": true
        },
        "valueAxis.axisLine.size": {
            "defaultValue": 1,
            "description": "Set line size of axis.",
            "supportedValueType": "PositiveInt"
        },
        "valueAxis.axisLine.visible": {
            "defaultValue": false,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisTick": {
            "description": "Settings for the valueAxis axisTick.",
            "isPrefix": true
        },
        "valueAxis.axisTick.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis ticks. For mobile, default value will be false.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.color": {
            "defaultValue": null,
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "valueAxis.label": {
            "description": "Settings for the valueAxis label.",
            "isPrefix": true
        },
        "valueAxis.label.formatString": {
            "defaultValue": null,
            "description": "Set format string of value axis. Any character in \"MDYHSAmdyhsau#?%0@\" is reserved as a token for format code. The end \"u\" of format string let value format with SI units, the other format string will explained as Excel format string, The value that bigger than 1e8 or less than 1e-6 and be not 0 format with Exponential style. The following is a simple sample format string for label for axis as \"0.00%\".",
            "supportedValueType": "String"
        },
        "valueAxis.label.style": {
            "description": "Settings for the valueAxis label style.",
            "isPrefix": true
        },
        "valueAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "valueAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of the axis label",
            "supportedValueType": "Boolean"
        },
        "valueAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.title": {
            "description": "Settings for the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.title.style": {
            "description": "Settings for the style of the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.text": {
            "defaultValue": null,
            "description": "Set the text of the axis title",
            "supportedValueType": "String"
        },
        "valueAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the axis",
            "supportedValueType": "Boolean"
        }
    },
    "info/hichert_variance_line": {
        "categoryAxis.axisLine.visible": {
            "defaultValue": true,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.color": {
            "defaultValue": "#6c6c6c",
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "categoryAxis.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Set color of hoverShadow.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.angle": {
            "access": "internal",
            "defaultValue": 90,
            "description": "Set the rotation angle when the axis has only one layer and label rotation is fixed. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number",
            "supportedValues": "0, 30, 45, 60, 90"
        },
        "categoryAxis.label.rotation": {
            "access": "internal",
            "defaultValue": "auto",
            "description": "Set the rotation type when the axis has only one layer. Auto means labels may be horizontal or rotated 45 degrees. Fixed means labels will always be rotated, whenever truncatedLabelRatio is. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "String",
            "supportedValues": "auto, fixed"
        },
        "categoryAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "categoryAxis.label.truncatedLabelRatio": {
            "access": "internal",
            "defaultValue": 0.2,
            "description": "Set the truncated labels radio when there is only one layer. If too many labels need to be truncated, and rotation setting is auto, labels will be rotated. ",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Number"
        },
        "categoryAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis label.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxHeight": {
            "defaultValue": 0.3,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.maxWidth": {
            "defaultValue": 0.3,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "categoryAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.title.style": {
            "description": "Settings for the axis title style.",
            "isPrefix": true
        },
        "categoryAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.text": {
            "defaultValue": null,
            "description": "Set text of axis title.",
            "supportedValueType": "String"
        },
        "categoryAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "categoryAxis.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis.",
            "supportedValueType": "Boolean"
        },
        "embeddedLegend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the embedded legend",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.label.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "embeddedLegend.layout.leftMaxWidth": {
            "defaultValue": null,
            "description": "Set the max left width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.leftWidth": {
            "defaultValue": null,
            "description": "Set the left width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.rightMaxWidth": {
            "defaultValue": null,
            "description": "Set the max right width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.layout.rightWidth": {
            "defaultValue": null,
            "description": "Set the right width of the embedded legend",
            "supportedValueType": "Number"
        },
        "embeddedLegend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "feedingZone": {
            "defaultValue": [
                {
                    "bindDef": [
                        {
                            "id": null
                        }
                    ],
                    "bound": [
                        [
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ],
                            [
                                0,
                                0
                            ]
                        ]
                    ],
                    "name": null
                }
            ],
            "description": "Zone information of possible feeding areas. feedingZoneArray",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Array"
        },
        "general.background.border": {
            "description": "Settings for the background border.",
            "isPrefix": true
        },
        "general.background.border.bottom": {
            "description": "Settings for the background bottom border.",
            "isPrefix": true
        },
        "general.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.left": {
            "description": "Settings for the background left border.",
            "isPrefix": true
        },
        "general.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.right": {
            "description": "Settings for the background right border.",
            "isPrefix": true
        },
        "general.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "general.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "general.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "general.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "general.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the chart background.",
            "supportedValueType": "String"
        },
        "general.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "general.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "general.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "general.groupData": {
            "defaultValue": false,
            "description": "Set to respect input dataset order. If more than one dimensions are bound to category axis and groupData is set to true, chart will automatically group data. If groupData is set to false, input dataset order will always be respected. This property will not work once fields domain in dataset metadata is set.",
            "supportedValueType": "Boolean"
        },
        "general.layout.padding": {
            "defaultValue": 24,
            "description": "Set the universal padding value. This single value is applied to all sides of the chart. Individual settings for each edge are also supported.",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingBottom": {
            "defaultValue": null,
            "description": "Set the padding value for the bottom side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingLeft": {
            "defaultValue": null,
            "description": "Set the padding value for the left side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingRight": {
            "defaultValue": null,
            "description": "Set the padding value for the right side",
            "supportedValueType": "PositiveInt"
        },
        "general.layout.paddingTop": {
            "defaultValue": null,
            "description": "Set the padding value for the top side",
            "supportedValueType": "PositiveInt"
        },
        "interaction.behaviorType": {
            "defaultValue": "hichertBehavior",
            "description": "Switch the behavior type by behavior ID, instead of using default interaction behavior. The behavior is registered via interaction.add(behavior) API. 'noHoverBehavior' is an embeded value where data points details will be thrown when selecting (different from default behavior, which throw the information when hovering).",
            "readonly": false,
            "serializable": true
        },
        "interaction.decorations": {
            "defaultValue": null,
            "description": "Set decorations relating to interaction. Each item that is an object of {name: 'decoration name', fn: 'decoration callback function'} is a decoration. Currently two decorations are supported: showDetail and hideDetail. These two decorations can be used to create a user-defined tooltip. If these 2 decorations are used, the default tooltip is not used, and the user should implement a custom tooltip. The showDetail decoration is called when the tooltip is shown, and the hideDetail decoration is called when the tooltip is hidden. The arguments of showDetail are one object of {mode: 'tooltip mode', data: 'data of hovering selected data point', position: 'mouse position', container: 'chart container dom element', selectedNumber: 'number of selected data points', isAnchored: 'whether tooltip should keep current position or not'}. 'tooltip mode' is either 'infoMode' or 'actionMode'. Hovering over an unselected data point displays the infoMode tooltip, while hovering over a selected data point displays the actionMode tooltip. 'data' is an array of dimensions and measures, where each item is an object of {name: 'dimension name or measure name', value: 'dimension member or measure value', type: 'literal string of dimension or measure'}. For instance, {name: 'Country', value: 'China', type: 'dimension'}, or {name: 'Profit', value: 159, type: 'measure'}. The arguments of hideDetail are a string representing tooltip mode, i.e. what kind of tooltip should be hidden.",
            "serializable": false,
            "supportedValueType": "Array"
        },
        "interaction.deselected.opacity": {
            "defaultValue": 0.2,
            "description": "Set deselected data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.opacity": {
            "defaultValue": 1,
            "description": "Set hovered data point opacity. 0 means completely transparent, and 1 means completely opaque.",
            "supportedValueType": "Number"
        },
        "interaction.hover.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.hover.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of hovered data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.hover.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width. The max width is 4px.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.noninteractiveMode": {
            "defaultValue": false,
            "description": "Set chart rendering mode. When it's true, chart has no interaction, but selection API can work",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.axisLabelSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking axis label",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.legendSelection": {
            "defaultValue": true,
            "description": "Set whether or not the data shown in plot could be selected by clicking legend",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.mode": {
            "defaultValue": "INCLUSIVE",
            "description": "Set the selection mode. If this value is set to 'exclusive' or 'single', only one set of data points can be selected at once. If this value is set to 'inclusive' or 'multiple', multiple sets of data points can be selected at once. If this value is set to 'none', no sets of data points can be selected. The values 'single' and 'multiple' are deprecated; please remove them from your chart.",
            "supportedValueType": "String",
            "supportedValues": "INCLUSIVE, EXCLUSIVE, SINGLE, MULTIPLE, NONE"
        },
        "interaction.selectability.plotLassoSelection": {
            "defaultValue": true,
            "description": "Set whether lasso selection can be used in the plot area. This property doesn't work for Windows Phone",
            "supportedValueType": "Boolean"
        },
        "interaction.selectability.plotStdSelection": {
            "defaultValue": true,
            "description": "Set whether selection can be done in the plot area by clicking and tapping",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.color": {
            "defaultValue": "#3FA9F5",
            "description": "Set hovered data point color",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "interaction.selected.stroke.visible": {
            "defaultValue": true,
            "description": "Set visibility of selected data point stroke.",
            "supportedValueType": "Boolean"
        },
        "interaction.selected.stroke.width": {
            "defaultValue": "2px",
            "description": "Set hovered data point stroke width",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "legend.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for colors in the legend. If this value is set to 'glossy', colors are glossy. If this value is set to 'normal', colors are matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "legend.hoverShadow.color": {
            "defaultValue": "#cccccc",
            "description": "Define the color of the hover shadow in legend.",
            "supportedValueType": "String"
        },
        "legend.isScrollable": {
            "defaultValue": false,
            "description": "Set whether the legend is scrollable. If this value is set to 'false', and there is not enough room to show the whole legend, an ellipsis (...) indicates the missing legend items.",
            "supportedValueType": "Boolean"
        },
        "legend.itemMargin": {
            "defaultValue": 0.5,
            "description": "Set color legend item margin ratio. The actual margin value is calculated by multipling height of the legend item marker/text (whichever is larger) by this ratio.",
            "supportedValueType": "Number"
        },
        "legend.label.style": {
            "description": "Settings for label sytle of legend.",
            "isPrefix": true
        },
        "legend.label.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend label.",
            "supportedValueType": "String"
        },
        "legend.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the legend label.",
            "supportedValueType": "String"
        },
        "legend.marker.size": {
            "defaultValue": null,
            "description": "Set the color legend marker size in pixel",
            "supportedValueType": "Number"
        },
        "legend.mouseDownShadow.color": {
            "defaultValue": "#808080",
            "description": "Set the color of mouseDown shadow.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border": {
            "description": "Set the scrollbar border when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border when scrollable legend is on. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border when scrollable legend is on. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the size of scrollbar spacing when scrollable legend is on. The max value is 4 and the min value is 0.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb": {
            "description": "Set the legend scrollbar thumb when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of legend scrollbar thumb when scrollable legend is on",
            "supportedValueType": "String"
        },
        "legend.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.scrollbar.track": {
            "description": "Set the legend scrollbar track when scrollable legend is on.",
            "isPrefix": true
        },
        "legend.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when scrollable legend is on.",
            "supportedValueType": "String"
        },
        "legend.showFullLabel": {
            "defaultValue": true,
            "description": "If set to true, the legend will not be truncated unless the total width is not enough.",
            "supportedValueType": "Boolean"
        },
        "legend.title.style": {
            "description": "Settings for title style of legend.",
            "isPrefix": true
        },
        "legend.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.text": {
            "defaultValue": null,
            "description": "Set the text of the legend title.",
            "supportedValueType": "String"
        },
        "legend.title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend title",
            "supportedValueType": "Boolean"
        },
        "legend.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the legend",
            "supportedValueType": "Boolean"
        },
        "legendGroup.forceToShow": {
            "defaultValue": false,
            "description": "When legend is set to visible, always show it even chart size is small.",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.alignment": {
            "defaultValue": "topLeft",
            "description": "Change legendGroup alignment.",
            "supportedValueType": "String",
            "supportedValues": "topLeft, center"
        },
        "legendGroup.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "legendGroup.layout.position": {
            "defaultValue": "right",
            "description": "Set the position of the legend group area. When it's \"auto\", responsively layout the legend on the right when chart width is no less than the threshold, and at the bottom when it's smaller. The legend group will be put into bottom instead of right.",
            "supportedValueType": "String",
            "supportedValues": "top, bottom, right, left, auto"
        },
        "legendGroup.layout.respectPlotPosition": {
            "defaultValue": true,
            "description": "To align the legend position with plot area (excl. axis area), otherwise legend will align with the chart plot (excl. chart title).",
            "supportedValueType": "Boolean"
        },
        "legendGroup.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the legend group. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "plotArea.background.border": {
            "description": "Settings for background border of plotArea.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom": {
            "description": "Settings for bottom of border in background.",
            "isPrefix": true
        },
        "plotArea.background.border.bottom.visible": {
            "defaultValue": false,
            "description": "Set the visibility of bottom border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.left.visible": {
            "defaultValue": false,
            "description": "Set the visibility of left border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.right.visible": {
            "defaultValue": false,
            "description": "Set the visibility of right border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.border.stroke": {
            "defaultValue": "#d8d8d8",
            "description": "Settings for the color of the stroke.",
            "supportedValueType": "String"
        },
        "plotArea.background.border.strokeWidth": {
            "defaultValue": 1,
            "description": "Settings for the width of the stroke.",
            "supportedValueType": "Int"
        },
        "plotArea.background.border.top.visible": {
            "defaultValue": false,
            "description": "Set the visibility of top border",
            "supportedValueType": "Boolean"
        },
        "plotArea.background.color": {
            "defaultValue": "transparent",
            "description": "Define the color for the plot area background.",
            "supportedValueType": "String"
        },
        "plotArea.background.drawingEffect": {
            "defaultValue": "normal",
            "description": "Set the drawing effect for the background. If this value is set to 'glossy', the background is glossy. If this value is set to 'normal', the background is matte.",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.background.gradientDirection": {
            "defaultValue": "vertical",
            "description": "Set the direction of the color gradient in the background. This only takes effect if the 'drawingEffect' value is set to 'glossy'.",
            "supportedValueType": "String",
            "supportedValues": "horizontal, vertical"
        },
        "plotArea.background.visible": {
            "defaultValue": true,
            "description": "Set the visibility",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.background.opacity": {
            "defaultValue": 0.8,
            "description": "Set back ground opacity of data label",
            "supportedValueType": "Number"
        },
        "plotArea.dataLabel.formatString": {
            "defaultValue": null,
            "description": "Set format string of data label. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. Any character in \"MDYHSAmdyhsa#?%0@\" is reserved as a token for format code. Simple samples: \"0.00%\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "plotArea.dataLabel.hideWhenOverlap": {
            "defaultValue": true,
            "description": "Set whether data label is hidden when overlapping.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataLabel.position": {
            "defaultValue": null,
            "description": "Set data label display position. 'outsideFirst' means if plot has no space to display data label outside of bar, the data label will be displayed inside.",
            "supportedValueType": "String",
            "supportedValues": "inside,outside,outsideFirst"
        },
        "plotArea.dataLabel.style.color": {
            "defaultValue": null,
            "description": "Set the color of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the data label.",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the data label",
            "supportedValueType": "String"
        },
        "plotArea.dataLabel.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "plotArea.dataLabel.visible": {
            "defaultValue": true,
            "description": "Set visibility of data label",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPoint.stroke.color": {
            "defaultValue": "#000000",
            "description": "Set data point stroke color",
            "supportedValueType": "String"
        },
        "plotArea.dataPoint.stroke.visible": {
            "defaultValue": false,
            "description": "Set visibility of the data point stroke.",
            "supportedValueType": "Boolean"
        },
        "plotArea.dataPointStyle": {
            "defaultValue": null,
            "description": "",
            "supportedValueType": "JsonObject"
        },
        "plotArea.dataPointStyleMode": {
            "defaultValue": "override",
            "description": "This property supports two values : 'update' and 'override'. In 'update' mode, only data points which satisfy the input rules of dataPointStyle will change accordingly, and there is no change in the legend. In 'override' mode, data points which satisfy the input rules of dataPointStyle will change accordingly, and the left data points will follow 'others' display style. The legend items will change accordingly as well.",
            "supportedValueType": "String",
            "supportedValues": "update, override"
        },
        "plotArea.defaultOthersStyle.color": {
            "defaultValue": "#000000",
            "description": "Color to be used for datapoints which are not coverd by semantic rules",
            "supportedValueType": "String"
        },
        "plotArea.drawingEffect": {
            "defaultValue": "normal",
            "supportedValueType": "String",
            "supportedValues": "normal, glossy"
        },
        "plotArea.gridline.color": {
            "defaultValue": "#d8d8d8",
            "description": "Set color of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.size": {
            "defaultValue": 1,
            "description": "Set line stroke width of gridline.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.gridline.type": {
            "defaultValue": "line",
            "description": "Set render type of gridline.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine": {
            "description": "Customize zero gridline. Only takes effect when there is negative value.",
            "isPrefix": true
        },
        "plotArea.gridline.zeroLine.color": {
            "defaultValue": null,
            "description": "Color used to highlight the zero gridline. By default category axis color will be used.",
            "supportedValueType": "String"
        },
        "plotArea.gridline.zeroLine.highlight": {
            "defaultValue": true,
            "description": "Highlight the zero gridline using the color defined in plotArea.gridline.zeroLine.color. And respect other line styles defined in gridline.",
            "supportedValueType": "Boolean"
        },
        "plotArea.gridline.zeroLine.unhighlightAxis": {
            "defaultValue": true,
            "description": "When it's true, use gridline's color on category axis.",
            "supportedValueType": "Boolean"
        },
        "plotArea.isFixedDataPointSize": {
            "defaultValue": false,
            "description": "Enable or disable to use fixed datapoint size layout strategy",
            "supportedValueType": "Boolean"
        },
        "plotArea.lineVisible": {
            "defaultValue": true,
            "description": "Set show line or not.",
            "supportedValueType": "Boolean"
        },
        "plotArea.marker.displayMode": {
            "defaultValue": "manual",
            "description": "If it is auto, the line marker will invisible when line chart big data mode is triggerred, even markerVisible property is true. If it is manual, the line marker behavior is same as before.",
            "supportedValueType": "String"
        },
        "plotArea.marker.shape": {
            "defaultValue": "circle",
            "description": "Set the shape of the markers",
            "supportedValueType": "String",
            "supportedValues": "circle, diamond, triangleUp, triangleDown, triangleLeft, triangleRight, cross, intersection"
        },
        "plotArea.marker.size": {
            "defaultValue": 10,
            "description": "Set the marker size for data points, ranging from '4' to '32'. If you enter a value outside that range, the marker size defaults to '6'.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.marker.visible": {
            "defaultValue": true,
            "description": "Set the visibility of the markers",
            "supportedValueType": "Boolean"
        },
        "plotArea.overlap.offsetPercentage": {
            "defaultValue": 0.5,
            "description": "Settings for the overlap offset percentage.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle": {
            "description": "Set the default style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background": {
            "description": "Set the background of the above and below area of reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.background.opacity": {
            "defaultValue": 0.5,
            "description": "Set the background opacity for the above and below area of reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.color": {
            "defaultValue": "#666666",
            "description": "Set the default color of the reference line.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label": {
            "description": "Set the default label style of the reference line.",
            "isPrefix": true
        },
        "plotArea.referenceLine.defaultStyle.label.background": {
            "defaultValue": "#7a7a7a",
            "description": "Set the default color for the label background.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.color": {
            "defaultValue": "#ffffff",
            "description": "Set the default font color for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontFamily": {
            "defaultValue": "\"Open Sans\", Arial, Helvetica, sans-serif",
            "description": "Set the default font family for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontSize": {
            "defaultValue": "12px",
            "description": "Set the default font size for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the default font style for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the default font weight for the label.",
            "supportedValueType": "String"
        },
        "plotArea.referenceLine.defaultStyle.label.opacity": {
            "defaultValue": 0.8,
            "description": "Set the opacity for the label background.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.size": {
            "defaultValue": 1,
            "description": "Set the default stroke width of the reference line.",
            "supportedValueType": "Number"
        },
        "plotArea.referenceLine.defaultStyle.type": {
            "defaultValue": "dotted",
            "description": "Set the default line type of the reference line.",
            "supportedValueType": "String",
            "supportedValues": "line, dotted"
        },
        "plotArea.referenceLine.line": {
            "defaultValue": null,
            "description": "<div style=\"line-height: 16px;\">\n    <div>\n        Set reference line value & style individually. This property can accept an object using value scale name (i.e. valueAxis) as property name, and an object array as property value, in which the object describes the reference line value and style. If there is no style setting within it, the default style will be adopted.\n    </div>\n    <div>\n        The structure of referenceLine is as following:\n    </div>\n    <div style=\"padding-left: 24px\">\n        <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n            valueAxis\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                SupportedType:\n            </span>\n            ObjectArray\n        </div>\n        <div>\n            <span style=\"color: #BCD; font-weight: bold;\">\n                Description:\n            </span>\n            Lines refers to the primary value scale. Each line should at least contains the value property.\n        </div>\n        <div>\n            The structure of the object in the array is as following:\n        </div>\n        <div style=\"padding-left: 24px; margin-bottom: 4px;\">\n            <div style=\"color: #007dc0; font-weight: normal; line-height: 24px;\">\n                value\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the value of the reference line, which describes the position of the it.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                visible\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Boolean\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                true\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the visibility of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                color\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"#666666\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the color of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                size\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Number\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"1\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the stroke width of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                type\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedValue:\n                </span>\n                [\"line\", \"dotted\"]\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    DefaultValue:\n                </span>\n                \"dotted\"\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the line type of the reference line.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                aboveColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the above background color for the reference line. Must be set with value property. Example: {valueAxis:{value:100, aboveColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                bottomColor\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                String\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the bottom background color for the reference line. Must be set exclusively in a seperate object without other properties. Example: {valueAxis:{value: 100}, {bottomColor: \"#ffffff\"}}.\n            </div>\n            <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                label\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    SupportedType:\n                </span>\n                Object\n            </div>\n            <div>\n                <span style=\"color: #BCD; font-weight: bold;\">\n                    Description:\n                </span>\n                Set the label text & style for the reference line.\n            </div>\n            <div style=\"padding-left: 24px;\">\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    text\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the text of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    visible\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Boolean\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    true\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the visibility of the label.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    background\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    String\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"#7a7a7a\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the color for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    opacity\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Number\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        DefaultValue:\n                    </span>\n                    \"0.8\"\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the opacity for the label background.\n                </div>\n                <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                    style\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        SupportedType:\n                    </span>\n                    Object\n                </div>\n                <div>\n                    <span style=\"color: #BCD; font-weight: bold;\">\n                        Description:\n                    </span>\n                    Set the style of the font for the label.\n                </div>\n                <div style=\"padding-left: 24px;\">\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        color\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"#666666\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font color for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontSize\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"12px\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font size for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontFamily\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"'Open Sans', Arial, Helvetica, sans-serif\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font family for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontWeight\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"bold\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font weight for the label.\n                    </div>\n                    <div style=\"color: #007dc0; font-weight: bold; line-height: 24px;\">\n                        fontStyle\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            SupportedType:\n                        </span>\n                        String\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            DefaultValue:\n                        </span>\n                        \"normal\"\n                    </div>\n                    <div>\n                        <span style=\"color: #BCD; font-weight: bold;\">\n                            Description:\n                        </span>\n                        Set the font style for the label.\n                    </div>\n                </div>\n            </div>\n        </div>\n    </div>\n\n",
            "supportedValueType": "RuleObject"
        },
        "plotArea.scrollbar.border": {
            "description": "Set the scrollbar border.",
            "isPrefix": true
        },
        "plotArea.scrollbar.border.color": {
            "defaultValue": "white",
            "description": "Set the color of scrollbar border. This property only works on desktop.",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.border.width": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar border. The max value is 4 and the min value is 0. This property only works on desktop.",
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.spacing": {
            "defaultValue": 0,
            "description": "Set the width of scrollbar spacing. The max value is 4 and the min value is 0.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "PositiveInt"
        },
        "plotArea.scrollbar.thumb": {
            "description": "Set the scrollbar thumb when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.thumb.fill": {
            "defaultValue": "#e5e5e5",
            "description": "Set the color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.thumb.hoverFill": {
            "defaultValue": "#dedede",
            "description": "Set the hover color of scrollbar thumb when chart is scrollable",
            "supportedValueType": "String"
        },
        "plotArea.scrollbar.track": {
            "description": "Set the scrollbar track when chart is scrollable.",
            "isPrefix": true
        },
        "plotArea.scrollbar.track.fill": {
            "defaultValue": "#f7f7f7",
            "description": "Set the color of scrollbar track when chart is scrollable.",
            "readonly": false,
            "serializable": true,
            "supportedValueType": "String"
        },
        "propertyZone": {
            "defaultValue": null,
            "description": "Zone information of the possible areas that support customization.",
            "readonly": true,
            "serializable": false,
            "supportedValueType": "Object"
        },
        "title.alignment": {
            "defaultValue": "center",
            "description": "Set the alignment of the main title",
            "supportedValueType": "String",
            "supportedValues": "left, center, right"
        },
        "title.layout": {
            "description": "Settings for the layout of the title.",
            "isPrefix": true
        },
        "title.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.layout.maxHeight": {
            "defaultValue": 0.2,
            "description": "Set the max height of the title. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "String"
        },
        "title.style": {
            "description": "Settings for the style of the title.",
            "isPrefix": true
        },
        "title.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontSize": {
            "defaultValue": "16px",
            "description": "Set the font size of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the main title.",
            "supportedValueType": "String"
        },
        "title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the main title.",
            "supportedValueType": "String"
        },
        "title.text": {
            "defaultValue": null,
            "description": "Set the text of the main title",
            "supportedValueType": "String"
        },
        "title.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the main title",
            "supportedValueType": "Boolean"
        },
        "tooltip.background.borderColor": {
            "defaultValue": "#cccccc",
            "description": "Define the background border color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.background.color": {
            "defaultValue": "#ffffff",
            "description": "Define the background color of the tooltip.",
            "supportedValueType": "String"
        },
        "tooltip.formatString": {
            "defaultValue": null,
            "description": "Set the format strings for text in the tooltip. If value type of format string is String, the format string will be used to format all measures. If value type is Object, each format string in the Object will be used to format the measure specified. The following characters are reserved as tokens for format code: MDYHSAmdyhsa#?%0@.The following is examples : \"0.00\", {measureName : \"0.00%\"}.",
            "supportedValueType": "String, Object"
        },
        "tooltip.layinChart": {
            "defaultValue": true,
            "description": "Set whether the tooltip appears in the chart area",
            "supportedValueType": "Boolean"
        },
        "tooltip.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "tooltip.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the tooltip",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisLine": {
            "description": "Settings for the axisLine of the valueAxis.",
            "isPrefix": true
        },
        "valueAxis.axisLine.size": {
            "defaultValue": 1,
            "description": "Set line size of axis.",
            "supportedValueType": "PositiveInt"
        },
        "valueAxis.axisLine.visible": {
            "defaultValue": false,
            "description": "Set visibility of axisline.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.axisTick": {
            "description": "Settings for the valueAxis axisTick.",
            "isPrefix": true
        },
        "valueAxis.axisTick.visible": {
            "defaultValue": true,
            "description": "Set visibility of axis ticks. For mobile, default value will be false.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.color": {
            "defaultValue": null,
            "description": "Set color of both axis line and axis ticker.",
            "supportedValueType": "String"
        },
        "valueAxis.label": {
            "description": "Settings for the valueAxis label.",
            "isPrefix": true
        },
        "valueAxis.label.formatString": {
            "defaultValue": null,
            "description": "Set format string of value axis. Any character in \"MDYHSAmdyhsau#?%0@\" is reserved as a token for format code. The end \"u\" of format string let value format with SI units, the other format string will explained as Excel format string, The value that bigger than 1e8 or less than 1e-6 and be not 0 format with Exponential style. The following is a simple sample format string for label for axis as \"0.00%\".",
            "supportedValueType": "String"
        },
        "valueAxis.label.style": {
            "description": "Settings for the valueAxis label style.",
            "isPrefix": true
        },
        "valueAxis.label.style.color": {
            "defaultValue": "#333333",
            "description": "Set the color of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.style.fontWeight": {
            "defaultValue": "normal",
            "description": "Set the font weight of the axis label.",
            "supportedValueType": "String"
        },
        "valueAxis.label.unitFormatType": {
            "defaultValue": "FinancialUnits",
            "description": "Set the unit format type. If set FinancialUnits, unit K,M,B,T will be applied, eg, 5000 will display as 5K, 5000000 will display as 5M, 5000000000 will display as 5B and so on. If set MetricUnits, unit K,M,G,T will be applied. 5000000000 will display as 5G.",
            "supportedValueType": "String",
            "supportedValues": "FinancialUnits,MetricUnits"
        },
        "valueAxis.label.visible": {
            "defaultValue": true,
            "description": "Set visibility of the axis label",
            "supportedValueType": "Boolean"
        },
        "valueAxis.layout.height": {
            "defaultValue": null,
            "description": "Set the fixed height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxHeight": {
            "defaultValue": 0.25,
            "description": "Set the max height of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.maxWidth": {
            "defaultValue": 0.25,
            "description": "Set the max width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.layout.width": {
            "defaultValue": null,
            "description": "Set the fixed width of the axis. It should be a pixel or a ratio regarding to its container.",
            "supportedValueType": "Number"
        },
        "valueAxis.title": {
            "description": "Settings for the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.applyAxislineColor": {
            "defaultValue": false,
            "description": "Set title color same with axisline color.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.title.style": {
            "description": "Settings for the style of the valueAxis title.",
            "isPrefix": true
        },
        "valueAxis.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontSize": {
            "defaultValue": "14px",
            "description": "Set the font size of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the axis title.",
            "supportedValueType": "String"
        },
        "valueAxis.title.text": {
            "defaultValue": null,
            "description": "Set the text of the axis title",
            "supportedValueType": "String"
        },
        "valueAxis.title.visible": {
            "defaultValue": false,
            "description": "Set visibility of axis title.",
            "supportedValueType": "Boolean"
        },
        "valueAxis.visible": {
            "defaultValue": false,
            "description": "Set the visibility of the axis",
            "supportedValueType": "Boolean"
        },
        "variance1.axisLine.color": {
            "defaultValue": "#ffffff",
            "description": "Set the color of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance1.axisLine.size": {
            "defaultValue": "1px",
            "description": "Set the width/height of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance1.axisLine.style": {
            "defaultValue": "solid",
            "description": "Set the style of the variance axis line.",
            "supportedValueType": "String",
            "supportedValues": "solid, hatching, nonFill, (null)"
        },
        "variance1.layout.proportion": {
            "defaultValue": 0.25,
            "description": "Decide percentage variance plot proportion, and maximum value is 0.4",
            "supportedValueType": "Number"
        },
        "variance1.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the variance title",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the variance title.",
            "supportedValueType": "String"
        },
        "variance1.type": {
            "defaultValue": "absolute",
            "description": "Decide variance plot type",
            "supportedValueType": "String",
            "supportedValues": "absolute, percentage"
        },
        "variance1.visible": {
            "defaultValue": true,
            "description": "Decide whether variance plot is visible or not",
            "supportedValueType": "Boolean"
        },
        "variance2.axisLine.color": {
            "defaultValue": "#ffffff",
            "description": "Set the color of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance2.axisLine.size": {
            "defaultValue": "1px",
            "description": "Set the width/height of the variance axis line.",
            "supportedValueType": "String"
        },
        "variance2.axisLine.style": {
            "defaultValue": "solid",
            "description": "Set the style of the variance axis line.",
            "supportedValueType": "String",
            "supportedValues": "solid, hatching, nonFill, (null)"
        },
        "variance2.layout.proportion": {
            "defaultValue": 0.25,
            "description": "Decide percentage variance plot proportion, and maximum value is 0.4",
            "supportedValueType": "Number"
        },
        "variance2.title.style.color": {
            "defaultValue": "#000000",
            "description": "Set the color of the variance title",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontFamily": {
            "defaultValue": "'Open Sans', Arial, Helvetica, sans-serif",
            "description": "Set the font family of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontSize": {
            "defaultValue": "12px",
            "description": "Set the font size of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontStyle": {
            "defaultValue": "normal",
            "description": "Set the font style of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.title.style.fontWeight": {
            "defaultValue": "bold",
            "description": "Set the font weight of the variance title.",
            "supportedValueType": "String"
        },
        "variance2.type": {
            "defaultValue": "percentage",
            "description": "Decide variance plot type",
            "supportedValueType": "String",
            "supportedValues": "absolute, percentage"
        },
        "variance2.visible": {
            "defaultValue": true,
            "description": "Decide whether variance plot is visible or not",
            "supportedValueType": "Boolean"
        }
    }
};
});