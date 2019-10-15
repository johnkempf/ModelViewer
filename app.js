const koa = require("koa");
const koaRouter = require("koa-router");
const path = require("path");
const render = require("koa-ejs");
const fse = require("fs-extra");
const socket = require("socket.io");
const serve = require("koa-static");
const fg = require("fast-glob");
const shortid = require("shortid");
require("dotenv").config();

const app = new koa();
const router = new koaRouter();

const models_dir = process.env.MODELS_DIR;
let imageDir = "C:/Retraining_Images";
let imageSeriesDir;
let cachedModelData = [];

app.use(serve(__dirname, "/public"));
app.use(router.routes()).use(router.allowedMethods());

render(app, {
    root: path.join(__dirname, "views"),
    layout: "layout",
    viewExt: "html",
    cache: false,
    debug: false
});

router.get("/", loadIndex);
router.get("/series/:seriesName", getModels);
router.get("/model/:path", getMislabeledData);
router.get("/img/:key/:imageIndex", getImage);

async function loadIndex(ctx) {
    let seriesList = await fg("**/*11*.png", {
        cwd: imageDir
    });
    let series = seriesList.map(item => {
        pathSplit = item.split("/");
        return pathSplit[0];
    });
    series = Array.from(new Set(series));

    await ctx.render("index", { series: series });
}

async function getModels(ctx) {
    //set imageDir with the correct seriesName
    imageSeriesDir = path.join(imageDir, ctx.params.seriesName);

    let modelPaths = await fg(
        `**/*${ctx.params.seriesName}*/**/mislabeled.*.json`,
        {
            cwd: models_dir
        }
    );

    let test = 10;

    let models = modelPaths
        .map(item => path.dirname(item))
        .sort((a, b) => a.localeCompare(b));

    ctx.type = "application/json";
    ctx.body = { models: models, test: test };
}

async function getMislabeledData(ctx) {
    let modelDirectory = ctx.params.path;

    let mislabeledJsonFileList = await fg("mislabeled.*.json", {
        cwd: path.join(models_dir, modelDirectory),
        absolute: true
    });

    const mislabeledJSON = await fse.readJSON(mislabeledJsonFileList[0]);

    let modelKey;
    let modelFound = cachedModelData.find(
        item => item.modelDirectory === modelDirectory
    );

    if (!modelFound) {
        modelKey = shortid.generate();
        const imagePaths = mislabeledJSON.map(item => item.filename);

        cachedModelData.push({
            key: modelKey,
            modelDirectory,
            imagePaths
        });
    } else {
        modelKey = cachedModelData.find(
            item => item.modelDirectory === modelDirectory
        ).key;
    }

    let indexedJson = mislabeledJSON.map((item, index) => ({
        class: item.class,
        prediction: item.prediction,
        probability: item.probability,
        imgsrc: `/img/${modelKey}/${index}`
    }));

    finalObj = {
        Bad: indexedJson.filter(item => item.class === "Bad"),
        Good: indexedJson.filter(item => item.class === "Good"),
        Tray: indexedJson.filter(item => item.class === "Tray"),
        Part: indexedJson.filter(item => item.class === "Part Edge")
    };

    ctx.type = "application/json";
    ctx.body = finalObj;
}

async function getImage(ctx) {
    let data = cachedModelData.find(item => item.key == ctx.params.key);

    //dont hard code imgdir
    const imgPath = path.join(
        imageSeriesDir,
        data.imagePaths[ctx.params.imageIndex]
    );

    ctx.type = `image/${path.extname(imgPath).substring(1)}`;

    let validFilePath = await fse.pathExists(imgPath);

    if (validFilePath) {
        ctx.body = fse.createReadStream(imgPath);
    } else {
        ctx.body = fse.createReadStream(__dirname + "/public/MissingData.png");
    }
}

const server = app.listen(4000, () => console.log("server started at "));
console.log("Listening at http://127.0.0.1:4000");
//var io = socket(server);
