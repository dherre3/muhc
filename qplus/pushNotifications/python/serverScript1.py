from gcm import *

gcm = GCM("AIzaSyCk5zsAsrMBml9eVcWr9PutXG8PuNOD_vk")
data = {'the_message': 'You have x new friends', 'param2': 'value2'}

reg_id = 'eGrfopWoe1k:APA91bFFWNuColh6JWOeIz84xeMreF1OL6AH4vCv1PMkvkVqSUohXvAnHUzM8xX8h--U7RO0FZPieWcxNVENrZGmtXVvnmCot1RZryHRIiCw52AtkuLDuDb808PF4SwsyTmZ_SbAawzM-UxxxqpL4EUXTWOm0RXE5CrpMk'

gcm.plaintext_request(registration_id=reg_id, data=data)