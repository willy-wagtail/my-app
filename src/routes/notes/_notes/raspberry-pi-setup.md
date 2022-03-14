---
author: William Cheung
authorImage: william.jpg
date: 2022-03-12
description: This note documents what I do to set up a fresh Raspberry Pi with the goal of running it headless. I also document some steps to improve the security of the Pi.
slug: raspberry-pi-setup
title: Setting Up A New Raspberry Pi
---

This note presents what I do to set up a fresh Raspberry Pi with the goal of running it headless. I also document some steps to improve the security of the Pi.

## Setting Up the Pi

### Prepare SD card

On another computer, download and install the [Raspberry Pi Imager](https://www.raspberrypi.org/software/), then use it to install an operating system onto your SD card. The default OS is Raspberry Pi OS. There is a Raspberry Pi OS Lite which is useful for when you are only running it headless as it does not have a GUI interface.

After the operating system has been installed onto the SD card, we can make a couple more optional changes before using it to boot up the Raspberry Pi.

- For a headless setup, [SSH can be enabled](https://www.raspberrypi.com/documentation/computers/remote-access.html#ssh) by creating an empty file named "_ssh_" at the root directory on your SD card.

- For the Raspberry Pi to automatically connect to a Wi-Fi network on the first boot, create a [`wpa_supplicant.conf`](https://www.raspberrypi.com/documentation/computers/configuration.html#configuring-networking-2) file at the root directory on your SD card before first boot with the config below. (I mostly use an ethernet cable instead to connect to my local network.)

```
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
country=<Insert 2 letter ISO 3166-1 country code here>

network={
 ssid="<Name of your wireless LAN>"
 psk="<Password for your wireless LAN>"
}
```

I run my Pi headless and connected to the local network via an ethernet cable, so I'll enable SSH but skip the Wi-Fi step.

### First boot

With the SD card set up, put it into the Raspberry Pi and power it on. Wait a little for it to start up, then find the IP address of the Pi either using your network router or another network analyser tool (like [Fing app](https://www.fing.com/products/fing-app)).

If we enabled SSH correctly, we should be able to access the Pi remotely using SSH. Run the following command and type in the password. The default username is _pi_ and default password is _raspberry_.

```
# ssh pi@<IP address>
```

### Reboot and shutdown

To restart the Raspberry Pi, run "`sudo reboot`".

If you want to shut down the Pi, pulling the power plug without properly shutting down the system will increase the risk of corrupting the SD card. Anything running will not save and exit gracefully.

To properly shutdown, run "`sudo shutdown -h now`". Give it a second to send `SIGTERM`, `SIGKILL` signals to all running processes, unmount file systems, and so on. Only when the system is halted should you pull the power to the device.

To start the Pi back up after a shutdown, simply turn on the power. I use a cheap [USB on/off switch](https://thepihut.com/products/usb-c-cable-with-switch) to make it easy to turn on/off the power to the Pi.

There are ways to create a power button using the GPIO pins on the board, programmed to shut down properly. I have not experimented with this yet though (_to do!_).

### Change hostname

The hostname is the visible name for the Raspberry Pi on a network. This can be changed from the default "_raspberrypi_" using the [raspi-config tool](https://www.raspberrypi.com/documentation/computers/configuration.html#hostname) by running:

```
# sudo raspi-config
```

Go to "`System Options`", then "`Hostname`". You can then type in your new hostname and reboot.

Alternatively, you can also change the hostname by changing two configuration files. First, run `sudo nano /etc/hosts`, then change the default hostname "_raspberrypi_" to your new one before saving and exiting by hitting `Ctrl-X` and `Y` for yes. Secondly, run `sudo nano /etc/hostname`, change the hostname there to the new one too, save and exit. Finally, reboot the system by running "`sudo reboot`".

### Power consumption tweaks

If you are running a headless Raspberry Pi, then according to [this blog by Jeff Geerling](https://www.jeffgeerling.com/blogs/jeff-geerling/raspberry-pi-zero-conserve-energy), you can save a little bit of power by disabling the HDMI display circuitry.

Run the command "`/usr/bin/tvservice -o`" to disable HDMI. Also run "`sudo nano /etc/rc.local`" and add the command there too in order to disable HDMI on boot.

To enable again, run "`/usr/bin/tvservice -p`", and remove from the command from `/etc/rc.local`.

## Securing the Pi

Some steps to secure your Raspberry Pi and prevent hackers finding and using it can be [found here](https://www.raspberrypi.com/documentation/computers/configuration.html#securing-your-raspberry-pi). The level of security required depends on how exposed to the internet your Pi is.

### Change password for pi user

The default user "pi" has root access and it's default password "raspberry" is used for every single Raspberry Pi OS install. The first thing to ever do is change this password.

Run "`sudo raspi-config`". Go to “_System Options_”, and then “_Password_”.

Alternatively, run "`sudo passwd`" which is what the raspi-config tool does under the hood anyway.

### Create a new superuser

Run "`sudo adduser <account_name>`" to create a new user. Type in a password for it.

Run the following command to add the new user to all the groups. This will give it the necessary permissions.

```
# sudo usermod -a -G adm,dialout,cdrom,sudo,audio,video,plugdev,games,users,input,netdev,gpio,i2c,spi <account_name>
```

Make sure to check the new user has been successfully added to the `sudo` group by logging in with it and running, for example, "`sudo whoami`".

### Lock the pi account

We could delete the `pi` account instead of locking it, but some software in the currently Raspberry Pi OS distribution still relies on the existence of the `pi` user to work.

Before locking the `pi` account, make sure the new superuser account has `sudo` permission.

To lock the `pi` account, log onto the new superuser account set up in the previous step, then run "`sudo passwd --lock pi`".

### Password-protect sudo

By default, `sudo` does not require a password when invoked. To change this, run "`sudo visudo /etc/sudoers.d/010_pi-nopasswd`" and change the `pi` entry to:

```
pi ALL=(ALL) PASSWD: ALL
```

### [Update the OS](https://www.raspberrypi.com/documentation/computers/os.html#using-apt)

Run "`sudo apt update`", then "`sudo apt full-upgrade -y`", and finally "`sudo apt clean`".

The "`apt update`" command updates the list of software sources in the file `/etc/apt/sources.list`.

The "`apt full-upgrade`" command will upgrade all the installed packages to their latest versions. Before installing, this command will tell you how much space this will take on the SD card. Check you have enough free disk space by running "`df -h`" as `apt` will not do it for you.

The "`apt clean`" command will free up space by removing the downloaded `.deb` files which are kept in `/var/cache/apt/archives`.

### Automatic package update and upgrade

Set up a cron job to run the `apt update` and `apt upgrade` commands.

Alternatively, check out packages like `unattended-upgrades` with Raspberry Pi specific config.

Automatic updates may not be suitable for production because of potential dependency and compatibility issues with any software you are currently running.

### Kill unnecessary system services

To reduce idling power usage, and also reduce the areas for compromise, we disable all the running services which you don't need - e.g. wifi, bluetooth or sound card drivers.

To see all active services, run "`sudo systemctl --type=service --state=active`".

To disable the wifi service or the bluetooth service, run "`sudo systemctl disable --now wpa_supplicant.service`" or "`sudo systemctl disable --now bluetooth.service`" respectively.

To enable a service again, run "`sudo systemctl enable --now bluetooth.service`".

### [Restrict SSH accounts](https://www.raspberrypi.com/documentation/computers/configuration.html#improving-usernamepassword-security)

To allow or deny specific users, run `sudoedit /etc/ssh/sshd_config`. Under the line “`# Authentication`”, add the following line to allow users:

```
AllowUsers <account_name1> <account_name2>
```

You can also specifically stop some users from logging in with the following line:

```
DenyUsers <account_name1> <account_name2>
```

After the change, you will need to restart the sshd service using `sudo systemctl restart ssh` or by rebooting.

### [Use SSH key-based authentication](https://www.raspberrypi.com/documentation/computers/remote-access.html#passwordless-ssh-access)

Generating a public-private key-pair in Linux is done by running "`ssh-keygen`" on the _client_, with the keys stored in the `.ssh` folder in the user's home directory. You will be prompted for a passphrase during key generation for another layer of security. The private key is called `id_rsa` and the public key is called `id_rsa.pub`.

The public key now needs to be copied from the client to the server by running "`ssh-copy-id <USERNAME>@<IP-ADDRESS>`".

Finally, we could disable password logins, forcing all authentication to be key-pair based. Run "`sudo nano /etc/ssh/sshd_config`", then change these three lines to "no":

```
ChallengeResponseAuthentication no
PasswordAuthentication no
UsePAM no
```

Save and either restart the ssh system by running "`sudo service ssh reload`" or reboot the Pi.

### Firewall

Use _ufw_ (uncomplicated firewall). Need to be very careful not to lock yourself out. See [Raspberry Pi docs](https://www.raspberrypi.com/documentation/computers/configuration.html#install-a-firewall) for more information.

_This is a to-do item for me._

### Brute-force detection

Use _fail2ban_ which watches system logs for repeated login attempts and will add a firewall rule to prevent further access for a specified time. See [Raspberry Pi docs](https://www.raspberrypi.com/documentation/computers/configuration.html#install-a-firewall) for more information.

_This is a to-do item for me._
