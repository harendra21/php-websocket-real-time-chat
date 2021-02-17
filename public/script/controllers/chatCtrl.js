app.controller('chatCtrl', ['$scope','userService',function($scope,userService) {

  var vm = this;
    $scope.users = [];
    $scope.onlineUsers = [];
    $scope.loggedInUser = null;
    // $scope.isUserLoggedIn = false;
    $scope.userName = null;
    $scope.toUser = null;
    //$scope.messageModel = null;
    $scope.messages = [];
    $scope.newMessage = null;
    $scope.user = {}

    $scope.init = function(){
        userService.getUser().then(data => {
          var user = data.user;
          var data = {'type' : 'userconnected', 'user': user};
          conn.send(JSON.stringify(data));

          $scope.user = user
          userService.getAllUsers().then(allUsers => {
            $scope.users = allUsers.users;
            $scope.selectUser($scope.users[0])
          })
        })


        // var userLogedIn = localStorage.getItem('loggedInUser');
        // if(userLogedIn != null || userLogedIn != undefined){
        //     $scope.loggedInUser = userLogedIn;
        //     $scope.isUserLoggedIn = true;
        //     setTimeout(() => {
        //         var data = {'type' : 'login', 'name': userLogedIn};
        //         conn.send(JSON.stringify(data));
        //     },100)
        //
        // }else{
        //     $scope.isUserLoggedIn = false;
        //     $scope.loggedInUser = null;
        // }
    }
    $scope.logout = function(){
        localStorage.removeItem('loggedInUser')
        $scope.init();
        conn.close()
    }
    $scope.login = function(userName){
        var data = {'type' : 'login', 'name': userName};
        localStorage.setItem('loggedInUser',userName)
        $scope.init();
        conn.send(JSON.stringify(data));
    }
    conn.onmessage = function(e) {
        var data = JSON.parse(e.data);
        $scope.messages.push(data.data);
        $scope.newMessage = data.data.from_id;
        $scope.$apply();
        $scope.playAudio();
        setTimeout(() => {
            $scope.newMessage = null;
            $scope.$apply();
        },10)
    };

    $scope.sendMsg = function(){
        if ( vm.messageModel != null ){
            var data = {'type' : 'message', data : {
                from : $scope.user.id,
                to : $scope.toUser.id,
                message : vm.messageModel
            }};
            conn.send(JSON.stringify(data));
            $scope.messages.push(data.data)
            setTimeout(() => {
                vm.messageModel = null;
                $scope.$apply();
            },10)

        }
    }

    $scope.selectUser = function(toUser){
        $scope.messages = [];
        $scope.toUser = toUser;
        userService.getChats(toUser.id).then(data => {
          var chats = data.chats;
          chats.forEach((chat) => {
            var data =  {
                from : chat.from_id,
                to : chat.to_id,
                message : chat.value
            }
            $scope.messages.push(data)
          });
        })
        window.scrollTo(0,document.body.scrollHeight);
    }

    $scope.playAudio = function() {
        var audio = new Audio('audio/beep.mp3');
        audio.play();
    };


}]);
