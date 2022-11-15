class Fish {
    constructor() {
        this.position = createVector(random(width), random(height));
        this.velocity = p5.Vector.random2D();
        this.velocity.setMag(random(0.5, 1.5));
        this.acceleration = createVector();
        this.maxForce = 0.3;
        this.maxSpeed = 1.5;
        this.size = random(10, 40);
        this.angle = 0;
        this.easing = 0.05;
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

    flock(fishes, target, people) {
        let alignment = this.align(fishes);
        let cohesion = this.cohesion(fishes);
        let separation = this.separation(fishes);
        let mouse = createVector(mouseX, mouseY);
      //  let follow = this.follow(people);


        //   alignment.mult(alignSlider.value());
        //  cohesion.mult(cohesionSlider.value());
        //  separation.mult(separationSlider.value());
          separation.mult(1.1);

        this.acceleration.add(alignment);
        this.acceleration.add(cohesion);
        this.acceleration.add(separation);
     //   this.acceleration.add(follow);

        if (pose) {
            let flee = this.flee(target);
            this.acceleration.add(flee);
        }
    }

    align(fishes) {
        let perception = 50;
        let total = 0;
        let steer = createVector();
        for (let i = 0; i < fishes.length; i++) {
            let d = dist(this.position.x, this.position.y, fishes[i].position.x, fishes[i].position.y);
            if (d < perception && fishes[i] != this) {
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
            if (d < perception && fishes[i] != this) {
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

    follow(people) {
        let perception = width/2;
        let total = 0;
        let steer = createVector();
        for (let i = 0; i < people.length; i++) {
            let d = dist(this.position.x, 0, people[i].position.x, 0);
            if (d < perception) {
                steer.add(fishes[i].position);
                total++;
            }
        }
        if (total > 0) {
            steer.div(total);
            steer.sub(this.position);
            steer.setMag(this.maxSpeed/3);
            steer.sub(this.velocity);
            steer.limit(this.maxForce);
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
        image(fish, -this.size/2, 0, this.size, this.size);
        pop();
    }
}