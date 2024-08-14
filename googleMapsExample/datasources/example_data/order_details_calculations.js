/**
 * @properties={type:8,typeid:36,uuid:"4120E900-D472-4428-BC2F-F1E93831A05D"}
 */
function subtotal()
{
	var amt = quantity * unitprice * (1-discount);
	return parseFloat(amt.toFixed(2));
}
