import * as d3 from "d3";

async function drawLineChart() {
  const triedColor = "#D1D1D1"
  const deathsColor = "#FA5C71"
  const textColor = "#777F85"

  const dataset = await d3.csv("./data/witch_trials.csv");
  // Remove data rows with NA for the values I am interested in
  const cleanedDataSet = dataset.filter(data => {
    return data.year !== "NA" && data.tried !== "NA" && data.deaths !== "NA"
  })
  // Group the data by year
  const groupedData = d3.rollup(
    cleanedDataSet, 
    v => ({ tried: d3.sum(v, d => d.tried), deaths: d3.sum(v, d => d.deaths) }),
    d => d.year
  )
  // Convert the grouped data to flat objects
  let structuredGroupedData = []
  groupedData.forEach((value, key, map) => {
    structuredGroupedData.push({ year: new Date(key), tried: value.tried, deaths: value.deaths })
  })
  // Order data by year
  const orderedDataSet = structuredGroupedData.sort((a, b) => {
    // Dates will be cast to numbers automagically:
    return a.year - b.year;
  })
  
  const yAccessor = d => d.tried
  const y2Accessor = d => d.deaths
  const xAccessor = d => d.year

  // 2. Create chart dimensions

  let dimensions = {
    width: window.innerWidth * 0.9,
    legendWidth: window.innerWidth * 0.78,
    height: 500,
    margin: {
      top: 15,
      right: 15,
      bottom: 40,
      left: 60,
    },
  }
  dimensions.boundedWidth = dimensions.width
    - dimensions.margin.left
    - dimensions.margin.right
  dimensions.boundedHeight = dimensions.height
    - dimensions.margin.top
    - dimensions.margin.bottom

  // 3. Draw canvas

  const wrapper = d3.select("#exercise-wrapper")
    .append("svg")
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)

  wrapper.append("circle")
    .attr("cx",dimensions.legendWidth)
    .attr("cy",dimensions.margin.bottom)
    .attr("r", 6)
    .style("fill", triedColor)
  wrapper.append("circle")
    .attr("cx",dimensions.legendWidth)
    .attr("cy",dimensions.margin.bottom + 20)
    .attr("r", 6)
    .style("fill", deathsColor)
  wrapper.append("text")
    .attr("x", dimensions.legendWidth + 20)
    .attr("y", dimensions.margin.bottom)
    .text("Witch trials")
    .attr("alignment-baseline","middle")
    .style("fill", textColor)
  wrapper.append("text")
    .attr("x", dimensions.legendWidth + 20)
    .attr("y", dimensions.margin.bottom + 20)
    .text("Witch deaths")
    .attr("alignment-baseline","middle")
    .style("fill", deathsColor)

  const bounds = wrapper.append("g")
    .style("transform", `translate(${
      dimensions.margin.left
    }px, ${
      dimensions.margin.top
    }px)`)
    .style("isolation", "isolate")

  // 4. Create scales

  const yScale = d3.scaleLog()
    .domain(d3.extent(orderedDataSet, yAccessor))
    .range([dimensions.boundedHeight, 0])

  const y2Scale = d3.scaleSymlog()
    .domain(d3.extent(orderedDataSet, y2Accessor))
    .range([dimensions.boundedHeight, 0])

  const xScale = d3.scaleTime()
    .domain(d3.extent(orderedDataSet, xAccessor))
    .range([0, dimensions.boundedWidth])

  // 5. Draw data

  const triedLineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => yScale(yAccessor(d)))
    .curve(d3.curveBasis)

  const deathsLineGenerator = d3.line()
    .x(d => xScale(xAccessor(d)))
    .y(d => y2Scale(y2Accessor(d)))
    .curve(d3.curveBasis)

  const triedLine = bounds.append("path")
    .attr("d", triedLineGenerator(orderedDataSet))
    .attr("fill", triedColor)
    .attr("stroke", "none")
    .attr("stroke-width", 2)

  const deathsLine = bounds.append("path")
    .attr("d", deathsLineGenerator(orderedDataSet))
    .attr("fill", deathsColor)
    .attr("stroke", "none")
    .attr("stroke-width", 2)
    .style("mix-blend-mode", "multiply")

  // 6. Draw peripherals

  const yAxisGenerator = d3.axisLeft()
      .scale(yScale)
      .ticks(12, "~s")
      .tickSize(0)
      .tickPadding(10)

  const yAxis = bounds.append("g")
    .call(yAxisGenerator)
    .call(g => g.select(".domain")
      .attr("stroke", triedColor)
      .attr("stroke-opacity", "0.5")
    )

  const xAxisGenerator = d3.axisBottom()
    .scale(xScale)
    .tickSize(0)
    .tickPadding(10)

  const xAxis = bounds.append("g")
    .call(xAxisGenerator)
    .style("transform", `translateY(${
      dimensions.boundedHeight
    }px)`)
    .call(g => g.select(".domain")
      .attr("stroke", triedColor)
      .attr("stroke-opacity", "0.5")
    )
}

drawLineChart()
