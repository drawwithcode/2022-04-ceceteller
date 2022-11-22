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
];

const pens = [
  [166, 206, 227, 50],
  [31, 120, 180, 50],
  [178, 223, 138, 50],
  [51, 160, 44, 50],
  [251, 154, 153, 50],
  [227, 26, 28, 50],
  [253, 191, 111, 50],
  [255, 127, 0, 50],
  [202, 178, 214, 50],
  [202, 178, 214, 50],
  [255, 255, 153, 50],
  [177, 89, 4, 50],
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
let bottone2;
let fase1 = true;

let lineCol;
let myColor;
let micLevel;

let myIncrement;
let myFont1;
var cnv;

var strokeColor = 0;

function setup() {
  //imposto tela
  cnv = createCanvas(windowWidth, windowHeight);
  centerCanvas();
  //imposto bottone
  bottone = createElement("button", "START");
  bottone2 = createElement("button", "CHANGE NOSE COLOR");
  //imposto la ripresa della camera
  video = createCapture(VIDEO);
  video.size(width, height);

  //disegno la tela per disegnare solo la linea del naso
  pg = createGraphics(width, height);

  //imposto il modello sul poseNet di ml5
  poseNet = ml5.poseNet(video, modelReady);
  poseNet.on("pose", function (results) {
    poses = results;
  });
  angleMode(DEGREES);

  //nascondo la ripresa video e lascio visibile solo la canva
  video.hide();

  myFont1 = loadFont("fonts/TINY5x3-80.otf");
  myFont2 = loadFont("fonts/TINY5x3-120.otf");
}

function draw() {
  if (fase1 == true) {
    //imposto l'interazione sul colore di sfondo
    bgcol = map(rotationZ, 0, 360, 0, 10);
    background(backgrounds[round(bgcol)]);

    let arcX = windowWidth / 2;
    let arcY = windowHeight - (windowHeight - 80);
    let arcRadius = width / 4;

    myIncrement = 360 / 10;

    push();

    for (i = 0; i < 10; i++) {
      fill(backgrounds[i]);
      arc(
        arcX,
        arcY,
        arcRadius,
        arcRadius,
        myIncrement * i,
        myIncrement * (i + 1)
      );
    }

    //testo di introduzione
    fill("white");
    textAlign(CENTER);
    textFont(myFont2);

    if (width < 400) textSize(30);
    else if (width < 600) textSize(15);
    else if (width > 399) textSize(50);
    text(
      "Place your phone on a table \n spin it to choose your background!",
      windowWidth / 2,
      windowHeight / 2
    );
    //callback function per il bottone
    rectMode(CENTER);

    bottone.style("position", "absolute");
    bottone.style("bottom", "20px");
    bottone.style("left", "20px");
    bottone.style("padding", "10px");
    //bottone.style("padding-bottom", "20px");

    bottone.style("text-align", "center");
    bottone.style("font-family", "TINY5x3-120");
    bottone.style("font-size", "18px");

    bottone.mousePressed(noseDraw);

    bottone2.style("position", "absolute");
    bottone2.style("bottom", "20px");
    bottone2.style("right", "20px");
    bottone2.style("padding", "10px");
    // bottone2.style("padding-bottom", "5px");

    bottone2.style("text-align", "center");
    bottone2.style("font-family", "TINY5x3-120");
    bottone2.style("font-size", "18px");
  } else {
    //fisso il bg con l'ultimo colore visualizzato
    background(backgrounds[round(bgcol)]);
    bottone2.mousePressed(changeColor);
    //nascondo il bottone
    bottone.hide();
    rectMode(CORNER);
    fill("white");

    textFont(myFont2);

    if (width < 400) textSize(30);
    else if (width < 600) textSize(40);
    else if (width > 399) textSize(50);
    text("Draw with nose!", 85, windowHeight - (windowHeight - 20));

    textFont(myFont1);
    if (width < 400) textSize(30);
    else if (width < 600) textSize(40);
    else if (width > 399) textSize(50);
    text(
      "(and with code)",
      windowWidth - 85,
      windowHeight - (windowHeight - 20)
    );

    fill("black");

    textFont(myFont2);
    if (width < 400) textSize(30);
    else if (width < 600) textSize(40);
    else if (width > 399) textSize(50);
    text(
      "Shake the phone \nto clean your drawing",
      windowWidth / 2,
      windowHeight / 2
    );

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
  for (let i = 0; i < min(poses.length, 1); i = i + 4) {
    // loop di tutti i keypoints per ogni posizione rilevata
    for (let j = 0; j < poses[i].pose.keypoints.length; j = j + 4) {
      // un keypoint è un'ellisse che descrive una parte del corpo
      let keypoint = poses[i].pose.keypoints[j];
      // tolleranza della traccia del punto
      if (keypoint.score > 0.2) {
        if (j == 0) {
          noseX = keypoint.position.x;
          noseY = keypoint.position.y;

          //disegno della linea

          pg.stroke(pens[strokeColor]);

          //dimensione della traccia in base al volume rilevato
          if (mic) {
            micLevel = mic.getLevel();
            let myLine = map(micLevel, 0, 1, 25, pg.width);
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

function centerCanvas() {
  var x = (windowWidth - width) / 2;
  var y = (windowHeight - height) / 2;
  cnv.position(x, y);
}

function changeColor() {
  if (strokeColor < pens.length - 1) {
    strokeColor++;
  } else {
    strokeColor = 0;
  }
}
