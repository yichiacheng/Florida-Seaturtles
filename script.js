/*------Load two datasets: a csv file of florida sea-turtle and a geojson file for Florida------*/

var promises = [
  d3.csv("./data/Sea_Turtle_Florida_Time.csv",parseCSV), 
  d3.csv("./data/seaturtle_condition.csv"), 
  d3.json("./geojson/Florida_geomap.json")
];

/*------Loading data------*/

Promise.all(promises).then(function(data) {

console.log(data);

/*------Load Florida sea turtle data 1988 - 2014 Adapted from: https://myfwc.com/research/wildlife/sea-turtles/ ------*/
var turtleData = data[0];

var turtleCondition = data [1]

/*------Load Florida: GEOjson file------*/

var florida = data[2];



/*------Define the dimension of the svg and svg canvas------*/

var width = document.querySelector("#chart").clientWidth;
var height = document.querySelector("#chart").clientHeight;
var svg = d3.select("#chart")
      .append("svg")
      .attr("width", width)
      .attr("height", height);

/*------Create Lengends------*/

var svg2 = d3.select("#legend")

    svg2.append("circle").attr("cx",20).attr("cy",20).attr("r", 5).style("fill", "#58546d")
    svg2.append("circle").attr("cx",20).attr("cy",40).attr("r", 5).style("fill", "#f4d53f")
    svg2.append("circle").attr("cx",20).attr("cy",60).attr("r", 5).style("fill", "#ec697d")
  
    svg2.append("text").attr("x", 40).attr("y", 20).text("Green Turtles").style("font-size", "15px").attr("alignment-baseline","middle")
    svg2.append("text").attr("x", 40).attr("y", 40).text("Loggerhead").style("font-size", "15px").attr("alignment-baseline","middle")
    svg2.append("text").attr("x", 40).attr("y", 60).text("Kemp's Ridley").style("font-size", "15px").attr("alignment-baseline","middle")
      

/*------Make Florida map (by county)-------*/

var projection = d3.geoAlbers()
      .center([13, 27])
      .translate([width/2, height/2])
      .scale(4500);

// Convert GeoJSON into SVG path elements
var path = d3.geoPath().projection(projection);


// Draw the paths for the counties of Florida
  svg.selectAll("path")
    .data(florida.features)
    .enter()
    .append("path")
        .attr("class","county")
        .attr("d", path)
        .attr("fill", );


/*------Update the the scale for the slider bar. From 1988-2014.------*/

var slider = d3.select("#selectYear");

   slider
       .property("min", turtleData[0].year)
       .property("max", turtleData[turtleData.length-1].year)
       .property("value", turtleData[turtleData.length-1].year);

var selectedYear = slider.property("value");


/*------Write the year labels------*/

var yearLabel = svg.append("text")
      .attr("class", "yearLabel")
      .attr("x", 25)
      .attr("y", height - 100)
      .text(selectedYear);
   

var colorScale = d3.scaleOrdinal()
      .domain(["Green turtle", "Loggerhead", "Kemp's ridley"])
      .range([ "#58546d", "#f4d53f","#ec697d"]);


/*------Draw the circles and html slider------*/

function updateMap(year) {

var filtered_data= turtleData.filter(function(d) {
           return d.year == year;
       });


var greencircles = svg.selectAll("circle")
          .data(filtered_data);
       
       greencircles.enter().append("circle")
           .attr("cx", function(d) {
               var proj = projection([d.longitude, d.latitude]);
               return proj[0];
           }).attr("cy", function(d) {
               var proj = projection([d.longitude, d.latitude]);
               return proj[1];            
           }).attr("r", 5)
           .attr("stroke", "white")
           .attr("stroke-weight", 0.2)
           .attr("opacity", 0.8)
           .attr("fill", function(d) { return colorScale(d.commonname); })

       .merge(greencircles)
           .transition()
           .duration(0)
           .attr("cx", function(d) {
               var proj = projection([d.longitude, d.latitude]);
               return proj[0];
           }).attr("cy", function(d) {
               var proj = projection([d.longitude, d.latitude]);
               return proj[1];            
           }).attr("r", 5)
           .attr("stroke", "white")
           .attr("stroke-weight", 0.2)
           .attr("opacity", 0.8)
           .attr("fill", function(d) { return colorScale(d.commonname); });    
           
       greencircles.exit()
           .transition()
           .duration(0)
           .attr("r", 0)
           .remove();
      
    yearLabel.text(year);

    /*------Create tooltips and hover effect------*/

    var tooltip = d3.select("#chart")
    .append("div")
    .attr("class","tooltip");

  svg.selectAll("circle")
  greencircles.on("mouseover", function(d) {
      var cx = +d3.select(this).attr("cx") + 15;
      var cy = +d3.select(this).attr("cy") - 15;

      tooltip.style("visibility","visible")
        
          .style("left",(d3.event.pageX + 25) + "px")
          .style("top", (d3.event.pageY - 28) +"px")
          .html("Species: " + d.commonname + "<br>" + "County: "+ d.county+ "<br>" + "Condition: "+ d.condition);

      svg.selectAll("circle")
          .attr("opacity",0.2);

      d3.select(this)
          .attr("opacity",1);

  }).on("mouseout", function() {
      tooltip.style("visibility","hidden");

      svg.selectAll("circle")
          .attr("opacity",0.8);
  })


   }

 
    // Initialize map
    updateMap(selectedYear);

   
   /*------Upadte the data according the the year slider------*/

    slider.on("input", function() {
        var year = this.value;
        selectedYear = year;
       updateMap(selectedYear);

   })



 function parseCSV(data) {
  var d = {};
  d.county = data.County;
  d.latitude = +data.Latitude;
  d.longitude = +data.Longitude;
  d.year = +data.YEAR_; 
  d.condition = data.CONDITION;
  d.commonname = data.Commonname;
 
  return d;

 }

})

 /*-------------------------------code for assignment finishes here-------------------------------*/




