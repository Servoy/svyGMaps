/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"CF3D747F-652E-445E-A738-7E5B83A05406"}
 */
var apiKey = '';

/**
 * Callback method for when form is shown.
 *
 * @param {Boolean} firstShow form is shown first time after load
 * @param {JSEvent} event the event that triggered the action
 *
 * @private
 *
 * @properties={typeid:24,uuid:"E9DC7CF8-14F8-4C8C-8697-FB78B56883F3"}
 */
function onShow(firstShow, event) {
	if(!apiKey){
		var input = plugins.dialogs.showInputDialog('API Key Required','Google Maps now requires an API key to submit for every request. Please put your API key here:');
		if(input){
			apiKey = input;
		}
	}
}
