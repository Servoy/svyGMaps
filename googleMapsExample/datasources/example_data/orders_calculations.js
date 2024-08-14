/**
 * @properties={type:12,typeid:36,uuid:"110FFDBC-4511-4A80-8C46-26BF98B7F55C"}
 */
function displayAddressMap()
{
	return shipaddress + ' ' + shipcity + ' ' + shipcountry;
}

/**
 * @properties={type:12,typeid:36,uuid:"8D28CA37-8150-4AF6-8B6E-3A004F856C3B"}
 */
function displayAddress() {
	return [shipaddress,
	shipcity,
	shipcountry + ' ' + shippostalcode].join('\n')
}

/**
 * Returns the calculated total of the order all items + freight
 * @properties={type:8,typeid:36,uuid:"D4BA139C-3E72-48D1-BDD4-ADA10D44F3BE"}
 */
function order_total() {
	var total = 0;
	for (var i = 1; i <= orders_to_order_details.getSize(); i++) {
		var record = orders_to_order_details.getRecord(i);
		total += record.subtotal;
	}
	return total + freight;
}

/**
 * @properties={typeid:36,uuid:"7A518C78-8A03-4C0E-B920-E0EC61E73CD1"}
 */
function orderStatus() {
	// TODO use i18n or Enum
	var status = "New Order";
	if (requireddate) {
		if (shippeddate) {
			status = "Completed";
		} else {
			status = "Planned";
		}
	}
	application.output(status);

	return status;
}

/**
 * @properties={typeid:36,uuid:"A75846F8-1775-4873-AE6F-E46E0C69C9FB"}
 */
function orderStatusStyleClass() {
	switch (orderStatus) {
	case "New Order":
		return "text-info";
		break;
	case "Completed":
		return "text-success";
		break;
	case "Planned":
		return "text-info";
		break;
	default:
		break;
	}
	return "text-info";
}
