#!/bin/sh

rsync --delete -av --exclude="node_modules" --exclude="logs" --exclude="*.log" --exclude=".DS_Store" ../bayouxi bin@124.70.83.120:/cygdrive/c/webserver/bayouxi
