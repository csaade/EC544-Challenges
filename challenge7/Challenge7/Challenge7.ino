#include <SoftwareSerial.h>

#define MAX_RANDOM_NUM 50

// global varialbes
//char *address[]; // array of strings
SoftwareSerial xbSerial(2,3);

char id = 0;
char received_id = 0;
int time_counter = 0;

void setup() {
//  randomSeed(micros());
//  id = '0' + random(1, MAX_RANDOM_NUM);
//  id = '1';
  id = 1;
  
  // put your setup code here, to run once:
  Serial.begin(9600);
  xbSerial.begin(9600);
}

void loop() {
  while(xbSerial.available() > 0) {
    received_id = xbSerial.read();
    Serial.print("Received ID ");
    Serial.println(received_id, DEC);
  }

  if(time_counter >= 50) { // 5 seconds
    Serial.print("Sending my ID ");
    Serial.println(id, DEC);
    xbSerial.write(id);
    time_counter = 0;
  }
  
  delay(100);
  time_counter++;
}

