/*global define*/
define('app/empty-graphs', ['jquery', 'MG'], function($, MG) {

  // Filling in empty data for now
  $(function() {

    MG.data_graphic({
      chart_type: 'missing-data',
      width: 335,
      height: 320,
      left: 60,
      animate_on_load: true,
      target: '#devtools-toolbox-opened-ratio-chart'
    });

  }); // end $()

}); // end define
