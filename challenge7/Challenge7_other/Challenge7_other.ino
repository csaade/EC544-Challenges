#include <SoftwareSerial.h>

#define MAX_RANDOM_NUM 50
#define MAX_XBEES 9
#define MY_ID 3

#define RED 4
#define BLUE 5
#define GREEN 6
#define BUTTON 8

// id bits are the least significant four
//   (e.g. id 3)       xxxx 0011
#define INFECT 0x10 // 0001 0000
#define CLEAR 0x20  // 0010 0000

// global varialbes
byte ids[MAX_XBEES] = {};
SoftwareSerial xbSerial(2,3);

byte my_id;
byte leader;
byte rx_byte;
bool infected;
bool should_clear;

//Prevent immediate reinfection
unsigned long timeSinceClear = 0;

int tcount1 = 0, tcount2 = 0;

void setup() {
  my_id = MY_ID;
  leader = 0;
  infected = false;
  should_clear = false;
  rx_byte = 0;

  emptyArray(); // puts my id in the array too

  pinMode(RED, OUTPUT);
  pinMode(BLUE, OUTPUT);
  pinMode(GREEN, OUTPUT);
  pinMode(BUTTON, INPUT);
  
  // put your setup code here, to run once:
  Serial.begin(9600);
  xbSerial.begin(9600);
}

void loop() {
  while(xbSerial.available() > 0) {
    rx_byte = xbSerial.read();
    Serial.print("Received byte: ");
    Serial.println(rx_byte, HEX);
    
    if(rx_byte > 0) // is it not null
    {
      if((rx_byte & 0xF) > my_id) // only compare lower 4 bits (the id)
      {
        // I know i'm not the leader but I dont know who it is
        leader = 0;
        digitalWrite(BLUE, LOW);
      }
      addToArray(rx_byte & 0xF); // store the lower 4 bits
    }

    if((rx_byte & INFECT) && leader != my_id)
    {
      if(millis() - timeSinceClear >= 3000 || timeSinceClear == 0)
        infected = true;
        }
      
    if(rx_byte == 0x21 || rx_byte == 0x22 || rx_byte == 0x23 || rx_byte == 0x24 ){
      infected = false;
      timeSinceClear = millis();
      Serial.println("Got a clear");
      }
  }

  if(tcount1 >= 200) { // every 3.5 seconds
    byte tx_byte = 0;
    if(should_clear)
      {
        Serial.println("I'm clearing");
        tx_byte = CLEAR | my_id; // clear if i'm the leader
        should_clear = false;
        Serial.print("Sending byte: ");
        Serial.println(tx_byte, HEX);
        xbSerial.write(tx_byte);
      }
  }

  
  if(tcount1 >= 350) { // every 3.5 seconds
    byte tx_byte = 0;
    if(leader != my_id)
    {
      if(infected){
        tx_byte = INFECT | my_id; // infect if i'm not the leader
        Serial.print("Sending byte: ");
        Serial.println(tx_byte, HEX);
        xbSerial.write(tx_byte);}
      else{
        tx_byte = my_id; // just regular id broadcast
        Serial.print("Sending byte: ");
        Serial.println(tx_byte, HEX);
        xbSerial.write(tx_byte);}
    }
    else
    {
        tx_byte = my_id; // just regular id broadcast
        infected = false;
        Serial.print("Sending byte: ");
        Serial.println(tx_byte, HEX);
        xbSerial.write(tx_byte);
    }

    printArray();
    tcount1 = 0;
  }
  
  if(tcount2 >= 700) { // every 20 seconds
    // Figure out leader
    int max_id = ids[0];
    int i;
    for(i = 0; i < MAX_XBEES; i++)
      if(ids[i] > max_id)
        max_id = ids[i];
    leader = max_id;
    if(leader == my_id)
      digitalWrite(BLUE, HIGH);

    emptyArray();
    
    tcount2 = 0;
  }
  
  // update red and green leds
  if(leader == my_id)
  {
    digitalWrite(RED, LOW);
    digitalWrite(GREEN, LOW);
  }
  if(!infected && leader != my_id)
  {
    //digitalWrite(BLUE, LOW);
    digitalWrite(RED, LOW);
    digitalWrite(GREEN, HIGH);
  }
  if(infected && leader != my_id)
  {
    //digitalWrite(BLUE, LOW);
    digitalWrite(RED, HIGH);
    digitalWrite(GREEN, LOW);
  }

  // button press
  if(digitalRead(BUTTON) == LOW)
  {
    if(leader)
      should_clear = true;
    else
      infected = true;
  }
  
  delay(10);
  tcount1++;
  tcount2++;
}

void emptyArray()
{
  int i;
  for(i = 0; i < MAX_XBEES; i++)
    ids[i] = 0;
  ids[0] = my_id;
}

void addToArray(byte id)
{
  int i;
  for(i = 0; i < MAX_XBEES; i++)
    if(ids[i] == 0)
      break; // found an empty index
    else if(ids[i] == id)
      return; // this id is already in the array, don't add it again
  ids[i] = id; // store new id
}

void printArray()
{
  Serial.println("Ids contents");
  int i;
  for(i = 0; i < MAX_XBEES; i++)
  {
    Serial.print("  ");
    Serial.println(ids[i], HEX);
  }
  Serial.println("------------");
}
