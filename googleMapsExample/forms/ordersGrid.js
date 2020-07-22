
/**
 * Handle record selected.
 *
 * @param {JSEvent} event the event that triggered the action
 *
 * @protected
 *
 * @properties={typeid:24,uuid:"6E374EFD-64F0-4929-B5AE-285AA35512F5"}
 */
function onRecordSelection(event) {
	forms.orderDetail.setMarkers(event, foundset.getSelectedRecords());
}
