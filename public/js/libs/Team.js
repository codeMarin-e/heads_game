class Team{
    
	constructor(index, $p5) {
        this.index = index;
        this.$p5 = $p5;
        this.goals = 0;
        this.players = {};
	}
    
    addPlayer(player) {
        this.players[ player.id ] = player;
    }    
    
    gameStatus(data) {
        var teamSub = {};
        this.goals = data.goals
        for (var id in data.players) {
            if(!this.players[id]) {
                this.players[id] = new Player(-100, -100, 22, id, this.index, this.$p5);
            }
            this.players[id].team = this.index;
            this.players[id].main_angle = data.players[id].main_angle;
            this.players[id].jumping = data.players[id].jumping;
            this.players[id].moving = data.players[id].moving;
            this.players[id].head_sprite = data.players[id].head_sprite;
            this.players[id].kicking = data.players[id].kicking;
            this.players[id].head = data.players[id].head;
            this.players[id].foot = data.players[id].foot;
            teamSub[id] = this.players[id];
        }
        this.players = teamSub;
    }
    
    remakeObj() {        
        for(var player of Object.values(this.players)) {
            player.remove();
            this.players[ player.id ] = new Player(
                    player.head.position.x,
                    player.head.position.y,
                    player.r,
                    player.id,
                    this.index,
                    player.$p5
            );
            this.players[ player.id ].main_angle = player.main_angle;
            this.players[ player.id ].jumping = player.jumping;
            this.players[ player.id ].moving = player.moving;
            this.players[ player.id ].head_sprite = player.head_sprite;
            this.players[ player.id ].kicking = player.kicking;
            Matter.Body.setAngle(this.players[ player.id ].head, player.main_angle);
            Matter.Body.setAngle(this.players[ player.id ].foot, player.main_angle);
            
        }
    }
    
    newFrame() {
        for(var id in this.players) {
            this.players[id].do_move();
        }
    }
    
    show() {        
        Object.values(this.players).map(player => player.show());
    }
}