$(function(doc, panel, height){
    if(!parent._panel){
        return;
    }
    var doc = window.document;
    var panel = parent._panel;

    if(panel){
        var pageBody = doc.body;
        if(doc.getElementById('playground-float-panel')){
            pageBody.removeChild(doc.getElementById('playground-float-panel'));
        };
        if(doc.getElementById('shrink-icon')){
            pageBody.removeChild(doc.getElementById('shrink-icon'));
        };

        var panelDom = document.createElement('div');

        panelDom.id = "playground-float-panel";
        
        $(panelDom).css({
            "position" : "fixed",
            "max-width" : "300px",
            //"max-height" : height*0.6+"px",
            "overflow":"hidden",
            "top" : "20px",
            "right" : "20px",
            "border-left" : "1px solid rgb(191,191,191)",
            "border-right" : "1px solid rgb(191,191,191)",
            "border-bottom" : "1px solid rgb(191,191,191)",
            "border-top" : "1px solid rgb(191,191,191)",
            "background":"white",
            "color":"#7f7f7f",
            "font-family": "'Open Sans' sans-serif"
        });

        $(panelDom).addClass('panel');
        var titleBar= panel.title;
        var titleDom = document.createElement('div');
        $(titleDom).css({
            "width":"100%",
            "height":"24px",
            "line-height":"24px",
            //"border-bottom": "1px solid rgb(191,191,191)",
        });
        var titleText = document.createElement('div');
        var titleImg = document.createElement('img');
        titleImg.id = "shrink-icon";
        titleText.innerText = titleBar;
        titleImg.src = "../../../resources/img/panelexpand.png";
        $(titleText).css({
            "display":"inline",
            "font-weight": "bold",
            "font-size": "14px",
            "color": "#000000",
            "padding":"6px 10px 6px 10px",

        });
        $(titleImg).css({
            "position" : "relative",
            "display":"inline",
            "float":"right",
            "z-index":2,
        }).bind('click',function(e){
            if(e.target.isHidden){
                titleImg.src = "../../../resources/img/panelexpand.png";
                e.target.isHidden = false;
                doc.getElementById("playground-float-panel").style.visibility="visible";
                titleDom.appendChild(titleImg);
                $(titleImg).css({
                    "position" : "relative",
                    "top":"",
                        "left":""
                });
            }else{
                var offset = $(titleImg).offset();
                titleImg.src = "../../../resources/img/panelshrink.png";
                e.target.isHidden = true;
                doc.getElementById("playground-float-panel").style.visibility="hidden";
                doc.body.appendChild(titleImg);
                $(titleImg).css({
                    "position" : "absolute",
                    "top":offset.top,
                    "left":offset.left
                });
            }
        });
        
        titleDom.appendChild(titleText);
        titleDom.appendChild(titleImg);
        panelDom.appendChild(titleDom);

        var sections = panel.sections;
        var functionalPanel = null;
        for(var i in sections){
            var singleSection = sections[i];
            var singleSectionDom = document.createElement('div');
            $(singleSectionDom).css({
                "border-top":"1px solid rgb(191,191,191)",
                "overflow-y": "auto",
                "overflow-x": "hidden"
            });
            if(singleSection.title){
                var SingletitleDom = document.createElement('div');
                SingletitleDom.innerText = singleSection.title;
                $(SingletitleDom).css({
                    "font-weight": "bold",
                    "font-size": "12px",
                    "color": "#000000",
                    "padding":"10px"
                });
                singleSectionDom.appendChild(SingletitleDom);
            }

            if(singleSection.content){
                var domID = singleSection.content;
                var sectionDIV = doc.getElementById(domID);
                singleSectionDom.appendChild(sectionDIV);
                $(singleSectionDom).css({
                    //"max-height": "0px",
                });
                functionalPanel = singleSectionDom;
            }
            if(singleSection.description){
                var descriptionDom = document.createElement('div');
                descriptionDom.innerText = singleSection.description;
                singleSectionDom.appendChild(descriptionDom);
                $(descriptionDom).css({
                    "padding":"10px",
                    "font-size": "12px",
                });
                $(singleSectionDom).css({
                    "max-height": "140px",
                })
            }

            panelDom.appendChild(singleSectionDom);
        }

        pageBody.appendChild(panelDom);
        $(functionalPanel).css({
            //"max-height": height*0.6-$(panelDom).height() +"px",
        });
    }
});