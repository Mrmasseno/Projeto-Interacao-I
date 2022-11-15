class FlowField {
    constructor(particleNum) {
        this.field = [];
        this.resolution = 10;
        this.cols = width / this.resolution;
        this.rows = height / this.resolution;
        this.pnum = particleNum;
        this.velocity = [];
        this.acceleration = [];
        this.position = [];
        this.maxSpeed = 0.004;
        for (let i = 0; i < this.pnum; i++) {
            this.position[i] = createVector(random(width), random(height));
            this.velocity[i] = createVector();
            this.velocity[i] = p5.Vector.random2D();
            this.velocity[i].setMag(random(0.05, 0.2));
            this.acceleration[i] = createVector();
        }
        this.hue = random(100);
    }
    setNoise() {
        let xoff = 0;
        for (let i = 0; i < this.cols; i++) {
            this.field[i] = []
            let yoff = 0;
            for (let j = 0; j < this.rows; j++) {
                let theta = map(noise(xoff, yoff), 0, 1, 0, TWO_PI);
                this.field[i][j] = createVector(cos(theta), sin(theta));
                // this.field[i][j].mult(15);
                yoff += 0.1;
            }
            xoff += 0.1;
        }
    }
    move(position, velocity) {
        let steer = createVector();
        let column = int(constrain(position.x / this.resolution, 0, this.cols - 1));
        let row = int(constrain(position.y / this.resolution, 0, this.rows - 1));
        steer.add(this.field[column][row]);
        steer.sub(velocity);
        steer.setMag(this.maxSpeed);
        return steer;
    }
    edges(position) {
        if (position.x > width) {
            position.x = random(2 * width / 3);
            position.y = random(height);
        } else if (position.x < 0) {
            position.x = random(2 * width / 3);
            position.y = random(height);
        }
        if (position.y > height) {
            position.x = random(2 * width / 3);
            position.y = random(height);
        } else if (position.y < 0) {
            position.x = random(2 * width / 3);
            position.y = random(height);
        }
        return position;
    }

    flee(target, i) {
        let perception = 100;
        let steer = createVector();
        let d = dist(this.position[i].x, this.position[i].y, target.x, target.y);
        if (d < perception) {
            let diff = p5.Vector.sub(this.position[i], target);
            diff.div(d);
            steer.add(diff);
            steer.setMag(this.maxSpeed*2);
            steer.add(this.velocity);
        }
        return steer;
    }

    update() {
        for (let i = 0; i < this.pnum; i++) {
            this.position[i].sub(this.velocity[i]);
            this.velocity[i].add(this.acceleration[i]);
            this.velocity[i].limit(this.maxSpeed);
            this.acceleration[i].mult(0);
        }
    }


    show(fleeTarget) {
        for (let i = 0; i < this.pnum; i++) {
            let steering = this.move(this.position[i], this.velocity[i]);
            this.acceleration[i].add(steering);
           // this.acceleration[i].add(this.flee(fleeTarget, i));
            this.update();
            this.position[i] = this.edges(this.position[i]);
            fieldbg.noStroke();
            let column = int(constrain(this.position[i].x / this.resolution, 0, this.cols - 1));
            let row = int(constrain(this.position[i].y / this.resolution, 0, this.rows - 1));
            fieldbg.colorMode(HSL, 100);
            fieldbg.fill(this.hue, 50, map(acos(this.field[column][row].x), 0, TWO_PI, 0, 100));
            fieldbg.ellipse(this.position[i].x, this.position[i].y, 5);
        }
    }

    randHue() {
        this.hue = random(100);
    }


}