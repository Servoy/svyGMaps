/**
 * @type {String}
 *
 * @properties={typeid:35,uuid:"4F0D74A6-84F2-4D24-A0FC-99112A287E54"}
 */
var addr = '';

/**
 * @type {String}
 * TODO: add error checking for invalid keys
 * @properties={typeid:35,uuid:"4D8F25D9-51FA-4B66-B8C5-4B2B93DDF749"}
 */
var apiKey = 'Your Google API Key';

/**
 *
 * @param {JSEvent} event
 * @param {String} type
 * @properties={typeid:24,uuid:"2FCFD2F9-7CA6-4B82-94AB-8D26C3E91B59"}
 */
function onAction$switchAddr(event,type) {
	addr = type;
}

/**
 *
 * @param {JSEvent} event
 *
 * @properties={typeid:24,uuid:"67294327-DDA3-4350-A82E-8978E431728D"}
 */
function onAction$switchLayout(event) {
	if (event.getFormName() == 'responsiveLayout') {
		forms.absoluteLayout.show();
	} else {
		forms.responsiveLayout.show();
	}
}
