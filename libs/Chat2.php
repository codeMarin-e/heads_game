<?php
    namespace MyApp;
    use Ratchet\MessageComponentInterface;
    use Ratchet\ConnectionInterface;

    class Chat2 implements MessageComponentInterface {
        public $clients;
        protected $hosting;

        public function __construct() {
            $this->clients = new \SplObjectStorage;
        }

        public function onOpen(ConnectionInterface $conn) {
            // Store the new connection to send messages to later
            $host = 0;
            $players = array();
            if(!$this->clients->count()) {
                $host = 1;
                $this->hosting = $conn;
            }
            $conn->send(json_encode(array(
                'type'=> 'connection',
                'id' => $conn->resourceId,
                'host'=> $host,
                'start_game' => 1
            )));
            $this->clients->attach($conn);
            
            if($this->hosting != $conn) {
                $this->hosting->send(json_encode(array(
                    'type'=> 'new_players',
                    'players' => array( $conn->resourceId ),
                )));
            }

            echo "New connection! ({$conn->resourceId})".EOL;
            if($host) {
                echo "New Host ({$this->hosting->resourceId})".EOL;
            }

            $GLOBALS['server']->loop->cancelTimer( $GLOBALS['stop_server_timer'] );
        }

        public function onMessage(ConnectionInterface $from, $msg) {

            // echo "Connection {$from->resourceId} send message: ".EOL;
            $data = json_decode($msg, true);
            if($this->hosting->resourceId == $from->resourceId) {
                if($data['type'] == 'game_status') {                    
                    foreach ($this->clients as $client) {
                        if ($from === $client) continue;
                        $client->send($msg);
                    }
                    return;
                }
            } else {
                if($data['type'] == 'keys_pressed') {     
                    $data['id'] = $from->resourceId;
                    $this->hosting->send(json_encode($data));
                    return;
                }
                
//                
//                if($data['type'] == 'player_move') { 
//                    $this->hosting->send($msg);
//                    return;
//                }
//                if($data['type'] == 'player_kick') { 
//                    $this->hosting->send($msg);
//                    return;
//                }
            }

        }

        public function onClose(ConnectionInterface $conn) {
            // The connection is closed, remove it, as we can no longer send it messages
            
            $this->clients->detach($conn);
            if($this->hosting->resourceId == $conn->resourceId) {
                foreach($this->clients as $client) {
                    $this->hosting = $client;
                    echo "New Host ({$this->hosting->resourceId})".EOL;
                    break;
                }
                $this->hosting->send(json_encode(array(
                    'type'=> 'connection',
                    'id' => $client->resourceId,
                    'host'=> 1,
                    'start_game' => 0
                )));
            }
            $this->hosting->send(json_encode(array(
                'type'=> 'remove_player',
                'id' => $conn->resourceId,
            )));

            echo "Connection {$conn->resourceId} has disconnected".EOL;

            if(!$this->clients->count()) { 
                stopChatTimer();
                return;
            }
               // $GLOBALS['server']->loop->stop();
        }

        public function onError(ConnectionInterface $conn, \Exception $e) {
            echo "An error has occurred: {$e->getMessage()}".EOL;

            $conn->close();
        }
    }