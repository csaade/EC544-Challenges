PRODUCT_ID(1783)
PRODUCT_VERSION(3)

#include <math.h>

double temp = 0;
int thermistorPin = A1;

void setup()
{
  Particle.variable("temp", temp);
  pinMode(thermistorPin, INPUT);
}

void loop()
{
  int rawADC = analogRead(thermistorPin); // Read pin

  // Convert to celsius
  //double converted = log(10000.0*((1024.0/rawADC-1)));
  //converted = 1 / (0.001129148 + (0.000223125 + (0.0000000876741 * converted * converted)) * converted);
  //converted = converted - 273.15;
  temp = (((rawADC * 3.3)/4095) - 0.5) * 100;

  //temp = converted;

  delay(250);
}