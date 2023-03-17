<!DOCTYPE html>
<html>
<head>
	<title>Socket test</title>
</head>
<body>
	<script type='text/javascript' src='https://code.jquery.com/jquery-3.3.1.min.js'></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.js"></script>
	<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.12.0/matter.min.js"></script>
    <script type="text/javascript">  
        var engine;
        var world;
        var walls;     
        var you;
        var youAngle = 0;
        var spaceClicked = false;
        var flag = 0;
        
        class Box {
            constructor(x, y, w ,h, $p5) {
                this.createMatter(x, y, w, h);
                this.w = w;
                this.h = h;
                this.$p5 = $p5;
            }

            createMatter(x, y, w, h) {		
                this.body = Matter.Bodies.rectangle(x, y, w, h);
                Matter.World.add(world, this.body);
            }
            
            remove() {
                Matter.World.remove(world, this.body);
            }

            show() {
                const pos = this.body.position;
                const angle = this.body.angle;
                this.$p5.push();
                this.$p5.translate(pos.x, pos.y);
                if(angle !== null) this.$p5.rotate(angle);
                this.$p5.rectMode(this.$p5.CENTER);

                this.$p5.noStroke();
                this.$p5.fill(0, 100, 0);
                this.$p5.rect(0, 0, this.w, this.h);

                this.$p5.pop();
            }
        }
        
        class Ball {
            constructor(x, y, r, $p5) {
                this.createMatter(x, y, r)
                this.r = r;
                this.$p5 = $p5;
            }

            createMatter(x,y,r) {
                this.body = Matter.Bodies.circle(x, y, r, {
                    restitution: 1.1
                });
                Matter.World.add(world, this.body);
            }

            remove() {
                Matter.World.remove(world, this.body);
            }

            show() {
                const pos = this.body.position;
                const angle = this.body.angle;
                this.$p5.push();
                this.$p5.translate(pos.x, pos.y);
                this.$p5.rotate(angle? angle : 0);
                this.$p5.rectMode(this.$p5.CENTER);

                this.$p5.noStroke();

                this.$p5.fill(255, 255, 255);
                this.$p5.circle(0, 0, this.r);

                this.$p5.pop();
            }
        }
        
        class Player {
            constructor(x, y, r, id, $p5) {
                this.createMatter(x, y, r)
                this.r = r;
                this.$p5 = $p5;

                this.id = parseInt(id);
                this.jumping = false;
                this.team = 1;
            }

            createMatter(x,y,r) {
                this.head = Matter.Bodies.circle(x, y, r, {
                    restitution: 0,                    
                    angularVelocity: 0,
                    angle: 0,
                });
                this.foot = Matter.Bodies.rectangle(x, y+r+(23/2), 50, 23, {
                    restitution: 0,
                    angularVelocity: 0,
                    angle: 0,
                    chamfer: { radius: [25, 25, 0, 0] }
                });
                console.log(this.foot);

//                this.body = Matter.Body.create({
//                    parts: [this.head, this.foot, this.leg]
//                });
                this.foot_joint = Matter.Constraint.create({
                    bodyA: this.head,
                    pointA: { x: 0, y: r },
                    bodyB: this.foot,
                    pointB: { x: 0, y: (23/2)/-2 },
                    stiffness: 1,
                });
                this.leg = Matter.Constraint.create({
                    bodyA: this.head,
                    pointA: { x: 0, y: r },
                    bodyB: this.foot,
                    pointB: { x: 0, y: (-1*23/2) },
                    stiffness: 1,
                });


                Matter.World.add(world, [ this.head, this.foot, this.leg ]);
//                Matter.World.add(world, [this.body, this.leg_joint, this.foot_joint]);
            }
            
            remove() {
                Matter.World.remove(world, [ this.head, this.foot ] );
//                Matter.World.remove(world, [this.head, this.foot, this.leg, this.leg_joint, this.foot_joint] );
            }

            show() {
                var pos = this.head.position;
                var angle = this.head.angle;
                if(flag != 200) {
                    if(flag == 100 || flag == 199) 
//                    console.log(this.body.angularVelocity);
                    flag++;
                }
                this.$p5.push();
                this.$p5.translate(pos.x, pos.y);
                
                this.$p5.rotate(angle? angle : 0);
                this.$p5.noStroke();
                this.$p5.fill(255, 0, 255);
                this.$p5.circle(0, 0, this.r);
                
                this.$p5.strokeWeight(1);
                this.$p5.stroke(51);
                this.$p5.fill(0, 0, 0);
                this.$p5.line(0, 0, 0, this.r);
                
                this.$p5.pop();
                
//                Matter.Body.set(this.foot, {
//                    position: {
//                        x: pos.x,
//                        y: pos.y+this.r+(23/2)
//                    }
//                });
                var pos = this.foot.position;
                var angle = this.foot.angle;
                
                this.$p5.push();
//                this.$p5.translate(pos.x, pos.y);

                this.$p5.fill(100, 100, 0);
                this.$p5.noStroke();
                this.$p5.beginShape();
                    for(var vertice of this.foot.vertices)
                        this.$p5.vertex(vertice.x, vertice.y);
                this.$p5.endShape(this.$p5.CLOSE);
                this.$p5.rotate(angle? angle : 0);
//                this.$p5.rectMode(this.$p5.CENTER);

//                
//                this.$p5.rect(0, 0, 50, 23);
                this.$p5.pop();
            }
        }
        
        
        
        sketch = function($p5) {
            function playerHostMoving( move, id ) {
                var player = you;
                if(move == 'left-up' ){   
                    if(player.jumping) return;
                    Matter.Body.setVelocity(player.head, {
                        x: -3,
                        y: -6
                    });
                    player.jumping = false;
                }
                if(move == 'left') {
                    Matter.Body.setVelocity(player.head, {
                        x: -3,
                        y: player.head.velocity.y
                    });     
                }
                if(move == 'right-up') {  
                    if(player.jumping) return;
                    Matter.Body.setVelocity(player.head, {
                        x: 3,
                        y: -6
                    });
                    player.jumping = false;
                }
                if(move == 'right') {         
                    Matter.Body.setVelocity(player.head, {
                        x: 3,
                        y: player.head.velocity.y
                    });       
                }
                if(move == 'up') {
                    if(player.jumping) return;         
                    Matter.Body.setVelocity(player.head, {
                        x: player.head.velocity.x,
                        y: -6
                    });   
                    player.jumping = false;
                }
                Matter.Body.set(player.head, {
                    angularVelocity: 0,
                    angle: youAngle
                });
            }
        
            $p5.keyReleased = function () {                
//                Matter.Body.set(you.head, {
//                    velocity: {
//                        x: 0,
//                        y: 0,
//                    },
//                });
            }
            
            
            $p5.setup = function() {               
                $p5.createCanvas(600, 400);
                $p5.background(51);
                engine = Matter.Engine.create();
                world = engine.world;
//                world.gravity.y = 0;
                walls = [
                    new Box($p5.width / 2, $p5.height - (20 / 2), $p5.width, 20, $p5), //bottom
                    new Box($p5.width / 2, -1*20 / 2, $p5.width, 20, $p5), //top
                    new Box((-1*20 / 2), $p5.height / 2, 20, $p5.height, $p5), //left
                    new Box($p5.width - (-1*20 / 2), $p5.height / 2, 20, $p5.height, $p5) //right
                ];
                for(var wall_index in walls) {
                    var wall = walls[wall_index];
                    var friction = wall_index? 0 : 1;
                    Matter.Body.set(wall.body, {
                        friction: 1,
                        isStatic: true,
                        friction: friction
                    });
                }
                you = new Player(200, 200, 25, 1, $p5);
                console.log(you);
            }
//            $p5.keyIsDown()
            
            $p5.draw = function() {
                $p5.background(51);
//                if(youAngle == 0) {
//                    Matter.Body.rotate(you.head, 0);
//                }
                
                
                if ($p5.keyIsDown($p5.LEFT_ARROW)) { //left - 39
                    if ($p5.keyIsDown($p5.UP_ARROW)) { //up - 38
                        playerHostMoving('left-up', you.id);
                    } else {
                        playerHostMoving('left', you.id);
                    }
                } else if ($p5.keyIsDown($p5.RIGHT_ARROW)) {  //right - 37
                    if ($p5.keyIsDown($p5.UP_ARROW)) { //up - 38
                        playerHostMoving('right-up', you.id);
                    } else {
                        playerHostMoving('right', you.id);
                    }
                } else if ($p5.keyIsDown($p5.UP_ARROW)) { //up - 38
                    playerHostMoving('up', you.id);
                } 
//                if($p5.keyIsPressed) {
//                    console.log($p5.keyCode);
//                }
                
                if(spaceClicked) {
                    if(Math.abs(youAngle.toFixed(2)) >= 1.5) {
                        spaceClicked = false;
                    } else {                   
                        youAngle -= 0.2;
                        var angle = (youAngle ) * (Math.PI/180); // Convert to radians
                        Matter.Body.set(you.foot, {
                            position: {
                                x: Math.cos(angle) * (you.foot.position.x - you.head.position.x) - Math.sin(angle) * (you.foot.position.y-you.head.position.y) + you.head.position.x,
                                y: Math.sin(angle) * (you.foot.position.x - you.head.position.x) + Math.cos(angle) * (you.foot.position.y - you.head.position.y) + you.head.position.y
                            },
                            angularVelocity: 0,
                            angle: youAngle
                        });
                    }
                } else {
                    if(Math.abs(youAngle.toFixed(2)) > 0) {
                        youAngle += 0.04;
                        var angle = (youAngle ) * (Math.PI/180); // Convert to radians
                        Matter.Body.set(you.foot, {
                            position: {
                                x: Math.cos(angle) * (you.foot.position.x - you.head.position.x) - Math.sin(angle) * (you.foot.position.y-you.head.position.y) + you.head.position.x,
                                y: Math.sin(angle) * (you.foot.position.x - you.head.position.x) + Math.cos(angle) * (you.foot.position.y - you.head.position.y) + you.head.position.y
                            },
                            angularVelocity: 0,
                            angle: youAngle
                        });
                        
                    } else {
                        spaceClicked = true;
                    }
                }
                
//                
//                   Matter.Body.rotate(you.body, 0.08);  
                
                Matter.Body.set(you.head, {
                    angularVelocity: 0,
                    angle: youAngle
                });
                Matter.Body.set(you.foot,{ 
                    angularVelocity: 0,
                    angle: youAngle
                });
                
                for(var wall of walls) {
                    wall.show();
                }
                
                you.show();
                Matter.Engine.update(engine);
            }
        
        }

        var myp5 = new p5(sketch);
        
    </script>
</body>
</html>