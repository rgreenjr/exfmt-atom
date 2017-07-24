#!/usr/bin/env bash

cd "$@" && mix exfmt --stdin
