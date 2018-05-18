import RPi.GPIO as GPIO
import time
import os

from sys import argv

GPIO.setwarnings(False)
GPIO.setmode(GPIO.BOARD)
GPIO.setup(11,GPIO.IN)

f = open('/home/pi/Documents/Projects/file.txt','w+')
f.write(str(os.getpid()))
f.close()
first = True

while True:
        if first:
                first = False
                os.system("echo \"Security Camera tripped just now!\" | mail -s \"Security Note\" dthatrain137@gmail.com")
	i=GPIO.input(11)
	if i==1:
		os.system('python /home/pi/Documents/Projects/camera.py ' + str(argv[1]))
		time.sleep(5)
