let modelLabel = document.getElementById("modelLabel");
let modelList = document.getElementById("modelDropdown");
let seriesList = document.getElementById("seriesDropdown");
let htmlBody = document.getElementById("mainBody");
let modelDropdownLbl = document.getElementById("modelDropdownLbl");
let seriesDropdownLbl = document.getElementById("seriesDropdownLbl");
let badBtn = document.getElementById("badBtn");
let goodBtn = document.getElementById("goodBtn");
let trayBtn = document.getElementById("trayBtn");
let partBtn = document.getElementById("partBtn");

let imageData;

//adds models based on series clicked
seriesList.addEventListener("click", async e => {
    e.preventDefault();
    while (modelList.firstChild && modelList.removeChild(modelList.firstChild));
    while (htmlBody.firstChild && htmlBody.removeChild(htmlBody.firstChild));

    let seriesName = getTarget().innerHTML;
    seriesDropdownLbl.innerHTML = seriesName;
    modelDropdownLbl.innerHTML = "Select Model: ";

    let data = await fetch("series/" + seriesName).then(res => res.json());
    console.log(data);

    for (let i = 0; i < data.models.length; i++) {
        let newLi = document.createElement("li");
        newLi.innerHTML = data.models[i];
        newLi.className = "dropdown-item";
        newLi.href = "#";
        modelList.appendChild(newLi);
    }
});

//displays images based on model clicked
modelList.addEventListener("click", async e => {
    e.preventDefault();

    while (htmlBody.firstChild && htmlBody.removeChild(htmlBody.firstChild));

    let modelName = getTarget().innerHTML;
    modelDropdownLbl.innerHTML = modelName;

    imageData = await fetch("model/" + encodeURIComponent(modelName)).then(
        res => res.json()
    );

    document.getElementById("badLbl").innerHTML = imageData.Bad.length;
    document.getElementById("goodLbl").innerHTML = imageData.Good.length;
    document.getElementById("trayLbl").innerHTML = imageData.Tray.length;
    document.getElementById("partLbl").innerHTML = imageData.Part.length;

    badBtn.click();
});

badBtn.addEventListener("click", async e => {
    displayImages(imageData.Bad, "danger");
});

goodBtn.addEventListener("click", async e => {
    displayImages(imageData.Good, "success");
});

trayBtn.addEventListener("click", async e => {
    displayImages(imageData.Tray, "default");
});

partBtn.addEventListener("click", async e => {
    displayImages(imageData.Part, "info");
});

async function displayImages(imageData, classStyle) {
    while (htmlBody.firstChild && htmlBody.removeChild(htmlBody.firstChild));

    for (let i = 0; i < imageData.length; i += 2) {
        let predictionStyle = await getPredictionLblStyle(
            imageData[i].prediction
        );
        let imageDiv = document.createElement("div");
        imageDiv.setAttribute("style", "inline-block");

        if (isOdd(imageData.length) && i == imageData.length - 1) {
            imageDiv.innerHTML = `<div class="row">
                                        <div class="col-6">
                                            <h3 style="margin-top: 25px; margin-bottom: 5px"><span class="label label-${classStyle}">Class: ${imageData[i].class}</span></h2>
                                            <h3 style="margin-top: 0px; margin-bottom: 5px"><span class="label label-${predictionStyle}">Prediction: ${imageData[i].prediction}</span></h2>
                                            <h3 style="margin-top: 0px; margin-bottom: 5px"><span class="label label-primary">Probability: ${imageData[i].probability}%</span></h2>
                                            <img src="${imageData[i].imgsrc}" />
                                        </div> 
                                    </div>`;
        } else {
            imageDiv.innerHTML = `<div class="row">
                                        <div class="col-6">
                                            <h3 style="margin-top: 25px; margin-bottom: 5px"><span class="label label-${classStyle}">Class: ${imageData[i].class}</span></h2>
                                            <h3 style="margin-top: 0px; margin-bottom: 5px"><span class="label label-${predictionStyle}">Prediction: ${imageData[i].prediction}</span></h2>
                                            <h3 style="margin-top: 0px; margin-bottom: 5px"><span class="label label-primary">Probability: ${imageData[i].probability}%</span></h2>
                                            <img src="${imageData[i].imgsrc}" />
                                        </div>
                                        <div class="col-6">
                                            <h3 style="margin-top: 25px; margin-bottom: 5px"><span class="label label-${classStyle}">Class: ${imageData[i + 1].class}</span></h2>
                                            <h3 style="margin-top: 0px; margin-bottom: 5px"><span class="label label-${predictionStyle}">Prediction: ${imageData[i + 1].prediction}</span></h2>
                                            <h3 style="margin-top: 0px; margin-bottom: 5px"><span class="label label-primary">Probability: ${imageData[i + 1].probability}%</span></h2>
                                            <img src="${imageData[i + 1].imgsrc}" />
                                        </div>
                                    </div>`;
        }
        htmlBody.appendChild(imageDiv);
    }
}

function getTarget(x) {
    x = x || window.event;
    return x.target || x.srcElement;
}

async function getPredictionLblStyle(prediction) {
    if (prediction === "Good") {
        return "success";
    } else if (prediction === "Bad") {
        return "danger";
    } else if (prediction === "Part Edge") {
        return "info";
    } else {
        return "default";
    }
}

function isOdd(num) {
    return num % 2;
}
