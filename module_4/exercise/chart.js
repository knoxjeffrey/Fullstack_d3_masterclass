import * as d3 from "d3"

async function draw() {
  const metrics = [
    "pre_build_time",
    "build_time",
    "post_build",
    "total_time"
  ]

  let selectedMetric = metrics[0]

  // 1. Access data
  const dataset = await d3.csv("./data/build_times.csv")

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth,
    height: 700,
    margin: {
      top: 20,
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
    .attr("class", "lollipops")
  bounds.append("g")
    .attr("class", "y-axis")
    .style("transform", `translateY(-5px)`)

  const drawLollipopChart = metric => {

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

    // 5. Helpers

    const updateTransition = d3.transition()
      .duration(500)
      .ease(d3.easeCubicInOut)

    const updateSeconds = secondValue => {
      const element = document.getElementById("time")
      element.style.opacity = "0";
      setTimeout(() => {
        element.innerHTML = secondValue
        element.style.opacity = "1";
      }, 125);
    }

    const handleMouseOver = function(e, data) {
      updateSeconds(data[selectedMetric])
      e.target.parentElement.classList.add("active")
    }

    const handleMouseOut = (e, data) => {
      updateSeconds(0)
      e.target.parentElement.classList.remove("active")
    }

    // 6. Draw data

    let lollipopGroups = bounds.select(".lollipops")
      .selectAll(".lollipop")
      .data(dataset)

    const newLollipopGroups = lollipopGroups.enter().append("g")
      .attr("class", "lollipop")
    
    newLollipopGroups.append("line")
      .attr("x1", 0)
      .attr("x2", 0)
      .attr("y1", d => yScale(yAccessor(d)))
      .attr("y2", d => yScale(yAccessor(d)))
      .style("stroke", "yellowgreen")
    newLollipopGroups.append("circle")
      .attr("cx", 0 )
      .attr("cy", d => yScale(yAccessor(d)))
      .attr("r", "4")
      .style("fill", "#69b3a2")
      .attr("stroke", "black")
    newLollipopGroups.append("rect")
      .attr('x', 0)
      .attr('y', d => yScale(yAccessor(d)) - 4)
      .attr('width', d => xScale(xAccessor(d)))
      .attr('height', 10)
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)

    // update barGroups to include new points
    lollipopGroups = newLollipopGroups.merge(lollipopGroups)
    
    const rects = lollipopGroups.select("rect")
      .transition(updateTransition)
      .attr("width", d => xScale(xAccessor(d)) + 4)
      .transition()
      .style("stroke", "cornflowerblue")

    const lines = lollipopGroups.select("line")
      .transition(updateTransition)
      .attr("x2", d => xScale(xAccessor(d)))
      .transition()
      .style("stroke", "cornflowerblue")

    const circles = lollipopGroups.select("circle")
      .transition(updateTransition)
      .attr("cx", d => xScale(xAccessor(d)))
      .transition()
      .style("stroke", "cornflowerblue")

    // 7. Draw peripherals

    const yAxisGenerator = d3.axisLeft()
      .scale(yScale)
      .tickSize(0)

    const yAxis = bounds.select(".y-axis")
      .transition(updateTransition)
      .call(yAxisGenerator)
  }

  drawLollipopChart(metrics[0])

  metrics.forEach((metric, index) => {
    const button = d3.select(".button-group")
    .append("button")
      .text(metric.replace(/_/g, " "))

    button.node().addEventListener("click", onClick)
    function onClick(e) {
      const buttons = document.querySelectorAll("button")
      buttons.forEach(b => b.classList.remove("selected"))
      e.target.classList.add("selected")
      selectedMetric = metric
      drawLollipopChart(metrics[index])
    }
  })

  document.querySelector("button").classList.add("selected")
}

draw()
