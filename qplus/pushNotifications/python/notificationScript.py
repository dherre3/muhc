#written by Amro 11/05/2016
# This script handles sending notifications
# to an iOS or Android device. 

import time
import argparse # this is a module to handle arguments passed to the script
from gcm import * #the framework to handle android notifications
from apns import APNs, Frame, Payload #the framework to handle iOS notifications


def ios (token, message):
    #checks if the ios token passed includes the characters < and > 
    # if so it removes them. 
    if token.startswith("<") and token.endswith(">"):
        token = token[1:len(token)-1]
    #checks if the token includes any whitespaces. 
    #if it does, it removes them. 
    token = token.replace(" ","")
    #creates an apple notification service object
    apns = APNs(use_sandbox=True, cert_file='/var/www/devDocuments/david/muhc/qplus/pushNotifications/python/certificate.pem', key_file='/var/www/devDocuments/david/muhc/qplus/pushNotifications/python/p12Certificates.pem')
    #Creates the payload / message to send to the device 
    payload = Payload(alert=message, sound="default", badge=1)
    #sends the message to the device. 
    apns.gateway_server.send_notification(token, payload)


def android(token, message):
    #checks if the token includes any whitespaces. 
    #if it does, it removes them. 
    token = token.replace(" ","")
   
    #creates a GCM object to connects to our specific project in GCM services 
    #using the API provided by GCM services.
    gcm = GCM("AIzaSyCk5zsAsrMBml9eVcWr9PutXG8PuNOD_vk")

    #the message we want to send 
    data = {'message':message}

    #send the message
    gcm.plaintext_request(registration_id=token, data=data)

if __name__== "__main__":
    # restricting the choices of functions called to 
    # ios or android only. 
    choices = {"ios": ios, "android": android}
    parser = argparse.ArgumentParser(description ="Send notifications to "
        "android or iOS device of a specifc patient.")
    parser.add_argument("-d", metavar = "DEVICE", choices = choices, help = "Which type of "
        "device you're trying to message (android/ios)")
    parser.add_argument('-t', metavar='TOKEN',
                        help="The token number specific to a patient device")
    parser.add_argument('-m', metavar='MESSAGE',
                        help="The message you want to send to the device")
    args = parser.parse_args()
    caller = choices[args.d]
    caller(args.t, args.m)
