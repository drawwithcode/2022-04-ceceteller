/*un disegno guidato step by step dove il "bambino" può prima impostare il suo 
colore di sfondo: ruotando il dispositivo sceglie la gamma, muovendolo mappa il 
colore di quella gamma fra diverse sfumature.
poi ci disegna sopra soffiando nel microfono e facendo spostare il puntino
sliders per scegliere dimensione del tratto e colore

possibilità di selezionare fra delle immagini per avere uno sfondo
e disegnarci sopra con la face mesh



let facemesh;
let video;
let predictions = [];

function setup() {
  createCanvas(windowWidth, windowHeight);
  sfondo = map(mouseX, 0, width, backgrounds[0], backgrounds[10]);

  detailX = createSlider(0);
  detailX.position(50, windowHeight - 80);
  detailX.style("width", "25%");

  detailY = createSlider(0);
  detailY.position(50, windowHeight - 50);
  detailY.style("width", "25%");

  video = createCapture(VIDEO);
  video.size(width, height);

  facemesh = ml5.facemesh(video);
  facemesh.on("face", updatePredictions);

  video.hide();
}

function draw() {
  background(100);
  drawLandmarks();
}

// Draw ellipses over the detected landmarks
function drawLandmarks() {
  for (let i = 0; i < predictions.length; i += 1) {
    const keypoints = predictions[i].scaledMesh;

    // Draw facial keypoints.
    for (let j = 0; j < keypoints.length; j += 1) {
      const [x, y] = keypoints[j];

      fill(color("tomato"));
      ellipse(x, y, 5, 5);
    }
  }
}
function updatePredictions(results) {
  predictions = results;
}
*/

//ruota sfondi
const backgrounds = [
  "#ff4040",
  "#e78d0b",
  "#a7d503",
  "#58fc2a",
  "#18f472",
  "#00bfbf",
  "#1872f4",
  "#582afc",
  "#a703d5",
  "#e70b8d",
  "#ff4040",
];

let video;
let poseNet;
let poses = [];
let pg;
let noseX;
let noseY;
let pNoseX;
let pNoseY;
let bottone;

let fase1 = true;

let lineCol;
let myColor;
let micLevel;

function setup() {
  //imposto tela
  createCanvas(windowWidth, windowHeight);

  //imposto bottone
  bottone = createElement("button", "Start!");

  video = createCapture(VIDEO);
  video.size(width, height);

  pg = createGraphics(width, height);

  // Create a new poseNet method with a single detection
  poseNet = ml5.poseNet(video, modelReady);

  poseNet.on("pose", function (results) {
    poses = results;
  });
  setShakeThreshold(10);

  // Hide the video element, and just show the canvas
  video.hide();
}

function draw() {
  if (fase1 == true) {
    //imposto l'interazione sul colore di sfondo
    bgcol = map(rotationZ, 0, 360, 0, 10);
    background(backgrounds[round(bgcol)]);

    //testo di introduzione
    fill("black");
    textAlign(CENTER);
    text(
      "Place your phone on a table and spin it to chose your background!",
      windowWidth / 2,
      windowHeight / 2
    );

    //callback function per il bottone
    bottone.position(windowWidth / 2, windowHeight / 2);
    bottone.mousePressed(noseDraw);
  } else {
    //fisso il bg con l'ultimo colore visualizzato
    background(backgrounds[round(bgcol)]);

    //nascondo il bottone
    bottone.hide();

    //flippo la traccia della registrazione camera per visualizzarla a specchio
    translate(video.width, 0);
    scale(-1, 1);
    image(pg, 0, 0, width, height);

    // Chiamo la funzione per disegnare con il naso
    drawKeypoints();
    console.log(micLevel);
  }
}

function noseDraw() {
  fase1 = false;
}

// funzione per disegnare sui keypoints del naso
function drawKeypoints() {
  // loop di tutte le posizioni rilevate
  for (let i = 0; i < min(poses.length, 1); i = i + 10) {
    // loop di tutti i keypoints per ogni posizione rilevata
    for (let j = 0; j < poses[i].pose.keypoints.length; j = j + 10) {
      // un keypoint è un'ellisse che descrive una parte del corpo
      let keypoint = poses[i].pose.keypoints[j];
      // tolleranza della traccia del punto
      if (keypoint.score > 0.9) {
        if (j == 0) {
          noseX = keypoint.position.x;
          noseY = keypoint.position.y;

          //disegno della linea
          pg.stroke(255, 50);
          if (mic) {
            micLevel = mic.getLevel();
            let myLine = map(micLevel, 0, 1, 10, width);

            pg.strokeWeight(myLine);
          }
          pg.line(noseX, noseY, pNoseX, pNoseY);

          pNoseX = noseX;
          pNoseY = noseY;
        }
      }
    }
  }
}

// The callback that gets called every time there's an update from the model
function gotPoses(results) {
  poses = results;
}

function modelReady() {
  select("#status").html("model Loaded");
}
function deviceShaken() {
  pg.clear();
}
function mousePressed() {
  userStartAudio();
  mic = new p5.AudioIn();
  mic.start();
}

function touchEnded(event) {
  if (DeviceOrientationEvent && DeviceOrientationEvent.requestPermission) {
    DeviceOrientationEvent.requestPermission();
  }
}
