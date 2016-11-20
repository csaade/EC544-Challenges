#include <SoftwareSerial.h>
#include <Arduino.h>
#include <avr/wdt.h>

#define MAX_RANDOM_NUM 50
#define RED 4
#define BLUE 5
#define GREEN 6
#define BUTTON 8

// global varialbes
//char *address[]; // array of strings
SoftwareSerial xbSerial(2,3);

int time_counter = 1;

// IDs detected structures
char *ids; // array of IDs
int num_ids = 0;
char id = 0;

// state variables
char command;
bool isLeader;
bool infected;

// button debouncing variables
unsigned long lastDebounceTime = 0;
unsigned long debounceDelay = 50;
int lastButtonState = LOW;
int buttonState;

void setup() {

  pinMode(RED, OUTPUT);
  pinMode(BLUE, OUTPUT);
  pinMode(GREEN, OUTPUT); 
  pinMode(BUTTON, INPUT);
  
  digitalWrite(RED, LOW);
  digitalWrite(BLUE, LOW);
  digitalWrite(GREEN, LOW);

  id = '3';
  infected = false;

  ids = (char*) malloc(sizeof(char));
  ids[0] = id;
  num_ids++;
  
  // put your setup code here, to run once:
  Serial.begin(9600);
  xbSerial.begin(9600);

  xbSerial.write(id);
}

void loop() {

//  if(!(time_counter % 5)) {
//    free(ids);
//    Serial.println("REFRESHH");
//    num_ids = 0;
//    ids = (char*) malloc(0);
//  }

  if(time_counter >= 10)
  {
    while(xbSerial.available() > 0) {
      
      command = xbSerial.read();
      char received_id = '\0';
      
      switch(command) {
        case 'C':
          if(infected)
            infected = false;
          break;
        case 'I':
          if(!isLeader)
            infected = true;
          break;
        default: // if we received an id
          received_id = command;
          if(!search_in_array(received_id)) {
            num_ids++;
            ids = (char*) realloc(ids,num_ids*sizeof(char));
            ids[num_ids-1] = received_id;
          }
          
          break;
      }
    }
  
    if(findLeader() == id)
      isLeader = true;
    else
      isLeader = false;
  
    command = id;
  //  if(isButtonPressed()) {
  //    if(isLeader)
  //      command = 'C';
  //    else
  //      command = 'I';
  //  }
  
    xbSerial.write(command);
  
  
  //  if(time_counter >= 50) { // 5 seconds
  //    Serial.print("Sending my ID ");
  //    Serial.println(id, DEC);
  //    xbSerial.write(id);
  //    time_counter = 0;
  //
  //    // refresh
  //    if(!search_in_array(id)) {
  //      num_ids++;
  //      ids = (char*) realloc(ids, num_ids*sizeof(char));
  //      ids[num_ids-1] = id;
  //    }
  //  }
  
    // printing the values inside the id array
    Serial.println("Stuff that are inside array");
    for(int i=0; i<num_ids; i++) {
      Serial.println(ids[i]);
    }

    time_counter = 0;
  }

  // Check for button

  if(isButtonPressed()) {
    if(isLeader) {
      command = 'C';
      Serial.println("Clearing infection");
    }
    else {
      command = 'I';
      Serial.println("Sending infection");
    }
    xbSerial.write(command);
  }
  
//  if(digitalRead(BUTTON) == LOW && !isLeader)
//  {
//    infected = true;
//    Serial.println("Sending infection");
//    command = 'I';
//    xbSerial.write(command);
//  }
//  else if(digitalRead(BUTTON) == LOW && isLeader) {
//    infected = false;
//    command = 'C';
//    Serial.println("Clearing infection");
//    xbSerial.write(command);
//  }
//  else {
//    xbSerial.write(id);
//  }
  
  // LED assignments
  if(isLeader) {
    digitalWrite(BLUE,HIGH);
    digitalWrite(RED, LOW);
    digitalWrite(GREEN, LOW);
  }
  else {
    digitalWrite(BLUE, LOW);
    if(infected) {
      digitalWrite(GREEN, LOW);
      digitalWrite(RED, HIGH);
    }
    else {
      digitalWrite(RED, LOW);
      digitalWrite(GREEN, HIGH);
    }
  }
  
  time_counter++;
  delay(100);
}

// helper function
bool search_in_array(char num) {
  for(int i=0; i<num_ids; i++) {
    if(ids[i] == num)
      return true;
  }
  return false;
}

char findLeader() {
  char maxid = '0';
  for(int i=0; i<num_ids; i++) {
    if(maxid < ids[i])
      maxid = ids[i];
  }

  return maxid;
}


bool isButtonPressed() {
  
    int buttonRead = digitalRead(BUTTON);
    //return;
  //Serial.println("button handler");

  if(buttonRead != lastButtonState)
    lastDebounceTime = millis();

   if((millis() - lastDebounceTime) > debounceDelay) {
    if(buttonRead != buttonState) {
      buttonState = buttonRead;

      if(buttonState == HIGH) {
        Serial.println("PRESSED");
        return true;
      }      
    }
   }
    
    lastButtonState = buttonRead;
    return false;
}

