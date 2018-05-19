import RPi.GPIO as GPIO
import time
import os

from sys import argv

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(11,GPIO.IN)

cwd = os.getcwd()

f = open(cwd + '/file.txt','w+')
f.write(str(os.getpid()))
f.close()
first = True

while True:
	if first: #maybe use this for app notification?
		first = False
	i=GPIO.input(11)
	if i==1:
		os.system('python ' + os.getcwd() + '/camera.py ' + str(argv[1]))
		time.sleep(5)
