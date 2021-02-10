import * as d3 from "d3"

async function drawBars() {

  // 1. Access data
  const dataset = await d3.csv("./data/build_times.csv")

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 400,
    margin: {
      top: 80,
      right: 50,
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

  const wrapper = d3.select("#wrapper")
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const bounds = wrapper.append("g")
      .style("transform", `translate(${dimensions.margin.left}px, ${dimensions.margin.top}px)`)

  // init static elements
  bounds.append("g")
    .attr("class", "bars")
  bounds.append("g")
    .attr("class", "x-axis")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)
    .append("text")
    .attr("class", "x-axis-label")

  const drawBarChart = metric => {
    const metricAccessor = d => d.build_number
    const yAccessor = d => +d[metric]

    // 4. Create scales
    const xScale = d3.scaleBand()
      .domain(dataset.map(metricAccessor))
      .range([0, dimensions.boundedWidth])

    const yScale = d3.scaleLinear()
      .domain(d3.extent(dataset, yAccessor))
      .range([dimensions.boundedHeight, 0])
      .nice()

    // 5. Draw data

    const barPadding = 1

    const updateTransition = d3.transition()
      .duration(500)
      .ease(d3.easeCubicInOut)
    const exitTransition = d3.transition()
      .duration(500)
      .ease(d3.easeCubicInOut)

    let barGroups = bounds.select(".bars")
      .selectAll(".bar")
      .data(dataset)

    const oldBarGroups = barGroups.exit()
    oldBarGroups.selectAll("rect")
      .style("fill", "red")
      .transition(exitTransition)
      .attr("height", 0)
      .attr("y", d => dimensions.boundedHeight)
    oldBarGroups.selectAll("text")
      .transition(exitTransition)
      .attr("y", dimensions.boundedHeight)
    oldBarGroups.transition(exitTransition)
      .remove()

    const newBarGroups = barGroups.enter().append("g")
      .attr("class", "bar")
    newBarGroups.append("rect")
      .attr("x", d => xScale(metricAccessor(d)))
      .attr("y", d => dimensions.boundedHeight)
      .attr("width", xScale.bandwidth())
      .attr("height", 0)
      .style("fill", "yellowgreen")
    newBarGroups.append("text")
      .attr("x", d => xScale(metricAccessor(d)))
      .attr("y", dimensions.boundedHeight)

    // update barGroups to include new points
    barGroups = newBarGroups.merge(barGroups)
    
    const barRects = barGroups.select("rect")
      .transition(updateTransition)
      .attr("x", d => xScale(metricAccessor(d)))
      .attr("y", d => yScale(yAccessor(d)))
      .attr("width", xScale.bandwidth())
      .attr("height", d => dimensions.boundedHeight - yScale(yAccessor(d)))
      .transition()
      .style("fill", "cornflowerblue")

    const barText = barGroups.select("text")
      .transition(updateTransition)
      .attr("x", d => xScale(metricAccessor(d)))
      .attr("y", d => yScale(yAccessor(d)) - 5)
      .text(yAccessor)

    // 6. Draw peripherals

    const xAxisGenerator = d3.axisBottom()
      .scale(xScale)

    const xAxis = bounds.select(".x-axis")
      .transition(updateTransition)
      .call(xAxisGenerator)

    const xAxisLabel = xAxis.select(".x-axis-label")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", dimensions.margin.bottom - 10)
      .text(metric)
  }

  const metrics = [
    "pre_build_time",
    "build_time",
    "deploy_time",
    "total_time"
  ]

  let selectedMetricIndex = 0
  drawBarChart(metrics[selectedMetricIndex])

  const button = d3.select("body")
    .append("button")
      .text("Change metric")

  button.node().addEventListener("click", onClick)
  function onClick() {
    selectedMetricIndex = (selectedMetricIndex + 1) % metrics.length
    drawBarChart(metrics[selectedMetricIndex])
  }
}
drawBars()
