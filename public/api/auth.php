<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
require './../../vendor/autoload.php';
require './../../config.php';
use Medoo\Medoo;
use \Firebase\JWT\JWT;
$database = new Medoo($database_config);
if($_SERVER['REQUEST_METHOD'] == 'POST'){


    if($_GET['type'] == 'login'){
      doLogin($database);
    }else if($_GET['type'] == 'register'){
      doRegister($database);
    }else if($_GET['type'] == 'check'){
      loginCheck($database);
    }else if($_GET['type'] == 'getChats'){
      getChats($database);
    }
}else if($_SERVER['REQUEST_METHOD'] == 'GET'){
  if($_GET['type'] == 'getUserDetails'){
    userDetails();
  }else if($_GET['type'] == 'getAllUsers'){
    allUsers($database);
  }
}
function getChats($db){
  $headers = apache_request_headers();
  if(isset($headers['Authorization'])){
    $resp = decode_token($headers['Authorization']);
    if(!empty($resp)){
      $me = $resp->user[0]->id;
      $json = file_get_contents('php://input');
      $data = json_decode($json,true);
      $to = $data['id'];

      $chats = $db->query("SELECT  `id`,`from_id`,`to_id`,`type`,`value`,`created_at` FROM `messages` WHERE (`from_id` = $me AND `to_id` = $to) OR (`from_id` = $to AND `to_id` = $me)")->fetchAll();
      
      json_response(["status" => true, "data" => ['chats' => $chats], "error" => false]);
    }else{
      json_response(["status" => false, "error" => true]);
    }
  }else{
    json_response(["status" => false, "error" => true,'message' => 'Authorization header not found.']);
  }
}
function allUsers($db){
  $headers = apache_request_headers();
  if(isset($headers['Authorization'])){
    $resp = decode_token($headers['Authorization']);
    if(!empty($resp)){
      $me = $resp->user[0]->id;

      $users = $db->select("users",["id","email","firstname","lastname","profile_image" ], [ "id[!]" => $me]);

      json_response(["status" => true, "data" => ['users' => $users], "error" => false]);
    }else{
      json_response(["status" => false, "error" => true]);
    }
  }else{
    json_response(["status" => false, "error" => true,'message' => 'Authorization header not found.']);
  }
}

function userDetails(){
  $headers = apache_request_headers();
  if(isset($headers['Authorization'])){
    $resp = decode_token($headers['Authorization']);
    if(!empty($resp)){
      json_response(["status" => true, "data" => ['user' => $resp->user[0]], "error" => false]);
    }else{
      json_response(["status" => false, "error" => true]);
    }
  }else{
    json_response(["status" => false, "error" => true,'message' => 'Authorization header not found.']);
  }
}

function loginCheck($db){
  $json = file_get_contents('php://input');
  $data = json_decode($json,true);
  $token = $data['token'];
  $resp = decode_token($token);
  if(!empty($resp)){
    json_response(["status" => true, "error" => false]);
  }else{
    json_response(["status" => false, "error" => true]);
  }
}

function doLogin($db){
  $json = file_get_contents('php://input');
  $data = json_decode($json,true);
  $email = $data["email"];
  $password = $data["password"];
  $password = md5($password);
  // check if email exists
  $isEmail = $db->select("users", ["id" ], [ "email" => $email ]);
  if(!empty($isEmail)){
    // check for email and password
    $isEmailPassword = $db->select("users", ["id" ], [ "email" => $email, "password" => $password ]);

    if(!empty($isEmailPassword)){
      // check for email and password
      $user = $db->select("users", ["id","email","firstname","lastname" ], [ "email" => $email, "password" => $password ]);
      $token = genrate_token($user);
      json_response(["status" => true, "error" => false, "data" => ["token" => $token], "message" => $email." loggedin successfully."]);
    }else{
      json_response(["status" => false, "error" => true, "data" => null, "message" => "Email/Password is/are not correct."]);
    }
  }else{
    json_response(["status" => false, "error" => true, "data" => null, "message" => "Email is not registered. Please register first."]);
  }
}

function doRegister($db){
  $json = file_get_contents('php://input');
  $data = json_decode($json,true);
  $f_name = $data["f_name"];
  $l_name = $data["l_name"];
  $email = $data["email"];
  $password = $data["password"];
  $c_password = $data["c_password"];

  //check if email already registered
  $isEmail = $db->select("users", ["id" ], [ "email" => $email ]);
  if(empty($isEmail)){
    $password = md5($password);
    $db->insert("users", [
    	"firstname" => $f_name,
      "lastname" => $l_name,
    	"email" => $email,
    	"password" => $password
    ]);

    $user = $db->select("users", ["id","email","firstname","lastname" ], [ "email" => $email, "password" => $password ]);
    $token = genrate_token($user);
    json_response(["status" => true, "error" => false, "data" => ["token" => $token], "message" => $email." registered successfully."]);
  }else{
    json_response(["status" => false, "error" => true, "data" => null, "message" => "Email is already registered. Please login."]);
  }
}

function json_response($data){
  echo json_encode($data);return 0;
}

function genrate_token($user){
  $key = "harendra";
  $payload = array(
      "iss" => "http://example.org",
      "aud" => "http://example.com",
      "iat" => 1356999524,
      "nbf" => 1357000000,
      "user" => $user
  );
  try{
    $jwt = JWT::encode($payload, $key);
    return $jwt;
  }catch (Exception $e) {
      echo 'Caught exception: ',  $e->getMessage(), "\n";
  }

}

function decode_token($jwt){
  $key = "harendra";
  return $decoded = JWT::decode($jwt, $key, array('HS256'));
}

?>
