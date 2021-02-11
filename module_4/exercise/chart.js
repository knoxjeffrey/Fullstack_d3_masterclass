import * as d3 from "d3"

async function drawBars() {

  // 1. Access data
  const dataset = await d3.csv("./data/build_times.csv")

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    height: 700,
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
    .attr("class", "y-axis")
    .append("text")
    .attr("class", "y-axis-label")
    .style("transform", `translateY(${dimensions.boundedHeight}px)`)

  const drawBarChart = metric => {
    const xAccessor = d => +d[metric]
    const yAccessor = d => d.build_number

    // 4. Create scales
    const yScale = d3.scaleBand()
      .domain(dataset.map(yAccessor))
      .range([0, dimensions.boundedHeight - dimensions.margin.bottom])

    const xScale = d3.scaleLinear()
      .domain([0, d3.max(dataset.map(d => d.total_time))])
      .range([0, dimensions.boundedWidth])
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

    const newBarGroups = barGroups.enter().append("g")
      .attr("class", "bar")
    newBarGroups.append("rect")
      .attr("x", 0)
      .attr("y", d => dimensions.boundedHeight)
      .attr("width", 0)
      .attr("height", yScale.bandwidth())
      .style("fill", "yellowgreen")
    newBarGroups.append("text")
      .attr("x", d => xScale(xAccessor(d)))
      .attr("y", dimensions.boundedHeight)

    // update barGroups to include new points
    barGroups = newBarGroups.merge(barGroups)
    
    const barRects = barGroups.select("rect")
      .transition(updateTransition)
      .attr("x", 0)
      .attr("y", d => yScale(yAccessor(d)))
      .attr("width", d => xScale(xAccessor(d)))
      .attr("height", yScale.bandwidth())
      .transition()
      .style("fill", "cornflowerblue")

    const barText = barGroups.select("text")
      .transition(updateTransition)
      .attr("x", d => xScale(xAccessor(d)) + 10)
      .attr("y", d => yScale(yAccessor(d)) + 5)
      .text(xAccessor)

    // 6. Draw peripherals

    const yAxisGenerator = d3.axisLeft()
      .scale(yScale)

    const yAxis = bounds.select(".y-axis")
      .transition(updateTransition)
      .call(yAxisGenerator)

    const yAxisLabel = yAxis.select(".y-axis-label")
      .attr("x", dimensions.boundedWidth / 2)
      .attr("y", 0)
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
