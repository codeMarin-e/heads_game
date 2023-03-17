<?php 
	require '../composer/vendor/autoload.php';

	use Ratchet\Server\IoServer;
	use Ratchet\Http\HttpServer;
	use Ratchet\WebSocket\WsServer;
	use MyApp\Chat;

	define('EOL', ( php_sapi_name() == 'cli' ? PHP_EOL : '<br />' ));

	function stopChatTimer() {
	  	//PERIOD     
	    // $counter = 0;
	    // $GLOBALS['server']->loop->addPeriodicTimer(1, function(\React\EventLoop\TimerInterface $timer) use (&$counter, &$chat) {
	    //     $counter++;
	    //     if($counter == 60) {
	    //         // $GLOBALS['server']->loop->cancelTimer($timer);
	    //         $GLOBALS['server']->loop->stop();
	    //     }
	    //     echo "[{$counter}] Connected: [{$chat->clients->count()}]".PHP_EOL;
	    // } );

	    //TIMER
	    // $GLOBALS['server']->loop->addTimer(10, function(\React\EventLoop\TimerInterface $timer) use (&$chat) {
	    $GLOBALS['stop_server_timer'] = $GLOBALS['server']->loop->addTimer(10, function() {
	    	$usersCount = $GLOBALS['chat']->clients->count();
	        if(!$usersCount) {
	            // $GLOBALS['server']->loop->cancelTimer($timer);
	            $GLOBALS['server']->loop->stop();
	        }
	        echo "Connected users: {$usersCount}".EOL;
	    } );
	}

	$GLOBALS['chat'] = new Chat();
    
    $serverPort = $_GET['port']? $_GET['port'] : 1235;

	$GLOBALS['server'] = IoServer::factory(
	    new HttpServer(
            new WsServer(
                $GLOBALS['chat']
            )
        ),
	    $serverPort
	);
    
        
    $GLOBALS['safety_server_stop'] = $GLOBALS['server']->loop->addTimer(2*60*60, function() { //safety stop
        $GLOBALS['server']->loop->stop();
        echo "Server stoping users: {$usersCount}".EOL;
    } );

	stopChatTimer();

    echo 'Server starting...'.EOL;
	$GLOBALS['server']->run();