import * as d3 from "d3";

async function drawScatter() {

  // 1. Access data
  let dataset = await d3.csv("./data/ms_rates.csv")
  // Remove data rows with NA for the values I am interested in
  const cleanedDataSet = dataset.filter(data => {
    return data.latitude !== "NA" && data.ms_rates_per_100000 !== "NA"
  })
  console.log(cleanedDataSet)

  // Take absolute value of latitude. Converting negative numbers to positive allows for a linear
  // trend line if there is a correlation. If negative latitudes are also used then a "V" shaped
  // trend around 0 would be expected. The main point of interest is distance from the equator so
  // north/south doesn't matter
  const xAccessor = d => Math.abs(d.latitude)
  const yAccessor = d => d.ms_rates_per_100000

  // 2. Create chart dimensions

  const width = d3.min([
    window.innerWidth * 0.9,
    window.innerHeight * 0.9,
  ])
  let dimensions = {
    width: width,
    height: width,
    margin: {
      top: 10,
      right: 10,
      bottom: 50,
      left: 50,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#exercise-wrapper-2")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${
        dimensions.margin.left
      }px, ${
        dimensions.margin.top
      }px)`)

  // 4. Create scales

  const xScale = d3.scaleLinear()
    .domain(d3.extent(cleanedDataSet, xAccessor))
    .range([0, dimensions.boundedWidth])

  const yScale = d3.scaleLinear()
    .domain(d3.extent(cleanedDataSet, yAccessor))
    .range([dimensions.boundedHeight, 0])

  // 5. Draw data

  const dots = bounds.selectAll("circle")
    .data(cleanedDataSet)
    .enter().append("circle")
      .attr("cx", d => xScale(xAccessor(d)))
      .attr("cy", d => yScale(yAccessor(d)))
      .attr("r", 4)
      .attr("fill", "skyblue")
      .attr("tabindex", "0")

  // 6. Draw peripherals

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
      .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  const xAxisLabel = xAxis.append("text")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 10)
      .attr("fill", "black")
      .style("font-size", "1.4em")
      .html("Latitude (Ignoring north/south difference)")

  const yAxisGenerator = d3.axisLeft()
    .scale(yScale)
    .ticks(4)

  const yAxis = bounds.append("g")
      .call(yAxisGenerator)

  const yAxisLabel = yAxis.append("text")
      .attr("x", -dimensions.boundedHeight / 2)
      .attr("y", -dimensions.margin.left + 10)
      .attr("fill", "black")
      .style("font-size", "1.4em")
      .text("MS Rates per 100,000")
      .style("transform", "rotate(-90deg)")
      .style("text-anchor", "middle")
}
drawScatter()
