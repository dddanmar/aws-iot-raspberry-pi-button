import paho.mqtt.client as mqtt
import ssl
import json
import pygame

def on_connect(client, userdata, flags, rc):
    print("Connected with result code "+str(rc))
    client.subscribe("$aws/things/RpiButton/shadow/update/accepted")

def on_message(client, userdata, msg):
    message_json = json.loads(str(msg.payload))
    if message_json['state']['reported']['button'] == 0:
        print("Button pushed!")
        pygame.mixer.init()
        pygame.mixer.music.load("doorbell-1.wav")
        pygame.mixer.music.play()

client = mqtt.Client()
client.on_connect = on_connect
client.on_message = on_message
client.tls_set(ca_certs='aws-iot-rootCA.crt', certfile='cert.pem', keyfile='privkey.pem', tls_version=ssl.PROTOCOL_SSLv23)
client.tls_insecure_set(True)
client.connect("A1XCN3BGLHHWJF.iot.us-east-1.amazonaws.com", 8883, 60)
client.loop_forever()

