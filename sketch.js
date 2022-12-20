const school = [];
let numFish = 40;

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
let fish;
let followers = []; 
let followersColors = []; //cor do follower
let followersAssigned = []; //nariz do follower
let colors = [10]
let rightWrist;
let leftWrist;
let nose = [];

let reachedLimit = 3;
let reachedNum = 0;
let reached = false;

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
    fish = loadImage('./assets/fish.svg');
    for (let i = 0; i < 10; i++) {
        colors[i] = random(100);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    //   background(seafloor,50);
    var mouse = createVector(width - mouseX, mouseY);

    push();
    translate(width, 0);
    scale(-1, 1);
    console.log(numposes.length+" poses");
    fieldbg.fill(0, 7);
    fieldbg.noStroke();
    fieldbg.rect(0, 0, width, height);
    if (pose && cam) {
        leftWrist = createVector(map(pose.keypoints[9].position.x, 0, video.width, 0, width), map(pose.keypoints[9].position.y, 0, video.height, 0, height));
        rightWrist = createVector(map(pose.keypoints[10].position.x, 0, video.width, 0, width), map(pose.keypoints[10].position.y, 0, video.height, 0, height));
        for (let i = 0; i < numposes.length; i++) {
            nose[i] = createVector(map(numposes[i].pose.keypoints[0].position.x, 0, video.width, 0, width), map(numposes[i].pose.keypoints[0].position.y, 0, video.height, 0, height));
        }
        for (let i = 0; i < particles.length; i++) {
           particles[i].flee(mouse);
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
            school[i].flock(school, mouse);
            if (numposes.length > prevnumposes) {
                for (let j = prevnumposes; j < numposes.length; j++) {
                    if (getClosestObjectPositions(school, nose[j]).includes(i)) {
                        followers.push(i);
                        followersAssigned.push(j);
                        followersColors.push(colors[j])
                    }
                }
            }
            if (numposes.length < prevnumposes) {
              /*  for (let j = 0; j < 6 * (prevnumposes - numposes.length); j++) {
                    followers.pop();
                    followersAssigned.pop();
                    followersColors.pop();
                    console.log("woop there it is");
                } */
                followers.splice(-(prevnumposes-numposes.length)*6,(prevnumposes-numposes.length)*6);
                followersAssigned.splice(-(prevnumposes-numposes.length)*6,(prevnumposes-numposes.length)*6);
                followersColors.splice(-(prevnumposes-numposes.length)*6,(prevnumposes-numposes.length)*6);
            }
            if (numposes.length < 1) {
                school[i].unfollow();
            }
        } else {
            school[i].flock(school, mouse);
            school[i].unfollow();
        }
    }
    for (let i = 0; i < followers.length; i++) {
        if (pose && cam) {
            school[followers[i]].startFollowing(nose[followersAssigned[i]], followersColors[i], followersAssigned[i]);
        }
    }

    for (let i = 0; i < school.length; i++) {
        school[i].update();
        school[i].show();
    }

    noFill();
    stroke(255);
    strokeWeight(2);
    if (pose && cam) {
        ellipse(getSmoothPosition(mouse).x, getSmoothPosition(mouse).y, 50);
    } else {
        ellipse(mouse.x, mouse.y, 50);
    }
    pop();
    delaycounter++;
    prevnumposes = numposes.length;

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

function getClosestObjectPositions(objects, location) {
    const objectsWithPositions = objects.map((obj, i) => ({
        position: i,
        distance: dist(obj.position.x, obj.position.y, location.x, location.y)
    }));

    objectsWithPositions.sort((a, b) => a.distance - b.distance);

    return objectsWithPositions.slice(0, 6).map(obj => obj.position);
}

function keyPressed() {
    if (key == ' ') {
        cam = !cam;
    }
}
