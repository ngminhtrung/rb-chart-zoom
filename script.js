figure01();
figure02();
figure03();
figure04();
figure05();

function figure05() {
    const margin = { 'left': -50, 'top': 80, 'bottom': 20, 'right': 20 };
    const width = 500, height = 120;

    const svg = d3.selectAll(".figure5")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

    const gMain = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + 100 + ")");

    gMain.append("rect")
        .attr("x", 50)
        .attr("y", -25)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "transparent");

    const xScale = d3.scaleLinear()
        .domain([0, 5000])
        .range([100, 500])

    const dataPoints = [1, 1010, 1020, 5000];
    let targetPoint = 1015;

    const k = 10 / (xScale(1020) - xScale(1010));
    const tx = 200 - k * xScale(1010);
    const t = d3.zoomIdentity.translate(tx, 0).scale(k);
    // d3.zoomIdentity là 1 transform có k = 1, tx = ty = 0;
    // t = d3.zoomIdentity.translate(tx, 0).scale(k);
    // t trở thành 1 transform, có k = k, tx=tx, ty = 0;

    const xNewScale = t.rescaleX(xScale);

    const circles = gMain.selectAll("circle")
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "pink")
        .attr("stroke", "red")
        .attr("stroke-width", "0.5px")

    gMain.append("text")
        .attr("x", 300)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("point value");

    gMain.append("text")
        .attr("x", 300)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .text("screen position");

    const xTopAxis = d3.axisTop()
        .scale(xNewScale)
        .ticks(3)

    const gTopAxis = gMain.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0, -15)");

    const xBottomAxis = d3.axisBottom()
        .scale(d3.scaleLinear().domain([100, 500]).range([100, 500]))
        .ticks(3);

    const gBottomAxis = gMain.append("g")
        .classed("x axis bottom", true)
        .attr("transform", "translate(0, 15)");


    const zoom = d3.zoom().on("zoom", zoomed);

    gMain.call(zoom.transform, t);

    function zoomed() {
        const transform = d3.event.transform;
        const xNewScale = transform.rescaleX(xScale);
        const {x, y} = transform;
        document.getElementById("tx").textContent = x.toFixed(1);
        document.getElementById("ty").textContent = y.toFixed(1);
        xTopAxis.scale(xNewScale);
        gTopAxis.call(xTopAxis);

        circles.attr("cx", d => xNewScale(d));
    }
    
    gMain.call(zoom);

    gBottomAxis.call(xBottomAxis);
    gTopAxis.call(xTopAxis);

    function transform() {
        // put points that are 10 values apart 20 pixels apart
        var k = 20 / (xScale(10) - xScale(0))
        // center in the middle of the visible area
        var tx = (xScale.range()[1] + xScale.range()[0]) / 2 - k * xScale(targetPoint)
        var t = d3.zoomIdentity.translate(tx, 0).scale(k)
        return t;
    }

    function transition(selection) {
        let n = dataPoints.length;
        let prevTargetPoint = targetPoint;

        // pick a new point to zoom to
        while (targetPoint == prevTargetPoint) {
            let i = Math.random() * n | 0
            targetPoint = dataPoints[i];
        }

        selection.transition()
            .delay(300)
            .duration(2000)
            .call(zoom.transform, transform)
            .on('end', function () { circles.call(transition); });
    }

    circles.call(transition);

}

function figure04() {
    const margin = { 'left': -50, 'top': 20, 'bottom': 20, 'right': 20 };
    const width = 500, height = 100;

    const svg = d3.selectAll(".figure4")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

    const gMain = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + 80 + ")");

    gMain.append("rect")
        .attr("x", 50)
        .attr("y", -25)
        .attr("width", width)
        .attr("height", height)
        .style("fill", "transparent");

    const xScale = d3.scaleLinear()
        .domain([0, 5000])
        .range([100, 500])

    const dataPoints = [1, 1010, 1020, 5000];

    const k = 10 / (xScale(1020) - xScale(1010));
    const tx = 200 - k * xScale(1010);
    const t = d3.zoomIdentity.translate(tx, 0).scale(k);
    // d3.zoomIdentity là 1 transform có k = 1, tx = ty = 0;
    // t = d3.zoomIdentity.translate(tx, 0).scale(k);
    // t trở thành 1 transform, có k = k, tx=tx, ty = 0;

    const xNewScale = t.rescaleX(xScale);

    const circles = gMain.selectAll("circle")
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "pink")
        .attr("stroke", "red")
        .attr("stroke-width", "0.5px")

    gMain.append("text")
        .attr("x", 300)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("point value");

    gMain.append("text")
        .attr("x", 300)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .text("screen position");

    const xTopAxis = d3.axisTop()
        .scale(xNewScale)
        .ticks(3)

    const gTopAxis = gMain.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0, -15)");

    const xBottomAxis = d3.axisBottom()
        .scale(d3.scaleLinear().domain([100, 500]).range([100, 500]))
        .ticks(3);

    const gBottomAxis = gMain.append("g")
        .classed("x axis bottom", true)
        .attr("transform", "translate(0, 15)");


    const zoom = d3.zoom().on("zoom", zoomed);

    gMain.call(zoom.transform, t);

    function zoomed() {
        const transform = d3.event.transform;
        const xNewScale = transform.rescaleX(xScale);
        const {x, y} = transform;
        document.getElementById("tx").textContent = x.toFixed(1);
        document.getElementById("ty").textContent = y.toFixed(1);
        xTopAxis.scale(xNewScale);
        gTopAxis.call(xTopAxis);

        circles.attr("cx", d => xNewScale(d));
    }
    
    gMain.call(zoom);

    gBottomAxis.call(xBottomAxis);
    gTopAxis.call(xTopAxis);
}

