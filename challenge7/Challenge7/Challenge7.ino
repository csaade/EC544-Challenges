#include <SoftwareSerial.h>

#define MAX_RANDOM_NUM 50

// global varialbes
//char *address[]; // array of strings
SoftwareSerial xbSerial(2,3);

char id = 0;
char received_id = 0;
int time_counter = 1;

char *ids; // array of IDs
int num_ids = 0;

void setup() {
//  randomSeed(micros());
//  id = '0' + random(1, MAX_RANDOM_NUM);
//  id = '1';
  id = '1';

  ids = (char*) malloc(sizeof(char));
  ids[0] = id;
  num_ids++;
  
  // put your setup code here, to run once:
  Serial.begin(9600);
  xbSerial.begin(9600);
}

void loop() {

  if(!(time_counter % 5)) {
    free(ids);
    Serial.println("REFRESHH");
    num_ids = 0;
    ids = (char*) malloc(0);
  }
  
  while(xbSerial.available() > 0) {
    received_id = xbSerial.read();
    //Serial.print("Received ID ");
    //Serial.println(received_id, DEC);

    if(!search_in_array(received_id)) {
      num_ids++;
      ids = (char*) realloc(ids,num_ids*sizeof(char));
      ids[num_ids-1] = received_id;
    }
    
  }

  if(time_counter >= 50) { // 5 seconds
    //Serial.print("Sending my ID ");
    //Serial.println(id, DEC);
    xbSerial.write(id);
    time_counter = 0;

    if(!search_in_array(id)) {
      num_ids++;
      ids = (char*) realloc(ids, num_ids*sizeof(char));
      ids[num_ids-1] = id;
    }
  }

  // printing the values inside the id array
  Serial.println("Stuff that are inside array");
  for(int i=0; i<num_ids; i++) {
    Serial.println(ids[i]);
  }
  
  time_counter++;
  delay(1000);
}

// helper function
bool search_in_array(char num) {
  for(int i=0; i<num_ids; i++) {
    if(ids[i] == num)
      return true;
  }
  return false;
}

