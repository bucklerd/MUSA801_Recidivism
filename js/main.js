var oneRecord;
var runningTotal=0;
var progCost = 2000;
var mainData = data;
var accepted = [];
var bdgt = 0;
var tempRec;
var tempData;
var map;
var recid;
var cost;

//Define the table function to build the main ex-offender data table
var table = () => { $('#exOffenderTable').DataTable({
  data: mainData,
  order: [[2, "desc"]],
  columns: [
    {data: 'id_num'},
    {data: 'name'},
    {data: 'probability'}
  ],
  columnDefs:[{
    targets:[0, 3],
    orderable: false,
    defaultContent: "<button class='btn btn-secondary btn-sm disp'>Details</button>" + "<input type='checkbox' class='btn btn-primary btn-sm tally' style='margin-left:.5rem' />"
  }],
  scrollCollapse: true,
  scrollY: '53vh',
  paging: false,
  info: false,
  searching: false,
  info: false
});

//Define button functionality for selecting details of an ex-offender row
$('#exOffenderTable tbody').on( 'click', '.disp', function () {
  oneRecord = $('#exOffenderTable').DataTable().row( $(this).parents('tr') ).data();
  buildDetail();
  $('#dtlClose').show()
} );

//Define checkbox functionality for selecting ex-offender for program list
$('#exOffenderTable tbody').on( 'click', '.tally', function () {
   tempRec = $('#exOffenderTable').DataTable().row( $(this).parents('tr') ).data();
  if($(this).is(":checked")) {
    console.log("checked");
    accepted.push(tempRec);
    runningTotal = runningTotal + progCost;

  } else {
    console.log("unchecked");
    accepted = accepted.filter(function(obj) {
      return obj.id_num != tempRec.id_num
    })
    runningTotal = runningTotal - progCost;

  }
  $('#selectedTable').DataTable().destroy();
  selected();
  statUpdate();
} );

$('#updateTable').on('click', function(){
  mainData = data.filter(function(dat) {
    return (dat.probability >= $('#minScore').val() &
    dat.probability <= $('#maxScore').val()  &
    moment(dat.releaseDate).isBetween($('#startDate').val(), $('#endDate').val()))

  });
  $('#exOffenderTable').DataTable().destroy();
  table();
  accepted=[];
});
};

//When document is ready, run final setup funcitons.
$(document).ready(function() {
  $('#inmateDtls').hide(); //hide detail  table initially
  $('#dtlClose').hide(); //hide close button
  $('#map').hide(); //hide map in about button
  table(); //render main ex-offender datatable
  //On recidivism ratio button click, display map, renderbasemap, ajax call for data, render polygons on map
  $('#recidRatopBtn').on('click', function(){
    console.log("recidRatopBtn");

    $.ajax("https://gist.githubusercontent.com/bucklerd/d453630f398531998f5c2b4a9db00dde/raw/1c7baf67dee2b14eb712104f0639ada14978e6ea/recidRatio.geojson").done(function(dat){
      console.log("Successful Load recidRatio");
      $('#map').show();
      if(recid){ map.removeLayer(recid); }
      if(cost){ map.removeLayer(cost); }
      if(!map) {
        map = L.map('map', {
          center: [36.086818, -79.797872],
          zoom: 10
        })
        var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        }).addTo(map);
      }

      var tempData=JSON.parse(dat);
      recid = L.geoJson(tempData, {style:function(feature){
        return {fillColor: getColor2(feature.properties.recidRatio),
                weight: 1,
                color: 'grey',
                fillOpacity: 0.8
              }
      }}).addTo(map);
    });
  });

  //On costtracks button click, display map, renderbasemap, ajax call for data, render polygons on map
  $('#costTracts').on('click', function(){
    console.log("costTracts");

    $.ajax("https://gist.githubusercontent.com/bucklerd/45f0c0f5b735d20c8781ba50510bd762/raw/586c8541178e72586d555c8bb3cb5e7e03bfe496/costByTracts.geojson").done(function(dat){
      console.log("Successful Load costTracts")
      $('#map').show();
      if(recid){ map.removeLayer(recid); }
      if(cost){ map.removeLayer(cost); }

      if(!map) {
        map = L.map('map', {
          center: [36.086818, -79.797872],
          zoom: 10
        })
        var OpenStreetMap_HOT = L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>'
        }).addTo(map);
      }

      tempData=JSON.parse(dat);
      cost = L.geoJson(tempData, {style:function(feature){
        return {fillColor: getColor(feature.properties.tractCost),
                weight: 1,
                color: 'grey',
                fillOpacity: 0.8
              }
      }}).addTo(map);
    });
  });
});

//Build/rebuild datatable of selected ex-offenders
var selected = () => {
  $('#selectedTable').DataTable({
    data: accepted,
    order: [[1, "desc"]],
    columns: [
      {data: 'name'},
      {data: 'probability'}
    ],
    scrollCollapse: true,
    scrollY: '18vh',
    paging: false,
    info: false,
    searching: false,
    info: false
  });
  $('#selectedTable').show();
};

var id;
var fields = ["name", "releaseDate", "race", "ethnicity", "sex", "age", "mostSeriousCurrentOffense",
"Cnt_Felony_Tot",  "totalSentenceCount", "juvnileOffensesFlag", "days_served_in_doc_custody",
"totalDisciplineInfractions"];

//builds the ex-offender details page
var buildDetail = () => {
  $('#description').hide();
  $('#inmateDtls').hide();
  _.each(fields, function(field){
    $('#' + field).val(eval('oneRecord.' + field));
  });
  $('#inmateDtls').show();
};

//updates tracker stats at bottom of page
var statUpdate = () => {
  runningTotal = progCost * accepted.length;
  $('#costTotal').val(runningTotal);
  var toSpend = bdgt - runningTotal;
  $('#toSpend').val(toSpend);

}

//helper for map renders in About Page
//sets bins for cost-by-tract map
function getColor(d) {
    return d < 150000 ? '#dddddd' :
           d < 350000  ? '#b1a4c7' :
           d < 550000  ? '#846cb0' :
           d < 850000  ? '#543898' :
           d < 2300000   ? '#000080' :
                      '#808080';
}

//helper for map renders in About Page
//sets bins for recidivism ratio map
function getColor2(d) {
    return d < .75 ? '#00c6bb ' :
           d < 1.0  ? '#84b094 ' :
           d < 1.4  ? '#ae996d ' :
           d < 1.75  ? '#ca7f46 ' :
           d < 2.1   ? '#de611c' :
                      '#808080';
}
