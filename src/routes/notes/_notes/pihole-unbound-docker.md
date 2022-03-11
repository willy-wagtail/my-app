---
author: William Cheung
authorImage: william.jpg
date: 2022-03-07
description: This note documents what I did to set up a local network-wide ad-blocker using Pi-hole, with a local Unbound DNS server. Setup is done using docker to make it easy to deploy and upgrade on any machine. I currently have this running on a Raspberry Pi.
slug: pihole-unbound-docker
title: Network-wide ad-blocker with Pi-hole and Docker Compose
---

This note explains how to use _Docker Compose_ to setup, stop, and update a _Pi-hole_ local network-wide ad-blocker. This setup also installs an _Unbound_ DNS server on your local network.

I currently have this running on a Raspberry Pi 3b. The setup described in this note can be [found here on GitHub](https://github.com/willy-wagtail/bulbasaur-server/tree/main/pihole-unbound).

## Pre-requisites

I run this on a Raspberry Pi 3b+ and I have a separate note on [how I set up a fresh Raspberry Pi](raspberry-pi-setup).

The host should have Docker and Docker compose installed.

The host should also have Git and Python3 installed for the optional step of running the script to add common false-positives to Pi-hole's whitelist.

## Configuration

Firstly, create a directory in which to host the five files which follows.

### Dockerfile

Create a file named _Dockerfile_ by running "`sudo nano Dockerfile`" with the contents below. It has instuctions to install Unbound, then copy over the Unbound server configuration file as well as a startup script we will create shortly, before telling Docker to run the script on startup.

```
FROM pihole/pihole:latest
RUN apt update -y && apt install -y unbound
COPY unbound-pihole.conf /etc/unbound/unbound.conf.d/pi-hole.conf
COPY start_unbound_and_pihole.sh start_unbound_and_pihole.sh
RUN chmod +x start_unbound_and_pihole.sh
ENTRYPOINT ./start_unbound_and_pihole.sh
```

### Docker compose file

Create a file named _docker-compose.yml_ by running "`sudo nano docker-compose.yml`" with the following contents:

```
version: "3"

# More info at https://github.com/pi-hole/docker-pi-hole/
# and https://docs.pi-hole.net/
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

### Environment variables

Create the environment variables referenced by the _docker-compose.yml_ file by running "`sudo nano .env`" to create a _.env_ file, and then add the environment variables, as below. You can add _.env_ to your _.gitignore_ file if you are commiting these files to source control so as to not reveal your password and IP address.

```
PIHOLE_PASSWORD=<password Pihole for web UI>
PIHOLE_ServerIP=<local IP Address of host>
PIHOLE_TIMEZONE=Europe/London
```

If you don't supply a Pi-hole password here, a random one will be generated at startup and shown in the system startup logs. This password is used to access the Pi-hole admin dashboard.

### Unbound configuration file

Create the configuration file for Unbound by running "`sudo nano unbound-pihole.conf`" with the following contents:

```
# Copied from https://docs.pi-hole.net/guides/unbound/ on 23rd Jan 2021.

server:
    # If no logfile is specified, syslog is used
    # logfile: "/var/log/unbound/unbound.log"
    verbosity: 0

    interface: 127.0.0.1
    port: 5335
    do-ip4: yes
    do-udp: yes
    do-tcp: yes

    # May be set to yes if you have IPv6 connectivity
    do-ip6: no

    # You want to leave this to no unless you have *native* IPv6. With 6to4 and
    # Terredo tunnels your web browser should favor IPv4 for the same reasons
    prefer-ip6: no

    # Use this only when you downloaded the list of primary root servers!
    # If you use the default dns-root-data package, unbound will find it
    # automatically.
    # root-hints: "/var/lib/unbound/root.hints"

    # Trust glue only if it is within the server's authority
    harden-glue: yes

    # Require DNSSEC data for trust-anchored zones, if such data is absent,
    # the zone becomes BOGUS
    harden-dnssec-stripped: yes

    # Don't use Capitalization randomization as it known to sometimes
    # cause DNSSEC issues sometimes
    # see https://discourse.pi-hole.net/t/unbound-stubby-or-dnscrypt-proxy/9378
    use-caps-for-id: no

    # Reduce EDNS reassembly buffer size.
    # Suggested by the unbound man page to reduce fragmentation reassembly problems
    edns-buffer-size: 1472

    # Perform prefetching of close to expired message cache entries
    # This only applies to domains that have been frequently queried
    prefetch: yes

    # One thread should be sufficient, can be increased on beefy machines.
    # In reality for most users running on small networks or on a single machine,
    # it should be unnecessary to seek performance enhancement by increasing
    # num-threads above 1.
    num-threads: 1

    # Ensure kernel buffer is large enough to not lose messages in traffic spikes
    so-rcvbuf: 1m

    # Ensure privacy of local IP ranges
    private-address: 192.168.0.0/16
    private-address: 169.254.0.0/16
    private-address: 172.16.0.0/12
    private-address: 10.0.0.0/8
    private-address: fd00::/8
    private-address: fe80::/10
```

### Startup script

Finally, create a script to start Unbound server within the Pi-hole container by running "`sudo nano start_unbound_and_pihole.sh`" with the following contents:

```
#!/bin/bash -e
/etc/init.d/unbound start
/s6-init
```

## Starting It Up

With the configuration files in place from the previous section, we can now build and start pihole-unbound docker container described by the _docker-compose.yml_ file.

### Startup

In the same directory as the _docker-compose.yml_ file, run the following docker commands:

```
# docker-compose up -d
# docker ps -a  // this is to get the id of the new docker container
# docker logs <container_id> // this is to check the start-up logs
```

To [test Unbound is working](https://docs.pi-hole.net/guides/dns/unbound/#test-validation), access the bash terminal in the docker container by running "`docker exec -it <container-id> bash`". Once in, run these two commands to test DNSSEC validation: "`dig sigfail.verteiltesysteme.net @127.0.0.1 -p 5335`" and "`dig sigok.verteiltesysteme.net @127.0.0.1 -p 5335`". The first should give a status report of `SERVFAIL` and no IP address. The second should give `NOERROR` plus an IP address.

To confirm Pi-hole is up and pointing to Unbound DNS server, go to the local IP address of the host Raspberry Pi, e.g 192.168.0.2 on your web browser. You should see the Pihole dashboard at `http://<192.168.0.2>/admin`. Log in using the password set in the environment variable "`PIHOLE_PASSWORD`" in the `.env` file. Go to "_Settings_" and under the "_DNS_" tab, check that it is pointing to "`127.0.0.1#5335`". This is the port we configured the Unbound DNS server to listen to in the Unbound configuration file.

### Add common white-lists

Some hosts which Pi-hole blacklists may actually be legit websites one may wish to visit. There is a [curated list on GitHub](https://github.com/anudeepND/whitelist.git) of commonly white-listed websites to remove these false-positives. As an _optional_ step, we can run the following commands to download and run a script that will add these whitelisted domains to Pi-hole.

```
# git clone https://github.com/anudeepND/whitelist.git ~/Documents/pihole-whitelist
# cd ~/Documents/pihole-whitelist/
# sudo python3 ./scripts/whitelist.py --dir ~/.pihole-unbound/etc-pihole/ --docker
```

### Configure your local network

Now that Pi-hole is running, we need to configure the internet traffic on your local network to go through Pi-hole.

On your home network's router, change the default DNS server setting to point to the IP address of the Pi-hole host, e.g. the Raspberry Pi's IP address. How you actually do this will depend on your router, and it is a good idea to setup a fallback DNS server incase this Pi-hole instance fails for whatever reason (perhaps a second device running Pi-hole).

For example, I have an ASUS router. Instructions on how to do this on an ASUS router can be [found here](https://www.asus.com/support/FAQ/1045253/)

### Verify ad-blocking

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

### Remotely accessing Pi-hole

Devices away from home can browse the internet through your locally hosted Pi-hole by using a self-hosted VPN server.

Set up a [OpenVPN](https://docs.pi-hole.net/guides/vpn/openvpn/overview/) or [WireGuard VPN](https://docs.pi-hole.net/guides/vpn/wireguard/overview/) server (perhaps on a Raspberry Pi!) to do this. Also consider looking into [PiVPN](https://www.pivpn.io/) to setup a Wireguard or OpenVPN server.

My ASUS router supports OpenVPN so I managed to set one up running on my router hardware.
