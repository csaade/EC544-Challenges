PRODUCT_ID(1783)
PRODUCT_VERSION(13)

#include <math.h>

double temp = 0;
int thermistorPin = A1;
int rawADC = 0;
char tempString[10];

void setup()
{
  Particle.variable("temp", temp);
  Particle.variable("rawADC", rawADC);
  pinMode(thermistorPin, INPUT);
}

void loop()
{
  rawADC = analogRead(thermistorPin); // Read pin

  // Convert to celsius
  //temp = log(10000.0*((1024.0/rawADC-1)));
  //temp = 1 / (0.001129148 + (0.000223125 + (0.0000000876741 * temp * temp)) * temp);
  //temp = temp - 273.15;

  temp = ((((rawADC * 3.3)/4095) - 0.5) * 100) - 85;
  //snprintf(tempString, 10, "%f", temp);

  //Particle.publish("sendTemp", tempString, PRIVATE);

  delay(500);
}
