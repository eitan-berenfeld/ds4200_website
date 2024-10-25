// Define the dimensions and margins for the SVG
let margin = {top: 50, bottom: 50, left: 50, right: 50};
let width = 600;
let height = 400;

// Load the iris dataset
d3.csv("iris.csv").then(function(data) {
    // Convert string values to numbers
    data.forEach(function(d) {
        d.PetalLength = +d.PetalLength;
        d.PetalWidth = +d.PetalWidth;
    });

    // Scatter Plot Section
    let svgScatter = d3.select('#scatter')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightyellow');

    const colorScale = d3.scaleOrdinal()
        .domain(data.map(d => d.Species))
        .range(d3.schemeCategory10);

    let xScaleScatter = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PetalLength))
        .range([margin.left, width - margin.right]);

    let yScaleScatter = d3.scaleLinear()
        .domain(d3.extent(data, d => d.PetalWidth))
        .range([height - margin.bottom, margin.top]);

    // Add circles for scatter plot
    svgScatter.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScaleScatter(d.PetalLength))
        .attr('cy', d => yScaleScatter(d.PetalWidth))
        .attr('r', 5)
        .attr('fill', d => colorScale(d.Species));

    // Add x-axis to scatter plot
    svgScatter.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScaleScatter));

    // Add y-axis to scatter plot
    svgScatter.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScaleScatter));

    // Box Plot Section
    let svgBoxplot = d3.select('#boxplot')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .style('background', 'lightyellow');

    let xScaleBoxplot = d3.scaleBand()
        .domain(data.map(d => d.Species))
        .range([margin.left, width - margin.right])
        .padding(0.5);

    let yScaleBoxplot = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.PetalLength)])
        .range([height - margin.bottom, margin.top]);

    const rollupFunction = function(groupData) {
        const values = groupData.map(d => d.PetalLength).sort(d3.ascending);
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const iqr = q3 - q1;
        const min = Math.max(d3.min(values), q1 - 1.5 * iqr);
        const max = Math.min(d3.max(values), q3 + 1.5 * iqr);
        return { q1, median, q3, min, max };
    };

    const quartilesBySpecies = d3.rollup(data, rollupFunction, d => d.Species);

    quartilesBySpecies.forEach((quartiles, species) => {
        const x = xScaleBoxplot(species);
        const boxWidth = xScaleBoxplot.bandwidth();

        // Draw vertical line for min to max
        svgBoxplot.append("line")
            .attr("x1", x + boxWidth / 2)
            .attr("x2", x + boxWidth / 2)
            .attr("y1", yScaleBoxplot(quartiles.min))
            .attr("y2", yScaleBoxplot(quartiles.max))
            .attr("stroke", "black");

        // Draw the box
        svgBoxplot.append("rect")
            .attr("x", x)
            .attr("width", boxWidth)
            .attr("y", yScaleBoxplot(quartiles.q3))
            .attr("height", yScaleBoxplot(quartiles.q1) - yScaleBoxplot(quartiles.q3))
            .attr("fill", "lightblue")
            .attr("stroke", "black");

        // Draw the median line
        svgBoxplot.append("line")
            .attr("x1", x)
            .attr("x2", x + boxWidth)
            .attr("y1", yScaleBoxplot(quartiles.median))
            .attr("y2", yScaleBoxplot(quartiles.median))
            .attr("stroke", "black");
    });

    // Add x-axis to box plot
    svgBoxplot.append('g')
        .attr('transform', `translate(0, ${height - margin.bottom})`)
        .call(d3.axisBottom(xScaleBoxplot));

    // Add y-axis to box plot
    svgBoxplot.append('g')
        .attr('transform', `translate(${margin.left}, 0)`)
        .call(d3.axisLeft(yScaleBoxplot));
});
