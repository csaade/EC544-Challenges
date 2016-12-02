PRODUCT_ID(1783)
PRODUCT_VERSION(18)

#include <math.h>
#include <LIDARLite.h>
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

SharpIR ir(A1, 20150);
LIDARLite lidar;
char *distanceString5;
char *distanceString6;
char *distanceIR;


bool initial;
int inital_distance5, inital_distance6;
bool compare5; // TRUE=measure from distance5, FALSE= measure from distanceLeft
int previousDistance; // stores the previous distance5 if compare5 is true
// stores the previous distance6 if compare5 is false

void setup()
{
  wheels.attach(D2); // initialize wheel servo to Digital IO Pin #2
  esc.attach(D3); // initialize ESC to Digital IO Pin #3

  pinMode(D5, OUTPUT);
  pinMode(D6, OUTPUT);

  wheels.write(180);
  delay(1000);
  wheels.write(0);
  delay(1000);
  wheels.write(90);
  delay(1000);

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

  initial = true;
  wheels.write(90);
  esc.write(0);

  compare5 = FALSE; // we start comparing from distanceRight
  previousDistance = lidar.distance(true, LIDARLITE_ADDR_DEFAULT)*1.00; // stores previousDistance5
  delay(10);
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


int go;

int start(String command) {
  if(command == "go") {
    go = 1;
    return 1;
  }
  else if(command == "no") {
    go = 0;
    return 0;
  }
}
double scale_deg, scale_rad, scale, error, totalDistance, actual_scale;
double distance5, distance6;
int wheel_write;
bool direction;
void loop()
{
  if(go) {
    delay(300);

    esc.write(70);

      distance5 = lidar.distance(true, LIDARLITE_ADDR_SECOND)*1.00; //Left
      delay(10);

      distance6 = lidar.distance(true, LIDARLITE_ADDR_DEFAULT)*1.00; //Right

      if(compare5) {
        if(abs(distance5- previousDistance) > 50) {
          compare5 = FALSE;
          previousDistance = distance6;
        }
        else
          previousDistance = distance5;
      }
      else {
        if(abs(distance5- previousDistance) > 50) {
          compare5 = TRUE;
          previousDistance = distance5;
        }
        else
          previousDistance = distance6;
      }

      itoa(distance6, distanceString6, 10);
      delay(10);

      //error = distance5 - distance6;
      /*if(error >= 0){
        direction = true; // Left
      }
      else{
        direction = false; //Right
      }*/


      totalDistance = distance5 + distance6;

      if(compare5)
        scale = distance5 * 360.00;
      else
        scale = distance6 * 360.00;

      scale_deg = scale / totalDistance;

      scale_rad = degToRad(scale_deg);

      actual_scale = 90 * sin(scale_rad);

      wheel_write = 90 + actual_scale;

      wheels.write(wheel_write);

      int dis = ir.distance();  // this returns the distance to the object you're measuring
      
    if(dis < 20)
    {
      wheels.write(90);
      esc.write(110); //slower backwards
      delay(1000);
      esc.write(90);
      start("no");
    }
    delay(10);
  }
  else {
    esc.write(90); //Stop wheels
  }
}
