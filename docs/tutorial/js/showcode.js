$(function() {
    var jsurl = parent._jsurl;
    var htmlurl = "../../../"+parent._htmlurl;
    var panel = parent._panel;
    var showCode = parent._showCode;
    if(!showCode){
        $("#button-container").remove();
        $("#code-content").remove();
        return;
    }

    $('#button-container').empty();
    $('#code-content').empty();
    
    //$('#chart').append("<div id=\"button-container\" class=\"button-content\" style=\"width: 80%; height: 100%;  margin:auto\">");
    //$('#chart').append("<div id=\"code-content\" style=\"border:1px solid #dddddd; margin:auto; width: 80%; clear:right\"></div>");

    $("#code-content").css({
        "border": "1px solid #dddddd"
    });
    
    var btnCtnr = document.getElementById("button-container");
    var btnRC = document.createElement("button");
    btnRC.id = "code_edit";
    btnRC.innerText = "Run Code";
    var btnJS = document.createElement("button");
    btnJS.id = "js_code";
    btnJS.innerText = "JS";
    var btnHtml = document.createElement("button");
    btnHtml.id = "html_code";
    btnHtml.innerText = "HTML";

    $(btnJS).addClass("button_class");
    $(btnHtml).addClass("button_class");
    $(btnRC).addClass("button_class");

    $(btnJS).css({
        "border-radius" : "0px",
        "margin" : "15px 0px 0px 0px",
        "float" : "left"
    });
    $(btnHtml).css({
        "border-radius" : "0px",
        "margin" : "15px 0px 0px 1px",
    });
    $(btnRC).css({
        "float" : "right"
    });
    
    $(btnJS).bind("click", function() {
        $(btnRC).prop('disabled', false);
        $(btnJS).css({
            "background-color": "#007dc0"
        });
        $(btnHtml).css({
            "background-color": "#3498DB"
        });
        $("#code-content").empty();
        $.get(jsurl, function(data) {
            codeEditor = CodeMirror(textArea, {
                value: data,
                //mode: "htmlmixed",
                lineNumbers: true,
                width: "100%",
                height: "100%",
                readOnly: false
            });
            $(btnRC).off("click");
            $(btnRC).click(function() {
                window.eval(codeEditor.getValue());
            });
        }, "text");
    });

    $(btnHtml).bind("click", function() {
        $(btnRC).prop('disabled', true);
        $(btnHtml).css({
            "background-color": "#007dc0"
        });
        $(btnJS).css({
            "background-color": "#3498DB"
        });
        $("#code-content").empty();
        $.get(htmlurl, function(data) {
            codeEditor = CodeMirror(textArea, {
                value: data,
                //mode: "htmlmixed",
                lineNumbers: true,
                width: "100%",
                height: "100%",
                readOnly: false
            });
        }, "html");
    });


    btnCtnr.appendChild(btnJS);
    btnCtnr.appendChild(btnHtml);
    btnCtnr.appendChild(btnRC);

    var textArea = document.getElementById('code-content');
    var codeEditor;
    $.get(jsurl, function(data) {
        codeEditor = CodeMirror(textArea, {
            value: data,
            //mode: "htmlmixed",
            lineNumbers: true,
            width: "100%",
            height: "100%",
            readOnly: false
        });
        $(btnRC).off("click");
        $(btnRC).click(function() {
            window.eval(codeEditor.getValue());
        });
    }, "text");
});