function figure03() {
    const margin = { 'left': -50, 'top': 40, 'bottom': 20, 'right': 20 };
    const width = 500, height = 120;

    const svg = d3.selectAll(".figure3")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

    const gMain = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + 100 + ")");

    const xScale = d3.scaleLinear()
        .domain([0, 5000])
        .range([100, 500])

    const dataPoints = [1, 1010, 1020, 5000];

    const k = 10 / (xScale(1020) - xScale(1010));
    const tx = 200 - k * xScale(1010);
    const t = d3.zoomIdentity.translate(tx, 0).scale(k);

    const xNewScale = t.rescaleX(xScale);

    const circles = 

    gMain.selectAll("circle")
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "pink")
        .attr("stroke", "red")
        .attr("stroke-width", "0.5px")
        .attr("cx", d => t.applyX(xScale(d)));

    gMain.append("text")
        .attr("x", 300)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("point value");

    gMain.append("text")
        .attr("x", 300)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .text("screen position");

    const xTopAxis = d3.axisTop()
        .scale(xNewScale)
        .ticks(3)

    const gTopAxis = gMain.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0, -15)");

    const xBottomAxis = d3.axisBottom()
        .scale(d3.scaleLinear().domain([100, 500]).range([100, 500]))
        .ticks(3);

    const gBottomAxis = gMain.append("g")
        .classed("x axis bottom", true)
        .attr("transform", "translate(0, 15)");

    gBottomAxis.call(xBottomAxis);
    gTopAxis.call(xTopAxis);
}

function figure02() {
    const margin = { 'left': -50, 'top': 20, 'bottom': 20, 'right': 20 };
    const width = 500, height = 120;;

    const svg = d3.selectAll(".figure2")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

    const gMain = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + 100 + ")");

    const xScale = d3.scaleLinear()
        .domain([0, 5000])
        .range([100, 500])

    const dataPoints = [1, 1010, 1020, 5000];

    const k = 10 / (xScale(1020) - xScale(1010));
    const tx = 200 - k * xScale(1010);
    const t = d3.zoomIdentity.translate(tx, 0).scale(k);

    gMain.selectAll("circle")
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "pink")
        .attr("stroke", "red")
        .attr("stroke-width", "0.5px")
        .attr("cx", d => t.applyX(xScale(d)));

    gMain.append("text")
        .attr("x", 300)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("point value");

    gMain.append("text")
        .attr("x", 300)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .text("screen position");

    const xTopAxis = d3.axisTop()
        .scale(xScale)
        .ticks(3)

    const gTopAxis = gMain.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0, -15)");

    const xBottomAxis = d3.axisBottom()
        .scale(d3.scaleLinear().domain([100, 500]).range([100, 500]))
        .ticks(3);

    const gBottomAxis = gMain.append("g")
        .classed("x axis bottom", true)
        .attr("transform", "translate(0, 15)");

    gBottomAxis.call(xBottomAxis);
    gTopAxis.call(xTopAxis);
}

function figure01() {
    const margin = { 'left': -50, 'top': 20, 'bottom': 20, 'right': 20 };
    const width = 500, height = 120;

    const svg = d3.selectAll(".figure1")
        .attr("height", height + margin.top + margin.bottom)
        .attr("width", width + margin.left + margin.right);

    const gMain = svg.append("g")
        .attr("transform", "translate(" + margin.left + "," + 100 + ")");

    const xScale = d3.scaleLinear()
        .domain([0, 5000])
        .range([100, 500])

    const dataPoints = [1, 1010, 1020, 5000];

    gMain.selectAll("circle")
        .data(dataPoints)
        .enter()
        .append("circle")
        .attr("r", 10)
        .attr("fill", "pink")
        .attr("stroke", "red")
        .attr("stroke-width", "0.5px")
        .attr("cx", d => xScale(d));

    gMain.append("text")
        .attr("x", 300)
        .attr("y", -60)
        .attr("text-anchor", "middle")
        .text("point value");

    gMain.append("text")
        .attr("x", 300)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .text("screen position");

    const xTopAxis = d3.axisTop()
        .scale(xScale)
        .ticks(3)

    const gTopAxis = gMain.append("g")
        .classed("x axis", true)
        .attr("transform", "translate(0, -15)");

    const xBottomAxis = d3.axisBottom()
        .scale(d3.scaleLinear().domain([100, 500]).range([100, 500]))
        .ticks(3);

    const gBottomAxis = gMain.append("g")
        .classed("x axis bottom", true)
        .attr("transform", "translate(0, 15)");

    gBottomAxis.call(xBottomAxis);
    gTopAxis.call(xTopAxis);
}

