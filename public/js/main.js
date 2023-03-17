(function ($) {
    $(document).ready(function () {

        var sketch = function ($p5) {
            var walls = [];
            var balls = [];
            var gates = [];
            var team1 = new Team(1, $p5);
            var team2= new Team(2, $p5);
            var flag;

            var startPositions = [];            
            
            var gameTimeMinutes;
            var gameCurrentTime;
            var gameDeadline;
            var gameTimeLeft;

            function time_remaining(endtime){
                var t = Date.parse(endtime) - Date.parse(new Date());
                var seconds = Math.floor( (t/1000) % 60 );
                var minutes = Math.floor( (t/1000/60) % 60 );
                var hours = Math.floor( (t/(1000*60*60)) % 24 );
                var days = Math.floor( t/(1000*60*60*24) );
                return {'total':t, 'days':days, 'hours':hours, 'minutes':minutes, 'seconds':seconds};
            }
            
            function run_clock(endtime){
                function update_clock(){
                    var t = time_remaining(endtime);
                    gameTimeLeft = (t.minutes < 10? '0'+t.minutes : t.minutes) + ' : '+ (t.seconds < 10? '0'+t.seconds : t.seconds);
                    if(t.total<=0){ 
                        clearInterval(timeinterval);
                        startGame(true);
                    }
                }
                update_clock(); // run function once at first to avoid delay
                var timeinterval = setInterval(update_clock,1000);
            }            
            
            
                    
            

//            function drawElipse(x, y) {
//                $p5.noStroke();
//                $p5.fill(255, 0, 100);
//                $p5.ellipse(x, y, 36, 36);
//            }


            // $p5.mouseDragged = function() {
            // socket.send( JSON.stringify({
            // 	x: $p5.mouseX,
            // 	y: $p5.mouseY
            // }) );
            // 	drawElipse($p5.mouseX, $p5.mouseY);
            // }

            function socketInit() {
                socket = new WebSocket('ws://' + window.location.hostname + ':' + socketPort);
                socket.onopen = function (e) {
                    console.log("socket established!");
                };

                // Log errors
                socket.onerror = function (error) {
                    alert('WebSocket Error');
                    console.log(error);
                };

                // Log messages from the server
                socket.onmessage = function (e) {
                    var data = JSON.parse(e.data);
                    if (data.type == 'connection') {
                        host = parseInt(data.host) ? true : false;
                        if (host) {
                            if (gameStarted) {
                                remakeObjs();
                                startGame(true)
                            }                            
                            Matter.Events.on(engine, 'collisionEnd', function(event) {
                                    var pairs = event.pairs;

                                    for (var i = 0, j = pairs.length; i != j; ++i) {
                                        var pair = pairs[i];

                                        if (pair.bodyA === balls[0].body || pair.bodyB === balls[0].body) {
                                            var ballHit = false;
                                            for(var player of Object.values(team1.players)) {
                                                if (pair.bodyA === player.foot || pair.bodyB === player.foot){
                                                        if(player.kicking) {
                                                            ballHit = true;
                                                            break;
                                                        }
                                                }
                                            }
                                            if(!ballHit) {                                
                                                for(var player of Object.values(team2.players)) {
                                                    if (pair.bodyA === player.foot || pair.bodyB === player.foot){
                                                        if(player.kicking) {
                                                            ballHit = true;
                                                            break;
                                                        }
                                                    }
                                                }
                                            }
                                            if(ballHit) {
                                                var yFix = Math.random() < 0.5? 2 : 3;
                                                Matter.Body.set(balls[0].body, {
                                                    velocity: {
                                                        x: balls[0].body.velocity.x*3,
                                                        y: (balls[0].body.velocity.y-yFix)*3,
                                                    }
                                                });
                                            }
                                        } 
                                    }
                            });
                            $p5.loop();
                        }
                        if (parseInt(data.start_game)) {
                            youId = data.id;
                            if(host) team1.addPlayer( new Player(startPositions[0].x, startPositions[0].y, 22, youId, 1, $p5) );
                            startGame(true);
                        }
                        return;
                    }
                    if (data.type == 'new_players') { 
                        if(!host) return;
                        var team1Count = Object.values(team1.players).length;
                        var team2Count = Object.values(team2.players).length;
                        for(var id of data.players) {
                            if(team1Count <= team2Count) {
                                team1.addPlayer( new Player(
                                    startPositions[0].x+(team1Count-1)*80, 
                                    startPositions[0].y, 
                                    22, id, 1, $p5
                                ) );  
                                team1Count++;
                                continue;
                            } 
                            team2.addPlayer( new Player(
                                startPositions[1].x-(team1Count-1)*80, 
                                startPositions[1].y, 
                                22, id, 2, $p5
                            ) );                    
                            team2Count++;
                        }
                        return;
                    }
                    if(data.type == 'keys_pressed') {                        
                        if(!host) return;
                        if(team1.players[data.id]) {
                            team1.players[data.id].moving = data.moving;
                            team1.players[data.id].head_sprite = data.head_sprite;    
                            if(data.moving.change_team) {                                
                                team1.players[data.id].team = 2;
                                team2.players[data.id] = team1.players[data.id];
                                delete team1.players[data.id];
                            }
                            return;
                        }
                        team2.players[data.id].moving = data.moving;    
                        team2.players[data.id].head_sprite = data.head_sprite;    
                        if(data.moving.change_team) {
                            team2.players[data.id].team = 1;
                            team1.players[data.id] = team2.players[data.id];
                            delete team2.players[data.id];
                        } 
                        return;
                    }
                    if (data.type == 'player_kick') { 
                        if(!host) return;
                        team1.players[data.id]?
                            team1.players[data.id].kick( data.move ) :
                            team2.players[data.id].kick( data.move );
                        return;
                    }
                    if (data.type == 'remove_player') { 
                        if(!host) return;
                        if(team1.players[ data.id ]) {
                            team1.players[ data.id ].remove();
                            delete team1.players[ data.id ];
                            return;
                        }
                        team2.players[ data.id ].remove();
                        delete team2.players[ data.id ];
                        return;
                    } 
                    if (data.type == 'game_status') {
                        if (host) return;
                        for (var i in balls) {
                            balls[i].body = data.balls[i].body;
                        }
                        team1.gameStatus(data.team1);
                        team2.gameStatus(data.team2);
                        gameTimeLeft = data.gameTimeLeft;
                        
                        newFrame();
                        return;
                    }
                };
            }

            function remakeObjs() {
                prepareBackground();
                balls = balls.reduce((accumulator, ball) => {
                    ball.remove();
                    var newBall = new Ball(
                            ball.body.position.x,
                            ball.body.position.y,
                            ball.r,
                            $p5
                            );
                    Matter.Body.setAngle(newBall.body, ball.body.angle);
                    accumulator.push(newBall);
                    return accumulator;
                }, []);
                gates = gates.reduce((accumulator, gate) => {
                    gate.remove();
                    var newGate = new Gate(
                            gate.body.position.x,
                            gate.body.position.y,
                            gate.w,
                            gate.h,
                            gate.team,
                            $p5
                            );
                    accumulator.push(newGate);
                    return accumulator;
                }, []);
                
                team1.remakeObj();
                team2.remakeObj();
            }

            function prepareBackground() {
                walls.map(wall => wall.remove());
                walls = [
                    new Ground($p5.width / 2, $p5.height + (100 / 2)-20, $p5.width, 100, $p5), //bottom - 10px above
                    new Ground($p5.width / 2, -1*100 / 2, $p5.width, 100, $p5), //top
                    new Ground((-1*100 / 2), $p5.height / 2, 100, $p5.height, $p5), //left
                    new Ground($p5.width - (-1*100 / 2), $p5.height / 2, 100, $p5.height, $p5) //right
                ];
                Matter.Body.set(walls[0].body, { friction: 1 });
                Matter.Body.set(walls[1].body, { friction: 0 });
                Matter.Body.set(walls[2].body, { friction: 0 });
                Matter.Body.set(walls[3].body, { friction: 0 });
            }
            
            function prepareGates() {
                gates.map(ball => ball.remove());
                gates = [
                    new Gate(0+72/2, $p5.height-20-150/2, 72, 150, 1, $p5),
                    new Gate($p5.width-72/2, $p5.height-20-150/2, 72, 150, 2, $p5),
                ];
            }

            function prepareObjects() {
                balls.map(ball => ball.remove());
                balls = [
                    new Ball($p5.width/2, 50, 15, $p5),
//                    new Ball(252, 100, 15, $p5),
//                    new Ball(248, 50, 15, $p5),
                ];
                if(host) {
                    var xFix = Math.random() < 0.5? -1 : 1;
                    var xMul = Math.random() < 0.5? 1 : 2;
                    Matter.Body.set(balls[0].body, {
                        velocity: {
                            x: xFix*xMul,
                            y: 0,
                        }
                    });
                }
            }
            
            function preparePlayers() {
                if(!host) return;
                Object.values(team1.players).map( (player, i) => {
                    team1.players[player.id].changePosition(startPositions[0].x+i*80, startPositions[0].y);
                });
                Object.values(team2.players).map( (player, i) => {
                    team2.players[player.id].changePosition(startPositions[1].x-i*80, startPositions[1].y);
                });
            }

            function startGame(timeup) {
                gameStarted = true;
                if(timeup && host) {
                    gameTimeMinutes = 2;
                    gameCurrentTime = Date.parse(new Date());
                    gameDeadline = new Date(gameCurrentTime + gameTimeMinutes*60*1000);
                    gameTimeLeft = "02:00";
                    run_clock(gameDeadline);
                    team1.goals = 0;
                    team2.goals = 0;
                }
                prepareBackground();
                prepareObjects();
                preparePlayers();
                prepareGates();
            }

            function sendGameStatus() {
                if (!host)
                    return;
                socket.send(JSON.stringify({
                    type: 'game_status',
                    balls: balls.reduce((accumulator, ball) => {
                        accumulator.push({
                            body: {
                                position: ball.body.position,
                                angle: ball.body.angle
                            }
                        });
                        return accumulator;
                    }, []),
                    gameTimeLeft: gameTimeLeft,
                    team1: {
                        goals: team1.goals,
                        players: Object.values(team1.players).reduce((accumulator, player) => {
                            accumulator[player.id] = {
                                team: player.team,
                                jumping: player.jumping,
                                head_sprite: player.head_sprite,
                                kicking: player.kicking,
                                moving: player.moving,
                                head_sprite: player.head_sprite,
                                main_angle: player.main_angle,
                                head: {
                                    position: player.head.position,
                                    angle: player.head.angle
                                },
                                foot: {
                                    position: player.foot.position,
                                    angle: player.foot.angle
                                }
                                };
                            return accumulator;
                        }, {}),
                    },
                    team2: {
                        goals: team2.goals,
                        players: Object.values(team2.players).reduce((accumulator, player) => {
                            accumulator[player.id] = {
                                team: player.team,
                                jumping: player.jumping,
                                head_sprite: player.head_sprite,
                                kicking: player.kicking,
                                moving: player.moving,
                                head_sprite: player.head_sprite,
                                main_angle: player.main_angle,
                                head: {
                                    position: player.head.position,
                                    angle: player.head.angle
                                },
                                foot: {
                                    position: player.foot.position,
                                    angle: player.foot.angle
                                }
                            };
                            return accumulator;
                        }, {}),
                    },
                }));
            }

            function showBackground() {
                $p5.background(51);
                
                $p5.textSize(32);
                $p5.fill(255, 255, 255);
                $p5.text(gameTimeLeft, $p5.width/2-68, 30);
                
                $p5.textSize(32);
                $p5.fill(255, 255, 255);
                $p5.text(team1.goals + " : " + team2.goals, $p5.width/2-50, 60);
                
                
                walls.map(wall => wall.show());
            }

            function showGates() {
                gates.map(gate => gate.show());
            }

            function showObjects() {
                balls.map(ball => ball.show());
            }

            function showPlayers() {
                team1.show();
                team2.show();
            }
            

            function newFrame() {
                if (!gameStarted)
                    return;
                if(host) {
                    for(var gate of gates) {
                        if(flag) break;
                        var x = (gate.team == 1)? 
                            gate.body.position.x+gate.w/2-balls[0].r*2 :
                            gate.body.position.x-gate.w/2+balls[0].r*2;
                        var collisions = Matter.Query.ray([ balls[0].body ], {
                            x: x,
                            y: gate.body.position.y-gate.h/2+10
                        }, {
                            x: x,
                            y: gate.body.position.y+gate.h/2
                        }, 1);
                        if(collisions.length) {
                            if(gate.team == 1) {
                                team2.goals++;
                            } else {
                                team1.goals++;
                            }
                            startGame();
                        }
                        
                    }
                    
                    team1.newFrame();
                    team2.newFrame();
                }
                
                sendGameStatus();
                showBackground();
                showObjects();
                showPlayers();
                showGates();
                
                //goal lines
                $p5.fill(100, 0, 100);
                for(var gate of gates) {
                    if(gate.team == 1) {
                        $p5.line(
                            gate.body.position.x+gate.w/2-balls[0].r*2,
                            gate.body.position.y-gate.h/2,
                            gate.body.position.x+gate.w/2-balls[0].r*2,
                             gate.body.position.y+gate.h/2
                        );
                        continue;   
                    }
                    $p5.line(
                        gate.body.position.x-gate.w/2+balls[0].r*2,
                        gate.body.position.y-gate.h/2,
                        gate.body.position.x-gate.w/2+balls[0].r*2,
                         gate.body.position.y+gate.h/2
                    );
                }
                Matter.Engine.update(engine);
            }

            $p5.preload = function () {
                images.players = {
                    marin: $p5.loadImage('img/marin.png'),
                    jivko: $p5.loadImage('img/jivko.png'),
                    maria: $p5.loadImage('img/maria.png'),
                    ani: $p5.loadImage('img/ani.png'),
                    kiro: $p5.loadImage('img/kiro.png'),
                    ceco: $p5.loadImage('img/ceco.png'),
                    christin: $p5.loadImage('img/christin.png'),
                    dani: $p5.loadImage('img/dani.png'),
                };
                images.shoes = {
                    left: $p5.loadImage('img/shoe-left.png'),
                    right: $p5.loadImage('img/shoe-right.png')
                };
                images.gates = {
                    net: $p5.loadImage('img/net2.png'),
                };
                images.ball = $p5.loadImage('img/ball.png');
                images.grass = $p5.loadImage('img/grass.jpg');
            }
            
            youKeysPressed = function() {                
                if (!gameStarted)
                    return;    
                var keysPressed = {                                
                    up: false,
                    left: false,
                    right: false,
                    space: false,                
                    start_game: false,
                    change_team: false,
                };
                var head_sprite = (team1.players[ youId ])? team1.players[ youId ].head_sprite : team2.players[ youId ].head_sprite;
                if($p5.keyIsDown(97) || $p5.keyIsDown(49)) { //1
                    head_sprite = 'marin';
                } else if($p5.keyIsDown(98) || $p5.keyIsDown(50)) { //2
                    head_sprite = 'jivko';
                } else if($p5.keyIsDown(99) || $p5.keyIsDown(51)) { //3
                    head_sprite = 'ani';
                } else if($p5.keyIsDown(100) || $p5.keyIsDown(52)) { //4
                    head_sprite = 'maria';
                } else if($p5.keyIsDown(101) || $p5.keyIsDown(53)) { //5
                    head_sprite = 'kiro';
                } else if($p5.keyIsDown(102) || $p5.keyIsDown(54)) { //6
                    head_sprite = 'ceco';
                } else if($p5.keyIsDown(103) || $p5.keyIsDown(55)) { //7
                    head_sprite = 'christin';
                } else if($p5.keyIsDown(104) || $p5.keyIsDown(56)) { //8
                    head_sprite = 'dani';
                } else if($p5.keyIsDown(96) || $p5.keyIsDown(48)) { //0
                    head_sprite = false;
                }
                
                if ($p5.keyIsDown(84)) { //t
                    keysPressed.change_team = true;
                }
                
                if ($p5.keyIsDown($p5.LEFT_ARROW) || $p5.keyIsDown(65)) { //left - 39 | a - 65
                    keysPressed.left = true;
                } 
                if($p5.keyIsDown($p5.RIGHT_ARROW) || $p5.keyIsDown(68)) {  //right - 37 | d - 68
                    keysPressed.right = true;
                }
                if ($p5.keyIsDown($p5.UP_ARROW) || $p5.keyIsDown(87)) { //up - 38 | w - 87
                    keysPressed.up = true;
                }
//                if ($p5.keyIsDown($p5.CONTROL) || $p5.keyIsDown(32)) { //CTRL OR space
                if ($p5.keyIsDown($p5.CONTROL)) { //CTRL - space is buged for left/up/space
                    keysPressed.space = true;
                }
                if ($p5.keyIsDown(80)) { //p
                    startGame();
//                    keysPressed.start_game = true;
                }  
//                console.log($p5.keyCode);
                if(team1.players[ youId ]) {
                    team1.players[ youId ].moving = keysPressed;
                    team1.players[ youId ].head_sprite = head_sprite;
                    if(host && keysPressed.change_team) {
                        team1.players[ youId ].team = 2;
                        team2.players[ youId ] = team1.players[ youId ];
                        delete team1.players[ youId ];
                        return;
                    }
                    team1.players[ youId ].keysPressed();                    
                    return;
                }
                if(team2.players[ youId ]) {
                    team2.players[ youId ].moving = keysPressed;     
                    team2.players[ youId ].head_sprite = head_sprite;
                    if(host && keysPressed.change_team) {
                        team2.players[ youId ].team = 1;
                        team1.players[ youId ] = team2.players[ youId ];
                        delete team2.players[ youId ];
                        return;
                    }
                    team2.players[ youId ].keysPressed();
                }
            }
            
            $p5.keyReleased = function() {
                youKeysPressed();
            }

            $p5.keyPressed = function () {
                youKeysPressed();
            }

            $p5.setup = function () {
                $p5.noLoop();
                $p5.createCanvas(1200, 400);
                startPositions = [
                    {x: 200, y: $p5.height - 100},
                    {x: $p5.width - 200, y: $p5.height - 100},
                ]
                $p5.background(51);
                socketInit();
            }

            $p5.draw = function () {
                newFrame();
            }
        }

        var myp5 = new p5(sketch);


    });

})(jQuery);