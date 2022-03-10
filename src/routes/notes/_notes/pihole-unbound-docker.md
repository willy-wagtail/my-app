---
author: William Cheung
authorImage: william.jpg
date: 2022-03-07
description: This note documents what I did to set up a local network-wide ad-blocker using Pi-hole, with a local Unbound DNS server. Setup is done using docker to make it easy to deploy and upgrade on any machine. I currently have this running on a Raspberry Pi.
slug: pihole-unbound-docker
title: Network-wide ad-blocker with Pi-hole and Docker Compose
---

This note explains how to use _Docker Compose_ to setup, stop, and update a _Pi-hole_ local network-wide ad-blocker. This setup also installs an _Unbound_ DNS server on your local network.

I currently have this running on a Raspberry Pi 3b. The setup for that is [found here](https://github.com/willy-wagtail/bulbasaur-server/tree/main/pihole-unbound).

## Pre-requisites

The host should have Docker and Docker compose installed.

The host should also have Python3 installed for the optional step of running the script to add common false-positives to Pi-hole's whitelist.

## Configuration Files

Firstly, create a directory in which to host the five configuration files which follows.

Create a file named _Dockerfile_ by running "`sudo nano Dockerfile`" with the contents below. It has instuctions to install Unbound, then copy over the Unbound server configuration file as well as a startup script we will create shortly, before telling Docker to run the script on startup.

```
FROM pihole/pihole:latest
RUN apt update -y && apt install -y unbound
COPY unbound-pihole.conf /etc/unbound/unbound.conf.d/pi-hole.conf
COPY start_unbound_and_pihole.sh start_unbound_and_pihole.sh
RUN chmod +x start_unbound_and_pihole.sh
ENTRYPOINT ./start_unbound_and_pihole.sh
```

Create a file named _docker-compose.yml_ by running "`sudo nano docker-compose.yml`" with the following contents:

```
version: "3"

# More info at https://github.com/pi-hole/docker-pi-hole/ and https://docs.pi-hole.net/
services:
  pihole-unbound:
    build: .
    container_name: pihole-unbound
    image: pihole-unbound:latest
    ports:
      - "${PIHOLE_ServerIP}:53:53/tcp"
      - "${PIHOLE_ServerIP}:53:53/udp"
      - "67:67/udp"
      - "80:80/tcp"
      - "443:443/tcp"
    environment:
      ServerIP: $PIHOLE_ServerIP
      TZ: $PIHOLE_TIMEZONE
      WEBPASSWORD: $PIHOLE_PASSWORD
      DNS1: 127.0.0.1#5335
      DNS2: 127.0.0.1#5335
      DNSSEC: "true"
    # Volumes store your data between container upgrades
    volumes:
      - ~/.pihole-unbound/etc-pihole/:/etc/pihole:rw
      - ~/.pihole-unbound/etc-dnsmasq.d/:/etc/dnsmasq.d:rw
    # Recommended but not required (DHCP needs NET_ADMIN)
    #   https://github.com/pi-hole/docker-pi-hole#note-on-capabilities
    cap_add:
      - NET_ADMIN
    restart: unless-stopped
```

Create the environment variables referenced by the _docker-compose.yml_ file by running "`sudo nano .env`" to create a _.env_ file, and then add the environment variables, as below. You can add _.env_ to your _.gitignore_ file if you are commiting these files to source control so as to not reveal your password and IP address.

```
PIHOLE_PASSWORD=<password Pihole for web UI>
PIHOLE_ServerIP=<local IP Address of host>
PIHOLE_TIMEZONE=Europe/London
```

Create the configuration file for Unbound by running "`sudo nano unbound-pihole.conf`" with the following contents:

```
# Copied from https://docs.pi-hole.net/guides/unbound
server:
    verbosity: 0
    interface: 127.0.0.1
    port: 5335
    do-ip4: yes
    do-udp: yes
    do-tcp: yes
    do-ip6: no
    prefer-ip6: no
    harden-glue: yes
    harden-dnssec-stripped: yes
    use-caps-for-id: no
    edns-buffer-size: 1472
    prefetch: yes
    num-threads: 1
    so-rcvbuf: 1m

    private-address: 192.168.0.0/16
    private-address: 169.254.0.0/16
    private-address: 172.16.0.0/12
    private-address: 10.0.0.0/8
    private-address: fd00::/8
    private-address: fe80::/10
```

Finally, create a script to start Unbound server within the Pi-hole container by running "`sudo nano start_unbound_and_pihole.sh`" with the following contents:

```
#!/bin/bash -e
/etc/init.d/unbound start
/s6-init
```

## Startup

With the config files in place from the previous section, we can now build and start pihole-unbound docker container described by the _docker-compose.yml_ file. In the same directory as the _docker-compose.yml_ file, run the following docker commands:

```
# docker-compose up -d
# docker ps -a  // this is to get the id of the new docker container
# docker logs <container_id> // this is to check the start-up logs
```

Some hosts which Pi-hole blacklists may actually be legit websites one may wish to visit. There is a [curated list on GitHub](https://github.com/anudeepND/whitelist.git) of commonly white-listed websites to remove these false-positives. As an _optional_ step, we can run the following commands to download and run a script that will add these whitelisted domains to Pi-hole.

```
# git clone https://github.com/anudeepND/whitelist.git ~/Documents/pihole-whitelist
# cd ~/Documents/pihole-whitelist/
# sudo python3 ./scripts/whitelist.py --dir ~/.pihole-unbound/etc-pihole/ --docker
```

## Configure Your Local Network

Now that Pi-hole is running, we need to configure the internet traffic on your local network to go through Pi-hole.

On your home network's router, change the default DNS server setting to point to the IP address of the Pi-hole host, e.g. the Raspberry Pi's IP address. How you actually do this will depend on your router, and it is a good idea to setup a fallback DNS server incase this Pi-hole instance fails for whatever reason (perhaps a second device running Pi-hole).

For example, I have an ASUS router. Instructions on how to do this on an ASUS router can be [found here](https://www.asus.com/support/FAQ/1045253/)

## Verify

Verify that advert blocking works using this [ad-blocker test](https://ads-blocker.com/testing/), or by visiting any website with ads blacklisted by Pi-hole.

## Teardown

In the same directory as the _docker-compose.yml_ file, run the following command to stop the Pi-hole docker container:

```
# docker-compose down
```

## Update

The Pi-hole UI will tell you when there are updates available.

In the same directory as the _docker-compose.yml_ file, run the following command to stop the Pi-hole docker container:

```
# docker-compose down
```

Start the Pi-hole docker container once again, supplying the build flag to force it to build the image afresh.

```
# docker-compose up --build -d
```

There are different ways to set it up so that the system will automatically check and perform the updates. But it is so simple with Docker Compose that I prefer to just do it manually.
