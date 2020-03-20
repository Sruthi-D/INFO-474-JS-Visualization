'use strict'; 

let context = "";
let regressionConstants = "";

let canvas = document.getElementById('myCanvas');
context = canvas.getContext("2d");
fetch("data/admission_predict.json")
    .then(res => res.json()) 
    .then(data => makeScatterPlot(data)); 

// scatterplot
function makeScatterPlot(data) {
    line(50, 50, 50, 450);
    line(50, 450, 850, 450);

    let axesLimits = findMinMax(data);
    console.log(axesLimits);
    drawAxesTicks(axesLimits);

    for (let i = 0; i < 400; i++) { 
      let canvasPoint = toCanvasPoint(data[i]); 
      context.beginPath();
      context.arc(canvasPoint.x, canvasPoint.y, 3, 0, 2 * Math.PI); 
      context.stroke();
    }

    context.font = "15px Arial";
    context.fillText("TOEFL Score", 400, 510);
    context.fillText("Chance of Admit", 10, 30);

    drawRegressionLine();
}

// find min and max of data 
function findMinMax(data) {
    let toeflScores = data.map((row) => parseInt(row["TOEFL Score"]));
    let admissionRates = data.map((row) => parseFloat(row["Chance of Admit"]));
    regressionConstants = linearRegression(toeflScores, admissionRates);

    let xMax = 120;
    let xMin = 92;
    let yMax = 1;
    let yMin = 0.4;

    let allMaxsAndMins = {
        xMax: xMax,
        xMin: xMin,
        yMax: yMax,
        yMin: yMin
    }
    return allMaxsAndMins;
}

// draw the axes ticks on both axes
function drawAxesTicks(axesLimits) {
    let xMark = axesLimits.xMin; 
    for (let x = 100; x < 850; x += 50) {
        if (xMark > axesLimits.xMax) {
            break;
        }
        line(x, 440, x, 460);
        context.fillText(xMark, x - 5, 480);
        xMark += 2;
    }

    let yMark = axesLimits.yMin; 
    for (let y = 400; y > 50; y -= 50) {
        yMark = Math.round(yMark * 100) / 100; 
        if (yMark > axesLimits.yMax) {
            break;
        }
        line(40, y, 60, y);
        context.fillText(yMark, 15, y + 5);
        yMark += 0.1;
    }
}

// draw a line starting from x1,y1 to x2,y2
function line(x1, y1, x2, y2) {
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.stroke();
}

// convert a data point to canvas coordinates
function toCanvasPoint(point) {
    const xCanvas = (point["TOEFL Score"] - 90) * 25 + 50; // scale the x point
    const yCanvas = 450 - (point["Chance of Admit"] - 0.3) * 500; // scale the y point
    return {
        x: xCanvas,
        y: yCanvas
    }
}

// return a new point with Chance of Admit using Linear Regression Equation
function regressionLine(toeflScore) {
    return {
        "Chance of Admit": Math.round((toeflScore * regressionConstants.a + regressionConstants.b) * 100) / 100,
        "TOEFL Score": toeflScore
    }
}

// Draw the regression line
function drawRegressionLine() {
    let startPoint = regressionLine(90); 
    let endPoint = regressionLine(122); 
    startPoint = toCanvasPoint(startPoint);
    endPoint = toCanvasPoint(endPoint);
    line(startPoint.x, startPoint.y, endPoint.x, endPoint.y);
}

function linearRegression(independent, dependent) {
    let lr = {};
    let independent_mean = arithmeticMean(independent);
    let dependent_mean = arithmeticMean(dependent);
    let products_mean = meanOfProducts(independent, dependent);
    let independent_variance = variance(independent);

    lr.a = (products_mean - (independent_mean * dependent_mean)) / independent_variance;
    lr.b = dependent_mean - (lr.a * independent_mean);
    return lr;
}

function arithmeticMean(data) {
    let total = 0;
    for (let i = 0, l = data.length; i < l; total += data[i], i++);
    return total / data.length;
}

function meanOfProducts(data1, data2) {
    let total = 0;
    for (let i = 0, l = data1.length; i < l; total += (data1[i] * data2[i]), i++);
    return total / data1.length;
}

function variance(data) {
    let squares = [];

    for (let i = 0, l = data.length; i < l; i++) {
        squares[i] = Math.pow(data[i], 2);
    }

    let mean_of_squares = arithmeticMean(squares);
    let mean = arithmeticMean(data);
    let square_of_mean = Math.pow(mean, 2);
    let variance = mean_of_squares - square_of_mean;

    return variance;
}