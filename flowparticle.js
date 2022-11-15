class FlowParticle {
    constructor(particleNum) {
        this.resolution = 10;
        this.velocity = createVector();
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(0.05, 0.2));
        this.position = createVector(random(width), random(height));;
        this.maxSpeed = random(1, 2);
        this.acceleration = createVector();
        this.hue = 60;
        this.consthue = 60;
    }
    move() {
        let angle = noise(this.position.x / noiseScale, this.position.y / noiseScale, frameCount / noiseScale) * TWO_PI;
        let dir = createVector();
        dir.x = cos(angle);
        dir.y = sin(angle);
        this.acceleration = dir.copy();
        var d = 1;
        this.acceleration.mult(this.maxSpeed * d);
    }
    edges() {
        if (this.position.x > width || this.position.x < 0 || this.position.y > height || this.position.y < 0) {
            this.position.x = random(width * 1.2);
            this.position.y = random(height);
        }
    }

    flee(target) {
        let d = dist(this.position.x, this.position.y, target.x, target.y);
        if (d < 80) {
            let diff = createVector();
            diff.x = this.position.x - target.x;
            diff.y = this.position.y - target.y;
            diff.div(d);
            diff.mult(2);
            this.position.add(diff);
        }
    }

    update() {
        this.position.sub(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    nearPerson(target, hue) {
        let d = dist(this.position.x, this.position.y, target.x, target.y);
        if (d < 200) {
            this.hue = hue;
        } else {
        }
    }

    setHue(hue) {
        if(hue.length>1) {
        let huenum = int(random(hue.length));
        this.hue = hue[huenum];
        }
        //console.log(hue.length);
    }

    show(hue) {
        this.move();
        this.edges();
        this.update();
        this.setHue(hue);
        fieldbg.colorMode(HSL, 100);
        fieldbg.fill(this.hue, 50, map(acos(this.acceleration.x), 0, TWO_PI, 0, 100), 20);
        fieldbg.ellipse(this.position.x, this.position.y, 5);
        this.hue+= 0.01;
        if(this.hue>100) {
            this.hue = 0;
        }
    }

}