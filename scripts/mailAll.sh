#!/bin/sh

DATE=`date +%y%m%d`

for entry in /home/pi/Pictures/camera/*
do
	case "$entry" in *"$DATE"*)
		if [ "$entry" != "/home/pi/Pictures/camera/$DATE" ]; then
			echo $entry
			zip -rjT "$entry".zip $entry
			echo "Security Camera tripped!" | mail -s "Security" -A "$entry".zip dthatrain137@gmail.com
			rm "$entry".zip && rm -rf $entry
		fi
	esac
done