PRODUCT_ID(1783)
PRODUCT_VERSION(18)

#include <math.h>
#include <LIDARLite.h>
//#include <Servo.h>
#include <SharpIR.h>

#define model 20150
// ir: the pin where your sensor is attached
// model: an int that determines your sensor:  1080 for GP2Y0A21Y
//                                            20150 for GP2Y0A02Y
//                                            (working distance range according to the datasheets)
Servo wheels; // servo for turning the wheels
Servo esc; // not actually a servo, but controlled like one!
bool startup = true; // used to ensure startup only happens once
int startupDelay = 1000; // time to pause at each calibration step
double maxSpeedOffset = 45; // maximum speed magnitude, in servo 'degrees'
double maxWheelOffset = 85; // maximum wheel turn magnitude, in servo 'degrees'

SharpIR ir(D4, 20150);
LIDARLite lidar;
char *distanceString;

void setup()
{
  Serial.begin(9600);
  wheels.attach(D2); // initialize wheel servo to Digital IO Pin #8
  esc.attach(D3); // initialize ESC to Digital IO Pin #9
  /*  If you're re-uploading code via USB while leaving the ESC powered on,
   *  you don't need to re-calibrate each time, and you can comment this part out.
   */
  calibrateESC();
  
  distanceString = (char *)malloc(10 * sizeof(char));

  lidar.begin(0, true);
  lidar.configure(0);
  //lidar.changeAddress(LIDARLITE_ADDR_SECOND, LIDARLITE_ADDR_DEFAULT);

  //lidar.begin(0, true);
  //lidar.configure(0);
}

/* Convert degree value to radians */
double degToRad(double degrees){
  return (degrees * 71) / 4068;
}

/* Convert radian value to degrees */
double radToDeg(double radians){
  return (radians * 4068) / 71;
}

/* Calibrate the ESC by sending a high signal, then a low, then middle.*/
void calibrateESC(){
    esc.write(180); // full backwards
    delay(startupDelay);
    esc.write(0); // full forwards
    delay(startupDelay);
    esc.write(90); // neutral
    delay(startupDelay);
    esc.write(90); // reset the ESC to neutral (non-moving) value
}

/* Oscillate between various servo/ESC states, using a sine wave to gradually
 *  change speed and turn values.
 *
void oscillate(){
  for (int i =0; i < 360; i++){
    double rad = degToRad(i);
    double speedOffset = sin(rad) * maxSpeedOffset;
    double wheelOffset = sin(rad) * maxWheelOffset;
    esc.write(90 + speedOffset);
    wheels.write(90 + wheelOffset);
    delay(50);
  }
}
*/
void loop()
{
  delay(500);

  /*Serial.println(lidar.distance());*/
  int distance = lidar.distance(true, LIDARLITE_ADDR_DEFAULT);
  itoa(distance, distanceString, 10);

  //Particle.publish("distance", distanceString);
  /*Serial.println(distance);*/

  unsigned long pepe1=millis();  // takes the time before the loop on the library begins

  int dis = ir.distance();  // this returns the distance to the object you're measuring
  Serial.print("Mean distance: ");  // returns it to the serial monitor
  Serial.println(dis);

  unsigned long pepe2=millis()-pepe1;  // the following gives you the time taken to get the measurement
  Serial.print("Time taken (ms): ");
  Serial.println(pepe2);


  if(dis < 50)
  {
    wheels.write(90);
    esc.write(90); //neutral
    delay(50);
  }
}
