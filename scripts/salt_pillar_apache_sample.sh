#!/bin/bash

# Salt Master/Minion preconfiguration script - Apache set-up
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

# - This script creates default  apache configuration for Salt minion running on localhost
# - This script is meant to be run on Salt master
# - Use as a part of the main shell script. Individual usage not recommended
# 
# NOTE: Not exactly using Salt pillar configuration template
#
###########################################################

if [ $(id -u) -eq 0 ]; then

if [ ! -f /srv/salt/top.sls ]; then
cat <<PILLAR_TOP > /srv/salt/top.sls
base:
PILLAR_TOP
fi

if [ $(grep "\- apache" /srv/salt/top.sls | wc -l) -eq 0 ]; then
tee -a /srv/salt/top.sls <<PILLAR_TOP_ADD > /dev/null
  'defaultMinion':
    - apache
PILLAR_TOP_ADD
fi

cat <<SAMPLE_SITE_CONF > /srv/salt/apache/samplesite.conf
<VirtualHost *:80>
    ServerName {{ servername }}
    ServerAlias {{ serveralias }}
    ServerAdmin webmaster@localhost
    DocumentRoot {{ ('/var/www/html/' + grains_id + '/') }}
    ErrorLog ${APACHE_LOG_DIR}/error.log
    CustomLog ${APACHE_LOG_DIR}/access.log combined
</VirtualHost>
SAMPLE_SITE_CONF

cat << DEFAULT_SITE > /srv/salt/apache/defaultsite.html
Default site
DEFAULT_SITE

cat <<APACHE_DATA > /srv/salt/apache/init.sls

{% set grains_id = grains['id'].lower() %}
{% set grains_os = grains['os'].lower() %}

{% set servername = grains_os + '.' + grains_id + '.com' %}
{% set serveralias = 'www.' + grains_os + '.' + grains_id + '.com' %}

{% if grains_os == 'ubuntu' %}

{% set apache_pkgname = 'apache2' %}
{% set apache_confdir = 'apache2' %}
{% set apache_servicename = 'apache2.service' %}
{% set curl_pkgname = 'curl' %}

{# TODO: support for more OSes #}
{% endif %}

apache_install:
  pkg.installed:
    - pkgs:
      - {{ apache_pkgname }}
      - {{ curl_pkgname }}

sample_page_conf:
  file.managed:
    - name: /etc/{{ apache_confdir }}/sites-available/{{ grains_id }}.conf
    - source: 
      - salt://apache/samplesite.conf
    - mode: 0644
    - user: root
    - group: root
    - template: jinja
    - context:
      servername: {{ servername }}
      serveralias: {{ serveralias }}
      grains_id: {{ grains_id }}
    - require:
      - pkg: apache_install

enable_sample_page:
  cmd.run:
    - name: 'a2ensite {{ grains_id }}.conf'
    - require:
      - file: sample_page_conf

remove_default_index:
    file.managed:
        - name: /var/www/html/index.html
        - source: salt://apache/defaultsite.html
        - require:
          - pkg: apache_install

sample_page_content:
  file.managed:
    - mode: 0644
    - user: root
    - group: root
    - makedirs: True
    - name: {{ ('/var/www/html/' + grains_id + '/index.html') }}
    - source: salt://apache/data/sampleindex.html
    - require:
      - cmd: enable_sample_page

sample_page_js_content:
  file.managed:
    - mode: 0644
    - user: root
    - group: root
    - makedirs: True
    - name: {{ ('/var/www/html/' + grains_id + '/sampleindex_functions.js') }}
    - source: salt://apache/data/sampleindex_functions.js
    - require:
      - file: sample_page_content

add_vhost_domain:
  file.append:
    - name: /etc/hosts
    - text: 127.0.0.1 {{ servername }}
    - require:
      - file: sample_page_content
      
restart_apache:
  service.running:
    - name: {{ apache_servicename }}
    - watch:
      - file: add_vhost_domain
      - cmd: enable_sample_page

test_page:
  http.query:
    - name: {{ 'http://' + servername }}
    - status: 200
    - require:
      - service: restart_apache

APACHE_DATA

    if [ ! -f /srv/salt/apache/init.sls ] || \
    [ ! -f /srv/salt/top.sls ] || \
    [ ! -f /srv/salt/apache/samplesite.conf ] || \
    [ ! -f /srv/salt/apache/data/sampleindex.html ] || \
    [ ! -f /srv/salt/apache/data/sampleindex_functions.js ]; then
        echo "Salt files missing. Aborting."
        exit 1
    else
        echo -e "\e[1m**Salt -- state.apply output**\n\e[0m"
        salt 'defaultMinion' state.apply apache --state-output terse
    fi
else
    echo "Run this script as root (or with sudo)"
fi
