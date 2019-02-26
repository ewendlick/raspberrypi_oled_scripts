# About
This is a collection of little things I enjoy running on a 0.96" 128x64px OLED screen via Raspberry Pi 3/Zero W

OLED controls are built with great thanks to the incredible efforts from the [Luma](https://github.com/rm-hull/luma.examples/tree/master/examples) project on Github

## Generall Installation (required for all projects)
Install the OLED packages
`pip3 install luma.core`
`pip3 install luma.oled`

Optionally, to improve performance, increase the I2C baudrate from the default of 100KHz to 400KHz by altering /boot/config.txt to include: dtparam=i2c_arm=on,i2c_baudrate=400000
Then reboot for the changes to take effect.

# IP Address Display
## Description
Displays IP addresses that would be returned from `ifconfig` command. Written for use when booting a Raspberry Pi W headless on a network that doesn't allow hostname lookups and has greatly varying IP addresses, and is set up to run as a service 20 seconds after network resolution finishes.

## Installation and setup
### Set up the script to run as a service
Copy the show_ip_addresses_on_oled.service file to /etc/systemd/system folder
`sudo cp show_ip_addresses_on_oled.service /etc/systemd/system`

Reload it so the changes take effect
`sudo systemctl daemon-reload`

Enable the service on boot
`sudo systemmctl enable show_ip_addresses_on_oled.service`

### Install Python packages
`pip3 install netifaces`

### Connect the things
| GPIO |              | GPIO |               |
|:----:|:------------:|:----:|:-------------:|
| 1    | OLED VCC(+)  | 2    |               |
| 3    | OLED SDA     | 4    |               |
| 5    | OLED SCL     | 6    |               |
| 7    |              | 8    |               |
| 9    |              | 10   |               |
| 11   |              | 12   |               |
| 13   |              | 14   | OLED GND(-)   |
| 15   |              | 16   |               |
| 17   | DHT 3.3V(+)  | 18   |               |
| 19   |              | 20   |               |
| 21   |              | 22   |               |
| 23   |              | 24   |               |
| 25   |              | 26   |               |
| 27   |              | 28   |               |
| 29   |              | 30   |               |
| 31   |              | 32   |               |
| 33   |              | 34   |               |
| 35   |              | 36   |               |
| 37   |              | 38   |               |
| 39   |              | 40   |               |

### Timezone
You will probably need to set your timezone.
Let's assume that you are using a Raspberry Pi, and that it is running Raspbian.
Run the following command:
`sudo raspi-config`
Navigate to Internationalization, select the options to configure your timezone, and set it to the appropriate value.


# Temperature and Humidity System
## Description
Displays the current temperature and humidity as a Celsius value and a percentage. Also displays a history of temperatures, which are stored and read from an sqlite3 database. The amount of data displayed depends on the width of the OLED screen, and by default will take readings every minute, and display one bar representing temperature for each minute.
This was written because our office is a sweltering jungle. Rather than wear coats or warmer clothing like intelligent humans, many of the employees opt to turn the heat up to 27 degrees because they are under the mindset that "winter cold. must turn heat on" while completely disregarding the actual temperatures and divorced of all critical thinking capabilities.
I wanted to track my discomfort and have a counter to people asking me "Aren't you cold wearing a T-shirt?! It's Winter!". No, I am not cold... I am very very warm and I have taken off my shoes and socks, rolled up my pants, and have been wiping sweat from my forehead. I don't dispute that it is 10C outside, but in here it is 27C, and that is 3 degrees warmer than Honolulu.

## Installation and setup
`pip3 install Adafruit_DHT`

### Connect the things
| GPIO |              | GPIO |               |
|:----:|:------------:|:----:|:-------------:|
| 1    | OLED VCC(+)  | 2    |               |
| 3    | OLED SDA     | 4    |               |
| 5    | OLED SCL     | 6    |               |
| 7    | DHT DATA     | 8    |               |
| 9    | DHT GND(-)   | 10   |               |
| 11   |              | 12   |               |
| 13   |              | 14   | OLED GND(-)   |
| 15   |              | 16   |               |
| 17   | DHT 3.3V(+)  | 18   |               |
| 19   |              | 20   |               |
| 21   |              | 22   |               |
| 23   |              | 24   |               |
| 25   |              | 26   |               |
| 27   |              | 28   |               |
| 29   |              | 30   |               |
| 31   |              | 32   |               |
| 33   |              | 34   |               |
| 35   |              | 36   |               |
| 37   |              | 38   |               |
| 39   |              | 40   |               |
