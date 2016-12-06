//PRODUCT_ID(1783)
//PRODUCT_VERSION(18)

#include <math.h>
#include "LIDARLite.h"
#include "SharpIR.h"
#include "PID.h"
#include <Servo.h>

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
double distance5, distance6;
int wheel_write;
bool initial;
int go = 1;
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

SharpIR ir(1, 25, 93, 20150);
LIDARLite lidar;

//Define Variables we'll be connecting to
double Setpoint, Input, Output;

//Specify the links and initial tuning parameters
PID myPID = PID(&Input, &Output, &Setpoint,2,1,2, DIRECT);

void setup()
{
  // For serial communication with raspberry pi
  Serial.begin(9600);    // USB port
  
  wheels.attach(2); // initialize wheel servo to Digital IO Pin #2
  esc.attach(3); // initialize ESC to Digital IO Pin #3

  pinMode(5, OUTPUT);
  pinMode(6, OUTPUT);

  wheels.write(180);
  delay(1000);
  wheels.write(0);
  delay(1000);
  wheels.write(90);
  delay(1000);

  calibrateESC();

  digitalWrite(5, HIGH);
  digitalWrite(6, LOW);
  delay(20);
  lidar.begin(0, true);
  lidar.configure(0);
  lidar.changeAddress(LIDARLITE_ADDR_SECOND, true, LIDARLITE_ADDR_DEFAULT);

  digitalWrite(6, HIGH);
  delay(20);
  lidar.configure(0);

  initial = true;
  wheels.write(90);
  esc.write(0);

  //PID initalization
  distance5 = lidar.distance(true, LIDARLITE_ADDR_SECOND)*1.00; //Left
  delay(10);
  distance6 = lidar.distance(true, LIDARLITE_ADDR_DEFAULT)*1.00; //Right
  Input = distance5 - distance6;  
  Setpoint = 0;
  myPID.SetOutputLimits(0, 180); // Servo angles limits for output of PID to scale properly
  myPID.SetMode(AUTOMATIC);
  
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

void loop()
{
  if(Serial.available() > 0) {
    String command_from_js;// = (char*) malloc(sizeof(char)*15); //message no more than 15 characters
    command_from_js = Serial.readString();
    Serial.println("received command: " + command_from_js);

    if(command_from_js[0] == 'r') { // remote control
      bool readingWheelAngle = true; // we start by reading the wheel angle
      
      /* variables for wheels */
      String wheel_angle_str;
      /* variables for esc */
      String esc_angle_str;
      int size_esc_angle = 0;
      
      /*** PARSING COMMAND SET FROM NODE.JS ***/
      for(int i=1; i<15; i++) {
        if(command_from_js.charAt(i) != ',') {
          if(readingWheelAngle) {
            wheel_angle_str.concat(command_from_js.charAt(i));
          }
          else {
             esc_angle_str.concat(command_from_js.charAt(i));
          }
        }
        else {
          readingWheelAngle = false;
        }
      }
      /*** DONE PARSING ***/
      /*** GETTING THE ANGLE VALUES ***/
      int esc_val = esc_angle_str.toInt();
      int wheel_val = wheel_angle_str.toInt();
      esc.write(esc_val);
      wheels.write(wheel_val);
      
    }
    // command is automatic (only sending the bin number)
    else {

      if(go) {
      delay(300);
      esc.write(70);
      
      // Calculate input to PID control for straight navigation
      distance5 = lidar.distance(true, LIDARLITE_ADDR_SECOND)*1.00; //Left
      delay(10);
      distance6 = lidar.distance(true, LIDARLITE_ADDR_DEFAULT)*1.00; //Right
      Input = distance5 - distance6;
      delay(10);
     
      // COMPUTE PID AND WRITE TO SERVOS
      myPID.Compute();
      wheels.write(Output);

      // IR collision detection
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
  }
}
