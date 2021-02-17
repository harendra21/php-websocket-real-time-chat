<?php

namespace App;

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;
require './../vendor/autoload.php';
use Medoo\Medoo;

class Chat implements MessageComponentInterface {
    protected $clients;
    private $activeUsers;
    private $activeConnections;
    private $database;
    private $onlineUsers = [];

    public function __construct(){
        require './../config.php';
        $this->database = new Medoo($database_config);
        $this->clients = new \SplObjectStorage;
        $this->activeUsers = [];
        $this->activeConnections = [];
        session_start();
    }

    public function onOpen(ConnectionInterface $conn){
        // Store the new connection to send messages to later
        $this->clients->attach($conn);
        echo "New connection! ({$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $conn, $msg){
        $jsonMsg = json_decode($msg);
        if ($jsonMsg->type == "userconnected") {
           $this->updateSocketId($jsonMsg->user->id,$conn->resourceId);
           //$this->sendMessageToAll(json_encode($onlineUsers));
       } elseif ($jsonMsg->type == "message") {
           $this->sendMessageToUser($conn, $jsonMsg);
       }
    }

    public function sendMessageToUser($conn, $msg){
        $to = $msg->data->to;
        $from = $msg->data->from;
        $message = $msg->data->message;
        $this->database->insert('messages', [
            'from_id' => $from,
            'to_id' => $to,
            'type' => 'text',
            'value' => $message
        ]);


        $data = $this->database->select('socket_id', [
            'socket_id'
        ], [
            'user_id' => $to
        ]);
        if(!empty($data)){
          $toSocketId = $data[0]['socket_id'];
          foreach ($this->clients as $client) {
              if ($client->resourceId == $toSocketId) {
                  $client->send(json_encode(['type' => 'message','data' => $msg->data]));
              }
          }
        }

    }

    public function sendMessageToOthers($conn, $msg){
        foreach ($this->clients as $client) {
            if ($conn !== $client) {
                $client->send($msg);
            }
        }
    }


    public function sendMessageToAll($msg){
        foreach ($this->clients as $client) {
            $client->send($msg);
        }
    }

    public function onClose(ConnectionInterface $conn)
    {
        // The connection is closed, remove it, as we can no longer send it messages
        $this->clients->detach($conn);
        unset($this->activeUsers[$conn->resourceId]);
        $onlineUsers = [];
        $onlineUsers['type'] = "onlineUsers";
        $onlineUsers['onlineUsers'] = $this->activeUsers;
        //$this->sendMessageToOthers($conn, json_encode($onlineUsers));
        //echo "Connection {$conn->resourceId} has disconnected\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e)
    {
        echo "An error has occurred: {$e->getMessage()}\n";
        $conn->close();
    }

    public function updateSocketId($user,$id){

        $data = $this->database->select('socket_id', [
            'user_id'
        ], [
            'user_id' => $user
        ]);
        if(empty($data)){
            // insert
            //echo 'Insert';
            $this->database->insert('socket_id', [
                'user_id' => $user,
                'socket_id' => $id
            ]);
        }else{
            // update
            //echo 'Update';
            $data = $this->database->update('socket_id', [
                'socket_id' => $id
            ], [
                'user_id' => $user
            ]);
        }
    }
}
