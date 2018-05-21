# Salt testrun
## Minimal Salt Master/Minion configuration for a single Linux computer

----------------------

## About

What is Salt? Check out [SaltStack official website](saltstack.com) for more information.

----------------------

This repository creates a basic Salt Master/Minion configuration for a single Linux computer with minimal Apache Web server installation.

Basically, the following is done in the target system:

1) Check system environment requirements

    - Critical commands
    
    - Network connection
    
    - etc.
    
2) Install Salt Master

3) Install Salt Minion

    - Configure Salt Minion to establish connection to the Salt master daemon. Check the connection.
    
4) Deploy necessary Salt state files into the system in order to install Apache web server

5) Install & configure Apache web server automatically using SaltStack environment

6) Run a simple HTML/JavaScript test website on the localhost

## Support

Currently only Ubuntu 16.04 LTS or above is supported.

## Usage

Simply run the following in your terminal

```
wget https://raw.githubusercontent.com/Fincer/salt_testrun/master/salt_testrun.sh
sudo bash ./salt_testrun.sh

```

## License

This repository uses [GPLv3 license](https://github.com/Fincer/salt_testrun/blob/master/LICENSE)
