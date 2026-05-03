# loko-air-web-configurator

    +info - Print settings

    +erase - Erase settings

    debug - Enable debug output, Ex:debug 1

    + enable lorawan mode - Enable or disable LoRaWAN mode. Ex:enable lorawan mode 1
    + set id1 - Ex:set id1 123
    + set id2 - Ex:set id2 456
    + set freq - Frequency in HZ, Ex:set freq 866000000
    + p2p encryption - Enable or disable p2p encryption. Ex:p2p encryption 1
    + set p2p-key - Set Point to Point 32bit encryption key. Ex:set p2p-key 0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF0123456789ABCDEF
    + extended - Enable extended packet Ex:extended 1
    + set tx - Set lora TX power. Ex: set tx 10

    + wakeup period - Auto wake-up period in seconds, Ex:wakeup period 60
    + send every - Set wakeup count before send data.  0: disabled. Ex:send every 10

    + gtrace every - Set wakeup count before write GNSS trace. 0: disabled. Ex:gtrace every 10
    gtrace print - Show all gnss traces
    gtrace erase - Erase all gnss records

    + set dev-eui - Set end-device IEEE EUI. Ex:set dev-eui 0123456789ABCDEF
    + set app-eui - Set App/Join server IEEE EUI. Ex:set app-eui 0123456789ABCDEF
    + set app-key - Set Application root key LoRaWAN key. Ex:set app-key 0123456789ABCDEF0123456789ABCDEF
    + set region - Set LoRaWAN Active Region, use "set region ?" to print avalble regions


    + set gnss mode - Set navigation mode, allowed: 0-normal, 1-fitness, 2-aviation, 3-balloon, 4-stationary. Ex: set + gnss mode 1

