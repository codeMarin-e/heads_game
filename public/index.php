<?php 
    $serverPort = isset($_GET['port'])? $_GET['port'] : 1235;
?>
<!DOCTYPE html>
<html>
<head>
	<title>Socket test</title>
</head>
<body>
	<script type='text/javascript' src='https://code.jquery.com/jquery-3.3.1.min.js'></script>
	<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.7.3/p5.js"></script>-->
	<script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/0.9.0/p5.min.js"></script>
	<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.12.0/matter.min.js"></script>-->
	<script src="https://cdn.jsdelivr.net/npm/matter-js@0.14.2/build/matter.min.js"></script>
	<script type='text/javascript'>
		var engine = Matter.Engine.create();
		var world = engine.world;
		var images = {};
		var host = false;
		var gameStarted = false;
        var socket;
        var socketPort = <?= $serverPort; ?>;
        var playerId;
    </script>
	<script src="js/libs/Box.js"></script>
	<script src="js/libs/Ground.js"></script>
	<script src="js/libs/Ball.js"></script>
	<script src="js/libs/Gate.js"></script>
	<script src="js/libs/Player.js"></script>
	<script src="js/libs/Team.js"></script>
	<script src="js/main.js"></script>
</body>
</html>