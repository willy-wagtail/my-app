---
author: William Cheung
authorImage: william.jpg
date: 2022-03-07
description: This note documents what I did to set up a local network-wide ad-blocker using Pi-hole, with a local Unbound DNS server. Setup is done using docker to make it easy to deploy and upgrade on any machine. I currently have this running on a Raspberry Pi.
slug: pihole-unbound-docker
title: Network-wide ad-blocking with Pi-hole
---

This note explains how to setup, how to stop, and how to update a Pi-hole ad-blocker with Unbound DNS server on your local network. I currently have this running on a Raspberry Pi 3b.

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

Optional - Some hosts which Pi-hole blacklists may actually be legit websites one may wish to visit. There is a curated list of commonly white-listed websites to remove these false-positives. Run the following commands to download and run a script which updates Pi-hole's whitelist.

```
# git clone https://github.com/anudeepND/whitelist.git ~/Documents/pihole-whitelist
# cd ~/Documents/pihole-whitelist/
# sudo python3 ./scripts/whitelist.py --dir ~/.pihole-unbound/etc-pihole/ --docker
```

Now that Pi-hole is running, we need to configure the internet traffic on your local network to go through Pi-hole. On your home network's router, change the default DNS server to point to the IP address of the pihole-unbound host, e.g. the Raspberry Pi's IP address. How you actually do this will depend on your router, and it is a good idea to setup a fallback DNS server incase this Pi-hole instance fails for whatever reason (perhaps a second device running Pi-hole).

Finally, verify that advert blocking works using this [ad-blocker test](https://ads-blocker.com/testing/).

## Teardown

Stop pihole-unbound docker container

- `docker-compose down`

## Update

Stop the pihole-unbound docker container you want to upgrade. In the same directory as the _docker-compose.yml_ file, run the command:

```
# docker-compose down
```

Start pihole-unbound docker container again, forcing it to build again by supplying the build flag.

```
# docker-compose up --build -d
```
