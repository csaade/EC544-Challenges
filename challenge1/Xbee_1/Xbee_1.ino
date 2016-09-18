/*****************************************************************
XBee_Serial_Passthrough.ino

Set up a software serial port to pass data between an XBee Shield
and the serial monitor.

Hardware Hookup:
  The XBee Shield makes all of the connections you'll need
  between Arduino and XBee. If you have the shield make
  sure the SWITCH IS IN THE "DLINE" POSITION. That will connect
  the XBee's DOUT and DIN pins to Arduino pins 2 and 3.

*****************************************************************/
// We'll use SoftwareSerial to communicate with the XBee:
#include <SoftwareSerial.h>
#include <math.h>
// XBee's DOUT (TX) is connected to pin 2 (Arduino's Software RX)
// XBee's DIN (RX) is connected to pin 3 (Arduino's Software TX)
SoftwareSerial XBee(2, 3); // RX, TX

double Thermistor(int RawADC) {
 double Temp;
 Temp = log(10000.0*((1024.0/RawADC-1))); 
 Temp = 1 / (0.001129148 + (0.000223125 + (0.0000000876741 * Temp * Temp ))* Temp );
 Temp = Temp - 273.15;           
 return Temp;
}

char *temp_string;

void setup()
{
  temp_string = (char *) malloc(50*sizeof(char));
  // Set up both ports at 9600 baud. This value is most important
  // for the XBee. Make sure the baud rate matches the config
  // setting of your XBee.
  XBee.begin(9600);
  Serial.begin(9600);
}

void loop()
{
  int val;                
  int temp;
  val=analogRead(0);      
  temp=(int) Thermistor(val); //Cast to int because arduino cant do doubles/floats
  memset(temp_string, 0, sizeof(char)*50); // sets all characters in string to 0
  sprintf(temp_string, "1:%d\n", temp);
  Serial.print(temp_string);
  XBee.write(temp_string);
  delay(2000);            
}

