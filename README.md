#About
This is a collection of little things I enjoy running on a 0.96" 128x64px OLED screen via Raspberry Pi 3/Zero W

OLED controls are built thanks to Luma ()

Copy the show_ip_addresses_on_oled.service file to /etc/systemd/system folder
`sudo cp show_ip_addresses_on_oled.service /etc/systemd/system`

Run `systemctl daemon-reload`

Enable the service on boot
`sudo systemmctl enable show_ip_addresses_on_oled.service`


#Install Python packages
pip3 install luma.core
pip3 install luma.oled
pip3 install netifaces


#Connect the things

| GPIO         | GPIO          |
| -----------  |:-------------:|
| OLED VCC     |               |
| OLED SDA     |               |
| OLED SCL     |               |
| DHT DATA     |               |
| DHT -        |               |
|              |               |
|              |               |
|              |               |
| DHT +        |               |
|              |               |
|              |               |
|              |               |
|              |               |
|              |               |
|              |               |
|              |               |
|              |               |
|              |               |
|              |               |
|              |               |

Optionally, to improve performance, increase the I2C baudrate from the default of 100KHz to 400KHz by altering /boot/config.txt to include:

dtparam=i2c_arm=on,i2c_baudrate=400000
Then reboot.
