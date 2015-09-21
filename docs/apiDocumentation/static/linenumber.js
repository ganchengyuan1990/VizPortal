(function() {
    var source = document.getElementsByClassName('prettyprint');
    if (source) {
    	Array.prototype.forEach.call(source, function(sourceDoc, index, arr) {
    		var code = sourceDoc.getElementsByTagName('code')[0],
    			counter = 0,
    			numbered;
    		
    		if (code) {
    			numbered = code.innerHTML.split('\n');
    			numbered = numbered.map(function(item) {
    				counter++;
    				return '<tr><td id="line' + counter + '" class="line">' + counter + '</td>' + '<td class="sample-code">' + item + '</td></tr>';
    			});
    			
    			code.innerHTML = '<table><tbody>' + numbered.join('\n') + '</tbody></table>';    		
    		}
    	});
    }
})();
