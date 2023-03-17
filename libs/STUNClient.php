<?php
    namespace MyApp;

    class STUNClient {
        private $socket;

        public function __construct() {
            //stun.l.google.com
//            $this->setServerAddr("66.102.1.127", 19302);
            $this->setServerAddr("109.104.207.4", 19302);
            $this->createSocket();
        }

        public function setServerAddr($host, $port = 3478) {
            $this->serverIP = $host;
            $this->serverPort = $port;
        }

        public function createSocket() {
            $this->socket = socket_create(AF_INET, SOCK_DGRAM, getprotobyname("udp"));
            socket_set_nonblock($this->socket);
        }

        public function getPublicIp() {
            $msg = "\x00\x01\x00\x08\xc0\x0c\xee\x42\x7c\x20\x25\xa3\x3f\x0f\xa1\x7f\xfd\x7f\x00\x00\x00\x03\x00\x04\x00\x00\x00\x00";

            $numberOfBytesSent = socket_sendto($this->socket, $msg, strlen($msg), 0, $this->serverIP, $this->serverPort);

            $st = time();
            while(time() - $st < 1) {

                socket_recvfrom($this->socket, $data, 32, 0, $remoteIP, $remotePort);

                if(strlen($data) < 32) {
                    continue;
                }
                break;
            }

            try {
                $info = unpack("nport/C4s", substr($data, 26, 6));
                $ip = sprintf("%u.%u.%u.%u", $info["s1"], $info["s2"], $info["s3"], $info["s4"]);
                $port = $info['port'];
                return [
                    'ip' => $ip,
                    'port' => $port
                ];
            } catch(Exception $e) {

                return [
                    'ip' => "0.0.0.0",
                    'port' => "0"
                ];
            }
        }
    }    