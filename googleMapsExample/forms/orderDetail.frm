customProperties:"formComponent:false",
dataSource:"db:/example_data/orders",
encapsulation:60,
items:[
{
anchors:3,
dataProviderID:"enableClusterMode",
displayType:4,
location:"561,397",
onDataChangeMethodID:"7F69F525-AD63-430E-BDA6-48C1E4358223",
size:"216,20",
text:"Cluster",
typeid:4,
uuid:"0F8D8224-7309-497A-9E90-485577616EBB"
},
{
anchors:11,
displaysTags:true,
location:"20,250",
size:"590,30",
styleClass:"label_header_1",
text:"Map View",
typeid:7,
uuid:"14980A6A-2F43-4BC1-82CA-CF07FBAEAF85"
},
{
anchors:3,
location:"561,500",
size:"80,20",
text:"Route details",
typeid:7,
uuid:"207558BA-CAD9-4211-B010-5D9997C2038C"
},
{
labelFor:"shipcity",
location:"350,120",
name:"shipcity_label",
size:"260,20",
text:"City",
transparent:true,
typeid:7,
uuid:"340D9228-782A-429D-AA2A-4D35457A7F08"
},
{
dataProviderID:"shipaddress",
location:"350,80",
name:"shipaddress",
size:"260,30",
text:"Address",
typeid:4,
uuid:"37D41D03-6168-4E36-9968-4074AF33F0F4"
},
{
anchors:11,
displaysTags:true,
location:"20,20",
size:"590,30",
styleClass:"label_header_1",
text:"Order #%%orderid%% > %%orders_to_customers.companyname%%",
typeid:7,
uuid:"38D509BF-2A18-4CB2-B3D7-3E12803711CD"
},
{
anchors:15,
json:{
KmlLayerURL:"KmlLayerURL",
address:"displayAddressMap",
anchors:15,
apiKey:"apiKey",
directionsSettings:{
svyUUID:"97B5FD94-A2D6-4B48-B13E-7FE90486CF98"
},
disableStreetview:true,
fullscreenControl:false,
location:{
x:20,
y:290
},
mapType:null,
mapTypeControl:false,
markers:[
{
addressDataprovider:"displayAddressMap",
svyUUID:"A64212E5-4D05-4A7D-8662-618EA118E5CE"
}
],
onRouteChanged:"1162BE1C-9833-4717-B179-F589CDE762E5",
size:{
height:322,
width:534
},
streetViewControl:false,
streetviewControl:true,
styleClass:"tabpanel-border",
useGoogleMapCluster:false,
useGoogleMapDirections:false,
zoomControl:false,
zoomLevel:"zoomLevel"
},
location:"20,290",
name:"map",
size:"534,322",
typeName:"googlemaps-svy-G-Maps",
typeid:47,
uuid:"39852305-1923-42D7-B6EC-91B05C6A3493"
},
{
labelFor:"orderdate",
location:"20,180",
name:"orderdate_label",
size:"260,20",
text:"Ordered",
transparent:true,
typeid:7,
uuid:"3AE1799D-58EC-4164-84F4-680244D14C52"
},
{
anchors:3,
json:{
anchors:3,
dataProviderID:"zoomLevel",
location:{
x:561,
y:316
},
max:20,
min:5,
size:{
height:29,
width:215
}
},
location:"561,316",
name:"slider_1",
size:"215,29",
typeName:"servoycore-slider",
typeid:47,
uuid:"430F201E-B757-4006-BEF6-815534B4FD7D"
},
{
anchors:3,
location:"668,446",
name:"centerLoc",
onActionMethodID:"07A118DF-55C8-491D-8DFC-BBE868506F72",
size:"110,23",
text:"Center lat/lng",
typeid:7,
uuid:"4C0134F0-CAA2-4E7E-B31E-00DB2F49F44D"
},
{
labelFor:"customerid",
location:"20,60",
name:"customerid_label",
size:"260,20",
text:"Customer",
transparent:true,
typeid:7,
uuid:"55E97BB2-DC92-46A5-B13E-83097E3D8FB7"
},
{
dataProviderID:"employeeid",
location:"20,140",
name:"employeeid",
size:"260,30",
text:"Sales Rep",
typeid:4,
uuid:"5F2B5236-1549-4D79-A417-8D56AD32BC43"
},
{
anchors:3,
labelFor:"shipcountry",
location:"560,290",
name:"shipcountry_labelc",
size:"216,20",
text:"Zoom level",
transparent:true,
typeid:7,
uuid:"6BCB09DA-A54D-4E5D-A29F-627A6FACD3BD"
},
{
anchors:7,
dataProviderID:"routeDetails",
displayType:1,
editable:false,
location:"561,518",
size:"215,95",
typeid:4,
uuid:"7280C6EF-BA42-460C-B54B-39A8BACE2CA8"
},
{
height:618,
partType:5,
typeid:19,
uuid:"74E45EC6-FE67-4803-81CB-317AD076849F"
},
{
labelFor:"employeeid",
location:"20,120",
name:"employeeid_label",
size:"260,20",
text:"Sales Rep",
transparent:true,
typeid:7,
uuid:"7B3398E5-F32E-4B47-832D-ED2E3C6867F1"
},
{
dataProviderID:"shipcountry",
location:"350,200",
name:"shipcountry",
size:"260,30",
text:"Country",
typeid:4,
uuid:"93652D46-EC83-45AA-9C9A-90FBDBB6BF82"
},
{
dataProviderID:"orderdate",
displayType:5,
location:"20,200",
name:"orderdate",
size:"260,30",
text:"Ordered",
typeid:4,
uuid:"943DCD6C-4A96-40AB-A177-C084A130A410"
},
{
anchors:3,
location:"559,422",
name:"enableKML",
onActionMethodID:"6914FAA1-EA79-4865-A249-740EE6551BA6",
size:"219,20",
text:"Enable Chicago KML",
typeid:7,
uuid:"995CB002-F6FD-4D22-8899-34920D0EF773"
},
{
anchors:3,
location:"560,446",
name:"centerAddress",
onActionMethodID:"07A118DF-55C8-491D-8DFC-BBE868506F72",
size:"103,23",
text:"Center address",
typeid:7,
uuid:"A624D70C-3290-4B25-9D07-4B1DC535C41D"
},
{
dataProviderID:"shipcity",
location:"350,140",
name:"shipcity",
size:"260,30",
text:"City",
typeid:4,
uuid:"AA15238C-5E85-43C8-80EA-F533D42E5C0F"
},
{
labelFor:"shipaddress",
location:"350,60",
name:"shipaddress_label",
size:"260,20",
text:"Address",
transparent:true,
typeid:7,
uuid:"C24DA9F0-F189-4A40-A9D5-FBB8EFBB6E3C"
},
{
labelFor:"shipcountry",
location:"350,180",
name:"shipcountry_label",
size:"260,20",
text:"Country",
transparent:true,
typeid:7,
uuid:"DFE2B6A5-E79E-4C89-868C-DBCB6BB0BED9"
},
{
dataProviderID:"customerid",
location:"20,80",
name:"customerid",
size:"260,30",
text:"Customer",
typeid:4,
uuid:"ECD7B519-BCD0-49E2-8E6E-CA384C0C4CC2",
valuelistID:"46AC7E83-19D0-40B1-B20D-D544218C7D56"
},
{
anchors:3,
dataProviderID:"enablePrivacy",
displayType:4,
location:"561,349",
size:"216,20",
text:"Privacy mode",
typeid:4,
uuid:"F4952ED8-F276-4335-A307-F756A3F5CA0D"
},
{
anchors:3,
dataProviderID:"enableRoute",
displayType:4,
location:"561,373",
onDataChangeMethodID:"2B39570E-A2E5-4F47-863F-5BBC8B1D71C2",
size:"216,20",
text:"Route",
typeid:4,
uuid:"F7628573-0B9E-4BA2-97C4-889330EB8171"
}
],
name:"orderDetail",
onShowMethodID:"E9DC7CF8-14F8-4C8C-8697-FB78B56883F3",
selectionMode:2,
showInMenu:true,
size:"782,480",
typeid:3,
uuid:"E15DEFF2-D55C-49B0-8C1F-FC17A458C9C1"