void setup() {
  // put your setup code here, to run once:
  pinMode(1, OUTPUT);
  pinMode(2, OUTPUT);
  pinMode(3, OUTPUT);
}

int count = 0;

void loop() {
  // put your main code here, to run repeatedly:
  switch(count) {
    case 1: 
      digitalWrite(1, LOW);
      digitalWrite(2, LOW);
      digitalWrite(3, HIGH);
      delay(1000);
      count++;
      break;

    case 2: 
      digitalWrite(1, LOW);
      digitalWrite(2, HIGH);
      digitalWrite(3, LOW);
      delay(1000);
      count++;
      break;

    case 3: 
      digitalWrite(1, LOW);
      digitalWrite(2, HIGH);
      digitalWrite(3, HIGH);
      delay(1000);
      count++;
      break;
      
    case 4: 
      digitalWrite(1, HIGH);
      digitalWrite(2, LOW);
      digitalWrite(3, LOW);
      delay(1000);
      count++;
      break;

    case 5: 
      digitalWrite(1, HIGH);
      digitalWrite(2, LOW);
      digitalWrite(3, HIGH);
      delay(1000);
      count++;
      break;

    case 6: 
      digitalWrite(1, HIGH);
      digitalWrite(2, HIGH);
      digitalWrite(3, LOW);
      delay(1000);
      count++;
      break;

    case 7: 
      digitalWrite(1, HIGH);
      digitalWrite(2, HIGH);
      digitalWrite(3, HIGH);
      delay(1000);
      count++;
      break;
    
    default:
      digitalWrite(1, LOW);
      digitalWrite(2, LOW);
      digitalWrite(3, LOW);
      delay(1000);
      count = 1;
  }
}


