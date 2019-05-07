var oneRecord;
var runningTotal=0;
var progCost = 2000;
var mainData = data;
var accepted = [];
var bdgt = 0;
var tempRec;


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
$('#exOffenderTable tbody').on( 'click', '.disp', function () {
  oneRecord = $('#exOffenderTable').DataTable().row( $(this).parents('tr') ).data();
  buildDetail();
  $('#dtlClose').show()
} );
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
});
};


$(document).ready(function() {
  $('#inmateDtls').hide();
  $('#dtlClose').hide();
  //$('#selectedTable').hide();
  table();
} );

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


var buildDetail = () => {
  $('#description').hide();
  $('#inmateDtls').hide();
  _.each(fields, function(field){
    $('#' + field).val(eval('oneRecord.' + field));
  });
  $('#inmateDtls').show();
};


var statUpdate = () => {
  runningTotal = progCost * accepted.length;
  $('#costTotal').val(runningTotal);
  var toSpend = bdgt - runningTotal;
  $('#toSpend').val(toSpend);

}
