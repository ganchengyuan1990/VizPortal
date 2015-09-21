try {
        $(function() {
            require(["./js/Charts"], function(Chart) {
                Chart.create();
            }); 
        });
    } catch(e) {
        ;
}