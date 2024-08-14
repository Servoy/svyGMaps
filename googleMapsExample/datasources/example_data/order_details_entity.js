/**
 * Record pre-insert trigger.
 * Validate the record to be inserted.
 * When false is returned the record will not be inserted in the database.
 * When an exception is thrown the record will also not be inserted in the database but it will be added to databaseManager.getFailedRecords(),
 * the thrown exception can be retrieved via record.exception.getValue().
 *
 * @param {JSRecord<db:/example_data/order_details>} record record that will be inserted
 *
 * @return {Boolean}
 *
 * @private
 *
 * @properties={typeid:24,uuid:"636B7FFC-63E9-4BC1-A366-5EC7E036A3D9"}
 */
function onRecordInsert(record) {
	// TODO Auto-generated method stub
	application.output('onRecordInser')
	// test if it is valid.
	if (!record.productid) {
		// TODO throw exception
	}
	
	if (!record.quantity) {
		record.quantity = 0;
	}
	
	if (!record.discount) {
		record.discount = 0;
	}
	
	if (!record.unitprice) {
		if (utils.hasRecords(record, "order_details_to_products")) {
			record.unitprice = record.order_details_to_products.unitprice;
		}
	}
	return true
}
