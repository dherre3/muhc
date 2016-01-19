//Defines the authorization parameters for the user serssion
var myApp=angular.module('MUHCApp');
/**
*@ngdoc service
*@name MUHCApp.services:UserAuthorizationInfo
*@description Contains all the authorization data for the user. Used in the {@link MUHCApp.services:UpdateUI UpdateUI}, {@link MUHCApp.controller:LogOutController LogOutController}, and {@link MUHCApp.services:UserMessages UserMessages}.
*initially set up in the {@link MUHCApp.controller:LoginController LoginController} after user enters credentials.
**/
myApp.service('UserAuthorizationInfo', function(){
    return {
        setUsername:function(username){
            this.UserName=username;
        },
        getUsername:function(){
            return this.UserName;
        }
    };
});
