const school = [];
let numFish = 200;

let video;
let poseNet;
let poses = [];
let pose;
let cam = true;

smoothAmt = 30;
pastX = [];
pastY = [];

let numPart = 3000;
let numposes = [];
let prevnumposes = 0;
let fieldbg;
let particles = [numPart];
let noisedelay = 600;
let delaycounter = 0;
let noiseScale = 1200;
let hue = [];
let seafloor;
let fish;

function setup() {
    createCanvas(windowWidth, windowHeight);
  //  alignSlider = createSlider(0, 2, 1, 0.1);
    //cohesionSlider = createSlider(0, 2, 1, 0.1);
  //  separationSlider = createSlider(0, 2, 1, 0.1);
    lastPost = createVector();
    for (let i = 0; i < numFish; i++) {
        school.push(new Fish());
    }
    video = createCapture(VIDEO);
    video.hide();
    poseNet = ml5.poseNet(video, loaded);
    poseNet.on('pose', function (poses) {
        numposes = poses;
        if (poses.length > 0) {
            poses = poses;
            pose = poses[0].pose;
        }
    });
    fieldbg = createGraphics(width, height);
    for (let j = 0; j < numPart; j++) {
        particles[j] = new FlowParticle;
    }
    seafloor = loadImage('assets/seafloor.jpg');
    fish = loadImage('assets/fish.svg');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    //   background(seafloor,50);
    var mouse = createVector(width - mouseX, mouseY);
    console.log(numposes.length);
    if (numposes.length > prevnumposes) {
        for (let i = prevnumposes; i < numposes.length; i++) {
            hue[i] = random(100);
        }
    } else {
        for (let i = numposes.length; i < prevnumposes; i++) {
            hue[i] = null;
        }
    }
    prevnumposes = numposes.length;

    push();
    translate(width, 0);
    scale(-1, 1);
    // console.log(pose);
    fieldbg.fill(0, 7);
    fieldbg.noStroke();
    fieldbg.rect(0, 0, width, height);
    if (pose && cam) {
        var leftWrist = createVector(map(pose.keypoints[9].position.x, 0, video.width, 0, width), map(pose.keypoints[9].position.y, 0, video.height, 0, height));
        var rightWrist = createVector(map(pose.keypoints[10].position.x, 0, video.width, 0, width), map(pose.keypoints[10].position.y, 0, video.height, 0, height));
        var nose = createVector(map(pose.keypoints[0].position.x, 0, video.width, 0, width), map(pose.keypoints[0].position.y, 0, video.height, 0, height));
        for (let i = 0; i < particles.length; i++) {
            particles[i].flee(rightWrist);
            //  particles[i].nearPerson(nose, hue);
            particles[i].show(hue);
        }
    } else {
        for (let i = 0; i < particles.length; i++) {
            particles[i].flee(mouse);
            particles[i].show(hue);
        }
    }
    image(fieldbg, 0, 0);
    tint(255, 30);
    if (cam) {
        image(video, 0, 0, width, height);
    }
    noTint();

    for (let i = 0; i < school.length; i++) {
        school[i].edges();
        if (pose && cam) {
            school[i].flock(school, rightWrist);
        } else {
            school[i].flock(school, mouse);
        }
        school[i].update();
        school[i].show();
    }

    noFill();
    stroke(255);
    strokeWeight(2);
    if (pose && cam) {
        // ellipse(leftWrist.x, leftWrist.y, 50);
        ellipse(getSmoothPosition(rightWrist).x, getSmoothPosition(rightWrist).y, 50);
    } else {
        ellipse(mouse.x, mouse.y, 50);
    }
    pop();
    delaycounter++;
    // console.log(frameRate());
}


function loaded() {
    console.log("PoseNet is loaded");
}

function getSmoothPosition(position) {
    const smoothPos = { x: null, y: null };
    smoothPos.x = this.getSmoothCoord(position.x, pastX);
    smoothPos.y = this.getSmoothCoord(position.y, pastY);

    return smoothPos;
}


function getSmoothCoord(coord, frameArray) {
    if (frameArray.length < 1) {
        for (let i = 0; i < smoothAmt; i++) {
            frameArray.push(coord);
        }
    } else {
        frameArray.shift(); 
        frameArray.push(coord); 
    }
    let sum = 0;
    for (let i = 0; i < frameArray.length; i++) {
        sum += frameArray[i];
    }
    return sum / frameArray.length;
}

function keyPressed() {
    if (key == ' ') {
        cam = !cam;
    }
}