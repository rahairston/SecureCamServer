# SecureCamServer
## Setup
1. This should be done on a Raspberry Pi with these 2 items attached
- https://www.amazon.com/gp/product/B012V1HEP4/ref=oh_aui_detailpage_o08_s00?ie=UTF8&psc=1
- https://www.amazon.com/gp/product/B019SX734A/ref=oh_aui_detailpage_o08_s00?ie=UTF8&psc=1
2. Make sure this directory is in the file path /home/pi/ (Will change pathing to be user independent soon)
3. Add the lines in cron/pi to your crontab using `crontab -e`
4. Move `server_startup` to `/etc/init.d/` in the pi file system.
- Make sure this file is executable by all
5. I will make a setup.sh soon...
