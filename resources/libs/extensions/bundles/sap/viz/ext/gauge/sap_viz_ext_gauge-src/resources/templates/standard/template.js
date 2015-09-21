var sampleTemplate = 
{
    "id": "standard",
    "name": "Standard",
    "properties": {
        "sap.viz.ext.gauge": {
            title : {
    	        visible : true,
    	        text : "Shooting Performance",
    	        alignment : 'center'
            }
        }
    }
};
sap.viz.extapi.env.Template.register(sampleTemplate);