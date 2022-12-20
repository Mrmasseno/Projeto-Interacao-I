class Fish {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(0.5, 1.5));
        this.acceleration = createVector();
        this.maxForce = 0.3;
        this.maxSpeed = 1.5;
        this.size = random(5, 20);
        this.angle = 0;
        this.easing = 0.05;
        this.following = false;
        this.hue = random(0, 100);
        this.color = false;
        this.tempTarget;
        this.followTemp = false;
        this.followTarget;
        this.assigned;
    }

    edges() {
        if (this.position.x > width) {
            this.position.x = 0;
        } else if (this.position.x < 0) {
            this.position.x = width;
        }
        if (this.position.y > height) {
            this.position.y = 0;
        } else if (this.position.y < 0) {
            this.position.y = height;
        }
    }

    flock(fishes, target) {
        let alignment = this.align(fishes);
        let cohesion = this.cohesion(fishes);
        let separation = this.separation(fishes);


        //   alignment.mult(alignSlider.value());
        //  cohesion.mult(cohesionSlider.value());
        //  separation.mult(separationSlider.value());
        separation.mult(1.1);

        this.acceleration.add(alignment);
        if (!this.following) {
            this.acceleration.add(cohesion);
        }
        this.acceleration.add(separation);
        if (pose) {
            let flee = this.flee(target);
            this.acceleration.add(flee);
        }
        if (this.following) {
            this.follow();
            this.convert(fishes);
        }

    }

    align(fishes) {
        let perception = 50;
        let total = 0;
        let steer = createVector();
        for (let i = 0; i < fishes.length; i++) {
            let d = dist(this.position.x, this.position.y, fishes[i].position.x, fishes[i].position.y);
            if (d < perception && fishes[i] != this && fishes[i].following == false) {
                steer.add(fishes[i].velocity);
                total++;
            }
        }
        if (total > 0) {
            steer.div(total);
            steer.setMag(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    cohesion(fishes) {
        let perception = 50;
        let total = 0;
        let steer = createVector();
        for (let i = 0; i < fishes.length; i++) {
            let d = dist(this.position.x, this.position.y, fishes[i].position.x, fishes[i].position.y);
            if (d < perception && fishes[i] != this && fishes[i].following == false) {
                steer.add(fishes[i].position);
                total++;
            }
        }
        if (total > 0) {
            steer.div(total);
            steer.sub(this.position);
            steer.setMag(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    separation(fishes) {
        let perception = 50;
        let total = 0;
        let steer = createVector();
        for (let i = 0; i < fishes.length; i++) {
            let d = dist(this.position.x, this.position.y, fishes[i].position.x, fishes[i].position.y);
            if (d < perception && fishes[i] != this) {
                let diff = p5.Vector.sub(this.position, fishes[i].position);
                diff.div(d);
                steer.add(diff);
                total++;
            }
        }
        if (total > 0) {
            steer.div(total);
            steer.setMag(this.maxSpeed);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
        }
        return steer;
    }

    startFollowing(target, color, assigned) {
        this.followTarget = target;
        this.following = true;
        this.hue = color;
        this.assigned = assigned;
    }

    follow() {
        this.color = true;
        let steer = createVector();
        if (reachedNum >= reachedLimit) {
            reached = true;
            reachedNum = 0;
        }
        if (this.followTemp && !reached) {
            if (dist(this.position.x, this.position.y, this.tempTarget.x, this.tempTarget.y) > 100) {
                steer.add(this.tempTarget);
                noFill();
                stroke(255);
                strokeWeight(1);
                ellipse(this.tempTarget.x, this.tempTarget.y, 70, 70);
            } else {
                this.tempTarget = null;
                this.followTemp = false;
                reachedNum++;
            }
        } else {
            steer.add(this.followTarget);
        }
        steer.sub(this.position);
        steer.setMag(this.maxSpeed);
        steer.sub(this.velocity);
        steer.limit(this.maxForce);
        this.acceleration.add(steer);

        if (mouseIsPressed) {
            // this.tempTarget = createVector(rightWrist.x, rightWrist.y);
            this.tempTarget = createVector(width - mouseX, mouseY);
            this.followTemp = true;
            reached = false;

        }
    }

    unfollow() {
        this.following = false;
        this.color = false;
        this.followTarget = null;
    }

    convert(fishes) {
        let perception = 50;
        if (this.followTemp) {
            for (let i = 0; i < fishes.length; i++) {
                if (dist(fishes[i].position.x, fishes[i].position.y, this.position.x, this.position.y) < 50 && fishes[i].following == false) {
                    fishes[i].startFollowing(this.followTarget, this.hue);
                    followers.push(i);
                    followersAssigned.push(this.assigned);
                    followersColors.push(this.hue);
                }
            }
        }
    }


    flee(target) {
        let perception = 100;
        let steer = createVector();
        let d = dist(this.position.x, this.position.y, target.x, target.y);
        if (d < perception) {
            let diff = p5.Vector.sub(this.position, target);
            diff.div(d);
            steer.add(diff);
            steer.setMag(this.maxSpeed);
            steer.add(this.velocity);
            steer.limit(this.maxForce * 2);
        }
        return steer;
    }

    update() {
        this.position.add(this.velocity);
        this.velocity.add(this.acceleration);
        this.velocity.limit(this.maxSpeed);
        this.acceleration.mult(0);
    }

    show() {
        fill(255);
        let targetAngle = this.velocity.heading();
        let dAngle = targetAngle - this.angle;
        // if (dAngle < PI) {
        this.angle += dAngle * this.easing;
        // }
        push();
        translate(this.position.x, this.position.y);
        rotate(this.angle);
        noStroke();
        if (this.color) {
            colorMode(HSL, 100);
            fill(this.hue, 50, 50);
        }
        ellipse(-this.size / 2, 0, this.size * 2, this.size);
        pop();
    }
}