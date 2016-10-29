PRODUCT_ID(1783)
PRODUCT_VERSION(18)

#include <math.h>
#include <LIDARLite.h>
//#include <Servo.h>
#include <SharpIR.h>

//#define model 20150
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
char *distanceString5;
char *distanceString6;
char *distanceIR;


bool initial = TRUE;
int initial_distance;

void setup()
{
  /*Serial.begin(9600);
  Serial.println("What's up");*/

  wheels.attach(D2); // initialize wheel servo to Digital IO Pin #2
  esc.attach(D3); // initialize ESC to Digital IO Pin #3
  /*  If you're re-uploading code via USB while leaving the ESC powered on,
   *  you don't need to re-calibrate each time, and you can comment this part out.
   */

  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);

  calibrateESC();

  distanceString5 = (char *)malloc(10 * sizeof(char));
  distanceString6 = (char *)malloc(10 * sizeof(char));
  distanceIR = (char *)malloc(10 * sizeof(char));

  digitalWrite(D5, HIGH);
  digitalWrite(D6, LOW);
  delay(20);
  lidar.begin(0, true);
  lidar.configure(0);
  lidar.changeAddress(LIDARLITE_ADDR_SECOND, true, LIDARLITE_ADDR_DEFAULT);

  digitalWrite(D6, HIGH);
  delay(20);
  lidar.configure(0);
  /*lidar.changeAddress(LIDARLITE_ADDR_SECOND, LIDARLITE_ADDR_DEFAULT);
  lidar.configure(0, LIDARLITE_ADDR_SECOND);
  delay(5);
  digitalWrite(D6, HIGH);
  delay(5);
  lidar.configure(0);*/

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
int distance5;
int distance6;
void loop()
{
  delay(1000);
  /*int distance = 0;

  if(initial) {
    initial = FALSE;
    inital_distance = lidar.distance();
  } else {
    distance = lidar.distance();
    itoa(distance, distanceString, 10);


    Particle.publish("distance", distanceString);

    esc.write(0); // full forward
    if(distance < initial_distance) {
      wheels.write(90); // go left?
    }
    else {
      wheels.write(90); // go write
    }
  }*/
  distance5 = lidar.distance(true, LIDARLITE_ADDR_SECOND);
  itoa(distance5, distanceString5, 10);
  Particle.publish("distance5", distanceString5);
  delay(10);

  distance6 = lidar.distance(true, LIDARLITE_ADDR_DEFAULT);
  itoa(distance6, distanceString6, 10);
  Particle.publish("distance6", distanceString6);

  delay(10);
  int dis = ir.distance();  // this returns the distance to the object you're measuring
  itoa(dis, distanceIR, 10);
  Particle.publish("dis", distanceIR);
  if(dis < 25)
  {
    esc.write(90); //neutral
    delay(5000);
  }
  delay(10);
}
