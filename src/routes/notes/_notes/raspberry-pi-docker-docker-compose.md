---
author: William Cheung
authorImage: william.jpg
date: 2022-03-13
description: Instructions on how to install Docker and Docker Compose on Raspberry Pi.
slug: raspberry-pi-docker-docker-compose
title: Docker and Docker Compose on a Raspberry Pi
---

Instructions on how to install Docker and Docker Compose on Raspberry Pi.

### Installing Docker

There are [multiple ways](https://docs.docker.com/engine/install/debian/#installation-methods) to install Docker, but the only supported approach for Raspberry Pi OS is via the [Docker convenience script](https://github.com/docker/docker-install) which is actually not recommended for production environments. _This is because downloading scripts from the internet and running it with root/sudo privileges is a security risk._

So, with that in mind 😊, run the following:

```
# curl -fsSL https://get.docker.com -o get-docker.sh
# sh get-docker.sh
```

(_Note that it is a [bad idea](https://www.idontplaydarts.com/2016/04/detecting-curl-pipe-bash-server-side/) to pipe `curl/wget` directly into `bash` or `sh`._)

Next, run the following commands to add your user account to the docker usergroup by running "`sudo gpasswd -a <username> docker`". Logout using the "`logout`" command, then log back in to make sure the group setting is applied. (You can also check that your username is in the right groups using this command "`grep '<username>' /etc/group`" or "`group ${<username>}`.)

Test docker is installed with "`docker version`".

You can also check that your user can run a docker container by running the hello-world container, "`docker run hello-world`". Afterwards, clean up by removing the container and the hello-world image. Firstly, get the container id by running "`docker ps -a`". Then remove the container by running "`docker rm -f <container id>`" which will stop and remove it. Finally, remove the downloaded image by running `docker image rm hello-world`.

### Installing Docker Compose

We'll install Docker Compose [using pip](https://docs.docker.com/compose/install/#install-using-pip). Run the following commands:

```
# sudo apt-get install libffi-dev libssl-dev
# sudo pip3 install docker-compose
```

Verify installation by running "`docker-compose version`".
