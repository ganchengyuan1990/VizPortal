(function() {
	window._CODEMIRRORS = [];
	var items = $('.livedemoFlag');
	for(var i = 0; i < items.length; i ++) {
		
		var item = items[i];
		var itemParent = item.parentElement;
		var urlMsg = item.children[0].value;
		
		$.ajax({
			url: urlMsg,
			async: false,
			data: "html",
			success: function(data) {

				itemParent.removeChild(item);

				// containerDiv to contain iframe and codeDiv
				var containerDiv = document.createElement('div');
				containerDiv.setAttribute('style', 'background-color:transparent;width:100%;height:auto;'
									+ 'overflow-x:hidden;overflow-y:hidden;');

				var iframe = document.createElement('iframe');
				iframe.setAttribute('src', urlMsg);
				iframe.setAttribute('style', 'background-color:transparent;border:0px;width:100%;height:500px;');
				// $(iframe).load(function() {
				// 	$(this).height($(this).contents().height() );
				// 	//$(this).width($(this).contents().width() );
				// });
				containerDiv.appendChild(iframe);
			
				var codeDiv = document.createElement('div');
				codeDiv.setAttribute('class', 'codeDiv');
				codeDiv.className = codeDiv.className + ' demo' + i.toString();
				codeDiv.setAttribute('style', 'display:none;');
				containerDiv.appendChild(codeDiv);
				var codemirror = CodeMirror(codeDiv, {
					height: '500px',
					width: '100%',
					lineNumbers: true,
					mode: 'htmlmixed',
					readOnly: true
				});
				
				codemirror.setValue(data);
				window._CODEMIRRORS.push(codemirror);
				setTimeout(function() {
					codemirror.refresh();
				}, 1);
				itemParent.parentElement.appendChild(containerDiv);	
				
				var btnViewCode = document.createElement('img');
				btnViewCode.setAttribute('style', 'float:right;padding-top:5px;padding-right:10px;top:-20px;'
									+ 'width:68px;height:14px;position:relative;cursor:pointer;');
				btnViewCode.setAttribute('src', 'static/ViewCode_unpressed.png');
				btnViewCode.setAttribute('class', 'unpressed');
				$(btnViewCode).click(function() {
					var _codeDiv = $(this.parentElement).next().find('.codeDiv')[0];
					if (_codeDiv.style.display == 'none') {
						_codeDiv.style.display = '';
						var index = parseInt(_codeDiv.className.substring(12));
						window._CODEMIRRORS[index].refresh();
						btnViewCode.setAttribute('src', 'static/ViewCode_pressed.png');
						btnViewCode.className = 'pressed';

						// foucs the codeeditor, scroll to codeeditor
						$("html,body").animate({scrollTop: _codeDiv.offsetTop});
					} else {
						_codeDiv.style.display = 'none';
						btnViewCode.setAttribute('src', 'static/ViewCode_unpressed.png');
						btnViewCode.className = 'unpressed';
					}
				});
				$(btnViewCode).hover(function() {
					/* Stuff to do when the mouse enters the element */
					if (btnViewCode.className == 'unpressed') {
						btnViewCode.setAttribute('src', 'static/ViewCode_hovered.png');
					}
				}, function() {
					/* Stuff to do when the mouse leaves the element */
					if (btnViewCode.className == 'pressed') {
						btnViewCode.setAttribute('src', 'static/ViewCode_pressed.png');
					} else if (btnViewCode.className == 'unpressed') {
						btnViewCode.setAttribute('src', 'static/ViewCode_unpressed.png');
					}					
				});
				itemParent.appendChild(btnViewCode);
			}
		}); 
		
	}
})();