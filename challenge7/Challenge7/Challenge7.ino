#include <SoftwareSerial.h>

#include <Printers.h>
#include <XBee.h>

#define ADDRESS_MAX_LENGTH 100

// global varialbes
//char *address[]; // array of strings
SoftwareSerial xbeeSerial(2,3);
XBee xbee = XBee();

uint8_t id = 3;
XBeeResponse response = XBeeResponse();
ZBRxResponse rx = ZBRxResponse();

void setup() {
  // put your setup code here, to run once:
  Serial.begin(9600);
  xbeeSerial.begin(9600);
  xbee.setSerial(xbeeSerial);
}
char ids;
void loop() {
  // put your main code here, to run repeatedly:
/*
  xbee.write(id);

  xbee.send

  while(xbee.available() > 0) {
    ids = xbee.read();
    Serial.println(ids);
    
  }
delay(2000);
  */
  xbee.readPacket();
  if(xbee.getResponse().isAvailable()) {
    if(xbee.getResponse().getApiId() == ZB_RX_RESPONSE) {
      xbee.getResponse().getZBRxResponse(rx);
      XBeeAddress64 addr = rx.getRemoteAddress64();
      Serial.print(addr.getMsb());
      Serial.println(addr.getLsb());
    }
  }

  XBeeAddress64 localAddr = xbee.getAddress();

  delay(1000);

  XBeeAddress64 sendAddr = XBeeAddress64(0x0, 0xFFFF);
  uint8_t values[] = {id};
  ZBTxRequest zbTx = ZBTxRequest(sendAddr, values, sizeof(values));
  xbee.send(zbTx);
  
}
