#include <SoftwareSerial.h>
#include <math.h>
// XBee's DOUT (TX) is connected to pin 2 (Arduino's Software RX)
// XBee's DIN (RX) is connected to pin 3 (Arduino's Software TX)
SoftwareSerial XBee(2, 3); // RX, TX

char *status_string;
int LED_array[4] = {0, 0, 0, 0};
/*
 * [0]: r
 * [1]: b
 * [2]: g
 * [3]: y
 */

void setup() {
  // put your setup code here, to run once:
  pinMode(4, OUTPUT); // r
  pinMode(5, OUTPUT); // g
  pinMode(10, OUTPUT); // b
  pinMode(13, OUTPUT); // y

  digitalWrite(4, LOW);
  digitalWrite(5, LOW);
  digitalWrite(10, LOW);
  digitalWrite(13, LOW);

  XBee.begin(9600);
  Serial.begin(9600);
  status_string = (char *) malloc(50*sizeof(char));

}

void loop() {

  char LED_color;
  if(XBee.available()) {
    LED_color = XBee.read();
    Serial.println(LED_color);

    switch (LED_color) {
      case 'r':
        LED_array[0] ^= 1;
        sprintf(status_string, "r:%d\n", LED_array[0]);
        XBee.write(status_string);
        digitalWrite(4, LED_array[0]); // r
        break;
      case 'b':
        LED_array[1] ^= 1;
        sprintf(status_string, "b:%d\n", LED_array[1]);
        XBee.write(status_string);
        digitalWrite(10, LED_array[1]); // b
        break;
      case 'g':
        LED_array[2] ^= 1;
        sprintf(status_string, "g:%d\n", LED_array[2]);
        XBee.write(status_string);
        digitalWrite(5, LED_array[2]); // g
        break;
      case 'y':
        LED_array[3] ^= 1;
        sprintf(status_string, "y:%d\n", LED_array[3]);
        XBee.write(status_string);
        digitalWrite(13, LED_array[3]); // y
        break;
      default:
        Serial.println("Error: unrecognized command");
        break;
    }
  }
}
