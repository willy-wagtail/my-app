---
author: William Cheung
authorImage: william.jpg
date: 2022-03-06
description: This note documents what I do to set up a fresh Raspberry Pi with the goal of running it headless. I also document some steps to improve the security of the Pi.
slug: raspberry-pi-setup
title: Setting Up A New Raspberry Pi
---

This note presents what I done to set up a fresh Raspberry Pi with the goal of running it headless. I also document some steps to improve the security of the Pi.

## Setting Up the Pi

### Prepare SD card

On another computer, download and install the [Raspberry Pi Imager](https://www.raspberrypi.org/software/), then use it to install an operating system onto your SD card. We'll use the _Raspberry Pi OS_.

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

The default user "_pi_" has root access and it's default password "_raspberry_" is used for every single Raspberry Pi OS install. The first thing to ever do is change this password.

Run "`sudo raspi-config`". Go to “_System Options_”, and then “_Password_”.

Alternatively, run "`sudo passwd`" which is what the raspi-config tool does under the hood anyway.

### Create a new superuser

Run "`sudo adduser <account_name>`" to create a new user. Type in a password for it.

Run the following command to add the new user to all the groups. This will give it the necessary permissions.

```
# sudo usermod -a -G adm,dialout,cdrom,sudo,audio,video,plugdev,games,users,input,netdev,gpio,i2c,spi <account_name>
```

Before moving on, make sure to check the new user has been successfully added to the `sudo` group by logging in with it and running, for example, "`sudo whoami`".

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

Check out `unattended-upgrades` with raspberry pi specific config. Not for production because of potential compatibility problems that may arise.

Alternatively, set up a cron job to run the update/upgrade commands.

See link to YouTube video above for more details.

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

<!--

## Install Docker and Docker Compose

<a name="installingdocker"></a>

# Installing Docker and Docker Compose

### Sources

https://www.raspberrypi.org/blog/docker-comes-to-raspberry-pi/
https://blog.alexellis.io/getting-started-with-docker-on-raspberry-pi/
https://sanderh.dev/setup-Docker-and-Docker-Compose-on-Raspberry-Pi/
https://dev.to/rohansawant/installing-docker-and-docker-compose-on-the-raspberry-pi-in-5-simple-steps-3mgl
https://www.zuidwijk.com/blog/installing-docker-and-docker-compose-on-a-raspberry-pi-4/

### Install Docker

Run `curl -sSL https://get.docker.com | sh`.

Then add your user to the docker usergroup by running `sudo gpasswd -a pi docker` - replacing pi with whatever account you use docker on your raspberry pi. Logout using `logout` command and log back in to make sure the group setting is applied. (You can check that your username is in the right groups using this command `grep '<username>' /etc/group`.)

Now test docker is installed with `docker version`.

You can also check that your user can run a docker container by running the hello-world container, `docker run hello-world`. Afterwards, clean up by removing the container and the hello-world image by firstly getting the container id by running `docker ps -a`. Then force remove the container by running `docker rm -f <container id>` which will stop and remove it. Finally, remove the downloaded image by running `docker image rm hello-world`.

### Install Docker Compose

Run `sudo apt install -y libffi-dev libssl-dev python3 python3-pip`, then `sudo apt remove python-configparser`, and finally run `sudo pip3 -v install docker-compose`.

Reboot the pi by running `sudo reboot`.

### Dump of Common Docker Commands

`docker ps -a`
`docker stop <container-id>`
`docker image ls`
`docker image rm <image-id>`
`docker rm -f <container-id>`
`docker exec -it <container-id> bash`
`docker build -t <docker-username>/<image-name>`
`docker push <docker-username>/<image-name>`

`docker-compose pull`
`docker-compose down`
`docker-compose up -d`

<a name="piholeandunboundwithdockercompose"></a>

# Pihole and Unbound with Docker Compose

### Sources

https://docs.pi-hole.net/
https://hub.docker.com/r/pihole/pihole/
https://github.com/pi-hole/docker-pi-hole
https://docs.pi-hole.net/guides/unbound/
https://github.com/chriscrowe/docker-pihole-unbound
https://github.com/anudeepND/whitelist
https://discourse.pi-hole.net/t/solved-dns-resolution-is-currently-unavailable/33725/3

### Start Pihole in container

> _Go to the next section if you want to start Pihole with Unbound. This is for starting Pihole only in a docker container._

Using the `docker-compose.yaml` file from https://hub.docker.com/r/pihole/pihole/ as reference, create the file by running `touch docker-compose.yml`, then `sudo nano docker-compose.yml` to open the file in an editor, and finally copy pasting the contents in.

Edit the file to uncomment the environment property `WEBPASSWORD` and point it to an environment variable - i.e. `WEBPASSWORD: $PIHOLE_PASSWORD`. Note that if we don't give it a password, a random one will be generated which you can find in the pihole startup logs.

Now pihole's web UI password will be set to whatever the environment variable `$PIHOLE_PASSWORD` is. You can set it on the pi by running: `export PIHOLE_PASSWORD=’<password>’`. A more permanent alternative is to create a file in the same directory as the docker-compose.yml file called `.env` by running `touch .env`, then go into the file using an editor by running `sudo nano .env` and add your environment variables - e.g. `PIHOLE_PASSWORD=password`.

In the directory where the `docker-compose.yml` is in, run `docker-compose up -d`. You can find the newly created container's id by running `docker ps -a`. Using the container id, you can use it to tail the logs as it starts up using `docker logs -f <docker container id>`.

### Start Pihole and Unbound in a single container

Clone this git repository by running `git clone https://github.com/willypapa/raspberrypi.git`. It will clone the files into `/raspberrypi` directory. Change directory to `cd docker-pihole-unbound` to find the `docker-compose.yml` file. We will now refer to the `pihole-unbound` service in this `docker-compose.yml` file.

In the directory where the `docker-compose.yml` is (i.e. `/raspberrypi/docker-pihole-unbound`), create a `.env` file by running `sudo nano .env`, then populate it with the environment variables that follows, changing the values to match your needs. These are referred to within the docker-compose.yml file.

```
PIHOLE_PASSWORD=password
PIHOLE_TIMEZONE=Europe/London
PIHOLE_ServerIP=<IP address of the host raspberry pi - e.g. 192.168.0.2>
```

Run `docker-compose up -d` to build and start the pihole-unbound container. You can find new container's id by running `docker ps -a`. Using the container id, you can use it to tail the logs as it starts up using `docker logs -f <docker container id>`.

To test unbound is working, access the bash terminal in the docker container by running `docker exec -it <container-id-of-pihole-unbound> bash`. Once in, run these two commands to test DNSSEC validation: `dig sigfail.verteiltesysteme.net @127.0.0.1 -p 5335` and `dig sigok.verteiltesysteme.net @127.0.0.1 -p 5335`. The first should give a status report of `SERVFAIL` and no IP address. The second should give `NOERROR` plus an IP address. See pihole's unbound docs for more info.

To confirm Pihole is up and pointing to unbound dns server, go to the local IP address of the host raspberry pi, e.g 192.168.0.2. You should see the Pihole dashboard at `<192.168.0.2>/admin`. Log in using the password set in the environment variable `$PIHOLE_PASSWORD`. Go to "Settings" and under the "DNS" tab, check that it is pointing to `127.0.0.1#5335` - which is the port we configured the unbound DNS server to listen to (see the `/docker-pihole-unbound/unbound-pihole.conf` file).

### Whitelist common false-positives

This is optional. Ths [github repo](https://github.com/anudeepND/whitelist.git) keeps a list of common false-positive domains for us to whitelist.

The whitelist is installed using a python script. However, the pihole/pihole docker image does not include a python installation. So we have to run the following on the host raspberry pi itself which should have python3 installed.

Run `git clone https://github.com/anudeepND/whitelist.git`, then `sudo python3 whitelist/scripts/whitelist.py --dir <path to /etc-pihole/ volume> --docker`

### Change Your Router's DNS Server

Log onto your home network's router (usually device 1 on your subnet - e.g. 192.168.0.1), and change the default DNS server to be the IP address of the raspberry pi running pihole. Instructions on how to do this will vary depending on your router.

### Verify that it works

Use this [ad blocker test](https://ads-blocker.com/testing/).

### Stopping the container

To stop the pihole-unbound container, go to the directory with the docker-compose.yml file and run `docker-compose down`.

### Updating Pihole-Unbound

When there is a new version available for pihole, you can update by first stopping the container by running `docker-compose down`, then rebuild and restart the docker container with `docker-compose up --build -d`. The build flag forces it to rebuild the image first which will pull the latest official pihole docker image.

### Set up VPN Server

Set up a OpenVPN or WireGuard VPN server so that your devices away from home can browse the internet through your locally hosted Pihole. See https://docs.pi-hole.net/guides/vpn/openvpn/overview/.

My router supports OpenVPN so I managed to set one up using that. Otherwise you could consider using PiVPN to setup a Wireguard or OpenVPN server on your raspberry pi. See [PiVPN](https://www.pivpn.io/) and [their docs](https://docs.pivpn.io/).

### Troubleshooting: DNS resolution is currently unavailable

I encountered [this issue](https://discourse.pi-hole.net/t/solved-dns-resolution-is-currently-unavailable/33725) a couple of times. When starting the pihole-unbound docker container, I see in the logs that the "DNS resolution is currently unavailable".

This is solved by `sudo nano /etc/resolv.conf`, and removing `nameserver <host-IP-address>`, leaving your home router's IP address. Or, replace it with `search home` there instead of having your host IP address.

Restart the pihole-unbound container after making the change.

<a name="log2ram"></a>

# Log2Ram

### Sources

https://github.com/azlux/log2ram
https://levelup.gitconnected.com/extend-the-lifespan-of-your-raspberry-pis-sd-card-with-log2ram-5929bf3316f2
https://www.geekbitzone.com/posts/log2ram/log2ram-raspberry-pi/

### Purpose

Log2ram is software that redirects logs to memory instead of the micro-SD card, only writing to the micro-SD card at set intervals or during system shutdown. By default, the interval is once a day. This supposedly extends the lifespan of micro-SD cards by reducing the number of writes to disk.

> If you use Docker on your Raspberry Pi, note that each container has its logs written inside their respective containers rather than `/var/log`, so won't benefit from log2ram.
>
> I've yet to explore a way to map them to /var/log to get benefit from log2ram (e.g. as suggested in [this github issue](https://github.com/gcgarner/IOTstack/issues/8)).

### Installing Log2Ram

Add Log2Ram repository to our apt sources list, `echo "deb http://packages.azlux.fr/debian/ buster main" | sudo tee /etc/apt/sources.list.d/azlux.list`.

Download the public key to allow us to install Log2Ram, `wget -qO - https://azlux.fr/repo.gpg.key | sudo apt-key add -`.

Update your apt packages, `sudo apt update`, then install log2ram, `sudo apt install log2ram`.

Reboot once installed, `sudo reboot`.

### Verify that it works

After reboot, check that log2ram is mounted on `/var/log` by runninng `df -h`.

Also verify that log2ram is mounted to `/var/log` by running `mount`.

### Uninstall

To uninstall, run `sudo apt remove log2ram --purge`. The purge option removes the config files as well. Using the verify steps above, check that log2ram has unmounted.
-->
