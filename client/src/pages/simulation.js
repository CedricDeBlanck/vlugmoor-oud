import App from "../lib/App";
import { Data, MetaData, HawserData } from "../simulation/dataClasses";
import { Simulation } from "../simulation/simulationClasses";
import Controls from "../simulation/simulationClasses/Controls";

const XLSX = require("xlsx");

const simulationTemplate = require("../templates/simulation.hbs");

// FUNCTIONS

export default () => {
    // render page
    const title = "Simulation page";
    App.render(simulationTemplate({ title }));

    const appInit = async (simulation, files) => {
        // create Controls object
        const controls = new Controls(simulation);
        controls.registerBasicNav();
        controls.registerOutlineSwitch("switch-outline");
        controls.registerRestartButton("restart-bttn");
        controls.registerTimeLine("...");

        // get shipTranslation data
        const shipTranslations = files.forces.map((timePoint) => {
            return timePoint.filter((column, index) => {
                if (
                    index >= files.metaData.bolderData.length &&
                    index < files.metaData.bolderData.length + 3
                ) {
                    return true;
                }
                return false;
            });
        });

        // create data object
        const data = new Data(files.metaData);
        console.log(data);
        // console.log(data.hawserBreakingTimePoints)
        data.addTimePoints(files.coords, files.forces, shipTranslations);
        
        addDataToTimelineOne(data, controls);
        addDataToTimelineTwo(data);
        onBreak(data);

        // SIMULATION
        simulation.addData(data);
        await simulation.init();
        // simulation.registerController();
        await simulation.addShip(files.metaData.caseShip, true);
        await simulation.addShip(files.metaData.passingShip);
        await simulation.addHawsers(
            files.metaData.bolderData,
            files.metaData.hawserLimits,
            data.hawserBreakingTimePoints
        );
        simulation.addFenders(
            files.metaData.fenderData,
            files.metaData.fenderLimits
        );
        simulation.drawShips();
        simulation.play();
    };

    const filesHaveLoaded = (simulation, files) => {
        const keys = Object.keys(files);
        if (
            keys.includes("metaData") &&
            keys.includes("forces") &&
            keys.includes("coords")
        ) {
            appInit(simulation, files);
        }
    };

    const getParsedCSVData = (data) => {
        const parsedData = [];

        const newLinebrk = data.split("\n");
        for (let i = 0; i < newLinebrk.length; i++) {
            parsedData.push(newLinebrk[i].split(","));
        }

        return parsedData;
    };

    // BEGIN SCRIPT

    // create simulation
    const canvasId = "simulation-canvas";
    const simulation = new Simulation(canvasId);

    // get inputfields
    const xlsxInput = document.getElementById("metadata-input");
    const forcesInput = document.getElementById("forces-input");
    const coordsInput = document.getElementById("coords-input");
    const submit = document.getElementById("submit");

    // when files are submitted
    submit.addEventListener("click", (e) => {
        const files = {};

        // read files
        const readerXSLX = new FileReader();
        readerXSLX.onload = (e) => {
            const data = e.target.result;

            const file = XLSX.read(data, { type: "binary" });

            // parse xlsx to formatted MetaData object
            const metaData = new MetaData(file).get();

            // add to files object
            files.metaData = metaData;

            // check if all filess have been loaded
            filesHaveLoaded(simulation, files);
        };
        const readerForces = new FileReader();
        readerForces.onload = (e) => {
            const data = e.target.result;

            // make file readable
            const forces = getParsedCSVData(data);

            // add to files object
            files.forces = forces;

            // check if all filess have been loaded
            filesHaveLoaded(simulation, files);
        };
        const readerCoords = new FileReader();
        readerCoords.onload = (e) => {
            const data = e.target.result;

            // make file readable
            const coords = getParsedCSVData(data);

            // add to files object
            files.coords = coords;

            // check if all filess have been loaded
            filesHaveLoaded(simulation, files);
        };
        readerXSLX.readAsBinaryString(xlsxInput.files[0]);
        readerForces.readAsBinaryString(forcesInput.files[0]);
        readerCoords.readAsBinaryString(coordsInput.files[0]);
    });

    const timeline = document.getElementById('timeline-data-one');

    const addDataToTimelineOne = async (data, controls) => {
        const timelineData = data.hawserBreakingTimePoints;
        const canvasImage = document
            .getElementById("simulation-canvas")
            .toDataURL("image/png");

        console.log("Onze data: " + JSON.stringify(timelineData));
        let timelineHTML =
            '<div class="point defaultpoints"><p>Start</p></div>';
        timelineData.map((timelineDataItem) => {
            timelineHTML += `
            <div class="point">
              <div class="point-info hidden">
                <div class="image-container">
                    <img class="canvas-image" src="${canvasImage}"/>
                </div>
                <p>Hawser ${timelineDataItem.hawserId} has reached the max loadratio <br>at this timepoint: ${timelineDataItem.timePoint}</p>
              </div>
            </div>
            `;
        });
        timelineHTML += '<div class="point defaultpoints"><p>Einde</p></div>';
        timeline.innerHTML = timelineHTML;

        const buttons = document.querySelectorAll(".canvas-image");
        for (let i = 0; i < buttons.length; i++) {
            buttons[i].addEventListener("click", () => {
                controls.setAnimationProgress(timelineData[i].timePoint);
                controls.setPause();
                setTimeout(() => {
                    const canvasScreenshot = document
                        .getElementById("simulation-canvas")
                        .toDataURL("image/png");
                    buttons[i].src = canvasScreenshot;
                }, 100);
            });
        }
    };

    const timelineTwo = document.getElementById('timeline-data-two');

    const addDataToTimelineTwo = async (data) => {
        const timelineData = data.caseMetaData.bolderData;

        console.log("bolderData: " + JSON.stringify(timelineData));
        let timelineHTML = "<div class=\"point defaultpoints\"><p>Start</p></div>";
        timelineData.map((timelineDataItem) => {
            var canvas = document.getElementById("simulation-canvas");
            var img = canvas.toDataURL("image/png");
            timelineHTML += `
            <div class="point">
                <div class="point-info hidden">
                    <img id="canvas-image" src="${img}"></img>
                    <p>X: ${timelineDataItem.posX}</p>
                    <p>Y: ${timelineDataItem.posY}</p>
                    <p>max force: ${timelineDataItem.forceMax} </p>
                </div>
            </div>
            `
        })
        timelineHTML += "<div class=\"point defaultpoints\"><p>Einde</p></div>";
        
        timelineTwo.innerHTML = timelineHTML;
    };
    
    const button = document.getElementById("open-timeline");
    const timelineOneDiv = document.querySelector(".timeline");
    const timelineTwoDiv = document.querySelector(".timeline-two");
    const timelineThreeDiv = document.querySelector(".timeline-three");
    const openTimeline = () => {
        button.addEventListener('click', () => {
            console.log("test");
            timelineOneDiv.classList.toggle("show");
            timelineTwoDiv.classList.toggle("visible");
            timelineThreeDiv.classList.toggle("visible");
        })
    };

    openTimeline();

    const onBreak = async (data) => {
        const timePoints = data.timePoints[3922];
        console.log("Timepoints: " + JSON.stringify(timePoints.hawserData));

        const breaking = data.hawserBreakingTimePoints;
        console.log(JSON.stringify(breaking));


    };
};
