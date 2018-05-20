#!/bin/bash

# Salt Master/Minion preconfiguration script
# Copyright (C) 2018  Pekka Helenius
#
# This program is free software: you can redistribute it and/or modify
# it under the terms of the GNU General Public License as published by
# the Free Software Foundation, either version 3 of the License, or
# (at your option) any later version.
#
# This program is distributed in the hope that it will be useful,
# but WITHOUT ANY WARRANTY; without even the implied warranty of
# MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
# GNU General Public License for more details.
#
# You should have received a copy of the GNU General Public License
# along with this program.  If not, see <https://www.gnu.org/licenses/>.

###########################################################

# This script sets up default environment for basic Salt Master & Minion configuration
# for one computer

# Supported distributions: Ubuntu

###########################################################
# Check for command dependencies

function checkCommands() {
    if [[ $(which --help 2>/dev/null) ]] && [[ $(echo --help 2>/dev/null) ]]; then

        COMMANDS=(grep mkdir systemctl id wget cat tee awk sed chmod)

        a=0
        for command in ${COMMANDS[@]}; do
            if [[ ! $(which $command 2>/dev/null) ]]; then
                COMMANDS_NOTFOUND[$a]=$command
                let a++
            fi
        done

        if [[ -n $COMMANDS_NOTFOUND ]]; then
            echo -e "\n${bash_red}Error:${bash_color_default} The following commands could not be found: ${COMMANDS_NOTFOUND[*]}\nAborting\n"
            exit 1
        fi
    else
        exit 1
    fi
}

checkCommands

###########################################################
# Check root

function checkRoot() {
    if [ $(id -u) -ne 0 ]; then
        echo "Run the script with root permissions (sudo or root)."
        exit 1
    fi
}

checkRoot

###########################################################
# Check network connection

function checkInternet() {
    if [[ $(echo $(wget --delete-after -q -T 5 github.com -o -)$?) -ne 0 ]]; then
        echo -e "\nInternet connection failed (GitHub). Please check your connection and try again.\n"
        exit 1
    fi
}

checkInternet

###########################################################
# Welcome message

function welcomeMessage() {

    read -r -p "This script will install Salt Master/Minion test environment. Continue? [y/N] " answer

    if [[ ! $(echo $answer | sed 's/ //g') =~ ^([yY][eE][sS]|[yY])$ ]]; then
        echo -e "Aborting.\n"
        exit 1
    fi

    unset answer

}

welcomeMessage

###########################################################
# Run package database updates?

function packageUpdateQ() {

    read -r -p "Refresh package databases before Salt installation? [y/N] " answer

    if [[ $(echo $answer | sed 's/ //g') =~ ^([yY][eE][sS]|[yY])$ ]]; then
        UPDATES=""
    fi
    
    unset answer

}

packageUpdateQ

###########################################################

if [[ -f /etc/os-release ]]; then

    DISTRO=$(grep ^PRETTY_NAME /etc/os-release | grep -oP '(?<=")[^\s]*')

    function installPackages() {

        case "${DISTRO}" in

            #Arch*)
            #    pkgmgr_cmd() {
            #        if [[ -z UPDATES ]]; then
            #            pacman -Suy && pacman -Fy
            #        fi
            #        pacman -S $1
            #    }

            #    PKGS=(salt openssh vagrant virtualbox)
            #    ;;
            Ubuntu*)
                pkgmgr_cmd() {
                    if [[ -v UPDATES ]]; then
                        apt-get update
                    fi
                    apt-get -y install $1
                }

                PKGS=(salt-master salt-minion)
                ;;
            default)
                echo -e "Can't recognize your Linux distribution. Aborting.\n"
                exit 1
        esac

        pkgmgr_cmd "${PKGS[*]}"
        systemctl enable salt-master.service &> /dev/null
        systemctl restart salt-master.service &> /dev/null

    }

    installPackages
    unset UPDATES

else
    echo -e "Can't recognize your Linux distribution. Aborting.\n"
    exit 1
fi

###########################################################

function saltEnvironment() {

    if [[ ! -d /srv/salt/apache/{data,scripts} ]]; then
        mkdir -p /srv/salt/apache/{data,scripts}
    fi

    function defaultMinionConf() {

        MINION_NAME="defaultMinion"

        if [[ -d /etc/salt ]]; then
            echo -e "\nWriting default Salt minion configuration '${MINION_NAME}' to /etc/salt/minion\n"
            echo -e "master: localhost\nid: ${MINION_NAME}" > /etc/salt/minion
            systemctl enable salt-minion.service &> /dev/null
            systemctl restart salt-minion.service &> /dev/null

            salt-key -y -a ${MINION_NAME} > /dev/null

            # Adding this sleep timer may reduce chance to failed connection tests in some cases
            sleep 5

            echo -e "Testing default Salt minion connection with the Salt master\n"

            if [[ $(echo $(salt "${MINION_NAME}" test.ping &> /dev/null)$?) -ne 0 ]]; then
                echo -e "Salt master can't connect to the default Salt minion. Aborting.\n"
                exit 1
            else
                echo -e "Connection OK!\n"
            fi

        else
            echo -e "Missing Salt configuration directory /etc/salt. Aborting.\n"
            exit 1
        fi

    }

    defaultMinionConf

}

if [ $? -eq 0 ]; then
    saltEnvironment
else
    echo -e "Unknown error. Aborting.\n"
    exit 1
fi

###########################################################

function getFiles() {
    echo -e "Downloading additional files\n"

    wget -q https://raw.githubusercontent.com/Fincer/salt_testrun/master/scripts/salt_pillar_apache_sample.sh \
    -O /srv/salt/apache/scripts/salt_pillar_apache_sample.sh

    wget -q https://raw.githubusercontent.com/Fincer/salt_testrun/master/data/sampleindex.html \
    -O /srv/salt/apache/data/sampleindex.html

    wget -q https://raw.githubusercontent.com/Fincer/salt_testrun/master/data/sampleindex_functions.js \
    -O /srv/salt/apache/data/sampleindex_functions.js

    chmod -R u+rw,go+r /srv/salt/apache
}

getFiles

cd /srv/salt/apache/scripts
bash ./salt_pillar_apache_sample.sh

sudo -u \#1000 xdg-open $(echo "http://${DISTRO}.${MINION_NAME}.com" | awk '{print tolower($0)}') &
