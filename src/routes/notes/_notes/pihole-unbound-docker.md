---
author: William Cheung
authorImage: william.jpg
date: 2022-03-07
description: This note documents what I did to set up a local network-wide ad-blocker using Pi-hole, with a local Unbound DNS server. Setup is done using docker to make it easy to deploy and upgrade on any machine. I currently have this running on a Raspberry Pi.
slug: pihole-unbound-docker
title: Network-wide ad-blocking with Pi-hole and Docker Compose
---

This note explains how to use _Docker Compose_ to setup, stop, and update a _Pi-hole_ local network-wide ad-blocker. This setup also installs an _Unbound_ DNS server on your local network.

I currently have this running on a Raspberry Pi 3b.

## Setup

In the same directory as the _docker-compose.yml_ file, create the environment variables it references by running "`sudo nano .env`" to create a _.env_ file, and then add the environment variables, as below:

```
PIHOLE_PASSWORD=<password Pihole for web UI>
PIHOLE_ServerIP=<local IP Address of host>
PIHOLE_TIMEZONE=Europe/London
```

We can now build and start pihole-unbound docker container described by the _docker-compose.yml_ file. In the same directory as the _docker-compose.yml_ file, run the following docker commands:

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

Now that Pi-hole is running, we need to configure the internet traffic on your local network to go through Pi-hole. On your home network's router, change the default DNS server setting to point to the IP address of the Pi-hole host, e.g. the Raspberry Pi's IP address. How you actually do this will depend on your router, and it is a good idea to setup a fallback DNS server incase this Pi-hole instance fails for whatever reason (perhaps a second device running Pi-hole).

Finally, verify that advert blocking works using this [ad-blocker test](https://ads-blocker.com/testing/).

## Teardown

In the same directory as the _docker-compose.yml_ file, run the following command to stop the Pi-hole docker container:

```
# docker-compose down
```

## Update

In the same directory as the _docker-compose.yml_ file, run the following command to stop the Pi-hole docker container:

```
# docker-compose down
```

Start the Pi-hole docker container once again, supplying the build flag to force it to build the image afresh.

```
# docker-compose up --build -d
```
